"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Users, GraduationCap, TrendingUp, Wallet, Target, UserCheck,
  Activity, CreditCard,
} from "lucide-react";
import { MOCK_STATS, MOCK_REVENUE, MOCK_LEADS, MOCK_PAYMENTS, formatCurrency } from "@/lib/mock-data";
import { useChartColors } from "@/hooks/use-chart-colors";
import { TopHeader } from "@/components/layout/top-header";

const STATS = [
  { title: "O'quvchilar",   value: MOCK_STATS.totalStudents,              change: "+12",  up: true,  icon: GraduationCap, bg: "bg-indigo-50 dark:bg-indigo-950/40",  text: "text-indigo-600 dark:text-indigo-400" },
  { title: "Guruhlar",       value: MOCK_STATS.activeGroups,               change: "+2",   up: true,  icon: Users,         bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400" },
  { title: "Daromad",        value: formatCurrency(MOCK_STATS.monthlyRevenue), change: "+18%", up: true,  icon: Wallet,        bg: "bg-amber-50 dark:bg-amber-950/40",    text: "text-amber-600 dark:text-amber-400" },
  { title: "Yangi Lidlar",   value: MOCK_STATS.newLeads,                   change: "+8",   up: true,  icon: Target,        bg: "bg-pink-50 dark:bg-pink-950/40",      text: "text-pink-600 dark:text-pink-400" },
  { title: "O'qituvchilar",  value: MOCK_STATS.totalTeachers,              change: "0",    up: true,  icon: TrendingUp,    bg: "bg-violet-50 dark:bg-violet-950/40",  text: "text-violet-600 dark:text-violet-400" },
  { title: "Davomat",        value: `${MOCK_STATS.attendance}%`,           change: "-3%",  up: false, icon: UserCheck,     bg: "bg-teal-50 dark:bg-teal-950/40",      text: "text-teal-600 dark:text-teal-400" },
];

const LEADS5 = MOCK_LEADS.slice(0, 5);
const PAYS5  = MOCK_PAYMENTS.slice(0, 3);

const LEAD_COLORS: Record<string, string> = {
  yangi:           "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  aloqa_qilingan:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  sinov_darsi:     "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  to_landi:        "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  bekor:           "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};
const LEAD_LABELS: Record<string, string> = {
  yangi: "Yangi", aloqa_qilingan: "Aloqa", sinov_darsi: "Sinov", to_landi: "To'ladi", bekor: "Bekor",
};
const PAY_LABELS: Record<string, string> = { naqd: "Naqd", karta: "Karta", click: "Click", payme: "Payme" };

export default function DashboardPage() {
  const chart = useChartColors();

  return (
    <div>
      <TopHeader title="Dashboard" subtitle="Bugungi holat" />

      <div className="p-6 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.title}
                className={`bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex gap-3 items-center ${i >= 4 ? "hidden lg:flex" : ""}`}>
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-5 h-5 ${s.text}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-[20px] font-black text-neutral-900 dark:text-neutral-100 leading-none truncate">{s.value}</p>
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5 truncate">{s.title}</p>
                  <span className={`text-[10px] font-bold ${s.up ? "text-emerald-500" : "text-red-500"}`}>{s.change}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Area chart */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-[16px] font-bold text-neutral-900 dark:text-neutral-100">Moliyaviy ko'rsatkich</h3>
              <p className="text-[12px] text-neutral-400 mt-0.5">So'nggi 6 oy · Kirim va chiqim</p>
            </div>
            <div className="flex gap-4 text-[12px] text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center gap-2"><span className="w-8 h-0.5 bg-teal-500 block rounded-full" />Kirim</div>
              <div className="flex items-center gap-2"><span className="w-8 h-0.5 bg-red-400 block rounded-full" />Chiqim</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MOCK_REVENUE}>
              <defs>
                <linearGradient id="dash-kirim" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: chart.axis }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: chart.axis }} tickFormatter={v => `${(v / 1_000_000).toFixed(0)}M`} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: unknown) => formatCurrency(v as number)} contentStyle={{ background: chart.tooltip, border: `1px solid ${chart.tooltipBorder}`, borderRadius: 10, color: chart.tooltipText }} />
              <Area type="monotone" dataKey="kirim" stroke="#14b8a6" fill="url(#dash-kirim)" strokeWidth={2.5} name="Kirim" />
              <Area type="monotone" dataKey="chiqim" stroke="#f87171" fill="none" strokeWidth={1.5} strokeDasharray="6 3" name="Chiqim" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 2-col bottom */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Leads */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
                  <Target className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-[14px] font-bold text-neutral-900 dark:text-neutral-100">Yangi Lidlar</h3>
              </div>
              <a href="/leads" className="text-[12px] text-teal-600 dark:text-teal-400 font-semibold hover:underline">Barchasi →</a>
            </div>
            <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
              {LEADS5.map(l => (
                <div key={l.id} className="flex items-center gap-4 px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-xl flex items-center justify-center text-white text-[13px] font-bold shrink-0">{l.name[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100 truncate">{l.name}</p>
                    <p className="text-[11px] text-neutral-400 truncate">{l.phone} · {l.course}</p>
                  </div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold shrink-0 ${LEAD_COLORS[l.status]}`}>{LEAD_LABELS[l.status]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payments + attendance */}
          <div className="space-y-5">
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                    <CreditCard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="text-[14px] font-bold text-neutral-900 dark:text-neutral-100">To'lovlar</h3>
                </div>
                <a href="/finance" className="text-[12px] text-teal-600 dark:text-teal-400 font-semibold hover:underline">Barchasi →</a>
              </div>
              <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {PAYS5.map(p => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white text-[12px] font-bold shrink-0">{p.studentName[0]}</div>
                      <div>
                        <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">{p.studentName}</p>
                        <p className="text-[11px] text-neutral-400">{PAY_LABELS[p.method]} · {p.date}</p>
                      </div>
                    </div>
                    <p className="text-[14px] font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(p.amount)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-teal-600 text-white rounded-2xl p-5 flex items-center gap-5">
              <div>
                <p className="text-4xl font-black">{MOCK_STATS.attendance}%</p>
                <p className="text-teal-200 text-[13px] mt-1 font-medium">Umumiy Davomat</p>
                <p className="text-teal-300 text-[11px] mt-0.5">Bu oyda 3% pasaydi</p>
              </div>
              <Activity className="w-16 h-16 text-white/20 ml-auto" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
