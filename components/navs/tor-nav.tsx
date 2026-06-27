"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navSections } from "@/components/layout/nav-config";
import { ThemeToggle } from "@/components/theme-toggle";

export function TorNav() {
  const pathname = usePathname();
  const allItems = navSections.flatMap(s => s.items);

  return (
    <aside className="group/rail fixed left-0 top-0 h-screen z-40
      w-[72px] hover:w-[200px]
      transition-[width] duration-200 ease-in-out
      flex flex-col overflow-hidden
      bg-white dark:bg-neutral-900
      border-r border-neutral-200/80 dark:border-neutral-800/80 shadow-sm">

      {/* Logo */}
      <div className="h-[60px] flex items-center px-[18px] border-b border-neutral-100 dark:border-neutral-800 shrink-0">
        <div className="w-9 h-9 bg-neutral-900 dark:bg-neutral-100 rounded-xl flex items-center justify-center shrink-0">
          <span className="text-white dark:text-neutral-900 font-black text-[15px]">O</span>
        </div>
        <span className="ml-3 font-bold text-[14px] text-neutral-900 dark:text-neutral-100 whitespace-nowrap
          opacity-0 group-hover/rail:opacity-100 transition-opacity duration-150 delay-75">
          OneLMS
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 flex flex-col gap-0.5">
        {allItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center h-10 px-2.5 rounded-xl transition-colors min-w-0",
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

      {/* User + theme */}
      <div className="px-2 pb-3 pt-2 border-t border-neutral-100 dark:border-neutral-800 shrink-0 flex flex-col gap-1">
        <div className="flex items-center h-10 px-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
          <ThemeToggle />
          <span className="ml-3 text-[13px] font-medium whitespace-nowrap text-neutral-500 dark:text-neutral-400
            opacity-0 group-hover/rail:opacity-100 transition-opacity duration-150 delay-75">
            Mavzu
          </span>
        </div>
        <div className="flex items-center h-10 px-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer">
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
