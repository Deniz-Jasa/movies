"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const hardcodedUsername = process.env.NEXT_PUBLIC_USERNAME;
  const hardcodedPassword = process.env.NEXT_PUBLIC_PASSWORD;

  // Load saved credentials on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedPassword = localStorage.getItem('rememberedPassword');
    if (savedUsername && savedPassword) {
      setUsername(savedUsername);
      setPassword(savedPassword);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (username === hardcodedUsername && password === hardcodedPassword) {
      // Save credentials if "Remember Me" is checked
      if (rememberMe) {
        localStorage.setItem('rememberedUsername', username);
        localStorage.setItem('rememberedPassword', password);
      } else {
        // Clear saved credentials if "Remember Me" is unchecked
        localStorage.removeItem('rememberedUsername');
        localStorage.removeItem('rememberedPassword');
      }
      router.push("/home");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="container mx-auto flex justify-center items-center min-h-screen">
      <form onSubmit={handleSubmit} className="space-y-4 w-96 p-8 border rounded-md">

        <h2 className="text-2xl font-bold text-center mb-4">Sign In</h2>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <div>
          <label htmlFor="username" className="block text-sm font-medium">Username</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="w-full p-2 mt-1 border rounded-md"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-2 mt-1 border rounded-md"
          />
        </div>

        <div className="flex items-center">
          <input
            id="rememberMe"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-white"
          />
          <label htmlFor="rememberMe" className="ml-2 block text-sm text-white">
            Remember me
          </label>
        </div>
        <br></br>

        <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Sign In
        </button>
      </form>
    </div>
  );
}
