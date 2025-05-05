// app/signin/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MoviePostersGrid from "@/components/movie-posters-grid";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const hardcodedUsername = process.env.NEXT_PUBLIC_USERNAME;
  const hardcodedPassword = process.env.NEXT_PUBLIC_PASSWORD;

  useEffect(() => {
    const u = localStorage.getItem("rememberedUsername");
    const p = localStorage.getItem("rememberedPassword");
    if (u && p) {
      setUsername(u);
      setPassword(p);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === hardcodedUsername && password === hardcodedPassword) {
      if (rememberMe) {
        localStorage.setItem("rememberedUsername", username);
        localStorage.setItem("rememberedPassword", password);
      } else {
        localStorage.removeItem("rememberedUsername");
        localStorage.removeItem("rememberedPassword");
      }
      router.push("/home");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-[#101010]">
      {/* left: login form */}
      <div className="flex items-center justify-center px-8">
        <form
          onSubmit={handleSubmit}
          className="w-[350px] p-4 bg-[#101010] backdrop-blur-sm"
        >
          <h2 className="text-[14pt] text-center font-bold mb-1 text-white">
            Sign In
          </h2>
          <p className="text-[10pt] text-center mb-10 text-[#9C9C9C]">
            Use your username and password to sign in
          </p>

          {error && <p className="text-red-500 text-center">{error}</p>}

          <label
            htmlFor="username"
            className="block text-[10pt] font-medium text-[#9C9C9C]"
          >
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full mb-4 p-2 mt-1 bg-transparent border border-[#222] rounded text-sm text-white focus:outline-none"
          />

          <label
            htmlFor="password"
            className="block text-[10pt] font-medium text-[#9C9C9C]"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 mb-4 mt-1 bg-transparent border border-[#222] rounded text-sm text-white focus:outline-none"
          />

          <button
            type="submit"
            className="w-full p-2 bg-[#1C1C1C] border border-[#222] text-[10pt] text-white rounded hover:bg-[#222] transition-colors duration-200"
          >
            Sign In
          </button>
        </form>
      </div>

      {/* right: posters panel – hidden on mobile */}
      <div className="hidden lg:block relative w-full h-screen overflow-hidden">
        <MoviePostersGrid />
      </div>
    </div>
  );
}
