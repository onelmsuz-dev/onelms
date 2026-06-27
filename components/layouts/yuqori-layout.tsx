"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navSections } from "@/components/layout/nav-config";
import { useVariant, VARIANT_LIST } from "@/hooks/use-variant";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bell, LayoutGrid, ChevronDown, X } from "lucide-react";
import { useState } from "react";

export function YuqoriLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { variantId, setVariant } = useVariant();
  const [showVariants, setShowVariants] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const allItems = navSections.flatMap(s => s.items);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-neutral-950">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-[54px] bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 shadow-sm">
        <div className="h-full flex items-center px-5 gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0 mr-2">
            <div className="w-7 h-7 bg-neutral-900 dark:bg-white rounded-lg flex items-center justify-center">
              <span className="text-white dark:text-neutral-900 font-black text-[13px]">O</span>
            </div>
            <span className="font-bold text-[15px] text-neutral-900 dark:text-neutral-100 tracking-tight hidden sm:block">OneLMS</span>
          </div>

          <div className="w-px h-5 bg-neutral-200 dark:bg-neutral-700 shrink-0" />

          {/* Nav items */}
          <nav className="flex-1 flex items-center gap-0.5 overflow-x-auto scrollbar-none">
            {allItems.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12.5px] whitespace-nowrap transition-all shrink-0 font-medium",
                    isActive
                      ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Layout picker */}
            <div className="relative">
              <button
                onClick={() => setShowVariants(!showVariants)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-semibold rounded-lg border transition-all",
                  showVariants
                    ? "bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white"
                    : "text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Layout</span>
                <ChevronDown className={cn("w-3 h-3 transition-transform", showVariants && "rotate-180")} />
              </button>
              {showVariants && (
                <div className="absolute right-0 top-full mt-1.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl p-1.5 w-48 z-50">
                  {VARIANT_LIST.map(v => (
                    <button
                      key={v.id}
                      onClick={() => { setVariant(v.id); setShowVariants(false); }}
                      className={cn(
                        "w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition-all",
                        variantId === v.id
                          ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                          : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      )}
                    >
                      <div>
                        <div className={cn("text-[12px] font-semibold", variantId === v.id ? "" : "text-neutral-800 dark:text-neutral-200")}>{v.name}</div>
                        <div className={cn("text-[11px]", variantId === v.id ? "text-neutral-300 dark:text-neutral-500" : "text-neutral-400 dark:text-neutral-500")}>{v.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button className="relative w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-all">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>

            <ThemeToggle />

            <div className="flex items-center gap-2 pl-1 border-l border-neutral-200 dark:border-neutral-700 ml-0.5">
              <div className="w-7 h-7 bg-neutral-900 dark:bg-white rounded-full flex items-center justify-center">
                <span className="text-white dark:text-neutral-900 text-[11px] font-bold">SA</span>
              </div>
              <span className="text-[12px] font-medium text-neutral-700 dark:text-neutral-300 hidden md:block">Super Admin</span>
            </div>
          </div>
        </div>
      </header>

      {/* Second row: section labels */}
      <div className="fixed top-[54px] left-0 right-0 z-40 h-[38px] bg-neutral-50 dark:bg-neutral-950 border-b border-neutral-200/60 dark:border-neutral-800/60 flex items-center px-5 gap-1 overflow-x-auto scrollbar-none">
        {navSections.map(section => {
          const Icon = section.icon;
          const hasActive = section.items.some(i => pathname === i.href || pathname?.startsWith(i.href + "/"));
          return (
            <div key={section.id} className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-md text-[11.5px] font-medium whitespace-nowrap shrink-0",
              hasActive
                ? "text-neutral-900 dark:text-neutral-100 bg-white dark:bg-neutral-800 shadow-sm"
                : "text-neutral-400 dark:text-neutral-500"
            )}>
              <Icon className="w-3 h-3" />
              {section.label}
            </div>
          );
        })}
      </div>

      {/* Content */}
      <main className="pt-[92px] min-h-screen">
        <div className="max-w-[1400px] mx-auto px-6 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
