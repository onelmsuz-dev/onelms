"use client";

import { useState } from "react";
import useSWR from "swr";
import { cn } from "@/lib/utils";
import {
  Building2, Users, GraduationCap, TrendingUp, BookOpen,
  Target, CheckCircle, XCircle, RefreshCw, Plus, X, AlertCircle,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

function fmt(v: number) {
  return new Intl.NumberFormat("uz-UZ", { style: "currency", currency: "UZS", maximumFractionDigits: 0 }).format(v);
}
function fmtShort(v: number) {
  if (v >= 1_000_000_000) return `${(v / 1_000_000_000).toFixed(1)}B`;
  if (v >= 1_000_000)     return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)         return `${(v / 1_000).toFixed(0)}K`;
  return String(v);
}

const PLAN_CFG: Record<string, { label: string; color: string }> = {
  BASIC:      { label: "Basic",      color: "bg-neutral-700 text-neutral-300" },
  PRO:        { label: "Pro",        color: "bg-blue-900/60 text-blue-300" },
  ENTERPRISE: { label: "Enterprise", color: "bg-purple-900/60 text-purple-300" },
};

const PLANS = ["BASIC", "PRO", "ENTERPRISE"] as const;

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-neutral-800 rounded-lg", className)} />;
}

type OrgForm = {
  name: string; subdomain: string; plan: "BASIC" | "PRO" | "ENTERPRISE";
  adminName: string; adminPhone: string; adminEmail: string; adminPassword: string;
};

const EMPTY_FORM: OrgForm = {
  name: "", subdomain: "", plan: "BASIC",
  adminName: "", adminPhone: "", adminEmail: "", adminPassword: "",
};

