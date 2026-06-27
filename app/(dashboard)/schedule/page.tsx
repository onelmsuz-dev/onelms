"use client";

import { useState, useMemo } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { MOCK_SCHEDULE } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, CalendarDays, LayoutGrid, List, Plus } from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const UZ_DAYS   = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
const UZ_DAYS_S = ["Du", "Se", "Cho", "Pay", "Ju", "Sha"];
const UZ_MONTHS = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
const UZ_MONTHS_S = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];

// JS weekday → Uzbek day name (Monday=1..Saturday=6, Sunday=0 → no classes)
const JS_TO_UZ: Record<number, string> = { 1:"Dushanba",2:"Seshanba",3:"Chorshanba",4:"Payshanba",5:"Juma",6:"Shanba" };

const TIME_SLOTS = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00"];

type ViewMode = "kun" | "hafta" | "oy";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function getMondayOf(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, n: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
         a.getMonth()    === b.getMonth()    &&
         a.getDate()     === b.getDate();
}

function getUzDay(date: Date) {
  return JS_TO_UZ[date.getDay()] ?? null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);

  const [view,        setView]        = useState<ViewMode>("hafta");
  const [selectedDay, setSelectedDay] = useState(new Date(today));
  const [weekStart,   setWeekStart]   = useState(getMondayOf(today));
  const [monthDate,   setMonthDate]   = useState(new Date(today));
  const [filterRoom,  setFilterRoom]  = useState("all");

  // navigation
  const prevWeek  = () => setWeekStart(d => addDays(d, -7));
  const nextWeek  = () => setWeekStart(d => addDays(d, +7));
  const prevDay   = () => setSelectedDay(d => addDays(d, -1));
  const nextDay   = () => setSelectedDay(d => addDays(d, +1));
  const prevMonth = () => setMonthDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setMonthDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  const goToday   = () => { setSelectedDay(new Date(today)); setWeekStart(getMondayOf(today)); setMonthDate(new Date(today)); };

  const filtered = filterRoom === "all" ? MOCK_SCHEDULE : MOCK_SCHEDULE.filter(s => s.room === filterRoom);

  const getEntries = (uzDay: string) =>
    filtered.filter(s => s.day === uzDay).sort((a, b) => toMin(a.time) - toMin(b.time));

  const getSlotEntries = (uzDay: string, slot: string) =>
    filtered.filter(s => s.day === uzDay && s.time === slot);

  // ── Shared header bar ─────────────────────────────────────────────────────

  const navLabel = (() => {
    if (view === "kun") {
      const d = selectedDay;
      return `${getUzDay(d) ?? "Yakshanba"}, ${d.getDate()} ${UZ_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    }
    if (view === "hafta") {
      const end = addDays(weekStart, 5);
      if (weekStart.getMonth() === end.getMonth())
        return `${weekStart.getDate()}–${end.getDate()} ${UZ_MONTHS[weekStart.getMonth()]} ${weekStart.getFullYear()}`;
      return `${weekStart.getDate()} ${UZ_MONTHS_S[weekStart.getMonth()]} – ${end.getDate()} ${UZ_MONTHS_S[end.getMonth()]} ${weekStart.getFullYear()}`;
    }
    return `${UZ_MONTHS[monthDate.getMonth()]} ${monthDate.getFullYear()}`;
  })();

  const onPrev = view === "kun" ? prevDay : view === "hafta" ? prevWeek : prevMonth;
  const onNext = view === "kun" ? nextDay : view === "hafta" ? nextWeek : nextMonth;

  // ── Week days array ────────────────────────────────────────────────────────
  const weekDays = Array.from({ length: 6 }, (_, i) => addDays(weekStart, i));

  // ── Month calendar ─────────────────────────────────────────────────────────
  const calStart = (() => {
    const d = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    return getMondayOf(d);
  })();
  const calCells = Array.from({ length: 42 }, (_, i) => addDays(calStart, i));

  return (
    <div className="flex flex-col h-screen">
      <TopHeader title="Jadval" subtitle="Dars jadvali" action={{ label: "Dars qo'shish" }} />

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shrink-0 flex-wrap">

        {/* View toggle */}
        <div className="flex gap-0.5 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl">
          {([
            { id: "kun",   label: "Kun",   icon: List },
            { id: "hafta", label: "Hafta", icon: LayoutGrid },
            { id: "oy",    label: "Oy",    icon: CalendarDays },
          ] as { id: ViewMode; label: string; icon: React.ComponentType<{ className?: string }> }[]).map(v => {
            const Icon = v.icon;
            return (
              <button key={v.id} onClick={() => setView(v.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                  view === v.id
                    ? "bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-neutral-100"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                )}>
                <Icon className="w-3.5 h-3.5" />
                {v.label}
              </button>
            );
          })}
        </div>

        {/* Nav arrows + label */}
        <div className="flex items-center gap-1">
          <button onClick={onPrev}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300 min-w-[200px] text-center">
            {navLabel}
          </span>
          <button onClick={onNext}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button onClick={goToday}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-neutral-200 dark:border-neutral-700
            text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
          Bugun
        </button>

        {/* Room filter */}
        <select value={filterRoom} onChange={e => setFilterRoom(e.target.value)}
          className="ml-auto text-xs h-8 px-2 rounded-lg border border-neutral-200 dark:border-neutral-700
            bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 outline-none">
          <option value="all">Barcha xonalar</option>
          {Array.from(new Set(MOCK_SCHEDULE.map(s => s.room))).map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      {/* ── KUN view ──────────────────────────────────────────────────────────── */}
      {view === "kun" && (() => {
        const uzDay = getUzDay(selectedDay);
        const entries = uzDay ? getEntries(uzDay) : [];
        const isToday = isSameDay(selectedDay, today);
        return (
          <div className="flex-1 overflow-auto p-5">
            {/* Day header */}
            <div className={cn(
              "rounded-2xl p-4 mb-4 flex items-center justify-between",
              isToday ? "bg-neutral-900 dark:bg-neutral-100" : "bg-neutral-50 dark:bg-neutral-800"
            )}>
              <div>
                <p className={cn("text-xs font-semibold uppercase tracking-widest",
                  isToday ? "text-neutral-400 dark:text-neutral-600" : "text-neutral-400 dark:text-neutral-500")}>
                  {isToday ? "Bugun" : UZ_MONTHS[selectedDay.getMonth()]}
                </p>
                <p className={cn("text-2xl font-black mt-0.5",
                  isToday ? "text-white dark:text-neutral-900" : "text-neutral-900 dark:text-neutral-100")}>
                  {uzDay ?? "Yakshanba"} · {selectedDay.getDate()}
                </p>
              </div>
              <div className={cn("text-right text-sm",
                isToday ? "text-neutral-300 dark:text-neutral-600" : "text-neutral-500 dark:text-neutral-400")}>
                <p className="font-bold text-lg">{entries.length}</p>
                <p className="text-xs">ta dars</p>
              </div>
            </div>

            {!uzDay ? (
              <div className="text-center py-16 text-neutral-400 dark:text-neutral-600">
                <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">Yakshanba — dam olish kuni</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-16 text-neutral-400 dark:text-neutral-600">
                <CalendarDays className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-semibold">Bu kunda dars yo'q</p>
              </div>
            ) : (
              <div className="relative ml-16">
                {/* Timeline line */}
                <div className="absolute left-0 top-0 bottom-0 w-px bg-neutral-200 dark:bg-neutral-700 -translate-x-8" />
                <div className="space-y-3">
                  {entries.map(entry => (
                    <div key={entry.id} className="relative">
                      {/* Time dot */}
                      <div className="absolute -left-8 top-3 w-3 h-3 rounded-full bg-white dark:bg-neutral-900 border-2 border-neutral-300 dark:border-neutral-600 -translate-x-1.5" />
                      {/* Time label */}
                      <div className="absolute -left-16 top-2 text-right">
                        <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">{entry.time}</p>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-600">{entry.endTime}</p>
                      </div>
                      {/* Entry card */}
                      <div className={cn(
                        "rounded-xl border-l-4 p-4 cursor-pointer hover:shadow-md transition-shadow",
                        entry.color
                      )}>
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-bold text-[14px] leading-tight">{entry.groupName}</p>
                            <p className="text-[12px] opacity-70 mt-0.5">{entry.courseName}</p>
                          </div>
                          <span className="text-[11px] font-semibold opacity-70 bg-white/40 dark:bg-black/20 px-2 py-0.5 rounded-full">
                            {entry.time}–{entry.endTime}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <span className="text-[12px] opacity-75">📍 {entry.room}</span>
                          <span className="text-[12px] opacity-75">👤 {entry.teacherName}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── HAFTA view ────────────────────────────────────────────────────────── */}
      {view === "hafta" && (
        <div className="flex-1 overflow-auto">
          <div className="min-w-[720px] p-4">
            {/* Day headers */}
            <div className="grid gap-1 mb-1" style={{ gridTemplateColumns: "56px repeat(6, 1fr)" }}>
              <div />
              {weekDays.map((d, i) => {
                const isToday = isSameDay(d, today);
                return (
                  <button key={i}
                    onClick={() => { setSelectedDay(d); setView("kun"); }}
                    className={cn(
                      "rounded-xl py-2 text-center transition-colors cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800",
                      isToday && "bg-neutral-900 dark:bg-neutral-100"
                    )}>
                    <p className={cn("text-[10px] font-bold uppercase tracking-wider",
                      isToday ? "text-neutral-300 dark:text-neutral-600" : "text-neutral-400 dark:text-neutral-500")}>
                      {UZ_DAYS_S[i]}
                    </p>
                    <p className={cn("text-[15px] font-black mt-0.5",
                      isToday ? "text-white dark:text-neutral-900" : "text-neutral-700 dark:text-neutral-200")}>
                      {d.getDate()}
                    </p>
                    <p className={cn("text-[10px] mt-0.5",
                      isToday ? "text-neutral-400 dark:text-neutral-600" : "text-neutral-400 dark:text-neutral-500")}>
                      {UZ_MONTHS_S[d.getMonth()]}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Time grid */}
            {TIME_SLOTS.map(slot => (
              <div key={slot} className="grid gap-1 mb-0.5" style={{ gridTemplateColumns: "56px repeat(6, 1fr)" }}>
                <div className="flex items-start justify-end pr-2 pt-1.5">
                  <span className="text-[10px] font-medium text-neutral-400 dark:text-neutral-600">{slot}</span>
                </div>
                {weekDays.map((d, i) => {
                  const uzDay = UZ_DAYS[i];
                  const entries = getSlotEntries(uzDay, slot);
                  const isToday = isSameDay(d, today);
                  return (
                    <div key={i}
                      className={cn(
                        "min-h-[48px] rounded-lg border border-transparent transition-colors",
                        entries.length === 0
                          ? isToday
                            ? "bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200/60 dark:border-neutral-700/40"
                            : "bg-neutral-50/40 dark:bg-neutral-800/10 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/30"
                          : ""
                      )}>
                      {entries.map(entry => (
                        <div key={entry.id}
                          className={cn(
                            "border-l-[3px] rounded-md p-1.5 mb-0.5 cursor-pointer hover:opacity-80 transition-opacity text-left",
                            entry.color
                          )}>
                          <p className="text-[10px] font-bold leading-tight truncate">{entry.groupName}</p>
                          <p className="text-[9px] opacity-60 mt-0.5">{entry.time}–{entry.endTime}</p>
                          <p className="text-[9px] opacity-55 truncate">📍{entry.room}</p>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── OY view ───────────────────────────────────────────────────────────── */}
      {view === "oy" && (
        <div className="flex-1 overflow-auto p-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {["Du","Se","Cho","Pay","Ju","Sha","Yak"].map(d => (
              <div key={d} className="text-center py-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">{d}</span>
              </div>
            ))}
          </div>

          {/* Calendar grid — 6 weeks */}
          <div className="grid grid-cols-7 gap-1">
            {calCells.map((d, i) => {
              const inMonth  = d.getMonth() === monthDate.getMonth();
              const isToday  = isSameDay(d, today);
              const isSel    = isSameDay(d, selectedDay);
              const uzDay    = getUzDay(d);
              const entries  = uzDay ? filtered.filter(s => s.day === uzDay) : [];
              const count    = entries.length;
              // Stop rendering after 6 full weeks if month ended
              if (i >= 35 && d.getMonth() !== monthDate.getMonth()) return null;

              return (
                <button key={i}
                  onClick={() => { setSelectedDay(new Date(d)); setView("kun"); }}
                  className={cn(
                    "rounded-xl p-1.5 min-h-[72px] flex flex-col items-center transition-colors text-left w-full",
                    !inMonth && "opacity-30",
                    isToday && "bg-neutral-900 dark:bg-neutral-100",
                    isSel && !isToday && "ring-2 ring-neutral-400 dark:ring-neutral-500",
                    !isToday && "hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}>
                  <span className={cn(
                    "text-[13px] font-bold w-7 h-7 flex items-center justify-center rounded-full",
                    isToday ? "text-white dark:text-neutral-900" : "text-neutral-700 dark:text-neutral-200"
                  )}>
                    {d.getDate()}
                  </span>

                  {count > 0 && inMonth && (
                    <div className="mt-1 w-full space-y-0.5">
                      {entries.slice(0, 2).map(e => (
                        <div key={e.id} className={cn(
                          "text-[9px] font-semibold px-1 py-0.5 rounded truncate w-full",
                          e.color
                        )}>
                          {e.time} {e.groupName}
                        </div>
                      ))}
                      {count > 2 && (
                        <div className="text-[9px] text-neutral-400 dark:text-neutral-500 px-1">
                          +{count - 2} ta
                        </div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
