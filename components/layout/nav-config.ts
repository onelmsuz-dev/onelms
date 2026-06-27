import {
  LayoutDashboard, Users, GraduationCap, BookOpen, CalendarDays,
  ClipboardList, Wallet, BarChart3, Settings, UserCheck, Target,
  Home, Megaphone, Layers, Banknote, Wrench, type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface NavSection {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

export const navSections: NavSection[] = [
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

export function getActiveSection(pathname: string): string {
  for (const s of navSections) {
    if (s.items.some(i => pathname === i.href || pathname?.startsWith(i.href + "/"))) return s.id;
  }
  return "asosiy";
}
