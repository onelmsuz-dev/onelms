"use client";

import { useState, useMemo } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { MOCK_SCHEDULE } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, CalendarDays, LayoutGrid, List } from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const UZ_DAYS   = ["Dushanba","Seshanba","Chorshanba","Payshanba","Juma","Shanba"];
const UZ_DAYS_S = ["Du","Se","Cho","Pay","Ju","Sha"];
const UZ_MONTHS = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
const UZ_MONTHS_S = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];

// JS getDay() → Uzbek day index (1=Du, 2=Se, ..., 6=Sha; 0=Yak)
const JS_TO_IDX: Record<number, number> = { 1:0, 2:1, 3:2, 4:3, 5:4, 6:5 };

const DAY_START = 8;          // 08:00
const DAY_END   = 20;         // 20:00
const HOUR_H    = 64;         // px per hour
const TOTAL_H   = (DAY_END - DAY_START) * HOUR_H; // 768px
const HOURS     = Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => i + DAY_START);
const TIME_W    = 52;         // px width of time label column

type ViewMode = "kun" | "hafta" | "oy";

// ─── Pure helpers ────────────────────────────────────────────────────────────

function toMin(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}
function blockTop(time: string) {
  return ((toMin(time) - DAY_START * 60) / 60) * HOUR_H;
}
function blockH(start: string, end: string) {
  return ((toMin(end) - toMin(start)) / 60) * HOUR_H;
}
function getMondayOf(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}
function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}
function getUzIdx(date: Date): number | null {
  const v = JS_TO_IDX[date.getDay()];
  return v !== undefined ? v : null;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const today = useMemo(() => {
    const d = new Date(); d.setHours(0, 0, 0, 0); return d;
  }, []);

  const [view,      setView]      = useState<ViewMode>("hafta");
  const [selDay,    setSelDay]    = useState(new Date(today));
  const [weekStart, setWeekStart] = useState(getMondayOf(today));
  const [monthDate, setMonthDate] = useState(new Date(today));

  const weekDays = useMemo(
    () => Array.from({ length: 6 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const calCells = useMemo(() => {
    const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    return Array.from({ length: 42 }, (_, i) => addDays(getMondayOf(first), i));
  }, [monthDate]);

  function goToday() {
    setSelDay(new Date(today));
    setWeekStart(getMondayOf(today));
    setMonthDate(new Date(today));
  }
  function onPrev() {
    if (view === "kun")        setSelDay(d => addDays(d, -1));
    else if (view === "hafta") setWeekStart(d => addDays(d, -7));
    else setMonthDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  function onNext() {
    if (view === "kun")        setSelDay(d => addDays(d, +1));
    else if (view === "hafta") setWeekStart(d => addDays(d, +7));
    else setMonthDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  const navLabel = useMemo(() => {
    if (view === "kun") {
      const i = getUzIdx(selDay);
      return `${i !== null ? UZ_DAYS[i] : "Yakshanba"}, ${selDay.getDate()} ${UZ_MONTHS[selDay.getMonth()]} ${selDay.getFullYear()}`;
    }
    if (view === "hafta") {
      const end = addDays(weekStart, 5);
      return weekStart.getMonth() === end.getMonth()
        ? `${weekStart.getDate()}–${end.getDate()} ${UZ_MONTHS[weekStart.getMonth()]} ${weekStart.getFullYear()}`
        : `${weekStart.getDate()} ${UZ_MONTHS_S[weekStart.getMonth()]} – ${end.getDate()} ${UZ_MONTHS_S[end.getMonth()]} ${weekStart.getFullYear()}`;
    }
    return `${UZ_MONTHS[monthDate.getMonth()]} ${monthDate.getFullYear()}`;
  }, [view, selDay, weekStart, monthDate]);

  // Columns for the time-grid views
  type GridCol = { date: Date; uzIdx: number | null; label: string };
  const gridCols = useMemo<GridCol[]>(() => {
    if (view === "hafta")
      return weekDays.map((d, i) => ({ date: d, uzIdx: i, label: UZ_DAYS_S[i] }));
    const i = getUzIdx(selDay);
    return [{ date: selDay, uzIdx: i, label: i !== null ? UZ_DAYS[i] : "Yakshanba" }];
  }, [view, weekDays, selDay]);

  const isGridView = view === "kun" || view === "hafta";

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopHeader title="Jadval" subtitle="Dars jadvali" action={{ label: "Dars qo'shish" }} />

      {/* ── Toolbar ──────────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-2.5
        border-b border-neutral-100 dark:border-neutral-800
        bg-white dark:bg-neutral-900">

        {/* View switcher */}
        <div className="flex p-1 gap-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
          {([
            ["kun",   "Kun",   List],
            ["hafta", "Hafta", LayoutGrid],
            ["oy",    "Oy",    CalendarDays],
          ] as [ViewMode, string, React.ComponentType<{ className?: string }>][]).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setView(id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                view === id
                  ? "bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-neutral-100"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              )}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>

        {/* Date navigation */}
        <div className="flex items-center gap-1 ml-2">
          <button onClick={onPrev}
            className="w-7 h-7 flex items-center justify-center rounded-lg
              hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-200
            min-w-[190px] text-center select-none">
            {navLabel}
          </span>
          <button onClick={onNext}
            className="w-7 h-7 flex items-center justify-center rounded-lg
              hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <button onClick={goToday}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg
            border border-neutral-200 dark:border-neutral-700
            text-neutral-600 dark:text-neutral-400
            hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
          Bugun
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TIME GRID  (Kun & Hafta)
          Each class block is positioned absolutely by start time + duration.
          This is the Google Calendar / Notion Calendar approach.
      ══════════════════════════════════════════════════════════════════════ */}
      {isGridView && (
        <div className="flex-1 overflow-auto">

          {/* Sticky day header row */}
          <div className="sticky top-0 z-20 flex
            border-b border-neutral-100 dark:border-neutral-800
            bg-white dark:bg-neutral-900">
            {/* spacer over time column */}
            <div style={{ width: TIME_W, minWidth: TIME_W }}
              className="shrink-0 border-r border-neutral-100 dark:border-neutral-800" />
            {gridCols.map((col, i) => {
              const isToday = sameDay(col.date, today);
              return (
                <div key={i}
                  onClick={() => {
                    if (view === "hafta") { setSelDay(new Date(col.date)); setView("kun"); }
                  }}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center py-3 gap-px",
                    "border-r border-neutral-100 dark:border-neutral-800 last:border-r-0",
                    view === "hafta" && "cursor-pointer transition-colors",
                    isToday
                      ? "bg-neutral-900 dark:bg-white"
                      : view === "hafta" ? "hover:bg-neutral-50 dark:hover:bg-neutral-800/50" : ""
                  )}>
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest",
                    isToday ? "text-white/50 dark:text-neutral-900/50"
                            : "text-neutral-400 dark:text-neutral-500")}>
                    {col.label}
                  </span>
                  <span className={cn("text-[22px] font-black leading-none",
                    isToday ? "text-white dark:text-neutral-900"
                            : "text-neutral-800 dark:text-neutral-100")}>
                    {col.date.getDate()}
                  </span>
                  <span className={cn("text-[10px]",
                    isToday ? "text-white/40 dark:text-neutral-900/40"
                            : "text-neutral-400 dark:text-neutral-500")}>
                    {UZ_MONTHS_S[col.date.getMonth()]}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Grid body */}
          <div className="flex">

            {/* Time label column */}
            <div className="shrink-0 border-r border-neutral-100 dark:border-neutral-800 relative"
              style={{ width: TIME_W, height: TOTAL_H }}>
              {HOURS.map((h, i) => (
                <span key={h}
                  className="absolute right-2 text-[10px] font-medium text-neutral-400 dark:text-neutral-600 tabular-nums select-none"
                  style={{ top: i * HOUR_H + 3 }}>
                  {String(h).padStart(2, "0")}:00
                </span>
              ))}
            </div>

            {/* Day columns */}
            {gridCols.map((col, ci) => {
              const isToday = sameDay(col.date, today);
              const uzDayName = col.uzIdx !== null ? UZ_DAYS[col.uzIdx] : null;
              const entries = uzDayName
                ? MOCK_SCHEDULE
                    .filter(s => s.day === uzDayName)
                    .sort((a, b) => toMin(a.time) - toMin(b.time))
                : [];

              return (
                <div key={ci}
                  className={cn(
                    "flex-1 relative border-r border-neutral-100 dark:border-neutral-800 last:border-r-0",
                    isToday && "bg-blue-50/25 dark:bg-blue-900/10"
                  )}
                  style={{ height: TOTAL_H }}>

                  {/* Solid hour lines */}
                  {HOURS.map((_, i) => (
                    <div key={i}
                      className="absolute inset-x-0 border-t border-neutral-100 dark:border-neutral-800"
                      style={{ top: i * HOUR_H }} />
                  ))}

                  {/* Dashed half-hour lines */}
                  {HOURS.slice(0, -1).map((_, i) => (
                    <div key={`hh${i}`}
                      className="absolute inset-x-0 border-t border-dashed border-neutral-100 dark:border-neutral-800/60"
                      style={{ top: i * HOUR_H + HOUR_H / 2 }} />
                  ))}

                  {/* Class blocks — positioned by time */}
                  {entries.map(entry => {
                    const top     = blockTop(entry.time);
                    const height  = blockH(entry.time, entry.endTime);
                    const compact = height < 52;
                    return (
                      <div key={entry.id}
                        className={cn(
                          "absolute inset-x-1.5 rounded-lg overflow-hidden cursor-pointer",
                          "border border-l-[3px] shadow-sm",
                          "transition-all hover:brightness-95 hover:shadow-md active:scale-[0.99]",
                          entry.color
                        )}
                        style={{ top: top + 2, height: Math.max(height - 4, 20) }}>
                        <div className="px-2 py-1.5 h-full flex flex-col overflow-hidden">
                          <p className={cn("font-bold truncate leading-tight",
                            compact ? "text-[10px]" : "text-[12px]")}>
                            {entry.groupName}
                          </p>
                          {!compact && (
                            <>
                              <p className="text-[10px] opacity-60 mt-0.5 tabular-nums">
                                {entry.time}–{entry.endTime}
                              </p>
                              <p className="text-[10px] opacity-55 truncate mt-0.5">
                                {entry.room} · {entry.teacherName}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          MONTH CALENDAR
      ══════════════════════════════════════════════════════════════════════ */}
      {view === "oy" && (
        <div className="flex-1 overflow-auto p-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {["Dushanba","Seshanba","Chorshanba","Payshanba","Juma","Shanba","Yakshanba"].map(d => (
              <div key={d} className="text-center py-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  {d.slice(0, 3)}
                </span>
              </div>
            ))}
          </div>

          {/* Calendar cells */}
          <div className="grid grid-cols-7 gap-px rounded-2xl overflow-hidden
            bg-neutral-200 dark:bg-neutral-700
            border border-neutral-200 dark:border-neutral-700">
            {calCells.slice(0, 42).map((d, i) => {
              const inMonth = d.getMonth() === monthDate.getMonth();
              if (i >= 35 && !inMonth) {
                return <div key={i} className="bg-white dark:bg-neutral-900 h-24" />;
              }

              const isToday = sameDay(d, today);
              const isSel   = sameDay(d, selDay);
              const idx     = getUzIdx(d);
              const entries = idx !== null && inMonth
                ? MOCK_SCHEDULE.filter(s => s.day === UZ_DAYS[idx])
                : [];

              return (
                <button key={i}
                  onClick={() => { setSelDay(new Date(d)); setView("kun"); }}
                  className={cn(
                    "bg-white dark:bg-neutral-900 h-24 p-2 text-left flex flex-col gap-1",
                    "hover:bg-neutral-50 dark:hover:bg-neutral-800/70 transition-colors",
                    !inMonth && "opacity-25"
                  )}>
                  <span className={cn(
                    "w-6 h-6 flex items-center justify-center rounded-full text-[12px] font-bold shrink-0",
                    isToday
                      ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                      : isSel
                        ? "ring-2 ring-neutral-400 dark:ring-neutral-500 text-neutral-700 dark:text-neutral-200"
                        : "text-neutral-700 dark:text-neutral-300"
                  )}>
                    {d.getDate()}
                  </span>
                  <div className="flex flex-col gap-px flex-1 overflow-hidden">
                    {entries.slice(0, 3).map(e => (
                      <div key={e.id}
                        className={cn("text-[9px] font-semibold px-1.5 py-px rounded-sm truncate", e.color)}>
                        {e.time} {e.groupName}
                      </div>
                    ))}
                    {entries.length > 3 && (
                      <span className="text-[9px] text-neutral-400 dark:text-neutral-500 px-1">
                        +{entries.length - 3} ta
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
