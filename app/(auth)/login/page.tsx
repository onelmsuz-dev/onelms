"use client";

import { useState, useTransition, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Eye, EyeOff, Lock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function getSubdomain(): string {
  if (typeof window === "undefined") return "demo";
  const host  = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return "demo";
  const parts = host.split(".");
  return parts.length >= 3 ? parts[0] : "demo";
}

function LoginForm() {
  const router      = useRouter();
  const params      = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";

  const [subdomain,    setSubdomain]    = useState("demo");
  const [phone,        setPhone]        = useState("+998901234567");
  const [password,     setPassword]     = useState("admin123");
  const [showPass,     setShowPass]     = useState(false);
  const [error,        setError]        = useState("");
  const [isPending,    startTransition] = useTransition();

  useEffect(() => { setSubdomain(getSubdomain()); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length !== 12) { setError("To'liq telefon raqam kiriting"); return; }
    startTransition(async () => {
      const res = await signIn("credentials", { phone, password, subdomain, redirect: false });
      if (res?.error) {
        setError("Telefon raqam yoki parol noto'g'ri");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    });
  }

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-6 space-y-5">
      <div>
        <h2 className="text-[17px] font-bold text-neutral-900 dark:text-neutral-100">Kirish</h2>
        <p className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-0.5">Tizimga kirish uchun ma'lumotlarni kiriting</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl px-3 py-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          <p className="text-[13px] font-medium text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
            Telefon raqam
          </label>
          <PhoneInput
            value={phone}
            onChange={setPhone}
            error={error.includes("telefon")}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[12px] font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
            Parol
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <Input
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="pl-9 pr-10 h-10"
            />
            <button type="button" onClick={() => setShowPass(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors">
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={isPending}
          className={cn(
            "w-full h-10 rounded-xl font-semibold text-[14px] transition-all",
            "bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200",
            "text-white dark:text-neutral-900",
            isPending && "opacity-60 cursor-not-allowed"
          )}>
          {isPending ? "Kirilmoqda..." : "Kirish"}
        </button>
      </form>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 rounded-xl p-3 text-[12px] text-blue-700 dark:text-blue-400 space-y-1">
        <p className="font-semibold mb-1">Demo kirish:</p>
        <p>👤 Super Admin: <span className="font-mono">+998901234567 / admin123</span></p>
        <p>📚 O'qituvchi:  <span className="font-mono">+998901002000 / teacher123</span></p>
        <p>🧾 Qabulxona:   <span className="font-mono">+998901111111 / rec123</span></p>
        <p>💰 Buxgalter:   <span className="font-mono">+998902222222 / acc123</span></p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-neutral-900 dark:bg-neutral-100 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg">
            <span className="text-white dark:text-neutral-900 font-black text-2xl">O</span>
          </div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-neutral-100">OneRoom</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Smart O'quv Markaz Tizimi</p>
        </div>
        <Suspense fallback={<div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl p-6 h-64 animate-pulse" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
