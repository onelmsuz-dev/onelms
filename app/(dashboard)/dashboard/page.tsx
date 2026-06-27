"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
} from "recharts";
import {
  Users, GraduationCap, TrendingUp, Wallet, Target, UserCheck,
  ArrowUpRight, ArrowDownRight, Calendar, ChevronRight,
  Activity, CreditCard,
} from "lucide-react";
import { MOCK_STATS, MOCK_REVENUE, MOCK_LEADS, MOCK_PAYMENTS, formatCurrency } from "@/lib/mock-data";
import { useChartColors } from "@/hooks/use-chart-colors";
import { useVariant } from "@/hooks/use-variant";
import { TopHeader } from "@/components/layout/top-header";

/* ─── Shared data ──────────────────────────────────────────────── */
const STATS = [
  { title: "O'quvchilar", value: MOCK_STATS.totalStudents, raw: MOCK_STATS.totalStudents, change: "+12", up: true,  icon: GraduationCap, color: "#6366f1", bg: "bg-indigo-50 dark:bg-indigo-950/40", text: "text-indigo-600 dark:text-indigo-400" },
  { title: "Guruhlar",     value: MOCK_STATS.activeGroups,  raw: MOCK_STATS.activeGroups,  change: "+2",  up: true,  icon: Users,         color: "#10b981", bg: "bg-emerald-50 dark:bg-emerald-950/40", text: "text-emerald-600 dark:text-emerald-400" },
  { title: "Daromad",      value: formatCurrency(MOCK_STATS.monthlyRevenue), raw: MOCK_STATS.monthlyRevenue, change: "+18%", up: true, icon: Wallet, color: "#f59e0b", bg: "bg-amber-50 dark:bg-amber-950/40", text: "text-amber-600 dark:text-amber-400" },
  { title: "Yangi Lidlar", value: MOCK_STATS.newLeads,      raw: MOCK_STATS.newLeads,      change: "+8",  up: true,  icon: Target,        color: "#ec4899", bg: "bg-pink-50 dark:bg-pink-950/40", text: "text-pink-600 dark:text-pink-400" },
  { title: "O'qituvchilar",value: MOCK_STATS.totalTeachers, raw: MOCK_STATS.totalTeachers, change: "0",   up: true,  icon: TrendingUp,    color: "#8b5cf6", bg: "bg-violet-50 dark:bg-violet-950/40", text: "text-violet-600 dark:text-violet-400" },
  { title: "Davomat",      value: `${MOCK_STATS.attendance}%`, raw: MOCK_STATS.attendance, change: "-3%", up: false, icon: UserCheck,     color: "#14b8a6", bg: "bg-teal-50 dark:bg-teal-950/40", text: "text-teal-600 dark:text-teal-400" },
];

const LEADS5 = MOCK_LEADS.slice(0, 5);
const PAYS5  = MOCK_PAYMENTS.slice(0, 5);
const ATTENDANCE_DATA = [
  { label: "Ingliz tili", value: 92 },
  { label: "Matematika", value: 85 },
  { label: "IT Dasturlash", value: 88 },
  { label: "Rus tili", value: 79 },
  { label: "Nemis tili", value: 91 },
];

const LEAD_COLORS: Record<string, string> = {
  yangi: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  aloqa_qilingan: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
  sinov_darsi: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  to_landi: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  bekor: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};
const LEAD_LABELS: Record<string, string> = {
  yangi: "Yangi", aloqa_qilingan: "Aloqa", sinov_darsi: "Sinov", to_landi: "To'ladi", bekor: "Bekor",
};
const PAY_LABELS: Record<string, string> = { naqd: "Naqd", karta: "Karta", click: "Click", payme: "Payme" };

