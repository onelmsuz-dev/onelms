"use client";

import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useVariant } from "@/hooks/use-variant";

interface TopHeaderProps {
  title: string;
  subtitle?: string;
  action?: { label: string; onClick?: () => void };
}

export function TopHeader({ title, subtitle, action }: TopHeaderProps) {
  const { variantId } = useVariant();

  /* Qora variant: dark sticky header */
  if (variantId === "qora") {
    return (
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 h-[56px] bg-[#0d0d12] dark:bg-[#080810] border-b border-white/[0.06]">
        <div>
          <h1 className="font-bold text-[16px] text-white leading-tight">{title}</h1>
          {subtitle && <p className="text-[12px] text-white/30 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
            <input
              placeholder="Qidirish..."
              className="pl-8 pr-4 py-1.5 w-44 text-[12px] bg-white/[0.05] border border-white/[0.08] rounded-lg text-white/60 placeholder:text-white/20 outline-none focus:border-indigo-500/50 transition-colors"
            />
          </div>
          <button className="relative w-8 h-8 flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/[0.06] rounded-lg transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
          </button>
          <ThemeToggle />
          {action && (
            <button onClick={action.onClick}
              className="flex items-center gap-1.5 h-8 px-3 text-[12px] font-semibold bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" />
              {action.label}
            </button>
          )}
        </div>
      </header>
    );
  }

  /* Yuqori variant: page already has top nav, show minimal title bar */
  if (variantId === "yuqori") {
    return (
      <div className="px-6 pt-6 pb-2">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">{title}</h1>
        {subtitle && <p className="text-[13px] text-neutral-400 dark:text-neutral-500 mt-1">{subtitle}</p>}
      </div>
    );
  }

  /* Tor variant: header is built into layout, show just title area */
  if (variantId === "tor") {
    return null;
  }

  /* Default: klassik + keng */
  return (
    <header className="sticky top-0 z-30 bg-white/85 dark:bg-neutral-900/85 backdrop-blur-md border-b border-neutral-200/70 dark:border-neutral-800/70 px-7 h-[60px] flex items-center justify-between">
      <div>
        <h1 className="font-semibold text-neutral-900 dark:text-neutral-100 leading-tight tracking-tight text-[15px]">
          {title}
        </h1>
        {subtitle && <p className="text-[12px] text-neutral-400 dark:text-neutral-500 leading-tight mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <Input
            placeholder="Qidirish..."
            className="pl-8 w-52 h-8 text-[13px] bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 rounded-lg placeholder:text-neutral-400 focus:bg-white dark:focus:bg-neutral-800"
          />
        </div>

        <Button variant="ghost" size="icon"
          className="relative h-8 w-8 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 rounded-lg">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </Button>

        {action && (
          <Button size="sm" onClick={action.onClick}
            className="gap-1.5 h-8 px-3 text-[13px] bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 text-white rounded-lg">
            <Plus className="w-3.5 h-3.5" />
            {action.label}
          </Button>
        )}

        <ThemeToggle />
      </div>
    </header>
  );
}
