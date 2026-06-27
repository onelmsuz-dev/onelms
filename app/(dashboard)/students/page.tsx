"use client";

import { useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { MOCK_STUDENTS, formatCurrency } from "@/lib/mock-data";
import type { PaymentStatus } from "@/types";
import { Search, Filter, Phone, Eye, Edit, Trash2 } from "lucide-react";

const paymentStatusConfig: Record<PaymentStatus, { label: string; className: string }> = {
  tolandi: { label: "To'langan", className: "bg-green-100 text-green-700 border-green-200" },
  qarzdor: { label: "Qarzdor", className: "bg-red-100 text-red-700 border-red-200" },
  qisman: { label: "Qisman", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
};

export default function StudentsPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<PaymentStatus | "barchasi">("barchasi");

  const filtered = MOCK_STUDENTS.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      s.groupName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "barchasi" || s.paymentStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    jami: MOCK_STUDENTS.length,
    tolandi: MOCK_STUDENTS.filter((s) => s.paymentStatus === "tolandi").length,
    qarzdor: MOCK_STUDENTS.filter((s) => s.paymentStatus === "qarzdor").length,
    totalDebt: MOCK_STUDENTS.filter((s) => s.balance < 0).reduce((sum, s) => sum + Math.abs(s.balance), 0),
  };

  return (
    <div>
      <TopHeader
        title="O'quvchilar"
        subtitle={`Jami ${stats.jami} ta o'quvchi`}
        action={{ label: "Yangi o'quvchi" }}
      />

      <div className="p-6 space-y-5">
        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Jami", value: stats.jami, color: "text-blue-700", bg: "bg-blue-50" },
            { label: "To'lagan", value: stats.tolandi, color: "text-green-700", bg: "bg-green-50" },
            { label: "Qarzdor", value: stats.qarzdor, color: "text-red-700", bg: "bg-red-50" },
            { label: "Jami qarz", value: formatCurrency(stats.totalDebt), color: "text-orange-700", bg: "bg-orange-50" },
          ].map((item) => (
            <Card key={item.label} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 dark:text-neutral-400 mb-1">{item.label}</p>
                <p className={`text-xl font-bold ${item.color}`}>{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-neutral-500" />
            <Input
              placeholder="Ism, telefon, guruh..."
              className="pl-9 h-9 text-sm w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {(["barchasi", "tolandi", "qarzdor", "qisman"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  filterStatus === status
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-neutral-900 text-gray-600 dark:text-neutral-400 border-gray-200 dark:border-neutral-700 hover:border-gray-300"
                }`}
              >
                {status === "barchasi" ? "Barchasi" : paymentStatusConfig[status].label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card className="border-0 shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-neutral-800/60">
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-neutral-400">O'quvchi</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-neutral-400">Telefon</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-neutral-400">Guruh</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-neutral-400">O'qituvchi</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-neutral-400">Balans</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-neutral-400">Status</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-neutral-400 text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((student) => (
                <TableRow key={student.id} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {student.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-neutral-100">{student.name}</p>
                        <p className="text-xs text-gray-400 dark:text-neutral-500">Qo'shildi: {student.enrolledAt}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm text-gray-700 dark:text-neutral-300">{student.phone}</p>
                      {student.parentPhone && (
                        <p className="text-xs text-gray-400 dark:text-neutral-500">Ota-ona: {student.parentPhone}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-700 dark:text-neutral-300">{student.groupName}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600 dark:text-neutral-400">{student.teacherName}</span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-sm font-semibold ${student.balance < 0 ? "text-red-600" : student.balance > 0 ? "text-yellow-600" : "text-green-600"}`}>
                      {student.balance === 0 ? "—" : formatCurrency(Math.abs(student.balance))}
                      {student.balance < 0 && " qarz"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium border ${paymentStatusConfig[student.paymentStatus].className}`}>
                      {paymentStatusConfig[student.paymentStatus].label}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 dark:text-neutral-500 hover:text-blue-600">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 dark:text-neutral-500 hover:text-green-600">
                        <Phone className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 dark:text-neutral-500 hover:text-orange-600">
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400 dark:text-neutral-500 text-sm">
              Hech narsa topilmadi
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
