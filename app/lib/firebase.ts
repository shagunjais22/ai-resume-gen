
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAAeYnr2JPp_9H9yyQZn3bimWbEPcxKnXw",
  authDomain: "ai-resume-agent-21f47.firebaseapp.com",
  projectId: "ai-resume-agent-21f47",
  storageBucket: "ai-resume-agent-21f47.firebasestorage.app",
  messagingSenderId: "719004089377",
  appId: "1:719004089377:web:a198f43fe384842345b760",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);