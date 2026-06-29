"use client";

import { signOut, useSession } from "next-auth/react";
import { ShieldCheck, LogOut } from "lucide-react";

export default function AdmodeLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Top bar */}
      <header className="h-14 border-b border-neutral-800 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="font-bold text-[14px] text-white">OneRoom</span>
            <span className="text-neutral-500 text-[12px] ml-2">Platform Admin</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-neutral-400">{session?.user?.name}</span>
          <button
            onClick={() => signOut({ callbackUrl: "/admode/login" })}
            className="flex items-center gap-1.5 text-[12px] text-neutral-500 hover:text-red-400 transition-colors">
            <LogOut className="w-3.5 h-3.5" />
            Chiqish
          </button>
        </div>
      </header>

      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
