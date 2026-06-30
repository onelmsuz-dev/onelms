"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { TopHeader } from "@/components/layout/top-header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal, ConfirmDeleteModal } from "@/components/ui/modal";
import { PhoneInput } from "@/components/ui/phone-input";
import { FormField } from "@/components/ui/form-field";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Search, Phone, Edit, GraduationCap, AlertCircle,
  CheckCircle, DollarSign, Trash2, ChevronRight, UserCheck, Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudents, useCreateStudent, useDeleteStudent } from "@/lib/hooks/useStudents";
import { useGroups } from "@/lib/hooks/useGroups";
import { mutate } from "swr";

function fmt(v: number) {
  return new Intl.NumberFormat("uz-UZ", { style: "currency", currency: "UZS", maximumFractionDigits: 0 }).format(v);
}
function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-neutral-200 dark:bg-neutral-700 rounded-xl", className)} />;
}

const ENROLL_CFG: Record<string, { label: string; cls: string }> = {
  SINOV:          { label: "Sinov",  cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  FAOL:           { label: "Faol",   cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  CHIQIB_KETGAN:  { label: "Ketgan", cls: "bg-neutral-100 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-500" },
};
const PAY_CFG: Record<string, { label: string; cls: string }> = {
  TOLANDI: { label: "To'langan", cls: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  QARZDOR: { label: "Qarzdor",   cls: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  QISMAN:  { label: "Qisman",   cls: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
};

const EMPTY = { name: "", phone: "", parentPhone: "", groupId: "" };

export default function StudentsPage() {
  const [search,       setSearch]       = useState("");
  const [filterEnroll, setFilterEnroll] = useState("barchasi");
  const [filterGroup,  setFilterGroup]  = useState("barchasi");
  const [showModal,    setShowModal]    = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [form,         setForm]         = useState(EMPTY);
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState("");
  const [fieldErr,     setFieldErr]     = useState({ name: "", phone: "" });
  const [activating,   setActivating]   = useState<string | null>(null);

  const { data: studentsRaw, isLoading } = useStudents({ search });
  const { data: groupsRaw }              = useGroups({ status: "ACTIVE" });

  const students: any[] = Array.isArray(studentsRaw) ? studentsRaw : [];
  const groups:   any[] = Array.isArray(groupsRaw)   ? groupsRaw   : [];

  const filtered = useMemo(() => students.filter(s => {
    const sg = s.groups?.[0];
    const matchEnroll = filterEnroll === "barchasi"
      || (filterEnroll === "SINOV"  && !s.isActive)
      || (filterEnroll === "FAOL"   && s.isActive)
      || sg?.enrollmentStatus === filterEnroll;
    const matchGroup = filterGroup === "barchasi" || s.groups?.some((g: any) => g.groupId === filterGroup);
    return matchEnroll && matchGroup;
  }), [students, filterEnroll, filterGroup]);

  const stats = useMemo(() => ({
    jami:    students.length,
    sinov:   students.filter(s => !s.isActive).length,
    faol:    students.filter(s => s.isActive).length,
    qarz:    students.filter(s => s.balance < 0).reduce((sum, s) => sum + Math.abs(s.balance), 0),
  }), [students]);

  function openCreate() {
    setForm(EMPTY); setError(""); setFieldErr({ name: "", phone: "" });
    setShowModal(true);
  }

  async function submit() {
    const errs = { name: "", phone: "" };
    if (!form.name.trim()) errs.name = "Ism majburiy";
    const digits = form.phone.replace(/\D/g, "");
    if (digits.length !== 12) errs.phone = "To'liq 9 ta raqam kiriting";
    if (errs.name || errs.phone) { setFieldErr(errs); return; }
    if (!form.groupId) { setError("Guruhni tanlang"); return; }

    setSaving(true); setError("");
    try {
      const res = await fetch("/api/students", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Xatolik"); return; }
      mutate((key: string) => typeof key === "string" && key.startsWith("/api/students"), undefined, { revalidate: true });
      setShowModal(false);
    } catch { setError("Serverga ulanib bo'lmadi"); }
    finally { setSaving(false); }
  }

  async function activate(student: any) {
    const sg = student.groups?.[0];
    if (!sg) return;
    setActivating(student.id);
    try {
      await fetch(`/api/student-groups/${sg.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enrollmentStatus: "FAOL" }),
      });
      mutate((key: string) => typeof key === "string" && key.startsWith("/api/students"), undefined, { revalidate: true });
    } finally { setActivating(null); }
  }

  async function deleteStudent() {
    if (!deleteTarget) return;
    setSaving(true);
    await fetch(`/api/students/${deleteTarget.id}`, { method: "DELETE" });
    mutate((key: string) => typeof key === "string" && key.startsWith("/api/students"), undefined, { revalidate: true });
    setDeleteTarget(null); setSaving(false);
  }

  return (
    <div>
      <TopHeader
        title="O'quvchilar"
        subtitle={isLoading ? "Yuklanmoqda..." : `Jami ${stats.jami} ta o'quvchi`}
        action={{ label: "Yangi o'quvchi", onClick: openCreate }}
      />

      {/* Create modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Yangi o'quvchi"
        subtitle="O'quvchi qo'shilganda sinov darsi yaratiladi"
        footer={
          <>
            <Button onClick={submit} disabled={saving}
              className="flex-1 h-9 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 text-white text-[13px]">
              {saving ? "Saqlanmoqda..." : "Qo'shish"}
            </Button>
            <Button variant="outline" className="h-9 px-4 text-[13px]" onClick={() => setShowModal(false)}>Bekor</Button>
          </>
        }
      >
        <FormField label="Ism familiya" required error={fieldErr.name}>
          <Input placeholder="Alisher Navoiy" value={form.name}
            onChange={e => { setForm(p => ({...p, name: e.target.value})); setFieldErr(p => ({...p, name: ""})); }}
            className="h-10" />
        </FormField>
        <FormField label="Telefon raqam" required error={fieldErr.phone}>
          <PhoneInput value={form.phone}
            onChange={v => { setForm(p => ({...p, phone: v})); setFieldErr(p => ({...p, phone: ""})); }}
            error={!!fieldErr.phone} />
        </FormField>
        <FormField label="Ota-ona telefoni" hint="Ixtiyoriy">
          <PhoneInput value={form.parentPhone} onChange={v => setForm(p => ({...p, parentPhone: v}))} />
        </FormField>
        <FormField label="Guruh" required error={error.includes("Guruh") ? error : ""}>
          <select value={form.groupId}
            onChange={e => { setForm(p => ({...p, groupId: e.target.value})); setError(""); }}
            className="w-full h-10 px-3 text-[13px] rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none focus:border-neutral-900 dark:focus:border-neutral-400 transition-colors">
            <option value="">Guruhni tanlang...</option>
            {groups.map((g: any) => (
              <option key={g.id} value={g.id}>{g.name} — {g.course?.name}</option>
            ))}
          </select>
        </FormField>
        {/* Info box */}
        <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/40 rounded-xl px-3 py-2.5">
          <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[12px] text-amber-700 dark:text-amber-400">
            O'quvchi <strong>nofaol</strong> holatda qo'shiladi. Sinov darsidan keyin "Faollashtirish" tugmasini bosing.
          </p>
        </div>
        {error && !error.includes("Guruh") && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl px-3 py-2.5">
            <AlertCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <p className="text-[12px] font-medium text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
      </Modal>

      <ConfirmDeleteModal
        open={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={deleteStudent} loading={saving}
        title="O'quvchini o'chirish"
        description={<><span className="font-semibold">{deleteTarget?.name}</span> o'chirilsinmi?</>}
      />

      <div className="p-5 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Jami",       value: stats.jami,  icon: GraduationCap, bg: "bg-blue-50 dark:bg-blue-950/40",   text: "text-blue-600 dark:text-blue-400" },
            { label: "Faol",       value: stats.faol,  icon: CheckCircle,   bg: "bg-green-50 dark:bg-green-950/40", text: "text-green-600 dark:text-green-400" },
            { label: "Sinov",      value: stats.sinov, icon: Clock,         bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-600 dark:text-amber-400" },
            { label: "Jami qarz",  value: fmt(stats.qarz), icon: DollarSign, bg: "bg-red-50 dark:bg-red-950/40",   text: "text-red-600 dark:text-red-400" },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", s.bg)}>
                  <Icon className={cn("w-4 h-4", s.text)} />
                </div>
                {isLoading ? <Skeleton className="h-6 w-12 mb-1" />
                  : <p className="text-[22px] font-black text-neutral-900 dark:text-neutral-100 leading-none">{s.value}</p>}
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">{s.label}</p>
              </div>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <Input placeholder="Ism, telefon..." className="pl-9 h-9 text-sm w-56"
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1.5">
            {[
              { v: "barchasi", l: "Barchasi" },
              { v: "SINOV",    l: "Sinov" },
              { v: "FAOL",     l: "Faol" },
            ].map(f => (
              <button key={f.v} onClick={() => setFilterEnroll(f.v)}
                className={cn("px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                  filterEnroll === f.v
                    ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900"
                    : "bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700 hover:border-neutral-400")}>
                {f.l}
              </button>
            ))}
          </div>
          <select value={filterGroup} onChange={e => setFilterGroup(e.target.value)}
            className="text-xs h-9 px-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 outline-none">
            <option value="barchasi">Barcha guruhlar</option>
            {groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </select>
          <span className="ml-auto text-xs text-neutral-400">{filtered.length} ta</span>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-neutral-50 dark:bg-neutral-800/60 hover:bg-neutral-50 dark:hover:bg-neutral-800/60">
                {["O'quvchi", "Telefon", "Guruh", "O'qituvchi", "Holat", "To'lov", ""].map(h => (
                  <TableHead key={h} className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading
                ? Array.from({length: 5}).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({length: 7}).map((_, j) => (
                        <TableCell key={j}><Skeleton className="h-3 w-full" /></TableCell>
                      ))}
                    </TableRow>
                  ))
                : filtered.map((s: any) => {
                    const sg      = s.groups?.[0];
                    const group   = sg?.group;
                    const teacher = group?.teacher?.user;
                    const enroll  = ENROLL_CFG[sg?.enrollmentStatus ?? (s.isActive ? "FAOL" : "SINOV")];
                    const pay     = PAY_CFG[sg?.paymentStatus ?? "TOLANDI"];
                    return (
                      <TableRow key={s.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-8 h-8 rounded-xl flex items-center justify-center text-white text-[12px] font-bold shrink-0",
                              s.isActive
                                ? "bg-gradient-to-br from-blue-400 to-indigo-500"
                                : "bg-gradient-to-br from-amber-400 to-orange-400"
                            )}>
                              {s.name[0]}
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">{s.name}</p>
                              <p className="text-[11px] text-neutral-400">{new Date(s.createdAt).toLocaleDateString("uz-UZ")}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-[13px] text-neutral-700 dark:text-neutral-300">{s.phone}</p>
                          {s.parentPhone && <p className="text-[11px] text-neutral-400">Ota: {s.parentPhone}</p>}
                        </TableCell>
                        <TableCell>
                          <span className="text-[13px] text-neutral-700 dark:text-neutral-300">{group?.name ?? "—"}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-[13px] text-neutral-500 dark:text-neutral-400">{teacher?.name ?? "—"}</span>
                        </TableCell>
                        <TableCell>
                          <span className={cn("text-[11px] px-2 py-0.5 rounded-full font-semibold", enroll?.cls)}>
                            {enroll?.label ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={cn("text-[11px] px-2.5 py-1 rounded-lg font-semibold", pay?.cls)}>
                            {pay?.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            {/* Faollashtirish */}
                            {!s.isActive && sg && (
                              <button
                                onClick={() => activate(s)}
                                disabled={activating === s.id}
                                title="Faollashtirish"
                                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors disabled:opacity-50">
                                <UserCheck className="w-3 h-3" />
                                {activating === s.id ? "..." : "Faollashtirish"}
                              </button>
                            )}
                            <a href={`tel:${s.phone}`}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 transition-colors">
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <Link href={`/students/${s.id}`}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                            <button onClick={() => setDeleteTarget(s)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-neutral-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
              }
            </TableBody>
          </Table>
          {!isLoading && filtered.length === 0 && (
            <div className="flex flex-col items-center py-16 text-neutral-400">
              <GraduationCap className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">Hech narsa topilmadi</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
