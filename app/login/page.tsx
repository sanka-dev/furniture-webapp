"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, LogIn, Palette, Sofa } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        router.push("/dashboard");
      } else {
        setError(result.error || "Invalid email or password. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7e7e1] px-4 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-32">
      <div className="pointer-events-none absolute inset-0 cartoon-dot-grid opacity-[0.06]" />
      <div className="absolute -left-10 top-24 h-40 w-40 rounded-full bg-[#b0664c]/20 blur-3xl" />
      <div className="absolute right-0 top-16 h-52 w-52 rounded-full bg-white/80 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-[#b0664c]/15 blur-3xl" />

      <Link
        href="/"
        className="cartoon-button absolute left-3 top-3 z-20 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-900 hover:bg-white sm:left-6 sm:top-6 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mx-auto grid w-full max-w-6xl gap-5 sm:gap-8 lg:grid-cols-[0.95fr_1.05fr]"
      >
        <div className="order-1 cartoon-frame rounded-[28px] bg-white p-3 sm:rounded-[36px] sm:p-5 lg:order-2">
          <div className="cartoon-frame rounded-[24px] bg-[#f7e7e1] p-4 sm:rounded-[30px] sm:p-8">
            <div className="flex items-center justify-between gap-3 sm:items-start sm:gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
                  Welcome back
                </p>
                <h2 className="font-display-cartoon mt-1.5 text-3xl text-slate-900 sm:mt-2 sm:text-4xl">
                  Sign in
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-[16px] border-[3px] border-slate-900 bg-white text-slate-900 sm:h-14 sm:w-14 sm:rounded-[20px]">
                <LogIn className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
              {error && (
                <div className="cartoon-frame flex items-center gap-2 rounded-[20px] bg-white px-4 py-3 text-sm text-[#b0664c] shadow-none">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-bold uppercase tracking-[0.08em] text-slate-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@caza.lk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 rounded-[18px] border-[3px] border-slate-900 bg-white px-4 shadow-none focus-visible:border-slate-900 focus-visible:ring-0 sm:h-12"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-bold uppercase tracking-[0.08em] text-slate-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 rounded-[18px] border-[3px] border-slate-900 bg-white px-4 shadow-none focus-visible:border-slate-900 focus-visible:ring-0 sm:h-12"
                />
              </div>

              <Button
                type="submit"
                className="cartoon-button h-11 w-full rounded-full bg-[#b0664c] text-sm font-bold text-white hover:bg-[#b0664c] sm:h-12 sm:text-base"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign in"}
                {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>

              <p className="text-center text-sm text-slate-600">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="font-bold text-[#b0664c] hover:underline">
                  Sign up
                </Link>
              </p>
            </form>
          </div>
        </div>

        <div className="order-2 flex flex-col justify-center lg:order-1">
          <div className="cartoon-frame inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-700 shadow-none sm:px-4 sm:py-2 sm:text-[11px] sm:tracking-[0.18em]">
            <LogIn className="h-3.5 w-3.5" />
            Designer login
          </div>

          <h1 className="font-display-cartoon mt-4 max-w-lg text-[2rem] leading-[0.95] text-slate-900 sm:mt-6 sm:text-5xl lg:text-6xl">
            Jump back into the room you were building.
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-700 sm:mt-5 sm:text-lg">
            Sign in to reopen layouts, tweak palettes, and show customers a room preview that still feels playful and easy to understand.
          </p>

          <div className="mt-4 grid gap-2 sm:hidden">
            <div className="cartoon-frame inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-none">
              <Palette className="h-4 w-4 text-[#b0664c]" />
              Palette choices stay saved
            </div>
            <div className="cartoon-frame inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-none">
              <Sofa className="h-4 w-4 text-[#b0664c]" />
              Pick up right where you left off
            </div>
            <div className="cartoon-frame inline-flex items-center gap-2 rounded-2xl bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-none">
              <CheckCircle2 className="h-4 w-4 text-[#b0664c]" />
              Share-ready room previews in minutes
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
