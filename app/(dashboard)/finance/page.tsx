"use client";

import { useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MOCK_PAYMENTS, MOCK_EXPENSES, MOCK_STATS, MOCK_STUDENTS, MOCK_TEACHER_SALARIES, formatCurrency } from "@/lib/mock-data";
import { TrendingUp, TrendingDown, Wallet, AlertCircle, Plus, X, CreditCard, CheckCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const METHOD_LABELS: Record<string, string> = { naqd: "Naqd", karta: "Karta", click: "Click", payme: "Payme" };
const METHOD_COLORS: Record<string, string> = {
  naqd:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  karta: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  click: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  payme: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

type Tab = "kirim" | "chiqim" | "oylik";

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<Tab>("kirim");
  const [showPayModal, setShowPayModal] = useState(false);
  const [payForm, setPayForm] = useState({ studentId: "", amount: "", method: "naqd", note: "" });

  const totalPayments = MOCK_PAYMENTS.reduce((s, p) => s + p.amount, 0);
  const totalExpenses = MOCK_EXPENSES.reduce((s, e) => s + e.amount, 0);
  const profit = totalPayments - totalExpenses;

  const selectedStudent = MOCK_STUDENTS.find(s => s.id === payForm.studentId);

  return (
    <div>
      <TopHeader
        title="Moliya"
        subtitle="Iyun 2024 — moliyaviy hisobot"
        action={{ label: "To'lov qabul qilish", onClick: () => setShowPayModal(true) }}
      />

      {/* Payment modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 dark:border-neutral-800">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-neutral-500" />
                <h2 className="font-bold text-[15px] text-neutral-900 dark:text-neutral-100">To'lov qabul qilish</h2>
              </div>
              <button onClick={() => setShowPayModal(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Student select */}
              <div>
                <Label className="text-xs font-medium text-neutral-500 mb-1.5 block">O'quvchi</Label>
                <select
                  value={payForm.studentId}
                  onChange={e => setPayForm(p => ({ ...p, studentId: e.target.value }))}
                  className="w-full h-9 px-3 text-sm rounded-lg border border-neutral-200 dark:border-neutral-700
                    bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 outline-none"
                >
                  <option value="">O'quvchini tanlang...</option>
                  {MOCK_STUDENTS.map(s => (
                    <option key={s.id} value={s.id}>{s.name} — {s.groupName}</option>
                  ))}
                </select>
              </div>

              {/* Student info */}
              {selectedStudent && (
                <div className={cn("rounded-lg p-3 text-sm",
                  selectedStudent.balance < 0
                    ? "bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40"
                    : "bg-neutral-50 dark:bg-neutral-800")}>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{selectedStudent.groupName}</p>
                  <p className={cn("font-bold mt-0.5", selectedStudent.balance < 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400")}>
                    Balans: {formatCurrency(selectedStudent.balance)}
                  </p>
                </div>
              )}

              {/* Amount */}
              <div>
                <Label className="text-xs font-medium text-neutral-500 mb-1.5 block">Summa (so'm)</Label>
                <Input
                  type="number"
                  placeholder="400000"
                  value={payForm.amount}
                  onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>

              {/* Method */}
              <div>
                <Label className="text-xs font-medium text-neutral-500 mb-2 block">To'lov usuli</Label>
                <div className="grid grid-cols-4 gap-2">
                  {(["naqd", "karta", "click", "payme"] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setPayForm(p => ({ ...p, method: m }))}
                      className={cn(
                        "py-2 rounded-lg text-[12px] font-semibold border transition-colors",
                        payForm.method === m
                          ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 border-neutral-900 dark:border-neutral-100"
                          : "border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800"
                      )}
                    >
                      {METHOD_LABELS[m]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div>
                <Label className="text-xs font-medium text-neutral-500 mb-1.5 block">Izoh (ixtiyoriy)</Label>
                <Input
                  placeholder="Masalan: Iyun oyi to'lovi"
                  value={payForm.note}
                  onChange={e => setPayForm(p => ({ ...p, note: e.target.value }))}
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="px-5 pb-5 flex gap-2">
              <Button
                className="flex-1 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 h-10"
                disabled={!payForm.studentId || !payForm.amount}
                onClick={() => setShowPayModal(false)}
              >
                To'lovni qabul qilish
              </Button>
              <Button variant="outline" className="h-10 px-4" onClick={() => setShowPayModal(false)}>
                Bekor
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Oylik daromad",   value: formatCurrency(MOCK_STATS.monthlyRevenue), icon: Wallet,       color: "text-blue-700 dark:text-blue-400",   bg: "bg-blue-50 dark:bg-blue-900/20" },
            { label: "Tushgan to'lovlar", value: formatCurrency(totalPayments),           icon: TrendingUp,   color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
            { label: "Xarajatlar",      value: formatCurrency(totalExpenses),             icon: TrendingDown, color: "text-red-700 dark:text-red-400",     bg: "bg-red-50 dark:bg-red-900/20" },
            { label: "Sof foyda",       value: formatCurrency(profit),                   icon: AlertCircle,  color: "text-violet-700 dark:text-violet-400", bg: "bg-violet-50 dark:bg-violet-900/20" },
          ].map(item => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="border border-neutral-200 dark:border-neutral-800 shadow-none">
                <CardContent className="p-4">
                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-3", item.bg)}>
                    <Icon className={cn("w-4 h-4", item.color)} />
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-1">{item.label}</p>
                  <p className={cn("text-[17px] font-bold leading-tight", item.color)}>{item.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl w-fit">
          {([
            { id: "kirim", label: "To'lovlar (kirim)" },
            { id: "chiqim", label: "Xarajatlar (chiqim)" },
            { id: "oylik", label: "Oylik hisoblash" },
          ] as { id: Tab; label: string }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-white dark:bg-neutral-700 shadow-sm text-neutral-900 dark:text-neutral-100"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* To'lovlar */}
        {activeTab === "kirim" && (
          <Card className="border border-neutral-200 dark:border-neutral-800 shadow-none">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[14px] font-semibold">To'lovlar tarixi</CardTitle>
                <div className="flex gap-2">
                  {Object.entries(METHOD_COLORS).map(([m, cls]) => (
                    <span key={m} className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", cls)}>{METHOD_LABELS[m]}</span>
                  ))}
                </div>
              </div>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">O'quvchi</TableHead>
                  <TableHead className="text-xs">Guruh</TableHead>
                  <TableHead className="text-xs">Sana</TableHead>
                  <TableHead className="text-xs">Usul</TableHead>
                  <TableHead className="text-xs text-right">Summa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_PAYMENTS.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-400 text-xs font-bold">
                          {p.studentName[0]}
                        </div>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{p.studentName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-neutral-500 dark:text-neutral-400">{p.groupName}</TableCell>
                    <TableCell className="text-sm text-neutral-500 dark:text-neutral-400">{p.date}</TableCell>
                    <TableCell>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", METHOD_COLORS[p.method])}>
                        {METHOD_LABELS[p.method]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(p.amount)}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Xarajatlar */}
        {activeTab === "chiqim" && (
          <Card className="border border-neutral-200 dark:border-neutral-800 shadow-none">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-[14px] font-semibold">Xarajatlar</CardTitle>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                  <Plus className="w-3.5 h-3.5" /> Xarajat qo'shish
                </Button>
              </div>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Kategoriya</TableHead>
                  <TableHead className="text-xs">Tavsif</TableHead>
                  <TableHead className="text-xs">Sana</TableHead>
                  <TableHead className="text-xs text-right">Summa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_EXPENSES.map(e => (
                  <TableRow key={e.id}>
                    <TableCell>
                      <span className="text-xs bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-full font-medium">
                        {e.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-neutral-700 dark:text-neutral-300">{e.description}</TableCell>
                    <TableCell className="text-sm text-neutral-500 dark:text-neutral-400">{e.date}</TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">-{formatCurrency(e.amount)}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Oylik hisoblash */}
        {activeTab === "oylik" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-500 dark:text-neutral-400">Iyun 2024 — o'qituvchilar oylik hisobi</p>
              <Button size="sm" className="gap-1.5 bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 text-xs h-8">
                <CheckCircle className="w-3.5 h-3.5" /> Barchaga to'lash
              </Button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">Jami hisoblangan</p>
                <p className="text-[17px] font-black text-neutral-900 dark:text-neutral-100 mt-0.5">
                  {formatCurrency(MOCK_TEACHER_SALARIES.reduce((s, t) => s + t.calculatedSalary, 0))}
                </p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-3">
                <p className="text-xs text-emerald-600 dark:text-emerald-400">To'langan</p>
                <p className="text-[17px] font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                  {formatCurrency(MOCK_TEACHER_SALARIES.filter(t => t.status === "paid").reduce((s, t) => s + t.calculatedSalary, 0))}
                </p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                <p className="text-xs text-amber-600 dark:text-amber-400">Kutilmoqda</p>
                <p className="text-[17px] font-black text-amber-700 dark:text-amber-400 mt-0.5">
                  {formatCurrency(MOCK_TEACHER_SALARIES.filter(t => t.status === "pending").reduce((s, t) => s + t.calculatedSalary, 0))}
                </p>
              </div>
            </div>

            <Card className="border border-neutral-200 dark:border-neutral-800 shadow-none">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">O'qituvchi</TableHead>
                    <TableHead className="text-xs">Hisoblash usuli</TableHead>
                    <TableHead className="text-xs text-right">Yig'ilgan to'lov</TableHead>
                    <TableHead className="text-xs text-right">Oylik</TableHead>
                    <TableHead className="text-xs text-center">Holat</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_TEACHER_SALARIES.map(t => (
                    <TableRow key={t.teacherId}>
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {t.teacherName[0]}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{t.teacherName}</p>
                            <p className="text-xs text-neutral-400">{t.groupCount} guruh · {t.studentCount} o'quvchi</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {t.salaryType === "fixed" ? (
                          <div>
                            <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium">
                              Belgilangan
                            </span>
                            <p className="text-xs text-neutral-400 mt-0.5">{formatCurrency(t.baseSalary)}/oy</p>
                          </div>
                        ) : (
                          <div>
                            <span className="text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 px-2 py-0.5 rounded-full font-medium">
                              Foizli — {t.baseSalary}%
                            </span>
                            <p className="text-xs text-neutral-400 mt-0.5">to'lovdan</p>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-sm text-neutral-600 dark:text-neutral-400">
                        {formatCurrency(t.totalCollected)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                          {formatCurrency(t.calculatedSalary)}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {t.status === "paid" ? (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full font-medium">
                            <CheckCircle className="w-3 h-3" /> To'langan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                            <Clock className="w-3 h-3" /> Kutilmoqda
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {t.status === "pending" && (
                          <Button size="sm" variant="outline" className="h-7 text-xs">
                            To'lash
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
