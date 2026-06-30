"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useStudent } from "@/lib/hooks/useStudents";
import { TopHeader } from "@/components/layout/top-header";
import { Modal } from "@/components/ui/modal";
import { FormField } from "@/components/ui/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { mutate } from "swr";
import {
  Phone, Calendar, DollarSign, ArrowLeft,
  CheckCircle, Clock, AlertCircle, Plus,
} from "lucide-react";

function fmt(v: number) {
  return new Intl.NumberFormat("uz-UZ", { style: "currency", currency: "UZS", maximumFractionDigits: 0 }).format(v);
}
function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-neutral-200 dark:bg-neutral-700 rounded-xl", className)} />;
}

const ATTEND_CFG: Record<string, { label: string; cls: string; dot: string }> = {
  KELDI:      { label: "Keldi",      cls: "bg-green-100 text-green-700",   dot: "bg-green-500" },
  KELMADI:    { label: "Kelmadi",    cls: "bg-red-100 text-red-700",       dot: "bg-red-500" },
  KECH_KELDI: { label: "Kech keldi", cls: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
  SABABLI:    { label: "Sababli",    cls: "bg-blue-100 text-blue-700",     dot: "bg-blue-500" },
  SINOV_DARSI:{ label: "Sinov",      cls: "bg-amber-100 text-amber-700",   dot: "bg-amber-500" },
};
const ENROLL_CFG: Record<string, { label: string; cls: string }> = {
  SINOV:         { label: "Sinov darsi", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  FAOL:          { label: "Faol",        cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  CHIQIB_KETGAN: { label: "Ketgan",      cls: "bg-neutral-100 text-neutral-500" },
};
const METHODS = ["NAQD", "KARTA", "CLICK", "PAYME"] as const;
const METHOD_LABELS: Record<string, string> = { NAQD: "Naqd pul", KARTA: "Karta", CLICK: "Click", PAYME: "Payme" };

export default function StudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: student, isLoading, mutate: revalidate } = useStudent(id);

  const [showPayModal, setShowPayModal] = useState(false);
  const [payForm,      setPayForm]      = useState({ amount: "", method: "NAQD", note: "" });
  const [payErr,       setPayErr]       = useState("");
  const [paying,       setPaying]       = useState(false);

  async function submitPayment() {
    const amount = parseFloat(payForm.amount.replace(/\s/g, ""));
    if (!amount || amount <= 0) { setPayErr("Summa to'g'ri kiriting"); return; }

    setPaying(true); setPayErr("");
    try {
      const sg = student?.groups?.[0];
      const res = await fetch("/api/payments", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: id,
          groupId:   sg?.groupId ?? undefined,
          amount,
          method:    payForm.method,
          note:      payForm.note || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setPayErr(data.error ?? "Xatolik"); return; }
      revalidate();
      mutate((key: string) => typeof key === "string" && key.startsWith("/api/students"), undefined, { revalidate: true });
      setShowPayModal(false);
      setPayForm({ amount: "", method: "NAQD", note: "" });
    } catch { setPayErr("Serverga ulanib bo'lmadi"); }
    finally { setPaying(false); }
  }

  if (isLoading) {
    return (
      <div className="p-5 space-y-5">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-40" />)}
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
        action={{ label: "To'lov qo'shish", onClick: () => { setPayErr(""); setShowPayModal(true); } }}
      />

      {/* Payment modal */}
      <Modal
        open={showPayModal}
        onClose={() => setShowPayModal(false)}
        title="To'lov qabul qilish"
        subtitle={student.name}
        footer={
          <>
            <Button onClick={submitPayment} disabled={paying}
              className="flex-1 h-9 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 text-white text-[13px]">
              {paying ? "Saqlanmoqda..." : "Qabul qilish"}
            </Button>
            <Button variant="outline" className="h-9 px-4 text-[13px]" onClick={() => setShowPayModal(false)}>Bekor</Button>
          </>
        }
      >
        <FormField label="Summa (UZS)" required>
          <Input
            placeholder="500 000"
            value={payForm.amount}
            onChange={e => { setPayForm(p => ({...p, amount: e.target.value})); setPayErr(""); }}
            className="h-10 text-[14px] font-semibold"
            type="number"
            min="0"
          />
        </FormField>
        <FormField label="To'lov usuli">
          <div className="grid grid-cols-2 gap-2">
            {METHODS.map(m => (
              <button key={m} type="button" onClick={() => setPayForm(p => ({...p, method: m}))}
                className={cn(
                  "h-10 rounded-xl border text-[13px] font-semibold transition-all",
                  payForm.method === m
                    ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900"
                    : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400"
                )}>
                {METHOD_LABELS[m]}
              </button>
            ))}
          </div>
        </FormField>
        <FormField label="Izoh" hint="Ixtiyoriy">
          <Input placeholder="Iyul oyi uchun..." value={payForm.note}
            onChange={e => setPayForm(p => ({...p, note: e.target.value}))}
            className="h-10" />
        </FormField>
        {/* Current balance */}
        <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 rounded-xl px-4 py-2.5">
          <span className="text-[12px] text-neutral-500">Joriy balans</span>
          <span className={cn("text-[13px] font-bold",
            student.balance >= 0 ? "text-green-600" : "text-red-600")}>
            {fmt(student.balance)}
          </span>
        </div>
        {payErr && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl px-3 py-2.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <p className="text-[12px] font-medium text-red-600 dark:text-red-400">{payErr}</p>
          </div>
        )}
      </Modal>

      <div className="p-5 space-y-5">
        {/* Top cards */}
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
              <a href={`tel:${student.phone}`}
                className="flex items-center gap-2 text-[13px] text-neutral-600 dark:text-neutral-300 hover:text-blue-600 transition-colors">
                <Phone className="w-3.5 h-3.5 text-neutral-400" />
                {student.phone}
              </a>
              {student.parentPhone && (
                <a href={`tel:${student.parentPhone}`}
                  className="flex items-center gap-2 text-[13px] text-neutral-500 dark:text-neutral-400">
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
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Moliya</h3>
              <button onClick={() => { setPayErr(""); setShowPayModal(true); }}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                <Plus className="w-3 h-3" /> To'lov
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] text-neutral-400 mb-0.5">Balans</p>
                <p className={cn("text-[22px] font-black leading-none",
                  student.balance >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400")}>
                  {fmt(student.balance)}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-neutral-400 mb-0.5">Davomiylik</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${rate}%` }} />
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
            <div className="px-5 py-3 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-neutral-400" />
                <h3 className="text-[13px] font-bold text-neutral-900 dark:text-neutral-100">So'nggi to'lovlar</h3>
              </div>
              <button onClick={() => { setPayErr(""); setShowPayModal(true); }}
                className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                <Plus className="w-3 h-3" /> Yangi to'lov
              </button>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {student.payments?.length === 0 && (
                <p className="text-[12px] text-neutral-400 p-4 text-center">To'lovlar yo'q</p>
              )}
              {student.payments?.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3">
                  <div>
                    <p className="text-[13px] font-semibold text-green-600 dark:text-green-400">{fmt(p.amount)}</p>
                    <p className="text-[11px] text-neutral-400">
                      {new Date(p.date).toLocaleDateString("uz-UZ")} · {METHOD_LABELS[p.method] ?? p.method}
                    </p>
                  </div>
                  {p.note && <p className="text-[11px] text-neutral-400 max-w-[120px] text-right">{p.note}</p>}
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
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800 max-h-80 overflow-y-auto">
              {student.attendance?.length === 0 && (
                <p className="text-[12px] text-neutral-400 p-4 text-center">Davomat yo'q</p>
              )}
              {student.attendance?.map((a: any) => {
                const cfg = ATTEND_CFG[a.status];
                return (
                  <div key={a.id} className="flex items-center justify-between px-5 py-2.5">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full shrink-0", cfg?.dot ?? "bg-neutral-300")} />
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
