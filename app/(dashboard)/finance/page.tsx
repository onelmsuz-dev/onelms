"use client";

import { useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { MOCK_PAYMENTS, MOCK_EXPENSES, MOCK_STATS, formatCurrency } from "@/lib/mock-data";
import { TrendingUp, TrendingDown, Wallet, AlertCircle, Plus } from "lucide-react";

const methodLabels: Record<string, string> = {
  naqd: "💵 Naqd",
  karta: "💳 Karta",
  click: "📱 Click",
  payme: "📱 Payme",
};

const methodColors: Record<string, string> = {
  naqd: "bg-green-100 text-green-700",
  karta: "bg-blue-100 text-blue-700",
  click: "bg-orange-100 text-orange-700",
  payme: "bg-purple-100 text-purple-700",
};

export default function FinancePage() {
  const [activeTab, setActiveTab] = useState<"kirim" | "chiqim">("kirim");

  const totalPayments = MOCK_PAYMENTS.reduce((sum, p) => sum + p.amount, 0);
  const totalExpenses = MOCK_EXPENSES.reduce((sum, e) => sum + e.amount, 0);
  const profit = totalPayments - totalExpenses;

  return (
    <div>
      <TopHeader
        title="Moliya"
        subtitle="Iyun 2024 — moliyaviy hisobot"
        action={{ label: "To'lov qo'shish" }}
      />

      <div className="p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Oylik daromad", value: formatCurrency(MOCK_STATS.monthlyRevenue), icon: Wallet, color: "text-blue-700", bg: "bg-blue-50", iconColor: "text-blue-500" },
            { label: "Iyunga tushgan", value: formatCurrency(totalPayments), icon: TrendingUp, color: "text-green-700", bg: "bg-green-50", iconColor: "text-green-500" },
            { label: "Xarajatlar", value: formatCurrency(totalExpenses), icon: TrendingDown, color: "text-red-700", bg: "bg-red-50", iconColor: "text-red-500" },
            { label: "Sof foyda", value: formatCurrency(profit), icon: AlertCircle, color: "text-purple-700", bg: "bg-purple-50", iconColor: "text-purple-500" },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className={`w-8 h-8 ${item.bg} rounded-lg flex items-center justify-center mb-3`}>
                    <Icon className={`w-4 h-4 ${item.iconColor}`} />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mb-1">{item.label}</p>
                  <p className={`text-lg font-bold leading-tight ${item.color}`}>{item.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-neutral-800 p-1 rounded-lg w-fit">
          {(["kirim", "chiqim"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === tab ? "bg-white dark:bg-neutral-900 shadow-sm text-gray-900 dark:text-neutral-100" : "text-gray-500 dark:text-neutral-400 hover:text-gray-700 dark:text-neutral-300"
              }`}
            >
              {tab === "kirim" ? "To'lovlar (kirim)" : "Xarajatlar (chiqim)"}
            </button>
          ))}
        </div>

        {activeTab === "kirim" ? (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">To'lovlar tarixi</CardTitle>
                <div className="flex gap-2">
                  {Object.entries(methodColors).map(([method, cls]) => (
                    <span key={method} className={`text-xs px-2 py-0.5 rounded-full ${cls}`}>
                      {method}
                    </span>
                  ))}
                </div>
              </div>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-neutral-800/60">
                  <TableHead className="text-xs font-semibold text-gray-600 dark:text-neutral-400">O'quvchi</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 dark:text-neutral-400">Guruh</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 dark:text-neutral-400">Sana</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 dark:text-neutral-400">Usul</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 dark:text-neutral-400 text-right">Summa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_PAYMENTS.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-xs font-bold">
                          {payment.studentName[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-neutral-100">{payment.studentName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 dark:text-neutral-400">{payment.groupName}</TableCell>
                    <TableCell className="text-sm text-gray-500 dark:text-neutral-400">{payment.date}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${methodColors[payment.method]}`}>
                        {methodLabels[payment.method]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-bold text-green-700">{formatCurrency(payment.amount)}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">Xarajatlar</CardTitle>
                <Button size="sm" variant="outline" className="gap-1.5 text-xs h-7">
                  <Plus className="w-3.5 h-3.5" />
                  Xarajat qo'shish
                </Button>
              </div>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-neutral-800/60">
                  <TableHead className="text-xs font-semibold text-gray-600 dark:text-neutral-400">Kategoriya</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 dark:text-neutral-400">Tavsif</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 dark:text-neutral-400">Sana</TableHead>
                  <TableHead className="text-xs font-semibold text-gray-600 dark:text-neutral-400 text-right">Summa</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_EXPENSES.map((expense) => (
                  <TableRow key={expense.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                    <TableCell>
                      <span className="text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded-full font-medium border border-orange-100">
                        {expense.category}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 dark:text-neutral-300">{expense.description}</TableCell>
                    <TableCell className="text-sm text-gray-500 dark:text-neutral-400">{expense.date}</TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-bold text-red-600">-{formatCurrency(expense.amount)}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
}