/* ═══════════════════════════════════════════════════════════════════
   KLASSIK — Traditional card grid, charts side-by-side
══════════════════════════════════════════════════════════════════════ */
function KlassikDashboard() {
  const chart = useChartColors();
  return (
    <div>
      <TopHeader title="Dashboard" subtitle="Bugungi holat" />
      <div className="p-6 space-y-6">
        {/* 6-stat grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {STATS.map(s => {
            const Icon = s.icon;
            return (
              <Card key={s.title} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${s.text}`} />
                    </div>
                    <span className={`text-[11px] flex items-center gap-0.5 font-semibold ${s.up ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"}`}>
                      {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{s.change}
                    </span>
                  </div>
                  <p className="text-xl font-bold text-neutral-900 dark:text-neutral-100 leading-tight">{s.value}</p>
                  <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">{s.title}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid xl:grid-cols-3 gap-6">
          <Card className="xl:col-span-2 border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[15px] font-semibold">Moliyaviy ko'rsatkich</CardTitle>
                <Badge variant="outline" className="text-[11px]">So'nggi 6 oy</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={MOCK_REVENUE}>
                  <defs>
                    <linearGradient id="k-kirim" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="k-chiqim" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: chart.axis }} />
                  <YAxis tick={{ fontSize: 11, fill: chart.axis }} tickFormatter={v => `${(v / 1_000_000).toFixed(0)}M`} />
                  <Tooltip formatter={(v: unknown) => formatCurrency(v as number)} contentStyle={{ background: chart.tooltip, border: `1px solid ${chart.tooltipBorder}`, borderRadius: 8, color: chart.tooltipText }} />
                  <Area type="monotone" dataKey="kirim" stroke="#6366f1" fill="url(#k-kirim)" strokeWidth={2} name="Kirim" />
                  <Area type="monotone" dataKey="chiqim" stroke="#ef4444" fill="url(#k-chiqim)" strokeWidth={2} name="Chiqim" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2"><CardTitle className="text-[15px] font-semibold">Davomat</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {ATTENDANCE_DATA.map(d => (
                <div key={d.label}>
                  <div className="flex justify-between text-[13px] mb-1">
                    <span className="text-neutral-600 dark:text-neutral-400">{d.label}</span>
                    <span className="font-semibold text-neutral-900 dark:text-neutral-100">{d.value}%</span>
                  </div>
                  <Progress value={d.value} className="h-1.5" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Lists */}
        <div className="grid xl:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[15px] font-semibold">So'nggi Lidlar</CardTitle>
                <a href="/leads" className="text-[12px] text-indigo-600 hover:underline">Barchasini ko'rish →</a>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {LEADS5.map(l => (
                <div key={l.id} className="flex items-center justify-between px-6 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-semibold text-sm">{l.name[0]}</div>
                    <div>
                      <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">{l.name}</p>
                      <p className="text-[11px] text-neutral-400">{l.phone} · {l.course}</p>
                    </div>
                  </div>
                  <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${LEAD_COLORS[l.status]}`}>{LEAD_LABELS[l.status]}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[15px] font-semibold">So'nggi To'lovlar</CardTitle>
                <a href="/finance" className="text-[12px] text-indigo-600 hover:underline">Barchasini ko'rish →</a>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {PAYS5.map(p => (
                <div key={p.id} className="flex items-center justify-between px-6 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-semibold text-sm">{p.studentName[0]}</div>
                    <div>
                      <p className="text-[13px] font-medium text-neutral-900 dark:text-neutral-100">{p.studentName}</p>
                      <p className="text-[11px] text-neutral-400">{p.groupName} · {p.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(p.amount)}</p>
                    <p className="text-[11px] text-neutral-400">{PAY_LABELS[p.method]}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   YUQORI — Full-width, hero KPIs, wide chart, 3-col bottom
   Layout has top nav so NO TopHeader needed
══════════════════════════════════════════════════════════════════════ */
function YuqoriDashboard() {
  const chart = useChartColors();
  return (
    <div className="space-y-8">
      {/* Hero KPI band */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-sm border border-neutral-200/60 dark:border-neutral-800/60">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">Xush kelibsiz, Super Admin</h2>
            <p className="text-neutral-400 dark:text-neutral-500 mt-1">Bugungi ko'rsatkichlar bir nazar</p>
          </div>
          <div className="flex items-center gap-2 text-[13px] text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 px-4 py-2 rounded-xl">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString("uz-UZ", { month: "long", day: "numeric", year: "numeric" })}
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {STATS.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="text-center">
                <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center mx-auto mb-3`}>
                  <Icon className={`w-5 h-5 ${s.text}`} />
                </div>
                <p className="text-3xl font-black text-neutral-900 dark:text-neutral-100 leading-none tracking-tight">{s.value}</p>
                <p className="text-[12px] text-neutral-500 dark:text-neutral-400 mt-1.5 font-medium">{s.title}</p>
                <span className={`text-[11px] font-semibold ${s.up ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                  {s.up ? "↑" : "↓"} {s.change} bu oy
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full-width bar chart */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold">Daromad va Xarajatlar</CardTitle>
              <p className="text-[13px] text-neutral-400 mt-0.5">So'nggi 6 oylik moliyaviy hisobot</p>
            </div>
            <div className="flex items-center gap-4 text-[12px] font-medium">
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" />Kirim</div>
              <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400 inline-block" />Chiqim</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={MOCK_REVENUE} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: chart.axis }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: chart.axis }} tickFormatter={v => `${(v / 1_000_000).toFixed(0)}M`} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: unknown) => formatCurrency(v as number)} contentStyle={{ background: chart.tooltip, border: `1px solid ${chart.tooltipBorder}`, borderRadius: 12, color: chart.tooltipText }} />
              <Bar dataKey="kirim" fill="#6366f1" radius={[6, 6, 0, 0]} name="Kirim" />
              <Bar dataKey="chiqim" fill="#fca5a5" radius={[6, 6, 0, 0]} name="Chiqim" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 3-column bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[15px] font-bold flex items-center gap-2"><Target className="w-4 h-4 text-pink-500" />Lidlar</CardTitle>
              <a href="/leads" className="text-[12px] text-indigo-600 hover:underline">Barchasi</a>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 p-3">
            {LEADS5.map(l => (
              <div key={l.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 flex items-center justify-center text-[12px] font-bold shrink-0">{l.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100 truncate">{l.name}</p>
                  <p className="text-[11px] text-neutral-400 truncate">{l.course}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-lg font-semibold shrink-0 ${LEAD_COLORS[l.status]}`}>{LEAD_LABELS[l.status]}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Payments */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-[15px] font-bold flex items-center gap-2"><CreditCard className="w-4 h-4 text-emerald-500" />To'lovlar</CardTitle>
              <a href="/finance" className="text-[12px] text-indigo-600 hover:underline">Barchasi</a>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 p-3">
            {PAYS5.map(p => (
              <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[12px] font-bold shrink-0">{p.studentName[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100 truncate">{p.studentName}</p>
                  <p className="text-[11px] text-neutral-400 truncate">{p.groupName}</p>
                </div>
                <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 shrink-0">{formatCurrency(p.amount)}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Davomat */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-[15px] font-bold flex items-center gap-2"><Activity className="w-4 h-4 text-violet-500" />Davomat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ATTENDANCE_DATA.map(d => (
              <div key={d.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-[12px] text-neutral-600 dark:text-neutral-400">{d.label}</span>
                  <span className="text-[12px] font-bold text-neutral-900 dark:text-neutral-100">{d.value}%</span>
                </div>
                <div className="h-2 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${d.value}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   QORA — Light content, colored accent strip, side-by-side compact
   Dark sidebar with indigo accents, content should feel premium
══════════════════════════════════════════════════════════════════════ */
function QoraDashboard() {
  const chart = useChartColors();
  return (
    <div className="p-6 space-y-6">
      {/* Accent strip with stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STATS.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 group hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                <span className={`text-[10px] font-bold ${s.up ? "text-emerald-500" : "text-red-500"}`}>{s.change}</span>
              </div>
              <p className="text-[22px] font-black text-neutral-900 dark:text-neutral-100 leading-none">{s.value}</p>
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 font-medium">{s.title}</p>
              <div className="mt-2 h-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all group-hover:w-full w-0 duration-500" style={{ background: s.color, width: "0%" }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Main: big chart + side panel */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Line chart — spans 2 cols */}
        <div className="lg:col-span-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-[16px] font-bold text-neutral-900 dark:text-neutral-100">Daromad dinamikasi</h3>
              <p className="text-[12px] text-neutral-400 dark:text-neutral-500 mt-0.5">Oyma-oy tahlil</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{formatCurrency(MOCK_STATS.monthlyRevenue)}</p>
              <p className="text-[11px] text-emerald-500 font-semibold">↑ 18% o'sish</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MOCK_REVENUE}>
              <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: chart.axis }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: chart.axis }} tickFormatter={v => `${(v/1_000_000).toFixed(0)}M`} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: unknown) => formatCurrency(v as number)} contentStyle={{ background: chart.tooltip, border: `1px solid ${chart.tooltipBorder}`, borderRadius: 10, color: chart.tooltipText }} />
              <Line type="monotone" dataKey="kirim" stroke="#6366f1" strokeWidth={2.5} dot={false} name="Kirim" />
              <Line type="monotone" dataKey="chiqim" stroke="#f43f5e" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Chiqim" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <div className="bg-indigo-600 text-white rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-indigo-200 text-[12px] font-medium">Bu oy</span>
            </div>
            <p className="text-3xl font-black">{MOCK_STATS.newLeads}</p>
            <p className="text-indigo-200 text-[13px] mt-1">Yangi lidlar</p>
            <div className="mt-3 h-1 bg-white/20 rounded-full"><div className="h-full bg-white rounded-full" style={{ width: "68%" }} /></div>
          </div>

          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4">
            <h4 className="text-[13px] font-bold text-neutral-900 dark:text-neutral-100 mb-3">Davomat</h4>
            <div className="space-y-2.5">
              {ATTENDANCE_DATA.slice(0, 4).map(d => (
                <div key={d.label} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-neutral-500">{d.label}</span>
                      <span className="font-bold text-neutral-800 dark:text-neutral-200">{d.value}%</span>
                    </div>
                    <div className="h-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${d.value}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tables row */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-[14px] font-bold text-neutral-900 dark:text-neutral-100">So'nggi Lidlar</h3>
            <a href="/leads" className="text-[12px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 hover:gap-2 transition-all">Ko'rish <ChevronRight className="w-3.5 h-3.5" /></a>
          </div>
          <table className="w-full text-[13px]">
            <thead><tr className="bg-neutral-50 dark:bg-neutral-800/50">
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase text-neutral-400 tracking-wide">Ism</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase text-neutral-400 tracking-wide">Kurs</th>
              <th className="px-5 py-2.5 text-right text-[11px] font-bold uppercase text-neutral-400 tracking-wide">Holat</th>
            </tr></thead>
            <tbody>{LEADS5.map(l => (
              <tr key={l.id} className="border-t border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                <td className="px-5 py-3 font-medium text-neutral-900 dark:text-neutral-100">{l.name}</td>
                <td className="px-5 py-3 text-neutral-500">{l.course}</td>
                <td className="px-5 py-3 text-right"><span className={`text-[11px] px-2 py-0.5 rounded-lg font-semibold ${LEAD_COLORS[l.status]}`}>{LEAD_LABELS[l.status]}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
            <h3 className="text-[14px] font-bold text-neutral-900 dark:text-neutral-100">So'nggi To'lovlar</h3>
            <a href="/finance" className="text-[12px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1 hover:gap-2 transition-all">Ko'rish <ChevronRight className="w-3.5 h-3.5" /></a>
          </div>
          <table className="w-full text-[13px]">
            <thead><tr className="bg-neutral-50 dark:bg-neutral-800/50">
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase text-neutral-400 tracking-wide">O'quvchi</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase text-neutral-400 tracking-wide">Guruh</th>
              <th className="px-5 py-2.5 text-right text-[11px] font-bold uppercase text-neutral-400 tracking-wide">Summa</th>
            </tr></thead>
            <tbody>{PAYS5.map(p => (
              <tr key={p.id} className="border-t border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                <td className="px-5 py-3 font-medium text-neutral-900 dark:text-neutral-100">{p.studentName}</td>
                <td className="px-5 py-3 text-neutral-500">{p.groupName}</td>
                <td className="px-5 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(p.amount)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   TOR — Rail 72px, very wide content, 4-col stats, huge chart
══════════════════════════════════════════════════════════════════════ */
function TorDashboard() {
  const chart = useChartColors();
  return (
    <div className="space-y-5">
      {/* Stats: horizontal 4-col then 2-col */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {STATS.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={s.title} className={`bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-4 flex gap-3 items-center ${i < 4 ? "" : "hidden lg:flex"}`}>
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

      {/* Very wide area chart */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-[16px] font-bold text-neutral-900 dark:text-neutral-100">Moliyaviy ko'rsatkich</h3>
            <p className="text-[12px] text-neutral-400 mt-0.5">So'nggi 6 oy · Kirim va chiqim</p>
          </div>
          <div className="flex gap-4 text-[12px]">
            <div className="flex items-center gap-2"><span className="w-8 h-0.5 bg-teal-500 block rounded-full" />Kirim</div>
            <div className="flex items-center gap-2"><span className="w-8 h-0.5 bg-red-400 block rounded-full" />Chiqim</div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={MOCK_REVENUE}>
            <defs>
              <linearGradient id="t-kirim" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: chart.axis }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: chart.axis }} tickFormatter={v => `${(v/1_000_000).toFixed(0)}M`} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: unknown) => formatCurrency(v as number)} contentStyle={{ background: chart.tooltip, border: `1px solid ${chart.tooltipBorder}`, borderRadius: 10, color: chart.tooltipText }} />
            <Area type="monotone" dataKey="kirim" stroke="#14b8a6" fill="url(#t-kirim)" strokeWidth={2.5} name="Kirim" />
            <Area type="monotone" dataKey="chiqim" stroke="#f87171" fill="none" strokeWidth={1.5} strokeDasharray="6 3" name="Chiqim" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Wide 2-col bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Leads feed */}
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

        {/* Payments + mini attendance */}
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
              {PAYS5.slice(0, 3).map(p => (
                <div key={p.id} className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white text-[12px] font-bold shrink-0">{p.studentName[0]}</div>
                    <div>
                      <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">{p.studentName}</p>
                      <p className="text-[11px] text-neutral-400">{p.date}</p>
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
            <div className="ml-auto">
              <Activity className="w-16 h-16 text-white/20" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   KENG — Wide sidebar (300px), narrower content, editorial magazine
══════════════════════════════════════════════════════════════════════ */
function KengDashboard() {
  const chart = useChartColors();
  return (
    <div className="space-y-6">
      {/* Giant 3-stat hero row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {[
          { label: "Jami O'quvchilar", value: MOCK_STATS.totalStudents, sub: "Bu oyda +12 yangi", icon: GraduationCap, grad: "from-blue-600 to-indigo-600" },
          { label: "Oylik Daromad", value: formatCurrency(MOCK_STATS.monthlyRevenue), sub: "Oldingi oyga nisbatan +18%", icon: Wallet, grad: "from-emerald-600 to-teal-600" },
          { label: "Umumiy Davomat", value: `${MOCK_STATS.attendance}%`, sub: "Bu oyda 3% kamaydi", icon: UserCheck, grad: "from-violet-600 to-purple-600" },
        ].map(h => {
          const Icon = h.icon;
          return (
            <div key={h.label} className={`bg-gradient-to-br ${h.grad} text-white rounded-2xl p-6`}>
              <div className="flex items-start justify-between mb-4">
                <Icon className="w-7 h-7 text-white/80" />
                <span className="text-white/60 text-[11px] font-medium uppercase tracking-widest">Bu oy</span>
              </div>
              <p className="text-4xl font-black leading-none tracking-tight">{h.value}</p>
              <p className="text-white/70 text-[12px] mt-2 font-medium">{h.label}</p>
              <p className="text-white/50 text-[11px] mt-0.5">{h.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Secondary stats row */}
      <div className="grid grid-cols-3 gap-4">
        {STATS.slice(1, 4).filter((_, i) => i !== 2).concat([STATS[3]]).map(s => {
          const Icon = s.icon;
          return (
            <div key={s.title} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-4 flex items-center gap-4">
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                <Icon className={`w-5 h-5 ${s.text}`} />
              </div>
              <div>
                <p className="text-[22px] font-black text-neutral-900 dark:text-neutral-100 leading-none">{s.value}</p>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">{s.title}</p>
              </div>
              <span className={`ml-auto text-[12px] font-bold ${s.up ? "text-emerald-500" : "text-red-500"}`}>{s.change}</span>
            </div>
          );
        })}
      </div>

      {/* Chart full width */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-[17px] font-bold text-neutral-900 dark:text-neutral-100">Moliyaviy dinamika</h3>
            <p className="text-[12px] text-neutral-400 mt-0.5">Yanvar – Iyun 2024</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-right">
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl px-3 py-1.5">
              <p className="text-[11px] text-blue-500 font-medium">Jami kirim</p>
              <p className="text-[14px] font-black text-blue-700 dark:text-blue-400">{formatCurrency(MOCK_REVENUE.reduce((a,r)=>a+r.kirim,0))}</p>
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 rounded-xl px-3 py-1.5">
              <p className="text-[11px] text-red-400 font-medium">Jami chiqim</p>
              <p className="text-[14px] font-black text-red-600 dark:text-red-400">{formatCurrency(MOCK_REVENUE.reduce((a,r)=>a+r.chiqim,0))}</p>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={MOCK_REVENUE} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: chart.axis }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: chart.axis }} tickFormatter={v => `${(v/1_000_000).toFixed(0)}M`} axisLine={false} tickLine={false} />
            <Tooltip formatter={(v: unknown) => formatCurrency(v as number)} contentStyle={{ background: chart.tooltip, border: `1px solid ${chart.tooltipBorder}`, borderRadius: 10, color: chart.tooltipText }} />
            <Bar dataKey="kirim" fill="#6366f1" radius={[5,5,0,0]} name="Kirim" />
            <Bar dataKey="chiqim" fill="#fca5a5" radius={[5,5,0,0]} name="Chiqim" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 2-col feed */}
      <div className="grid sm:grid-cols-2 gap-5">
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
          <div className="bg-neutral-900 dark:bg-neutral-100 px-5 py-4 flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-white dark:text-neutral-900">So'nggi Lidlar</h3>
            <a href="/leads" className="text-neutral-300 dark:text-neutral-600 text-[12px] hover:text-white dark:hover:text-neutral-900 transition-colors">Barchasi →</a>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {LEADS5.map(l => (
              <div key={l.id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors group">
                <div className="w-9 h-9 bg-neutral-100 dark:bg-neutral-800 rounded-xl flex items-center justify-center text-neutral-700 dark:text-neutral-300 font-bold text-[13px] shrink-0 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/40 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-all">{l.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100 truncate">{l.name}</p>
                  <p className="text-[11px] text-neutral-400 truncate">{l.course}</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-lg font-bold shrink-0 ${LEAD_COLORS[l.status]}`}>{LEAD_LABELS[l.status]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
          <div className="bg-emerald-600 px-5 py-4 flex items-center justify-between">
            <h3 className="text-[14px] font-bold text-white">So'nggi To'lovlar</h3>
            <a href="/finance" className="text-emerald-200 text-[12px] hover:text-white transition-colors">Barchasi →</a>
          </div>
          <div className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {PAYS5.map(p => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/40 rounded-xl flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-bold text-[13px] shrink-0">{p.studentName[0]}</div>
                  <div>
                    <p className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100">{p.studentName}</p>
                    <p className="text-[11px] text-neutral-400">{p.groupName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(p.amount)}</p>
                  <p className="text-[10px] text-neutral-400">{PAY_LABELS[p.method]}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ROOT — Switch between 5 variants
══════════════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { variantId, mounted } = useVariant();

  if (!mounted) return <KlassikDashboard />;

  switch (variantId) {
    case "yuqori": return <YuqoriDashboard />;
    case "qora":   return <QoraDashboard />;
    case "tor":    return <TorDashboard />;
    case "keng":   return <KengDashboard />;
    default:       return <KlassikDashboard />;
  }
}
