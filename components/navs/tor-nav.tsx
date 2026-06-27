"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { navSections } from "@/components/layout/nav-config";
import { ThemeToggle } from "@/components/theme-toggle";

export function TorNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const allItems = navSections.flatMap(s => s.items);

  return (
    <aside className={cn(
      "rail-sidebar sticky top-0 h-screen z-40 shrink-0 flex flex-col overflow-hidden",
      open ? "w-[220px]" : "w-[72px]",
      "bg-white dark:bg-neutral-900",
      "border-r border-neutral-200/80 dark:border-neutral-800/80 shadow-sm"
    )}>

      {/* Logo */}
      <div className={cn(
        "h-[60px] shrink-0 flex items-center border-b border-neutral-100 dark:border-neutral-800",
        open ? "px-[18px] gap-3" : "justify-center"
      )}>
        <div className="w-9 h-9 bg-neutral-900 dark:bg-neutral-100 rounded-xl flex items-center justify-center shrink-0">
          <span className="text-white dark:text-neutral-900 font-black text-[15px]">O</span>
        </div>
        {open && (
          <span className="rail-label-in flex-1 font-bold text-[14px] text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
            OneLMS
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className={cn(
        "flex-1 overflow-y-auto py-3 flex flex-col gap-0.5",
        open ? "px-2" : "px-1"
      )}>

        {/* Toggle button */}
        <button
          onClick={() => setOpen(v => !v)}
          className={cn(
            "w-full flex items-center h-10 rounded-xl transition-colors mb-1",
            open ? "px-2.5 gap-3" : "justify-center",
            "text-neutral-400 dark:text-neutral-500",
            "hover:text-neutral-900 dark:hover:text-neutral-100",
            "hover:bg-neutral-100 dark:hover:bg-neutral-800"
          )}
        >
          {open
            ? <ChevronLeft className="w-5 h-5 shrink-0" />
            : <ChevronRight className="w-5 h-5 shrink-0" />
          }
          {open && (
            <span className="rail-label-in text-[13px] font-medium whitespace-nowrap">
              Yopish
            </span>
          )}
        </button>

        {/* Nav items */}
        {allItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center h-10 rounded-xl transition-colors",
                open ? "px-2.5 gap-3" : "justify-center",
                isActive
                  ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                  : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {open && (
                <span className="rail-label-in text-[13px] font-medium whitespace-nowrap">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className={cn(
        "pb-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 shrink-0 flex flex-col gap-1",
        open ? "px-2" : "px-1"
      )}>
        <div className={cn(
          "flex items-center h-10 rounded-xl transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800",
          open ? "px-2.5 gap-3" : "justify-center"
        )}>
          <ThemeToggle />
          {open && (
            <span className="rail-label-in text-[13px] font-medium whitespace-nowrap text-neutral-500 dark:text-neutral-400">
              Mavzu
            </span>
          )}
        </div>

        <div className={cn(
          "flex items-center h-10 rounded-xl transition-colors cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800",
          open ? "px-2 gap-3" : "justify-center"
        )}>
          <div className="w-8 h-8 bg-neutral-900 dark:bg-neutral-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-white dark:text-neutral-900 text-[11px] font-bold">SA</span>
          </div>
          {open && (
            <div className="rail-label-in min-w-0">
              <p className="text-[12px] font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">
                Super Admin
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[10px] text-neutral-400 whitespace-nowrap">Online</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
