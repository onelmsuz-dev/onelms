"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navSections } from "@/components/layout/nav-config";
import { useVariant, VARIANT_LIST } from "@/hooks/use-variant";
import { ThemeToggle } from "@/components/theme-toggle";
import { Bell, Search, LayoutGrid } from "lucide-react";
import { useState } from "react";

export function TorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { variantId, setVariant } = useVariant();
  const [showVariants, setShowVariants] = useState(false);

  const allItems = navSections.flatMap(s => s.items);

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-950">
      {/*
        Rail sidebar — 72px collapsed, 200px expanded on hover.
        Pure CSS group-hover: no JS, no layout shift on content.
        Sidebar overlays content slightly when expanded (z-40).
      */}
      <aside className="group/rail fixed left-0 top-0 h-screen z-40
        w-[72px] hover:w-[200px]
        transition-[width] duration-200 ease-in-out
        flex flex-col overflow-hidden
        bg-white dark:bg-neutral-900
        border-r border-neutral-200/80 dark:border-neutral-800/80
        shadow-sm">

        {/* Logo — icon collapses, text fades in on expand */}
        <div className="h-[60px] flex items-center px-[18px] border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <div className="w-9 h-9 bg-neutral-900 dark:bg-neutral-100 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-white dark:text-neutral-900 font-black text-[15px]">O</span>
          </div>
          <span className="ml-3 font-bold text-[14px] text-neutral-900 dark:text-neutral-100 whitespace-nowrap
            opacity-0 group-hover/rail:opacity-100 transition-opacity duration-150 delay-75">
            OneLMS
          </span>
        </div>

        {/* Nav — icon always visible, label fades in */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
          {allItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center h-10 px-2.5 rounded-xl transition-all duration-150 min-w-0",
                  isActive
                    ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                    : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                )}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="ml-3 text-[13px] font-medium whitespace-nowrap
                  opacity-0 group-hover/rail:opacity-100 transition-opacity duration-150 delay-75">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Layout picker */}
        <div className="px-2 py-2 border-t border-neutral-100 dark:border-neutral-800 shrink-0">
          <div className="relative">
            <button
              onClick={() => setShowVariants(!showVariants)}
              className={cn(
                "flex items-center h-10 w-full px-2.5 rounded-xl transition-all duration-150",
                showVariants
                  ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                  : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              )}
            >
              <LayoutGrid className="w-5 h-5 shrink-0" />
              <span className="ml-3 text-[13px] font-medium whitespace-nowrap
                opacity-0 group-hover/rail:opacity-100 transition-opacity duration-150 delay-75">
                Layout
              </span>
            </button>

            {showVariants && (
              <div className="absolute bottom-full left-[calc(100%+8px)] mb-1
                bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700
                rounded-xl shadow-xl p-1.5 w-44 z-50">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-2 mb-1 pt-1">
                  Layout tanlash
                </p>
                {VARIANT_LIST.map(v => (
                  <button
                    key={v.id}
                    onClick={() => { setVariant(v.id); setShowVariants(false); }}
                    className={cn(
                      "w-full flex flex-col px-2.5 py-2 rounded-lg text-left transition-all",
                      variantId === v.id
                        ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                        : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                    )}
                  >
                    <span className={cn("text-[12px] font-semibold",
                      variantId !== v.id && "text-neutral-800 dark:text-neutral-200")}>{v.name}</span>
                    <span className={cn("text-[10px]",
                      variantId === v.id ? "text-neutral-300 dark:text-neutral-600" : "text-neutral-400")}>{v.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* User */}
        <div className="px-2 pb-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 shrink-0 flex flex-col gap-2">
          <div className="flex items-center h-10 px-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-all">
            <ThemeToggle />
          </div>
          <div className="flex items-center h-10 px-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-all">
            <div className="w-8 h-8 bg-neutral-900 dark:bg-neutral-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-white dark:text-neutral-900 text-[11px] font-bold">SA</span>
            </div>
            <div className="ml-2.5 min-w-0 opacity-0 group-hover/rail:opacity-100 transition-opacity duration-150 delay-75">
              <p className="text-[12px] font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">Super Admin</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span className="text-[10px] text-neutral-400 whitespace-nowrap">Online</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main — always 72px offset, sidebar overlays on expand */}
      <div className="ml-[72px] flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 flex items-center justify-between px-6 h-[60px]
          bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md
          border-b border-neutral-200/60 dark:border-neutral-800/60">
          <div>
            <h1 className="font-bold text-[18px] text-neutral-900 dark:text-neutral-100 tracking-tight leading-none">
              {navSections.flatMap(s => s.items).find(i =>
                pathname === i.href || pathname?.startsWith(i.href + "/")
              )?.label ?? "Dashboard"}
            </h1>
            <p className="text-[12px] text-neutral-400 dark:text-neutral-500 mt-0.5">smart-markaz.onelms.uz</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              <input
                placeholder="Qidirish..."
                className="pl-9 pr-4 h-9 w-56 text-[13px] bg-neutral-100 dark:bg-neutral-800 border-0 rounded-xl
                  text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 outline-none
                  focus:bg-neutral-50 dark:focus:bg-neutral-700 transition-all"
              />
            </div>
            <button className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-all
              text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100
              hover:bg-neutral-100 dark:hover:bg-neutral-800">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
