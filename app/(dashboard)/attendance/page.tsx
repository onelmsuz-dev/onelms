"use client";

import { useState, useMemo, useEffect } from "react";
import { TopHeader } from "@/components/layout/top-header";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, FileCheck, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGroups } from "@/lib/hooks/useGroups";
import { useStudents } from "@/lib/hooks/useStudents";
import { mutate } from "swr";

const UZ_MONTHS = ["Yanvar","Fevral","Mart","Aprel","May","Iyun","Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];
const UZ_DAYS   = ["Yakshanba","Dushanba","Seshanba","Chorshanba","Payshanba","Juma","Shanba"];

type Status = "KELDI" | "KELMADI" | "KECH_KELDI" | "SABABLI";

const STATUS_CFG: Record<Status, { label: string; short: string; cls: string; icon: any }> = {
  KELDI:      { label: "Keldi",      short: "K",  cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",    icon: CheckCircle2 },
  KELMADI:    { label: "Kelmadi",    short: "X",  cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",            icon: XCircle },
  KECH_KELDI: { label: "Kech keldi", short: "KK", cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400", icon: Clock },
  SABABLI:    { label: "Sababli",    short: "S",  cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",        icon: FileCheck },
};
const ALL_STATUSES: Status[] = ["KELDI", "KELMADI", "KECH_KELDI", "SABABLI"];

function addDays(date: Date, n: number) {
  const d = new Date(date); d.setDate(d.getDate() + n); return d;
}
function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-neutral-200 dark:bg-neutral-700 rounded-xl", className)} />;
}

export default function AttendancePage() {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d; }, []);

  const [currentDate,   setCurrentDate]   = useState(new Date(today));
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [localStatus,   setLocalStatus]   = useState<Record<string, Status>>({});
  const [saving,        setSaving]        = useState(false);

  const { data: groupsRaw, isLoading: groupsLoading } = useGroups({ status: "ACTIVE" });
  const groups: any[] = Array.isArray(groupsRaw) ? groupsRaw : [];

  // Auto-select first group
  useEffect(() => {
    if (!selectedGroup && groups.length > 0) setSelectedGroup(groups[0].id);
  }, [groups, selectedGroup]);

  const dateStr = toDateStr(currentDate);

  const { data: studentsRaw, isLoading: studentsLoading } = useStudents(
    selectedGroup ? { groupId: selectedGroup } : undefined
  );
  const students: any[] = Array.isArray(studentsRaw) ? studentsRaw : [];

  // Load existing attendance for this date+group
  useEffect(() => {
    if (!selectedGroup) return;
    fetch(`/api/attendance?groupId=${selectedGroup}&date=${dateStr}`)
      .then(r => r.json())
      .then((records: any[]) => {
        if (!Array.isArray(records)) return;
        const map: Record<string, Status> = {};
        records.forEach(r => { map[r.studentId] = r.status as Status; });
        setLocalStatus(map);
      })
      .catch(() => {});
  }, [selectedGroup, dateStr]);

  const stats = useMemo(() => {
    const counts = { KELDI: 0, KELMADI: 0, KECH_KELDI: 0, SABABLI: 0 };
    students.forEach(s => {
      const status = localStatus[s.id] ?? "KELDI";
      counts[status]++;
    });
    return { ...counts, total: students.length };
  }, [students, localStatus]);

  const attendanceRate = stats.total > 0
    ? Math.round(((stats.KELDI + stats.KECH_KELDI) / stats.total) * 100)
    : 0;

  function cycleStatus(studentId: string) {
    setLocalStatus(prev => {
      const cur = prev[studentId] ?? "KELDI";
      return { ...prev, [studentId]: ALL_STATUSES[(ALL_STATUSES.indexOf(cur) + 1) % ALL_STATUSES.length] };
    });
  }

  function markAll(status: Status) {
    const map: Record<string, Status> = {};
    students.forEach(s => { map[s.id] = status; });
    setLocalStatus(map);
  }

  async function saveAttendance() {
    if (!selectedGroup || students.length === 0) return;
    setSaving(true);
    try {
      const records = students.map(s => {
        const sg = s.groups?.find((g: any) => g.groupId === selectedGroup);
        return {
          studentGroupId: sg?.id ?? "",
          studentId:      s.id,
          status:         localStatus[s.id] ?? "KELDI",
        };
      }).filter(r => r.studentGroupId);

      await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId: selectedGroup, date: dateStr, records }),
      });
    } finally {
      setSaving(false);
    }
  }

  const isToday = currentDate.getTime() === today.getTime();

  return (
    <div>
      <TopHeader
        title="Davomat"
        subtitle={`${currentDate.getDate()} ${UZ_MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}, ${UZ_DAYS[currentDate.getDay()]}`}
        action={{ label: saving ? "Saqlanmoqda..." : "Saqlash", onClick: saveAttendance }}
      />

      <div className="p-5 space-y-5">

        {/* Date nav + group selector */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5">
            <button onClick={() => setCurrentDate(d => addDays(d, -1))}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-700
                hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-4 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
              <p className="text-[13px] font-bold text-neutral-900 dark:text-neutral-100">
                {currentDate.getDate()} {UZ_MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
              </p>
              <p className="text-[11px] text-neutral-400 text-center">{UZ_DAYS[currentDate.getDay()]}</p>
            </div>
            <button onClick={() => setCurrentDate(d => addDays(d, 1))}
              className="w-8 h-8 flex items-center justify-center rounded-xl border border-neutral-200 dark:border-neutral-700
                hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
            {!isToday && (
              <button onClick={() => setCurrentDate(new Date(today))}
                className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-neutral-200 dark:border-neutral-700
                  text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                Bugun
              </button>
            )}
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {groupsLoading
              ? Array.from({length:3}).map((_,i) => <Skeleton key={i} className="h-8 w-24" />)
              : groups.map(g => (
                  <button key={g.id} onClick={() => setSelectedGroup(g.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all",
                      selectedGroup === g.id
                        ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100"
                        : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"
                    )}>
                    {g.name}
                  </button>
                ))
            }
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(Object.entries(STATUS_CFG) as [Status, typeof STATUS_CFG[Status]][]).map(([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <div key={key} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", cfg.cls)}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                {studentsLoading
                  ? <Skeleton className="h-6 w-8 mb-1" />
                  : <p className="text-[22px] font-black text-neutral-900 dark:text-neutral-100 leading-none">{stats[key]}</p>
                }
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">{cfg.label}</p>
              </div>
            );
          })}
        </div>

        {/* Rate bar */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[13px] font-semibold text-neutral-700 dark:text-neutral-300">Davomat darajasi</p>
            <span className={cn("text-[13px] font-black",
              attendanceRate >= 90 ? "text-green-600 dark:text-green-400"
              : attendanceRate >= 70 ? "text-amber-600 dark:text-amber-400"
              : "text-red-600 dark:text-red-400")}>
              {attendanceRate}%
            </span>
          </div>
          <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
            <div className={cn("h-full rounded-full transition-all",
              attendanceRate >= 90 ? "bg-green-500" : attendanceRate >= 70 ? "bg-amber-500" : "bg-red-500")}
              style={{ width: `${attendanceRate}%` }} />
          </div>
        </div>

        {/* Quick mark */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 mr-1">Tez belgilash:</span>
          {ALL_STATUSES.map(s => (
            <button key={s} onClick={() => markAll(s)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-colors",
                STATUS_CFG[s].cls, "border-current/20 hover:opacity-80"
              )}>
              Barchasi — {STATUS_CFG[s].label}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-xl border border-blue-100 dark:border-blue-900/40">
          💡 Status o'zgartirish uchun tugmachaga bosing: <strong>Keldi → Kelmadi → Kech keldi → Sababli</strong>. Yuqoridagi "Saqlash" tugmasini bosing.
        </p>

        {/* Table */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-50 dark:hover:bg-neutral-800/60">
                <TableHead className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider w-8">#</TableHead>
                <TableHead className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">O'quvchi</TableHead>
                <TableHead className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-center">Davomat</TableHead>
                <TableHead className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider text-center">Izoh</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentsLoading
                ? Array.from({length:5}).map((_,i) => (
                    <TableRow key={i}>
                      <TableCell className="text-neutral-400 text-[11px]">{i+1}</TableCell>
                      <TableCell><div className="flex items-center gap-2.5"><Skeleton className="w-8 h-8 rounded-xl shrink-0" /><Skeleton className="h-3 w-28" /></div></TableCell>
                      <TableCell className="text-center"><Skeleton className="h-7 w-28 rounded-lg mx-auto" /></TableCell>
                      <TableCell />
                    </TableRow>
                  ))
                : students.map((s: any, idx: number) => {
                    const status = localStatus[s.id] ?? "KELDI";
                    const cfg    = STATUS_CFG[status];
                    return (
                      <TableRow key={s.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                        <TableCell className="text-[11px] text-neutral-400 dark:text-neutral-600 font-mono">{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white text-[12px] font-bold shrink-0">
                              {s.name[0]}
                            </div>
                            <div>
                              <span className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">{s.name}</span>
                              {s.phone && <p className="text-[11px] text-neutral-400">{s.phone}</p>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <button onClick={() => cycleStatus(s.id)}
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all hover:opacity-80 cursor-pointer",
                              cfg.cls
                            )}>
                            <span className="font-black">{cfg.short}</span>
                            {cfg.label}
                          </button>
                        </TableCell>
                        <TableCell className="text-center">
                          {status === "SABABLI" && (
                            <span className="text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-lg">
                              Izoh kiriting
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
              }
            </TableBody>
          </Table>
          {!studentsLoading && students.length === 0 && (
            <div className="py-12 text-center text-sm text-neutral-400">
              {selectedGroup ? "Bu guruhda o'quvchi yo'q" : "Guruhni tanlang"}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
