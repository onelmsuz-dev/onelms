"use client";

import { ReactNode } from "react";
import { Bell, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopHeaderProps {
  title: string;
  subtitle?: ReactNode;
  action?: { label: string; onClick?: () => void };
}

export function TopHeader({ title, subtitle, action }: TopHeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 h-[60px]
      bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md
      border-b border-neutral-200/60 dark:border-neutral-800/60">
      <div>
        <h1 className="font-bold text-[18px] text-neutral-900 dark:text-neutral-100 tracking-tight leading-none">
          {title}
        </h1>
        {subtitle && (
          <p className="text-[12px] text-neutral-400 dark:text-neutral-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
          <input
            placeholder="Qidirish..."
            className="pl-9 pr-4 h-9 w-52 text-[13px] bg-neutral-100 dark:bg-neutral-800 border-0 rounded-xl
              text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none
              focus:bg-neutral-50 dark:focus:bg-neutral-700 transition-colors"
          />
        </div>

        <button className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-colors
          text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100
          hover:bg-neutral-100 dark:hover:bg-neutral-800">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
        </button>

        {action && (
          <Button size="sm" onClick={action.onClick}
            className="gap-1.5 h-9 px-4 text-[13px] bg-neutral-900 hover:bg-neutral-800
              dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200 text-white rounded-xl">
            <Plus className="w-3.5 h-3.5" />
            {action.label}
          </Button>
        )}
      </div>
    </header>
  );
}
