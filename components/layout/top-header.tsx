"use client";

import { ReactNode, useState, useRef, useEffect } from "react";
import { Bell, Search, Plus, DollarSign, UserPlus, Users, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications, type Notification } from "@/lib/hooks/useNotifications";
import { cn } from "@/lib/utils";

interface TopHeaderProps {
  title: string;
  subtitle?: ReactNode;
  action?: { label: string; onClick?: () => void };
}

const TYPE_ICON: Record<string, { icon: typeof DollarSign; cls: string }> = {
  payment: { icon: DollarSign, cls: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" },
  lead:    { icon: UserPlus,   cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
  student: { icon: Users,      cls: "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" },
};

function NotifIcon({ type }: { type: string }) {
  const cfg = TYPE_ICON[type] ?? TYPE_ICON["student"];
  const Icon = cfg.icon;
  return (
    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center shrink-0", cfg.cls)}>
      <Icon className="w-4 h-4" />
    </div>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)  return "Hozirgina";
  if (mins < 60) return `${mins} daq. oldin`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs} soat oldin`;
  return `${Math.floor(hrs / 24)} kun oldin`;
}

export function TopHeader({ title, subtitle, action }: TopHeaderProps) {
  const [showNotif, setShowNotif] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const { items, unread, markAllRead } = useNotifications();

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    }
    if (showNotif) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showNotif]);

  function handleOpen() {
    setShowNotif(v => !v);
  }

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

        {/* Bell */}
        <div className="relative" ref={panelRef}>
          <button onClick={handleOpen}
            className="relative w-9 h-9 flex items-center justify-center rounded-xl transition-colors
              text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100
              hover:bg-neutral-100 dark:hover:bg-neutral-800">
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[14px] h-[14px] bg-red-500 rounded-full
                text-[9px] text-white font-bold flex items-center justify-center px-0.5">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-full mt-1.5 w-80 bg-white dark:bg-neutral-900
              border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <h3 className="text-[13px] font-bold text-neutral-900 dark:text-neutral-100">Bildirishnomalar</h3>
                  {unread > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unread}
                    </span>
                  )}
                </div>
                {unread > 0 && (
                  <button onClick={markAllRead}
                    className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                    <Check className="w-3 h-3" /> Barchasini o'qildi
                  </button>
                )}
              </div>

              {/* Items */}
              <div className="max-h-[340px] overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center py-10 text-neutral-400">
                    <Bell className="w-8 h-8 mb-2 opacity-30" />
                    <p className="text-[12px]">Bildirishnomalar yo'q</p>
                  </div>
                ) : (
                  items.map((n: Notification) => (
                    <div key={n.id}
                      className={cn(
                        "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
                        !n.isRead && "bg-blue-50/50 dark:bg-blue-900/10",
                      )}>
                      <NotifIcon type={n.type} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[12px] font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                            {n.title}
                          </p>
                          {!n.isRead && (
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5 truncate">{n.body}</p>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

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
