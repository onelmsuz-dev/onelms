"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, GraduationCap, BookOpen, CalendarDays,
  ClipboardList, Wallet, BarChart3, Settings, UserCheck, Target,
  ChevronRight, Home, Megaphone, Layers, Banknote, Wrench,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useVariant, VARIANT_LIST } from "@/hooks/use-variant";
import { ThemeToggle } from "@/components/theme-toggle";

const navSections = [
  {
    id: "asosiy", label: "Asosiy", icon: Home,
    items: [{ href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    id: "crm", label: "CRM", icon: Megaphone,
    items: [{ href: "/leads", label: "Lidlar", icon: Target }],
  },
  {
    id: "talim", label: "Ta'lim", icon: BookOpen,
    items: [
      { href: "/courses", label: "Kurslar", icon: Layers },
      { href: "/groups", label: "Guruhlar", icon: Users },
      { href: "/schedule", label: "Jadval", icon: CalendarDays },
      { href: "/attendance", label: "Davomat", icon: UserCheck },
    ],
  },
  {
    id: "odamlar", label: "Odamlar", icon: GraduationCap,
    items: [
      { href: "/students", label: "O'quvchilar", icon: GraduationCap },
      { href: "/teachers", label: "O'qituvchilar", icon: ClipboardList },
    ],
  },
  {
    id: "moliya", label: "Moliyaviy", icon: Banknote,
    items: [
      { href: "/finance", label: "Moliya", icon: Wallet },
      { href: "/reports", label: "Hisobotlar", icon: BarChart3 },
    ],
  },
  {
    id: "tizim", label: "Tizim", icon: Wrench,
    items: [{ href: "/settings", label: "Sozlamalar", icon: Settings }],
  },
];

function getActiveSectionId(pathname: string) {
  for (const s of navSections) {
    if (s.items.some((i) => pathname === i.href || pathname?.startsWith(i.href + "/"))) return s.id;
  }
  return "asosiy";
}

export function AppSidebar() {
  const pathname = usePathname();
  const { variantId, setVariant } = useVariant();
  const [openSection, setOpenSection] = useState(() => getActiveSectionId(pathname ?? ""));

  useEffect(() => { setOpenSection(getActiveSectionId(pathname ?? "")); }, [pathname]);

  const toggle = (id: string) =>
    setOpenSection((prev) => (prev === id ? "" : id));

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col z-40 bg-white dark:bg-neutral-900 border-r border-neutral-200/80 dark:border-neutral-800/80">

      {/* Logo + dark toggle */}
      <div className="flex items-center justify-between px-5 h-[60px] border-b border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-neutral-900 dark:bg-neutral-100 rounded-[var(--v-sidebar-item-radius,8px)] flex items-center justify-center shrink-0">
            <span className="text-white dark:text-neutral-900 font-bold text-sm">O</span>
          </div>
          <div className="leading-tight">
            <p className="font-semibold text-[13px] text-neutral-900 dark:text-neutral-100 tracking-tight">OneLMS</p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500">smart-markaz.onelms.uz</p>
          </div>
        </div>
        <ThemeToggle />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        {navSections.map((section) => {
          const SectionIcon = section.icon;
          const isOpen = openSection === section.id;
          const hasActive = section.items.some(
            (item) => pathname === item.href || pathname?.startsWith(item.href + "/")
          );

          return (
            <div key={section.id}>
              <button
                onClick={() => toggle(section.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 text-[13px] font-medium transition-all duration-150 group",
                  "rounded-[var(--v-sidebar-item-radius,8px)]",
                  isOpen || hasActive
                    ? "text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                )}
              >
                <SectionIcon
                  className={cn(
                    "w-[17px] h-[17px] shrink-0 transition-colors",
                    isOpen || hasActive
                      ? "text-neutral-800 dark:text-neutral-200"
                      : "text-neutral-400 dark:text-neutral-500 group-hover:text-neutral-600 dark:group-hover:text-neutral-300"
                  )}
                />
                <span className="flex-1 text-left tracking-tight">{section.label}</span>
                <ChevronRight
                  className={cn(
                    "w-3.5 h-3.5 text-neutral-300 dark:text-neutral-600 transition-transform duration-200",
                    isOpen && "rotate-90"
                  )}
                />
              </button>

              {isOpen && (
                <div className="mt-0.5 ml-4 pl-3 border-l border-neutral-100 dark:border-neutral-800 py-0.5 space-y-0.5">
                  {section.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-2.5 px-3 py-2 text-[13px] transition-all duration-100",
                          "rounded-[var(--v-sidebar-item-radius,8px)]",
                          isActive
                            ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 font-medium"
                            : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                        )}
                      >
                        <ItemIcon
                          className={cn(
                            "w-4 h-4 shrink-0",
                            isActive ? "text-white dark:text-neutral-900" : "text-neutral-400 dark:text-neutral-500"
                          )}
                        />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Variant Picker */}
      <div className="px-4 pt-3 pb-2 border-t border-neutral-100 dark:border-neutral-800">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-600 mb-2.5">
          Dizayn Stili
        </p>
        <div className="grid grid-cols-5 gap-1.5">
          {VARIANT_LIST.map((v) => (
            <button
              key={v.id}
              onClick={() => setVariant(v.id)}
              title={v.desc}
              className={cn(
                "relative h-8 w-full text-[10px] font-semibold transition-all duration-150 border",
                "rounded-[var(--v-sidebar-item-radius,8px)]",
                variantId === v.id
                  ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100"
                  : "text-neutral-500 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
              )}
            >
              {v.name}
            </button>
          ))}
        </div>
      </div>

      {/* User */}
      <div className="p-3 border-t border-neutral-100 dark:border-neutral-800">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-[var(--v-sidebar-item-radius,8px)] hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer transition-colors">
          <div className="w-8 h-8 bg-neutral-900 dark:bg-neutral-100 rounded-full flex items-center justify-center shrink-0">
            <span className="text-white dark:text-neutral-900 text-xs font-semibold">SA</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100 truncate leading-tight">Super Admin</p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate leading-tight">Tizim egasi</p>
          </div>
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
        </div>
      </div>
    </aside>
  );
}
