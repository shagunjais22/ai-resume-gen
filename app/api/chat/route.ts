import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const SYSTEM_PROMPT = `
You are ResumeAI, an intelligent personal career and resume assistant.

You are NOT a boring form.

Your job is to have a natural conversation with the user and gradually collect
the information required to create a professional, ATS-friendly resume.

Learn about:
- Name
- Target job or internship
- Career goals
- Education
- College/university
- Degree
- Skills
- Programming languages
- Projects
- Work experience
- Internships
- Certifications
- Achievements
- Hackathons
- Leadership
- Extracurricular activities
- GitHub
- LinkedIn
- Portfolio
- Other relevant information

IMPORTANT BEHAVIOR:

1. Talk naturally like an intelligent career assistant.
2. Ask only one or two questions at a time.
3. Never make the user feel like they are filling out a government form.
4. Analyze every answer.
5. Suggest improvements whenever useful.
6. If a project description is weak, suggest a stronger professional version.
7. If an achievement can be quantified, ask for numbers.
8. If an important resume section is missing, suggest it.
9. Never invent information about the user.
10. Never invent achievements, experience, education or skills.
11. If the user asks you to rewrite something professionally, do it.
12. If the user asks for resume improvements, provide them.
13. Keep the conversation friendly, useful and concise.
14. Remember information that the user has already provided.
15. Do not ask the user for information they have already given.
16. Build the user's resume profile gradually from the conversation.

The final goal is a polished resume suitable for internships and jobs.

When enough information has been collected, tell the user that their
resume profile is becoming complete and suggest any missing information
before generating the final resume.
`;

type ChatMessage = {
  role: "user" | "model";
  text: string;
};

async function generateWithModel(
  model: string,
  history: ChatMessage[]
) {
  return await ai.models.generateContent({
    model,

    contents: history.map((message) => ({
      role: message.role,
      parts: [
        {
          text: message.text,
        },
      ],
    })),

    config: {
      systemInstruction: SYSTEM_PROMPT,
    },
  });
}

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        {
          error: "GEMINI_API_KEY is missing from .env.local",
        },
        { status: 500 }
      );
    }

    const body = await request.json();

    const message = body?.message;
    const conversation = body?.conversation;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        {
          error: "Message is required.",
        },
        { status: 400 }
      );
    }

    /*
      The frontend sends the previous conversation.
      We add the latest user message to it.
    */

    const history: ChatMessage[] = Array.isArray(conversation)
      ? conversation
          .filter(
            (item: any) =>
              item &&
              (item.role === "user" || item.role === "model") &&
              typeof item.text === "string"
          )
          .map((item: any) => ({
            role: item.role,
            text: item.text,
          }))
      : [];

    history.push({
      role: "user",
      text: message,
    });

    const models = [
      "gemini-3.7-flash",
      "gemini-3.6-flash",
      "gemini-3.5-flash",
      "gemini-3.1-flash-lite",
    ];

    let lastError: any = null;

    for (const model of models) {
      try {
        console.log(`Trying Gemini model: ${model}`);

        const response = await generateWithModel(
          model,
          history
        );

        const reply =
          response.text ||
          "I understood you. Tell me a little more.";

        console.log(`Gemini success: ${model}`);

        return NextResponse.json({
          reply,
          model,
        });
      } catch (error: any) {
        lastError = error;

        console.error(
          `${model} failed:`,
          error?.message || error
        );
      }
    }

    return NextResponse.json(
      {
        error:
          lastError?.message ||
          "Gemini is temporarily unavailable.",
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error("API error:", error);

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Something went wrong.",
      },
      { status: 500 }
    );
  }
}