"use client";

import { useState, useMemo } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { MOCK_SCHEDULE } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  ChevronLeft, ChevronRight, CalendarDays, LayoutGrid, List, ChevronDown,
} from "lucide-react";

// ─── Constants ───────────────────────────────────────────────────────────────

const UZ_DAYS   = ["Dushanba","Seshanba","Chorshanba","Payshanba","Juma","Shanba"];
const UZ_DAYS_S = ["Du","Se","Cho","Pay","Ju","Sha","Yak"];
const UZ_MONTHS = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
const UZ_MONTHS_S = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];
const JS_TO_IDX: Record<number, number> = { 1:0, 2:1, 3:2, 4:3, 5:4, 6:5 };

const DAY_START = 8;
const DAY_END   = 20;
const HOUR_H    = 64;
const TOTAL_H   = (DAY_END - DAY_START) * HOUR_H;
const HOURS     = Array.from({ length: DAY_END - DAY_START + 1 }, (_, i) => i + DAY_START);
const TIME_W    = 52;

type ViewMode = "kun" | "hafta" | "oy";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toMin(t: string) { const [h,m]=t.split(":").map(Number); return h*60+(m||0); }
function blockTop(t: string)              { return ((toMin(t)-DAY_START*60)/60)*HOUR_H; }
function blockH(s: string, e: string)     { return ((toMin(e)-toMin(s))/60)*HOUR_H; }

function getMondayOf(date: Date): Date {
  const d=new Date(date), day=d.getDay();
  d.setDate(d.getDate()+(day===0?-6:1-day)); d.setHours(0,0,0,0); return d;
}
function addDays(date: Date, n: number): Date {
  const d=new Date(date); d.setDate(d.getDate()+n); return d;
}
function sameDay(a: Date, b: Date) {
  return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
}
function getUzIdx(date: Date): number|null {
  const v=JS_TO_IDX[date.getDay()]; return v!==undefined?v:null;
}

// ─── Mini calendar popover ───────────────────────────────────────────────────

interface MiniCalProps {
  pickerMonth: Date;
  onChangeMonth: (d: Date) => void;
  today: Date;
  selDay: Date;
  weekStart: Date;
  view: ViewMode;
  onPick: (d: Date) => void;
  onToday: () => void;
}

