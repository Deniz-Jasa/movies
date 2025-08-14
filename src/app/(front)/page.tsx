// app/(front)/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MoviePostersGrid from "@/components/movie-posters-grid";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Login failed");
      }
      router.push("/home");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Registration failed");
      }
      // auto login after register
      await handleLogin(new Event("submit") as unknown as React.FormEvent);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 bg-[#101010]">
      {/* left: login form */}
      <div className="flex items-center justify-center px-8">
        <form onSubmit={handleLogin} className="w-[350px] p-4 bg-[#101010] backdrop-blur-sm">
          <h2 className="text-[14pt] text-center font-bold mb-1 text-white">Sign In</h2>
          <p className="text-[10pt] text-center mb-6 text-[#9C9C9C]">Use your email and password</p>

          {error && (
            <p
              role="alert"
              aria-live="polite"
              className="text-[11.5pt] text-center text-red-500 mb-3 font-medium"
            >
              {error}
            </p>
          )}

          <label htmlFor="email" className="block text-[10pt] font-medium text-[#9C9C9C]">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full mb-4 p-2 mt-1 bg-transparent border border-[#222] rounded text-sm text-white focus:outline-none"
          />

          <label htmlFor="password" className="block text-[10pt] font-medium text-[#9C9C9C]">Password</label>
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
            disabled={loading}
            className="w-full p-2 bg-[#1C1C1C] border border-[#222] text-[10pt] text-white rounded hover:bg-[#222] transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          {/* Registration disabled */}
        </form>
      </div>

      {/* right: posters panel – hidden on mobile */}
      <div className="hidden lg:block relative w-full h-screen overflow-hidden">
        <MoviePostersGrid />
      </div>
    </div>
  );
}
