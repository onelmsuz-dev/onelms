"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navSections } from "@/components/layout/nav-config";
import { useVariant, VARIANT_LIST } from "@/hooks/use-variant";
import { ThemeToggle } from "@/components/theme-toggle";
import { Users, BookOpen, TrendingUp } from "lucide-react";
import { MOCK_STATS } from "@/lib/mock-data";

export function KengNav() {
  const pathname = usePathname();
  const { variantId, setVariant } = useVariant();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[300px] flex flex-col z-40 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 shadow-sm">
      <div className="px-5 pt-5 pb-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-neutral-900 dark:bg-neutral-100 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-white dark:text-neutral-900 font-black text-[17px]">O</span>
          </div>
          <div>
            <p className="font-bold text-[15px] text-neutral-900 dark:text-neutral-100 tracking-tight">OneLMS</p>
            <p className="text-[11px] text-neutral-400">smart-markaz.onelms.uz</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Users, val: MOCK_STATS.totalStudents, label: "O'quvchi" },
            { icon: BookOpen, val: MOCK_STATS.activeGroups, label: "Guruh" },
            { icon: TrendingUp, val: `${MOCK_STATS.attendance}%`, label: "Davomat" },
          ].map(({ icon: Icon, val, label }) => (
            <div key={label} className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-2.5 text-center">
              <Icon className="w-3.5 h-3.5 text-neutral-400 mx-auto mb-1" />
              <p className="font-bold text-[14px] text-neutral-900 dark:text-neutral-100 leading-none">{val}</p>
              <p className="text-[10px] text-neutral-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
        {navSections.map(section => {
          const SectionIcon = section.icon;
          return (
            <div key={section.id}>
              <div className="flex items-center gap-2 px-3 mb-2">
                <SectionIcon className="w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600" />
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-neutral-400 dark:text-neutral-500">{section.label}</span>
              </div>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                  return (
                    <Link key={item.href} href={item.href}
                      className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium group transition-colors",
                        isActive
                          ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                          : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      )}>
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        isActive
                          ? "bg-white/20 dark:bg-black/20"
                          : "bg-neutral-100 dark:bg-neutral-800 group-hover:bg-neutral-200 dark:group-hover:bg-neutral-700"
                      )}>
                        <Icon className={cn("w-3.5 h-3.5", isActive ? "text-white dark:text-neutral-900" : "text-neutral-500 dark:text-neutral-400")} />
                      </div>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="px-4 pt-3 pb-2 border-t border-neutral-100 dark:border-neutral-800 shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400 mb-2">Layout</p>
        <div className="grid grid-cols-5 gap-1">
          {VARIANT_LIST.map(v => (
            <button key={v.id} onClick={() => setVariant(v.id)} title={v.desc}
              className={cn("h-7 text-[10px] font-bold rounded-lg border transition-colors",
                variantId === v.id
                  ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100"
                  : "text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:text-neutral-800 hover:border-neutral-400"
              )}>
              {v.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors">
          <div className="w-9 h-9 bg-neutral-900 dark:bg-neutral-100 rounded-xl flex items-center justify-center shrink-0">
            <span className="text-white dark:text-neutral-900 text-[12px] font-bold">SA</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100 truncate">Super Admin</p>
            <p className="text-[11px] text-neutral-400 truncate">Tizim egasi</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </aside>
  );
}