export default function AdmodePage() {
  const { data, isLoading, mutate } = useSWR("/api/admode/stats", fetcher, {
    refreshInterval: 30_000,
  });

  const [showCreate, setShowCreate]   = useState(false);
  const [form,       setForm]         = useState<OrgForm>(EMPTY_FORM);
  const [saving,     setSaving]       = useState(false);
  const [createErr,  setCreateErr]    = useState("");
  const [togglingId, setTogglingId]   = useState<string | null>(null);

  const totals = data?.totals;
  const orgs: any[] = data?.orgs ?? [];

  const statCards = totals ? [
    { label: "O'quv markazlar", value: totals.orgs,     icon: Building2,     color: "text-blue-400",   bg: "bg-blue-900/20" },
    { label: "Jami o'quvchilar", value: totals.students, icon: GraduationCap, color: "text-green-400",  bg: "bg-green-900/20" },
    { label: "O'qituvchilar",   value: totals.teachers,  icon: Users,         color: "text-purple-400", bg: "bg-purple-900/20" },
    { label: "Faol guruhlar",   value: totals.groups,    icon: BookOpen,      color: "text-yellow-400", bg: "bg-yellow-900/20" },
    { label: "Lidlar",          value: totals.leads,     icon: Target,        color: "text-pink-400",   bg: "bg-pink-900/20" },
    { label: "Jami daromad",    value: fmtShort(totals.revenue), icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-900/20", isText: true },
  ] : [];

  async function createOrg() {
    if (!form.name || !form.subdomain || !form.adminName || !form.adminPhone || !form.adminPassword) {
      setCreateErr("Barcha majburiy maydonlar to'ldirilsin"); return;
    }
    setSaving(true); setCreateErr("");
    try {
      const res  = await fetch("/api/admode/organizations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, subdomain: form.subdomain, plan: form.plan,
          adminName: form.adminName, adminPhone: form.adminPhone,
          adminEmail: form.adminEmail || undefined,
          adminPassword: form.adminPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setCreateErr(data.error ?? "Xatolik"); return; }
      mutate();
      setShowCreate(false);
      setForm(EMPTY_FORM);
    } catch { setCreateErr("Serverga ulanib bo'lmadi"); }
    finally { setSaving(false); }
  }

  async function toggleActive(id: string, isActive: boolean) {
    setTogglingId(id);
    try {
      await fetch(`/api/admode/organizations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      mutate();
    } finally { setTogglingId(null); }
  }

  async function changePlan(id: string, plan: string) {
    await fetch(`/api/admode/organizations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    mutate();
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Create Org Modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setShowCreate(false)}>
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800">
              <h2 className="font-bold text-[15px] text-white">Yangi o'quv markaz</h2>
              <button onClick={() => setShowCreate(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-neutral-800 text-neutral-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1.5">Markaz nomi *</label>
                  <input
                    className="w-full h-9 px-3 text-sm rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-600 outline-none focus:border-blue-500"
                    placeholder="Yulduz Academy"
                    value={form.name}
                    onChange={e => { setForm(p => ({ ...p, name: e.target.value })); setCreateErr(""); }}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-400 mb-1.5">Subdomain *</label>
                  <div className="flex items-center h-9 rounded-lg border border-neutral-700 bg-neutral-800 overflow-hidden focus-within:border-blue-500">
                    <input
                      className="flex-1 px-3 text-sm bg-transparent text-white placeholder-neutral-600 outline-none"
                      placeholder="yulduz"
                      value={form.subdomain}
                      onChange={e => { setForm(p => ({ ...p, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "") })); setCreateErr(""); }}
                    />
                    <span className="px-2 text-[11px] text-neutral-500 whitespace-nowrap">.oneroom.uz</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-400 mb-1.5">Tarif</label>
                <div className="flex gap-2">
                  {PLANS.map(planOpt => (
                    <button key={planOpt} onClick={() => setForm(prev => ({ ...prev, plan: planOpt }))}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-[12px] font-semibold border transition-colors",
                        form.plan === planOpt
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "border-neutral-700 text-neutral-400 hover:border-neutral-600"
                      )}>
                      {PLAN_CFG[planOpt].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-neutral-800 pt-3">
                <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider mb-3">Admin ma'lumotlari</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1.5">Ism *</label>
                    <input
                      className="w-full h-9 px-3 text-sm rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-600 outline-none focus:border-blue-500"
                      placeholder="Rahimov Jamshid"
                      value={form.adminName}
                      onChange={e => { setForm(p => ({ ...p, adminName: e.target.value })); setCreateErr(""); }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-400 mb-1.5">Telefon *</label>
                      <input
                        type="tel"
                        className="w-full h-9 px-3 text-sm rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-600 outline-none focus:border-blue-500"
                        placeholder="+998901234567"
                        value={form.adminPhone}
                        onChange={e => { setForm(p => ({ ...p, adminPhone: e.target.value })); setCreateErr(""); }}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-neutral-400 mb-1.5">Parol *</label>
                      <input
                        type="password"
                        className="w-full h-9 px-3 text-sm rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-600 outline-none focus:border-blue-500"
                        placeholder="min 6 belgi"
                        value={form.adminPassword}
                        onChange={e => { setForm(p => ({ ...p, adminPassword: e.target.value })); setCreateErr(""); }}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-neutral-400 mb-1.5">Email (ixtiyoriy)</label>
                    <input
                      type="email"
                      className="w-full h-9 px-3 text-sm rounded-lg border border-neutral-700 bg-neutral-800 text-white placeholder-neutral-600 outline-none focus:border-blue-500"
                      placeholder="admin@email.com"
                      value={form.adminEmail}
                      onChange={e => { setForm(p => ({ ...p, adminEmail: e.target.value })); setCreateErr(""); }}
                    />
                  </div>
                </div>
              </div>

              {createErr && (
                <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/40 rounded-xl px-3 py-2.5">
                  <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <p className="text-[12px] font-medium text-red-400">{createErr}</p>
                </div>
              )}
            </div>

            <div className="px-6 pb-6 flex gap-2">
              <button
                onClick={createOrg}
                disabled={saving}
                className="flex-1 h-10 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[13px] font-semibold rounded-xl transition-colors">
                {saving ? "Yaratilmoqda..." : "Yaratish"}
              </button>
              <button
                onClick={() => { setShowCreate(false); setCreateErr(""); setForm(EMPTY_FORM); }}
                className="px-4 h-10 border border-neutral-700 rounded-xl text-[13px] text-neutral-400 hover:bg-neutral-800 transition-colors">
                Bekor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Platform ko'rinishi</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Barcha o'quv markazlar statistikasi</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setForm(EMPTY_FORM); setCreateErr(""); setShowCreate(true); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-[13px] text-white font-semibold transition-colors">
            <Plus className="w-3.5 h-3.5" />
            Yangi markaz
          </button>
          <button
            onClick={() => mutate()}
            className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-[13px] text-neutral-300 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            Yangilash
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
                <Skeleton className="w-9 h-9 rounded-xl" />
                <Skeleton className="h-7 w-14" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))
          : statCards.map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label}
                  className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 hover:border-neutral-700 transition-colors">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center mb-3", s.bg)}>
                    <Icon className={cn("w-4.5 h-4.5", s.color)} />
                  </div>
                  <p className="text-[22px] font-black text-white leading-none">
                    {s.isText ? s.value : Number(s.value).toLocaleString()}
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-1">{s.label}</p>
                </div>
              );
            })
        }
      </div>

      {/* Organizations table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="font-bold text-[15px] text-white">O'quv markazlar</h2>
          <span className="text-[12px] text-neutral-500">{orgs.length} ta markaz</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-800">
                {["Markaz", "Plan", "O'quvchi", "O'qituvchi", "Guruh", "Lidlar", "Daromad", "Holat", "Sana", "Amal"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[11px] font-bold text-neutral-500 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-neutral-800/60">
                      {Array.from({ length: 10 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-3 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                : orgs.map(org => {
                    const plan = PLAN_CFG[org.plan] ?? PLAN_CFG.BASIC;
                    return (
                      <tr key={org.id}
                        className="border-b border-neutral-800/60 hover:bg-neutral-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-[13px] font-semibold text-white">{org.name}</p>
                            <p className="text-[11px] text-neutral-500">{org.subdomain}.oneroom.uz</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <select
                            value={org.plan}
                            onChange={e => changePlan(org.id, e.target.value)}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full border-0 outline-none cursor-pointer
                              bg-neutral-800 text-neutral-300 hover:bg-neutral-700 transition-colors">
                            {PLANS.map(p => (
                              <option key={p} value={p}>{PLAN_CFG[p].label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[13px] font-bold text-green-400">{org._count.students}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[13px] font-bold text-purple-400">{org._count.teachers}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[13px] font-semibold text-neutral-300">{org._count.groups}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[13px] font-semibold text-pink-400">{org._count.leads}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[12px] font-bold text-emerald-400">
                            {fmtShort(org.revenue)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {org.isActive
                            ? <div className="flex items-center gap-1.5 text-emerald-400"><CheckCircle className="w-3.5 h-3.5" /><span className="text-[12px]">Faol</span></div>
                            : <div className="flex items-center gap-1.5 text-red-400"><XCircle className="w-3.5 h-3.5" /><span className="text-[12px]">Bloklangan</span></div>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] text-neutral-500">
                            {new Date(org.createdAt).toLocaleDateString("uz-UZ")}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => toggleActive(org.id, org.isActive)}
                            disabled={togglingId === org.id}
                            className={cn(
                              "text-[10px] font-semibold px-2.5 py-1 rounded-lg transition-colors disabled:opacity-50",
                              org.isActive
                                ? "bg-red-900/30 text-red-400 hover:bg-red-900/50"
                                : "bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50"
                            )}>
                            {togglingId === org.id ? "..." : org.isActive ? "Bloklash" : "Faollashtirish"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>

          {!isLoading && orgs.length === 0 && (
            <div className="py-16 text-center text-neutral-600">
              <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm mb-3">Hali o'quv markaz qo'shilmagan</p>
              <button
                onClick={() => { setForm(EMPTY_FORM); setCreateErr(""); setShowCreate(true); }}
                className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors">
                <Plus className="w-3.5 h-3.5" /> Birinchi markazni qo'shish
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Revenue breakdown */}
      {!isLoading && totals && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <p className="text-[12px] text-neutral-500 mb-1">Jami daromad</p>
            <p className="text-[20px] font-black text-emerald-400">{fmt(totals.revenue)}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <p className="text-[12px] text-neutral-500 mb-1">Jami xarajatlar</p>
            <p className="text-[20px] font-black text-red-400">{fmt(totals.expenses)}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
            <p className="text-[12px] text-neutral-500 mb-1">Sof foyda</p>
            <p className={cn("text-[20px] font-black", (totals.revenue - totals.expenses) >= 0 ? "text-white" : "text-red-400")}>
              {fmt(totals.revenue - totals.expenses)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