function MiniCal({ pickerMonth, onChangeMonth, today, selDay, weekStart, view, onPick, onToday }: MiniCalProps) {
  const cells = useMemo(() => {
    const first = new Date(pickerMonth.getFullYear(), pickerMonth.getMonth(), 1);
    return Array.from({ length: 42 }, (_, i) => addDays(getMondayOf(first), i));
  }, [pickerMonth]);

  const weekEnd = addDays(weekStart, 5);

  return (
    <div className="w-[272px] bg-white dark:bg-neutral-900
      border border-neutral-200 dark:border-neutral-700
      rounded-2xl shadow-2xl p-4 select-none">

      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => onChangeMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth()-1, 1))}
          className="w-7 h-7 flex items-center justify-center rounded-lg
            hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-[13px] font-bold text-neutral-800 dark:text-neutral-100">
          {UZ_MONTHS[pickerMonth.getMonth()]} {pickerMonth.getFullYear()}
        </span>
        <button onClick={() => onChangeMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth()+1, 1))}
          className="w-7 h-7 flex items-center justify-center rounded-lg
            hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {UZ_DAYS_S.map(d => (
          <div key={d} className="text-center py-0.5">
            <span className="text-[10px] font-bold text-neutral-400 dark:text-neutral-600">{d}</span>
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.slice(0, 42).map((d, i) => {
          const inMonth   = d.getMonth() === pickerMonth.getMonth();
          const isToday   = sameDay(d, today);
          const isSel     = sameDay(d, selDay);
          // Hafta view: highlight the selected week row
          const inWeek    = view === "hafta"
            && d.getTime() >= weekStart.getTime()
            && d.getTime() <= weekEnd.getTime();
          // Oy view: highlight the selected month
          const inSelMon  = view === "oy"
            && d.getMonth() === selDay.getMonth()
            && d.getFullYear() === selDay.getFullYear();

          // Skip trailing empty rows
          if (i >= 35 && !inMonth) return <div key={i} />;

          return (
            <button key={i}
              onClick={() => onPick(d)}
              className={cn(
                "h-8 flex items-center justify-center rounded-lg text-[12px] font-semibold transition-all",
                !inMonth && "opacity-30",
                // Today
                isToday && "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900",
                // Selected day
                isSel && !isToday && "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 ring-2 ring-neutral-400 dark:ring-neutral-500",
                // Week highlight (hafta view)
                inWeek && !isSel && !isToday && "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-none",
                // Month highlight (oy view)
                inSelMon && !isSel && !isToday && "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300",
                // Default hover
                !isToday && !isSel && !inWeek && !inSelMon && "hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              )}>
              {d.getDate()}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
        <button onClick={onToday}
          className="w-full py-1.5 text-[12px] font-semibold rounded-lg
            text-neutral-600 dark:text-neutral-400
            hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors">
          Bugungi sana
        </button>
      </div>
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const today = useMemo(() => { const d=new Date(); d.setHours(0,0,0,0); return d; }, []);

  const [view,        setView]        = useState<ViewMode>("hafta");
  const [selDay,      setSelDay]      = useState(new Date(today));
  const [weekStart,   setWeekStart]   = useState(getMondayOf(today));
  const [monthDate,   setMonthDate]   = useState(new Date(today));
  const [pickerOpen,  setPickerOpen]  = useState(false);
  const [pickerMonth, setPickerMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const weekDays = useMemo(() => Array.from({length:6},(_,i)=>addDays(weekStart,i)), [weekStart]);
  const calCells = useMemo(() => {
    const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    return Array.from({length:42},(_,i)=>addDays(getMondayOf(first),i));
  }, [monthDate]);

  function goToday() {
    const d=new Date(today);
    setSelDay(d); setWeekStart(getMondayOf(d));
    setMonthDate(new Date(d.getFullYear(),d.getMonth(),1));
  }
  function onPrev() {
    if (view==="kun")        setSelDay(d=>addDays(d,-1));
    else if (view==="hafta") setWeekStart(d=>addDays(d,-7));
    else setMonthDate(d=>new Date(d.getFullYear(),d.getMonth()-1,1));
  }
  function onNext() {
    if (view==="kun")        setSelDay(d=>addDays(d,+1));
    else if (view==="hafta") setWeekStart(d=>addDays(d,+7));
    else setMonthDate(d=>new Date(d.getFullYear(),d.getMonth()+1,1));
  }

  function openPicker() {
    const base = view==="kun"   ? selDay
               : view==="hafta" ? weekStart
               :                  monthDate;
    setPickerMonth(new Date(base.getFullYear(), base.getMonth(), 1));
    setPickerOpen(v => !v);
  }

  function pickDate(d: Date) {
    setSelDay(new Date(d));
    if (view==="hafta") setWeekStart(getMondayOf(d));
    else if (view==="oy") setMonthDate(new Date(d.getFullYear(),d.getMonth(),1));
    setPickerOpen(false);
  }

  function pickToday() {
    goToday(); setPickerOpen(false);
  }

  const navLabel = useMemo(() => {
    if (view==="kun") {
      const i=getUzIdx(selDay);
      return `${i!==null?UZ_DAYS[i]:"Yakshanba"}, ${selDay.getDate()} ${UZ_MONTHS[selDay.getMonth()]} ${selDay.getFullYear()}`;
    }
    if (view==="hafta") {
      const end=addDays(weekStart,5);
      return weekStart.getMonth()===end.getMonth()
        ? `${weekStart.getDate()}–${end.getDate()} ${UZ_MONTHS[weekStart.getMonth()]} ${weekStart.getFullYear()}`
        : `${weekStart.getDate()} ${UZ_MONTHS_S[weekStart.getMonth()]} – ${end.getDate()} ${UZ_MONTHS_S[end.getMonth()]} ${weekStart.getFullYear()}`;
    }
    return `${UZ_MONTHS[monthDate.getMonth()]} ${monthDate.getFullYear()}`;
  }, [view, selDay, weekStart, monthDate]);

  // Kun view
  const kunUzIdx   = getUzIdx(selDay);
  const kunDayName = kunUzIdx!==null ? UZ_DAYS[kunUzIdx] : "Yakshanba";
  const kunEntries = kunUzIdx!==null
    ? MOCK_SCHEDULE.filter(s=>s.day===UZ_DAYS[kunUzIdx]).sort((a,b)=>toMin(a.time)-toMin(b.time))
    : [];
  const kunIsToday = sameDay(selDay, today);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopHeader title="Jadval" subtitle="Dars jadvali" action={{ label: "Dars qo'shish" }} />

      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-2 px-4 py-2.5
        border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">

        {/* View switcher */}
        <div className="flex p-1 gap-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl">
          {([
            ["kun",   "Kun",   List],
            ["hafta", "Hafta", LayoutGrid],
            ["oy",    "Oy",    CalendarDays],
          ] as [ViewMode, string, React.ComponentType<{className?:string}>][]).map(([id,label,Icon]) => (
            <button key={id} onClick={() => setView(id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                view===id
                  ? "bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-neutral-100"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
              )}>
              <Icon className="w-3.5 h-3.5" />{label}
            </button>
          ))}
        </div>

        {/* Date navigation with picker */}
        <div className="relative flex items-center gap-1 ml-2">
          <button onClick={onPrev}
            className="w-7 h-7 flex items-center justify-center rounded-lg
              hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Clickable date label — opens calendar picker */}
          <button onClick={openPicker}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-colors",
              "text-[13px] font-semibold text-neutral-700 dark:text-neutral-200",
              "min-w-[200px] justify-center",
              pickerOpen
                ? "bg-neutral-100 dark:bg-neutral-800"
                : "hover:bg-neutral-100 dark:hover:bg-neutral-800"
            )}>
            <CalendarDays className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 shrink-0" />
            {navLabel}
            <ChevronDown className={cn(
              "w-3 h-3 text-neutral-400 shrink-0 transition-transform",
              pickerOpen && "rotate-180"
            )} />
          </button>

          <button onClick={onNext}
            className="w-7 h-7 flex items-center justify-center rounded-lg
              hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Calendar popover */}
          {pickerOpen && (
            <>
              {/* Backdrop */}
              <div className="fixed inset-0 z-40" onClick={() => setPickerOpen(false)} />
              <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-50">
                <MiniCal
                  pickerMonth={pickerMonth}
                  onChangeMonth={setPickerMonth}
                  today={today}
                  selDay={selDay}
                  weekStart={weekStart}
                  view={view}
                  onPick={pickDate}
                  onToday={pickToday}
                />
              </div>
            </>
          )}
        </div>

        <button onClick={goToday}
          className="px-3 py-1.5 text-xs font-semibold rounded-xl
            border border-neutral-200 dark:border-neutral-700
            text-neutral-600 dark:text-neutral-400
            hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
          Bugun
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          KUN VIEW
      ══════════════════════════════════════════════════════════════════ */}
      {view === "kun" && (
        <>
          {/* Date banner */}
          <div className={cn(
            "shrink-0 flex items-center justify-between px-5 py-4",
            "border-b border-neutral-100 dark:border-neutral-800",
            kunIsToday ? "bg-neutral-900 dark:bg-neutral-950" : "bg-white dark:bg-neutral-900"
          )}>
            <div>
              <p className={cn("text-[11px] font-bold uppercase tracking-widest",
                kunIsToday ? "text-neutral-500" : "text-neutral-400 dark:text-neutral-500")}>
                {kunIsToday ? "Bugun" : `${UZ_MONTHS[selDay.getMonth()]} ${selDay.getFullYear()}`}
              </p>
              <h2 className={cn("text-[22px] font-black leading-tight mt-0.5",
                kunIsToday ? "text-white" : "text-neutral-900 dark:text-neutral-100")}>
                {kunDayName}
              </h2>
              <p className={cn("text-[13px] font-medium mt-0.5",
                kunIsToday ? "text-neutral-400" : "text-neutral-400 dark:text-neutral-500")}>
                {selDay.getDate()} {UZ_MONTHS[selDay.getMonth()]} {selDay.getFullYear()}
              </p>
            </div>

            {/* Date badge */}
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                "w-[60px] h-[60px] rounded-2xl flex flex-col items-center justify-center gap-0",
                kunIsToday ? "bg-white/10" : "bg-neutral-100 dark:bg-neutral-800"
              )}>
                <span className={cn("text-[10px] font-bold uppercase tracking-wider leading-none",
                  kunIsToday ? "text-neutral-400" : "text-neutral-400 dark:text-neutral-500")}>
                  {UZ_MONTHS_S[selDay.getMonth()]}
                </span>
                <span className={cn("text-[28px] font-black leading-tight",
                  kunIsToday ? "text-white" : "text-neutral-800 dark:text-neutral-200")}>
                  {selDay.getDate()}
                </span>
              </div>
              <span className={cn("text-[11px] font-semibold",
                kunIsToday ? "text-neutral-500" : "text-neutral-400 dark:text-neutral-500")}>
                {kunEntries.length} ta dars
              </span>
            </div>
          </div>

          {/* Time grid */}
          <div className="flex-1 overflow-auto">
            <div className="flex">
              <div className="shrink-0 border-r border-neutral-100 dark:border-neutral-800 relative"
                style={{ width: TIME_W, height: TOTAL_H }}>
                {HOURS.map((h,i) => (
                  <span key={h}
                    className="absolute right-2 text-[10px] font-medium text-neutral-400 dark:text-neutral-600 tabular-nums select-none"
                    style={{ top: i*HOUR_H+3 }}>
                    {String(h).padStart(2,"0")}:00
                  </span>
                ))}
              </div>

              <div className="flex-1 relative" style={{ height: TOTAL_H }}>
                {HOURS.map((_,i) => (
                  <div key={i} className="absolute inset-x-0 border-t border-neutral-100 dark:border-neutral-800"
                    style={{ top: i*HOUR_H }} />
                ))}
                {HOURS.slice(0,-1).map((_,i) => (
                  <div key={`h${i}`} className="absolute inset-x-0 border-t border-dashed border-neutral-100 dark:border-neutral-800/60"
                    style={{ top: i*HOUR_H+HOUR_H/2 }} />
                ))}

                {kunUzIdx === null ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-sm font-semibold text-neutral-400 dark:text-neutral-600">Dam olish kuni</p>
                  </div>
                ) : kunEntries.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-sm font-semibold text-neutral-400 dark:text-neutral-600">Bu kunda dars yo'q</p>
                  </div>
                ) : kunEntries.map(entry => {
                  const top    = blockTop(entry.time);
                  const height = blockH(entry.time, entry.endTime);
                  return (
                    <div key={entry.id}
                      className={cn(
                        "absolute inset-x-3 rounded-xl overflow-hidden cursor-pointer",
                        "border border-l-[4px] shadow-sm",
                        "transition-all hover:brightness-95 hover:shadow-md",
                        entry.color
                      )}
                      style={{ top: top+2, height: Math.max(height-4,24) }}>
                      <div className="px-3 py-2 h-full flex flex-col overflow-hidden">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-[13px] leading-tight">{entry.groupName}</p>
                          <span className="text-[11px] opacity-60 tabular-nums shrink-0 mt-0.5">
                            {entry.time}–{entry.endTime}
                          </span>
                        </div>
                        {height >= 56 && <p className="text-[11px] opacity-60 mt-1">{entry.courseName}</p>}
                        {height >= 80 && (
                          <div className="flex items-center gap-4 mt-2">
                            <span className="text-[11px] opacity-70">📍 {entry.room}</span>
                            <span className="text-[11px] opacity-70">👤 {entry.teacherName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          HAFTA VIEW
      ══════════════════════════════════════════════════════════════════ */}
      {view === "hafta" && (
        <div className="flex-1 overflow-auto">
          <div className="sticky top-0 z-20 flex
            border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
            <div style={{ width: TIME_W, minWidth: TIME_W }}
              className="shrink-0 border-r border-neutral-100 dark:border-neutral-800" />
            {weekDays.map((d, i) => {
              const isToday = sameDay(d, today);
              const isSel   = sameDay(d, selDay) && !isToday;
              return (
                <button key={i}
                  onClick={() => { setSelDay(new Date(d)); setView("kun"); }}
                  className={cn(
                    "flex-1 flex flex-col items-center justify-center py-3 gap-px",
                    "border-r border-neutral-100 dark:border-neutral-800 last:border-r-0",
                    "cursor-pointer transition-colors",
                    isToday ? "bg-neutral-900 dark:bg-white"
                    : isSel  ? "bg-neutral-100 dark:bg-neutral-800"
                             : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  )}>
                  <span className={cn("text-[10px] font-bold uppercase tracking-widest",
                    isToday ? "text-white/50 dark:text-neutral-900/50"
                    : isSel  ? "text-neutral-500 dark:text-neutral-400"
                             : "text-neutral-400 dark:text-neutral-500")}>
                    {UZ_DAYS_S[i]}
                  </span>
                  <span className={cn("text-[20px] font-black leading-none",
                    isToday ? "text-white dark:text-neutral-900"
                    : isSel  ? "text-neutral-800 dark:text-neutral-100"
                             : "text-neutral-700 dark:text-neutral-200")}>
                    {d.getDate()}
                  </span>
                  <span className={cn("text-[10px]",
                    isToday ? "text-white/40 dark:text-neutral-900/40"
                             : "text-neutral-400 dark:text-neutral-500")}>
                    {UZ_MONTHS_S[d.getMonth()]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex">
            <div className="shrink-0 border-r border-neutral-100 dark:border-neutral-800 relative"
              style={{ width: TIME_W, height: TOTAL_H }}>
              {HOURS.map((h,i) => (
                <span key={h}
                  className="absolute right-2 text-[10px] font-medium text-neutral-400 dark:text-neutral-600 tabular-nums select-none"
                  style={{ top: i*HOUR_H+3 }}>
                  {String(h).padStart(2,"0")}:00
                </span>
              ))}
            </div>

            {weekDays.map((d, ci) => {
              const isToday   = sameDay(d, today);
              const isSel     = sameDay(d, selDay) && !isToday;
              const uzDayName = UZ_DAYS[ci];
              const entries   = MOCK_SCHEDULE
                .filter(s => s.day===uzDayName)
                .sort((a,b) => toMin(a.time)-toMin(b.time));

              return (
                <div key={ci}
                  className={cn(
                    "flex-1 relative border-r border-neutral-100 dark:border-neutral-800 last:border-r-0",
                    isToday && "bg-blue-50/25 dark:bg-blue-900/10",
                    isSel   && "bg-neutral-50/80 dark:bg-neutral-800/30"
                  )}
                  style={{ height: TOTAL_H }}>
                  {HOURS.map((_,i) => (
                    <div key={i} className="absolute inset-x-0 border-t border-neutral-100 dark:border-neutral-800"
                      style={{ top: i*HOUR_H }} />
                  ))}
                  {HOURS.slice(0,-1).map((_,i) => (
                    <div key={`h${i}`} className="absolute inset-x-0 border-t border-dashed border-neutral-100 dark:border-neutral-800/60"
                      style={{ top: i*HOUR_H+HOUR_H/2 }} />
                  ))}
                  {entries.map(entry => {
                    const top     = blockTop(entry.time);
                    const height  = blockH(entry.time, entry.endTime);
                    const compact = height < 52;
                    return (
                      <div key={entry.id}
                        className={cn(
                          "absolute inset-x-1 rounded-lg overflow-hidden cursor-pointer",
                          "border border-l-[3px] shadow-sm",
                          "transition-all hover:brightness-95 hover:shadow-md",
                          entry.color
                        )}
                        style={{ top: top+2, height: Math.max(height-4,20) }}>
                        <div className="px-2 py-1.5 h-full flex flex-col overflow-hidden">
                          <p className={cn("font-bold truncate leading-tight", compact?"text-[10px]":"text-[12px]")}>
                            {entry.groupName}
                          </p>
                          {!compact && (
                            <>
                              <p className="text-[10px] opacity-60 mt-0.5 tabular-nums">{entry.time}–{entry.endTime}</p>
                              <p className="text-[10px] opacity-55 truncate mt-0.5">{entry.room} · {entry.teacherName}</p>
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

      {/* ══════════════════════════════════════════════════════════════════
          OY VIEW
      ══════════════════════════════════════════════════════════════════ */}
      {view === "oy" && (
        <div className="flex-1 overflow-auto p-4">
          <div className="flex items-baseline gap-2 mb-3 px-1">
            <h2 className="text-[20px] font-black text-neutral-900 dark:text-neutral-100">
              {UZ_MONTHS[monthDate.getMonth()]}
            </h2>
            <span className="text-[14px] font-semibold text-neutral-400 dark:text-neutral-500">
              {monthDate.getFullYear()}
            </span>
          </div>

          <div className="grid grid-cols-7 mb-1">
            {["Dushanba","Seshanba","Chorshanba","Payshanba","Juma","Shanba","Yakshanba"].map(d => (
              <div key={d} className="text-center py-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                  {d.slice(0,3)}
                </span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px rounded-2xl overflow-hidden
            bg-neutral-200 dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-700">
            {calCells.slice(0,42).map((d, i) => {
              const inMonth = d.getMonth()===monthDate.getMonth();
              if (i>=35 && !inMonth) return <div key={i} className="bg-white dark:bg-neutral-900 h-24" />;

              const isToday = sameDay(d, today);
              const isSel   = sameDay(d, selDay);
              const idx     = getUzIdx(d);
              const entries = idx!==null && inMonth
                ? MOCK_SCHEDULE.filter(s => s.day===UZ_DAYS[idx])
                : [];

              return (
                <button key={i}
                  onClick={() => { setSelDay(new Date(d)); setView("kun"); }}
                  className={cn(
                    "bg-white dark:bg-neutral-900 h-24 p-1.5 text-left flex flex-col gap-1",
                    "hover:bg-neutral-50 dark:hover:bg-neutral-800/70 transition-colors",
                    !inMonth && "opacity-25"
                  )}>
                  <span className={cn(
                    "w-6 h-6 flex items-center justify-center rounded-full text-[12px] font-bold shrink-0",
                    isToday ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                    : isSel  ? "bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 ring-2 ring-neutral-400 dark:ring-neutral-500"
                             : "text-neutral-700 dark:text-neutral-300"
                  )}>
                    {d.getDate()}
                  </span>
                  <div className="flex flex-col gap-px flex-1 overflow-hidden">
                    {entries.slice(0,3).map(e => (
                      <div key={e.id}
                        className={cn("text-[9px] font-semibold px-1.5 py-px rounded-sm truncate", e.color)}>
                        {e.time} {e.groupName}
                      </div>
                    ))}
                    {entries.length>3 && (
                      <span className="text-[9px] text-neutral-400 dark:text-neutral-500 px-1">
                        +{entries.length-3} ta boshqa
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
