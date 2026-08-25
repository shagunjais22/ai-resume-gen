"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "./lib/firebase";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const googleLogin = async () => {
    try {
      setLoading(true);

      const provider = new GoogleAuthProvider();

      await signInWithPopup(auth, provider);

      router.push("/workspace");
    } catch (error: any) {
  console.error("Google login error:", error);
  alert("Google login failed: " + error.code);
} finally {
      setLoading(false);
    }
  };

  const emailAuth = async () => {
    try {
      setLoading(true);

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/workspace");
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        router.push("/workspace");
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold tracking-tight">
            Resume<span className="text-blue-500">AI</span>
          </h1>

          <p className="text-gray-400 mt-3">
            Your AI career assistant.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">

          <h2 className="text-2xl font-semibold mb-2">
            {isLogin ? "Welcome back" : "Create your account"}
          </h2>

          <p className="text-gray-400 text-sm mb-7">
            {isLogin
              ? "Continue building your perfect resume."
              : "Let's build your career profile together."}
          </p>

          <button
            onClick={googleLogin}
            disabled={loading}
            className="w-full bg-white text-black py-3 rounded-xl font-medium hover:bg-gray-200 transition"
          >
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px bg-zinc-700 flex-1" />
            <span className="text-gray-500 text-sm">OR</span>
            <div className="h-px bg-zinc-700 flex-1" />
          </div>

          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 mb-3 outline-none focus:border-blue-500"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 mb-5 outline-none focus:border-blue-500"
          />

          <button
            onClick={emailAuth}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold transition"
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </button>

          <p className="text-center text-gray-400 text-sm mt-6">
            {isLogin
              ? "Don't have an account?"
              : "Already have an account?"}

            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-400 ml-2 hover:underline"
            >
              {isLogin ? "Create one" : "Sign in"}
            </button>
          </p>

        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Your career. Your story. Enhanced by AI.
        </p>

      </div>
    </main>
  );
}