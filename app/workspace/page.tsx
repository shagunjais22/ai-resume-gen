"use client";

import { useState, KeyboardEvent } from "react";

type Message = {
  role: "ai" | "user";
  text: string;
};

export default function Workspace() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      text: "Hey! 👋 I'm ResumeAI, your personal AI career assistant. I won't make you fill out a boring form. I'll get to know you through conversation and help build your resume.",
    },
    {
      role: "ai",
      text: "Let's start simple. What kind of job or internship are you hoping to get?",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // =========================
  // SEND MESSAGE
  // =========================

  async function sendMessage() {
    const text = input.trim();

    if (!text || loading) {
      return;
    }

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: text,
      },
    ]);

    // Clear input
    setInput("");

    // Start loading
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: text,

          conversation: messages.map((message) => ({
            role: message.role === "ai" ? "model" : "user",
            text: message.text,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Something went wrong with the AI."
        );
      }

      const aiReply =
        data?.reply ||
        data?.text ||
        data?.message ||
        data?.response ||
        "I received your message! Tell me a little more.";

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: aiReply,
        },
      ]);
    } catch (error) {
      console.error("Chat error:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "I couldn't connect to Gemini right now. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // ENTER KEY
  // =========================

  function handleKeyDown(
    e: KeyboardEvent<HTMLInputElement>
  ) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  }

  // =========================
  // DOWNLOAD RESUME
  // =========================

  async function downloadResume() {
    if (downloading) {
      return;
    }

    if (messages.length === 0) {
      return;
    }

    setDownloading(true);

    try {
      // Import PDF library only when needed
      const html2pdf = (await import("html2pdf.js")).default as any;

      // Get AI messages
      const aiMessages = messages
        .filter((message) => message.role === "ai")
        .map((message) => message.text)
        .join("\n\n");

      // Create temporary resume container
      const resumeElement =
        document.createElement("div");

      resumeElement.style.width = "794px";
      resumeElement.style.minHeight = "1123px";
      resumeElement.style.padding = "55px";
      resumeElement.style.background = "#ffffff";
      resumeElement.style.color = "#111827";
      resumeElement.style.fontFamily =
        "Arial, Helvetica, sans-serif";
      resumeElement.style.lineHeight = "1.6";
      resumeElement.style.fontSize = "14px";
      resumeElement.style.boxSizing = "border-box";

      // Escape HTML
      const safeText = aiMessages
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      resumeElement.innerHTML = `
        <div
          style="
            border-bottom: 3px solid #2563eb;
            padding-bottom: 18px;
            margin-bottom: 28px;
          "
        >
          <h1
            style="
              margin: 0;
              font-size: 32px;
              font-weight: 800;
              color: #111827;
            "
          >
            ResumeAI
          </h1>

          <p
            style="
              margin: 5px 0 0;
              color: #6b7280;
              font-size: 13px;
            "
          >
            AI-Assisted Professional Resume
          </p>
        </div>

        <div
          style="
            font-size: 14px;
            line-height: 1.7;
            color: #1f2937;
            white-space: pre-wrap;
            word-wrap: break-word;
          "
        >
          ${safeText}
        </div>

        <div
          style="
            margin-top: 45px;
            padding-top: 12px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #9ca3af;
            font-size: 10px;
          "
        >
          Generated with ResumeAI
        </div>
      `;

      // Add temporarily to page
      document.body.appendChild(resumeElement);

      // PDF settings
      const options = {
        margin: 10,

        filename: "ResumeAI_Resume.pdf",

        image: {
          type: "jpeg",
          quality: 0.98,
        },

        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        },

        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },

        pagebreak: {
          mode: ["avoid-all", "css", "legacy"],
        },
      };

      // Generate PDF
      await html2pdf()
        .set(options)
        .from(resumeElement)
        .save();

      // Remove temporary element
      document.body.removeChild(resumeElement);
    } catch (error) {
      console.error(
        "PDF generation error:",
        error
      );

      alert(
        "Could not generate the PDF. Please try again."
      );
    } finally {
      setDownloading(false);
    }
  }

  // =========================
  // UI
  // =========================

  return (
    <main className="min-h-screen bg-[#0b0d12] text-white flex flex-col">

      {/* ================= HEADER ================= */}

      <header className="border-b border-white/10 px-8 py-5">

        <div className="max-w-6xl mx-auto flex items-center justify-between">

          <div>

            <h1 className="text-2xl font-bold text-blue-400">
              RESUMEAI
            </h1>

            <p className="text-sm text-gray-400 mt-1">
              Your career. Your story. Enhanced by AI.
            </p>

          </div>

          <div
            className="
              px-4
              py-2
              rounded-full
              bg-green-500/10
              border
              border-green-500/20
              text-green-400
              text-sm
            "
          >
            ● AI Assistant Online
          </div>

        </div>

      </header>


      {/* ================= CHAT ================= */}

      <section className="flex-1 w-full max-w-5xl mx-auto px-6 py-10">

        <div className="space-y-7">

          {messages.map((message, index) => (

            <div
              key={index}
              className={
                message.role === "user"
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >

              {/* AI MESSAGE */}

              {message.role === "ai" && (

                <div className="max-w-3xl">

                  <div className="text-blue-400 font-bold text-sm mb-2">
                    RESUMEAI
                  </div>

                  <div
                    className="
                      bg-[#191c23]
                      border
                      border-white/10
                      rounded-2xl
                      rounded-tl-md
                      px-6
                      py-5
                      text-lg
                      leading-relaxed
                      text-gray-100
                      shadow-lg
                      whitespace-pre-wrap
                    "
                  >
                    {message.text}
                  </div>

                </div>

              )}


              {/* USER MESSAGE */}

              {message.role === "user" && (

                <div
                  className="
                    max-w-3xl
                    bg-white
                    text-black
                    rounded-2xl
                    rounded-tr-md
                    px-6
                    py-5
                    text-lg
                    leading-relaxed
                    shadow-lg
                    whitespace-pre-wrap
                  "
                >
                  {message.text}
                </div>

              )}

            </div>

          ))}


          {/* ================= THINKING ================= */}

          {loading && (

            <div className="flex justify-start">

              <div className="max-w-3xl">

                <div className="text-blue-400 font-bold text-sm mb-2">
                  RESUMEAI
                </div>

                <div
                  className="
                    bg-[#191c23]
                    border
                    border-white/10
                    rounded-2xl
                    rounded-tl-md
                    px-6
                    py-5
                  "
                >

                  <div className="flex items-center gap-2">

                    <span
                      className="
                        w-2
                        h-2
                        bg-blue-400
                        rounded-full
                        animate-bounce
                      "
                    />

                    <span
                      className="
                        w-2
                        h-2
                        bg-blue-400
                        rounded-full
                        animate-bounce
                      "
                      style={{
                        animationDelay: "150ms",
                      }}
                    />

                    <span
                      className="
                        w-2
                        h-2
                        bg-blue-400
                        rounded-full
                        animate-bounce
                      "
                      style={{
                        animationDelay: "300ms",
                      }}
                    />

                    <span className="ml-2 text-gray-400">
                      Thinking...
                    </span>

                  </div>

                </div>

              </div>

            </div>

          )}

        </div>


        {/* ================= DOWNLOAD CARD ================= */}

        {messages.length >= 4 && !loading && (

          <div className="mt-12">

            <div
              className="
                rounded-3xl
                border
                border-blue-500/20
                bg-gradient-to-br
                from-[#111827]
                to-[#0f172a]
                p-7
                shadow-2xl
              "
            >

              <div className="flex items-start justify-between gap-6">

                <div>

                  <div
                    className="
                      text-blue-400
                      text-sm
                      font-bold
                      tracking-widest
                    "
                  >
                    RESUME READY
                  </div>

                  <h2 className="text-2xl font-bold mt-2">
                    Your resume is taking shape 🚀
                  </h2>

                  <p className="text-gray-400 mt-2 max-w-xl">
                    Your resume information has been
                    developed with ResumeAI. Download
                    your current resume as a PDF.
                  </p>

                </div>

                <div className="text-4xl">
                  📄
                </div>

              </div>


              <button
                type="button"
                onClick={downloadResume}
                disabled={downloading}
                className="
                  mt-6
                  px-7
                  py-4
                  rounded-2xl
                  bg-blue-600
                  hover:bg-blue-500
                  active:scale-95
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  transition-all
                  font-bold
                  text-white
                  shadow-lg
                  cursor-pointer
                "
              >

                {downloading
                  ? "Generating PDF..."
                  : "⬇ Download Resume"}

              </button>

            </div>

          </div>

        )}

      </section>


      {/* ================= INPUT ================= */}

      <section
        className="
          sticky
          bottom-0
          bg-[#0b0d12]/95
          backdrop-blur-xl
          border-t
          border-white/10
          p-5
        "
      >

        <div className="max-w-5xl mx-auto">

          <div className="flex gap-4 items-center">

            <input
              type="text"
              value={input}
              onChange={(e) =>
                setInput(e.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Tell me about yourself..."
              disabled={loading}
              className="
                flex-1
                h-16
                px-6
                rounded-2xl
                bg-[#191c23]
                border
                border-white/10
                text-white
                text-lg
                outline-none
                focus:border-blue-500
                transition
                disabled:opacity-50
              "
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="
                h-16
                px-10
                rounded-2xl
                bg-blue-600
                hover:bg-blue-500
                active:scale-95
                transition-all
                text-white
                font-bold
                text-lg
                cursor-pointer
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >

              {loading
                ? "Thinking..."
                : "Send"}

            </button>

          </div>

          <p className="text-center text-gray-500 text-sm mt-3">
            ResumeAI will ask questions and suggest
            improvements as you go.
          </p>

        </div>

      </section>

    </main>
  );
}