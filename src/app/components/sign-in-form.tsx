// src/app/sign-in/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/actions/auth";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    setLoading(false);

    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setError("Invalid credentials");
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex flex-1 items-center justify-center px-8 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">Welcome back</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="name@example.com"
                type="email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                className="mt-1 block w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm">
                <input type="checkbox" className="mr-2" /> Remember me
              </label>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
            {/* GitHub Login Button */}
          <button
            onClick={() => login()}
            className="w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 flex items-center justify-center gap-2"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.26.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.09-.744.083-.73.083-.73 1.205.085 1.84 1.238 1.84 1.238 1.07 1.835 2.805 1.305 3.492.998.108-.776.418-1.305.76-1.605-2.665-.304-5.466-1.332-5.466-5.932 0-1.31.47-2.382 1.237-3.22-.125-.304-.536-1.526.118-3.176 0 0 1.01-.323 3.3 1.23a11.52 11.52 0 013.003-.404c1.02.005 2.047.137 3.003.404 2.29-1.553 3.298-1.23 3.298-1.23.656 1.65.245 2.872.12 3.176.77.838 1.236 1.91 1.236 3.22 0 4.61-2.805 5.625-5.476 5.922.43.37.814 1.103.814 2.222 0 1.606-.015 2.898-.015 3.293 0 .32.218.694.825.576C20.565 21.796 24 17.298 24 12c0-6.63-5.373-12-12-12z"
              />
            </svg>
            Sign in with GitHub
          </button>
          </form>
          <h1 className="mt-4">Dummy Credentials :</h1>
          <p className="mt-0 font-semibold">Email : <span>username@example.com</span></p>
          <p className="mt-0 font-semibold">Password : <span>password123</span></p>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex flex-1 bg-blue-600 text-white items-center justify-center p-10">
        <div className="max-w-md">
          <h1 className="text-3xl font-bold mb-4">ticktock</h1>
          <p className="text-sm leading-relaxed">
            Introducing ticktock, our cutting-edge timesheet web application
            designed to revolutionize how you manage employee work hours. With
            ticktock, you can effortlessly track and monitor employee
            attendance and productivity from anywhere, anytime, using any
            internet-connected device.
          </p>
        </div>
      </div>
    </div>
  );
}
