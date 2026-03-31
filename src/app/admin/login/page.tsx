"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        const data = await res.json();
        setError(data.error || "Invalid credentials");
      }
    } catch {
      setError("Connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-midnight px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl mb-2 text-foreground">
            Maiba Studio
          </h1>
          <p className="text-malamaya text-xs tracking-[0.3em] uppercase">
            Admin Access
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-xs tracking-widest uppercase text-malamaya mb-2 block">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              className="w-full bg-transparent border border-malamaya-border rounded-sm px-4 py-3 text-foreground focus:border-maiba-red focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="text-xs tracking-widest uppercase text-malamaya mb-2 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full bg-transparent border border-malamaya-border rounded-sm px-4 py-3 text-foreground focus:border-maiba-red focus:outline-none transition-colors"
            />
          </div>

          {error && (
            <p className="text-maiba-red text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-maiba-red/10 border border-maiba-red/30 text-maiba-red py-3 rounded-sm hover:bg-maiba-red/20 transition-colors text-sm tracking-widest uppercase disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Enter"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="text-malamaya-border text-xs hover:text-malamaya transition-colors tracking-widest uppercase"
          >
            ← Back to site
          </a>
        </div>
      </motion.div>
    </div>
  );
}
