"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navSections } from "@/components/layout/nav-config";
import { useVariant, VARIANT_LIST } from "@/hooks/use-variant";
import { ThemeToggle } from "@/components/theme-toggle";
import { LayoutGrid } from "lucide-react";
import { useState } from "react";

export function TorNav() {
  const pathname = usePathname();
  const { variantId, setVariant } = useVariant();
  const [showVariants, setShowVariants] = useState(false);
  const allItems = navSections.flatMap(s => s.items);

  return (
    <aside className="group/rail fixed left-0 top-0 h-screen z-40
      w-[72px] hover:w-[200px]
      transition-[width] duration-200 ease-in-out
      flex flex-col overflow-hidden
      bg-white dark:bg-neutral-900
      border-r border-neutral-200/80 dark:border-neutral-800/80 shadow-sm">

      <div className="h-[60px] flex items-center px-[18px] border-b border-neutral-100 dark:border-neutral-800 shrink-0">
        <div className="w-9 h-9 bg-neutral-900 dark:bg-neutral-100 rounded-xl flex items-center justify-center shrink-0">
          <span className="text-white dark:text-neutral-900 font-black text-[15px]">O</span>
        </div>
        <span className="ml-3 font-bold text-[14px] text-neutral-900 dark:text-neutral-100 whitespace-nowrap
          opacity-0 group-hover/rail:opacity-100 transition-opacity duration-150 delay-75">
          OneLMS
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
        {allItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              className={cn("flex items-center h-10 px-2.5 rounded-xl transition-colors min-w-0",
                isActive
                  ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                  : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              )}>
              <Icon className="w-5 h-5 shrink-0" />
              <span className="ml-3 text-[13px] font-medium whitespace-nowrap
                opacity-0 group-hover/rail:opacity-100 transition-opacity duration-150 delay-75">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="px-2 py-2 border-t border-neutral-100 dark:border-neutral-800 shrink-0">
        <div className="relative">
          <button onClick={() => setShowVariants(!showVariants)}
            className={cn("flex items-center h-10 w-full px-2.5 rounded-xl transition-colors",
              showVariants
                ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                : "text-neutral-400 dark:text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}>
            <LayoutGrid className="w-5 h-5 shrink-0" />
            <span className="ml-3 text-[13px] font-medium whitespace-nowrap
              opacity-0 group-hover/rail:opacity-100 transition-opacity duration-150 delay-75">
              Layout
            </span>
          </button>
          {showVariants && (
            <div className="absolute bottom-full left-[calc(100%+8px)] mb-1 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl p-1.5 w-44 z-50">
              <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-2 mb-1 pt-1">Layout tanlash</p>
              {VARIANT_LIST.map(v => (
                <button key={v.id} onClick={() => { setVariant(v.id); setShowVariants(false); }}
                  className={cn("w-full flex flex-col px-2.5 py-2 rounded-lg text-left transition-colors",
                    variantId === v.id
                      ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                      : "hover:bg-neutral-50 dark:hover:bg-neutral-800"
                  )}>
                  <span className={cn("text-[12px] font-semibold", variantId !== v.id && "text-neutral-800 dark:text-neutral-200")}>{v.name}</span>
                  <span className={cn("text-[10px]", variantId === v.id ? "text-neutral-300 dark:text-neutral-600" : "text-neutral-400")}>{v.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="px-2 pb-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 shrink-0 flex flex-col gap-1">
        <div className="flex items-center h-10 px-2.5 rounded-xl transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800">
          <ThemeToggle />
        </div>
        <div className="flex items-center h-10 px-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer">
          <div className="w-8 h-8 bg-neutral-900 dark:bg-neutral-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-white dark:text-neutral-900 text-[11px] font-bold">SA</span>
          </div>
          <div className="ml-2.5 opacity-0 group-hover/rail:opacity-100 transition-opacity duration-150 delay-75">
            <p className="text-[12px] font-semibold text-neutral-900 dark:text-neutral-100 whitespace-nowrap">Super Admin</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span className="text-[10px] text-neutral-400 whitespace-nowrap">Online</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
