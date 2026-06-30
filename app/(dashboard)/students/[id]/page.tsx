"use client";

import { use } from "react";
import Link from "next/link";
import { useStudent } from "@/lib/hooks/useStudents";
import { TopHeader } from "@/components/layout/top-header";
import { cn } from "@/lib/utils";
import {
  Phone, GraduationCap, Calendar, DollarSign,
  ArrowLeft, CheckCircle, XCircle, Clock, AlertCircle,
} from "lucide-react";

function fmt(v: number) {
  return new Intl.NumberFormat("uz-UZ", { style: "currency", currency: "UZS", maximumFractionDigits: 0 }).format(v);
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-neutral-200 dark:bg-neutral-700 rounded-xl", className)} />;
}

const ATTEND_CFG: Record<string, { label: string; cls: string; dot: string }> = {
  KELDI:      { label: "Keldi",      cls: "bg-green-100 text-green-700",  dot: "bg-green-500" },
  KELMADI:    { label: "Kelmadi",    cls: "bg-red-100 text-red-700",      dot: "bg-red-500" },
  KECH_KELDI: { label: "Kech keldi", cls: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  SABABLI:    { label: "Sababli",    cls: "bg-blue-100 text-blue-700",    dot: "bg-blue-500" },
  SINOV_DARSI:{ label: "Sinov",      cls: "bg-amber-100 text-amber-700",  dot: "bg-amber-500" },
};

const ENROLL_CFG: Record<string, { label: string; cls: string }> = {
  SINOV:         { label: "Sinov darsi", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  FAOL:          { label: "Faol",        cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  CHIQIB_KETGAN: { label: "Ketgan",      cls: "bg-neutral-100 text-neutral-500" },
};

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: student, isLoading } = useStudent(id);

  if (isLoading) {
    return (
      <div className="p-5 space-y-5">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!student || student.error) {
    return (
      <div className="p-5 flex flex-col items-center py-20 text-neutral-400">
        <AlertCircle className="w-10 h-10 mb-2 opacity-40" />
        <p className="text-sm">O'quvchi topilmadi</p>
        <Link href="/students" className="mt-3 text-sm text-blue-500 hover:underline">Orqaga</Link>
      </div>
    );
  }

  const sg      = student.groups?.[0];
  const group   = sg?.group;
  const teacher = group?.teacher?.user;
  const enroll  = ENROLL_CFG[sg?.enrollmentStatus ?? (student.isActive ? "FAOL" : "SINOV")];

  const attended = student.attendance?.filter((a: any) => a.status === "KELDI").length ?? 0;
  const total    = student.attendance?.filter((a: any) => a.status !== "SINOV_DARSI").length ?? 0;
  const rate     = total > 0 ? Math.round((attended / total) * 100) : 0;

  return (
    <div>
      <TopHeader
        title={student.name}
        subtitle={
          <Link href="/students" className="flex items-center gap-1 text-neutral-400 hover:text-neutral-600 text-sm transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            O'quvchilar
          </Link>
        }
      />

      <div className="p-5 space-y-5">
        {/* Profile + stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Profile */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
            <div className="flex items-center gap-4 mb-4">
              <div className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center text-white text-xl font-black",
                student.isActive
                  ? "bg-gradient-to-br from-blue-400 to-indigo-500"
                  : "bg-gradient-to-br from-amber-400 to-orange-400"
              )}>
                {student.name[0]}
              </div>
              <div>
                <h2 className="font-bold text-neutral-900 dark:text-neutral-100">{student.name}</h2>
                <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-semibold", enroll?.cls)}>
                  {enroll?.label}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <a href={`tel:${student.phone}`} className="flex items-center gap-2 text-[13px] text-neutral-600 dark:text-neutral-300 hover:text-blue-600 transition-colors">
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                {student.phone}
              </a>
              {student.parentPhone && (
                <a href={`tel:${student.parentPhone}`} className="flex items-center gap-2 text-[13px] text-neutral-500 dark:text-neutral-400">
                  <Phone className="w-3.5 h-3.5 text-neutral-400" />
                  Ota-ona: {student.parentPhone}
                </a>
              )}
              <div className="flex items-center gap-2 text-[13px] text-neutral-500 dark:text-neutral-400">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                {new Date(student.createdAt).toLocaleDateString("uz-UZ")} dan beri
              </div>
            </div>
          </div>

          {/* Group info */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
            <h3 className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Guruh</h3>
            {group ? (
              <div className="space-y-2">
                <Link href={`/groups/${group.id}`}
                  className="text-[14px] font-bold text-blue-600 hover:underline">{group.name}</Link>
                <p className="text-[12px] text-neutral-500">{group.course?.name}</p>
                {teacher && (
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-[10px] font-bold">
                      {teacher.name[0]}
                    </div>
                    <Link href={`/teachers/${group.teacher?.id}`}
                      className="text-[12px] text-neutral-600 dark:text-neutral-300 hover:text-blue-600 transition-colors">
                      {teacher.name}
                    </Link>
                  </div>
                )}
                <p className="text-[11px] text-neutral-400">
                  {group.scheduleDays?.join(", ").toUpperCase()} · {group.startTime}–{group.endTime}
                </p>
              </div>
            ) : (
              <p className="text-[13px] text-neutral-400">Guruhga biriktirilmagan</p>
            )}
          </div>

          {/* Finance */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5">
            <h3 className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-3">Moliya</h3>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] text-neutral-400 mb-0.5">Balans</p>
                <p className={cn("text-[22px] font-black leading-none",
                  student.balance >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                )}>
                  {fmt(student.balance)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-neutral-400 mb-0.5">Davomiylik</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${rate}%` }} />
                  </div>
                  <span className="text-[12px] font-bold text-neutral-700 dark:text-neutral-300">{rate}%</span>
                </div>
                <p className="text-[11px] text-neutral-400 mt-0.5">{attended}/{total} dars</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Payments */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-neutral-400" />
              <h3 className="text-[13px] font-bold text-neutral-900 dark:text-neutral-100">So'nggi to'lovlar</h3>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {student.payments?.length === 0 && (
                <p className="text-[12px] text-neutral-400 p-4 text-center">To'lovlar yo'q</p>
              )}
              {student.payments?.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-[13px] font-semibold text-green-600 dark:text-green-400">{fmt(p.amount)}</p>
                    <p className="text-[11px] text-neutral-400">{new Date(p.date).toLocaleDateString("uz-UZ")} · {p.method}</p>
                  </div>
                  {p.note && <p className="text-[11px] text-neutral-400">{p.note}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Attendance */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
            <div className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <h3 className="text-[13px] font-bold text-neutral-900 dark:text-neutral-100">Davomat tarixi</h3>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800max-h-80 overflow-y-auto">
              {student.attendance?.length === 0 && (
                <p className="text-[12px] text-neutral-400 p-4 text-center">Davomat yo'q</p>
              )}
              {student.attendance?.map((a: any) => {
                const cfg = ATTEND_CFG[a.status];
                return (
                  <div key={a.id} className="flex items-center justify-between px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", cfg?.dot ?? "bg-neutral-300")} />
                      <p className="text-[13px] text-neutral-700 dark:text-neutral-300">
                        {new Date(a.date).toLocaleDateString("uz-UZ")}
                      </p>
                    </div>
                    <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-semibold", cfg?.cls)}>
                      {cfg?.label ?? a.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
