"use client";

import { useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { MOCK_SCHEDULE, MOCK_ROOMS } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";

const DAYS = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];
const DAYS_SHORT = ["Du", "Se", "Cho", "Pa", "Ju", "Sha"];

const TIME_SLOTS = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00"];

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

export default function SchedulePage() {
  const [filterRoom, setFilterRoom] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const rooms = ["all", ...Array.from(new Set(MOCK_SCHEDULE.map(s => s.room)))];

  const filtered = filterRoom === "all"
    ? MOCK_SCHEDULE
    : MOCK_SCHEDULE.filter(s => s.room === filterRoom);

  const getCell = (day: string, slot: string) => {
    const slotMin = timeToMinutes(slot);
    return filtered.filter(s => {
      if (s.day !== day) return false;
      const start = timeToMinutes(s.time);
      const end = timeToMinutes(s.endTime);
      return slotMin >= start && slotMin < end;
    });
  };

  const isSlotStart = (entry: typeof MOCK_SCHEDULE[0], slot: string) =>
    entry.time === slot;

  const getStartEntries = (day: string, slot: string) =>
    filtered.filter(s => s.day === day && s.time === slot);

  const getSlotSpan = (entry: typeof MOCK_SCHEDULE[0]) => {
    const start = timeToMinutes(entry.time);
    const end = timeToMinutes(entry.endTime);
    return Math.ceil((end - start) / 60);
  };

  return (
    <div className="h-screen flex flex-col">
      <TopHeader
        title="Jadval"
        subtitle="Haftalik dars jadvali"
        action={{ label: "Dars qo'shish" }}
      />

      <div className="p-4 flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800">
        {/* View toggle */}
        <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg">
          {(["grid", "list"] as const).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-3 py-1 rounded-md text-xs font-medium transition-colors",
                view === v
                  ? "bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-neutral-100"
                  : "text-neutral-500 dark:text-neutral-400"
              )}
            >
              {v === "grid" ? "Jadval ko'rinish" : "Ro'yxat"}
            </button>
          ))}
        </div>

        {/* Room filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-neutral-400" />
          <select
            value={filterRoom}
            onChange={e => setFilterRoom(e.target.value)}
            className="text-xs h-8 px-2 rounded-lg border border-neutral-200 dark:border-neutral-700
              bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 outline-none"
          >
            <option value="all">Barcha xonalar</option>
            {Array.from(new Set(MOCK_SCHEDULE.map(s => s.room))).map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div className="ml-auto flex items-center gap-3 text-[11px] text-neutral-400">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-blue-200 border border-blue-400 inline-block" />Ingliz</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-200 border border-green-400 inline-block" />Matematika</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-200 border border-purple-400 inline-block" />IT</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-orange-200 border border-orange-400 inline-block" />Rus</span>
        </div>
      </div>

      {view === "grid" ? (
        <div className="flex-1 overflow-auto p-4">
          <div className="min-w-[700px]">
            {/* Header row */}
            <div className="grid gap-px mb-px" style={{ gridTemplateColumns: "64px repeat(6, 1fr)" }}>
              <div />
              {DAYS.map((day, i) => (
                <div key={day} className="bg-neutral-50 dark:bg-neutral-800/60 rounded-t-lg px-2 py-2 text-center">
                  <p className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wide">
                    {DAYS_SHORT[i]}
                  </p>
                  <p className="text-[12px] font-semibold text-neutral-700 dark:text-neutral-300 mt-0.5 hidden md:block">
                    {day}
                  </p>
                </div>
              ))}
            </div>

            {/* Time rows */}
            {TIME_SLOTS.map(slot => {
              const hasAnything = DAYS.some(d => getStartEntries(d, slot).length > 0);
              return (
                <div
                  key={slot}
                  className="grid gap-px mb-px"
                  style={{ gridTemplateColumns: "64px repeat(6, 1fr)" }}
                >
                  {/* Time label */}
                  <div className="flex items-start justify-end pr-3 pt-2">
                    <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                      {slot}
                    </span>
                  </div>

                  {/* Day cells */}
                  {DAYS.map(day => {
                    const entries = getStartEntries(day, slot);
                    return (
                      <div
                        key={day}
                        className={cn(
                          "min-h-[52px] rounded-sm border border-transparent",
                          entries.length === 0 && "bg-neutral-50/50 dark:bg-neutral-800/20 hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40 transition-colors"
                        )}
                      >
                        {entries.map(entry => (
                          <div
                            key={entry.id}
                            className={cn(
                              "border-l-[3px] rounded-md p-2 mb-0.5 cursor-pointer hover:opacity-90 transition-opacity",
                              entry.color
                            )}
                          >
                            <p className="text-[11px] font-bold leading-tight truncate">{entry.groupName}</p>
                            <p className="text-[10px] opacity-70 mt-0.5 truncate">{entry.time}–{entry.endTime}</p>
                            <p className="text-[10px] opacity-60 truncate">📍 {entry.room}</p>
                            <p className="text-[10px] opacity-60 truncate hidden sm:block">👤 {entry.teacherName}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List view */
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-4">
            {DAYS.map(day => {
              const entries = filtered.filter(s => s.day === day).sort((a, b) =>
                timeToMinutes(a.time) - timeToMinutes(b.time)
              );
              if (entries.length === 0) return null;
              return (
                <div key={day}>
                  <h3 className="text-[13px] font-bold text-neutral-700 dark:text-neutral-300 mb-2 flex items-center gap-2">
                    {day}
                    <span className="text-[11px] font-normal text-neutral-400 bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                      {entries.length} dars
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {entries.map(entry => (
                      <div key={entry.id}
                        className={cn("border-l-[3px] rounded-lg p-3 flex items-center gap-4 cursor-pointer hover:opacity-90 transition-opacity", entry.color)}>
                        <div className="text-center shrink-0 w-16">
                          <p className="text-[13px] font-bold">{entry.time}</p>
                          <p className="text-[10px] opacity-60">{entry.endTime}</p>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold leading-tight">{entry.groupName}</p>
                          <p className="text-[11px] opacity-70">{entry.courseName}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[12px] font-medium">📍 {entry.room}</p>
                          <p className="text-[11px] opacity-70">👤 {entry.teacherName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
