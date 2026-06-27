"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navSections } from "@/components/layout/nav-config";
import { useVariant, VARIANT_LIST } from "@/hooks/use-variant";
import { ThemeToggle } from "@/components/theme-toggle";

export function QoraNavi() {
  const pathname = usePathname();
  const { variantId, setVariant } = useVariant();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] flex flex-col z-40 bg-[#0d0d12] dark:bg-[#080810]">
      <div className="flex items-center gap-3 px-5 h-[56px] border-b border-white/[0.06] shrink-0">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shrink-0">
          <span className="text-white font-black text-[14px]">O</span>
        </div>
        <div>
          <p className="font-bold text-[13px] text-white">OneLMS</p>
          <p className="text-[10px] text-white/30">smart-markaz.onelms.uz</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
        {navSections.map(section => {
          const SectionIcon = section.icon;
          return (
            <div key={section.id}>
              <div className="flex items-center gap-2 px-2 mb-1.5">
                <SectionIcon className="w-3 h-3 text-white/20" />
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/25">{section.label}</span>
              </div>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                  return (
                    <Link key={item.href} href={item.href}
                      className={cn("flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] transition-colors",
                        isActive
                          ? "bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30"
                          : "text-white/50 hover:text-white/90 hover:bg-white/[0.06]"
                      )}>
                      <Icon className={cn("w-[15px] h-[15px] shrink-0", isActive ? "text-indigo-400" : "text-white/30")} />
                      {item.label}
                      {isActive && <span className="ml-auto w-1.5 h-1.5 bg-indigo-400 rounded-full shrink-0" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="px-3 pt-3 pb-2 border-t border-white/[0.06] shrink-0">
        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/20 mb-2 px-2">Layout</p>
        <div className="grid grid-cols-5 gap-1">
          {VARIANT_LIST.map(v => (
            <button key={v.id} onClick={() => setVariant(v.id)} title={v.desc}
              className={cn("h-6 text-[9px] font-bold rounded-md border transition-colors",
                variantId === v.id
                  ? "bg-indigo-500 text-white border-indigo-500"
                  : "text-white/30 border-white/10 hover:border-white/30 hover:text-white/60"
              )}>
              {v.name}
            </button>
          ))}
        </div>
      </div>

      <div className="p-3 border-t border-white/[0.06] shrink-0 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center shrink-0">
          <span className="text-white text-xs font-bold">SA</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-white truncate">Super Admin</p>
          <p className="text-[11px] text-white/30 truncate">Tizim egasi</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
