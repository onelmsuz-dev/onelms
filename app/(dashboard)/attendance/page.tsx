"use client";

import { useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { MOCK_ATTENDANCE, MOCK_GROUPS } from "@/lib/mock-data";
import type { AttendanceStatus } from "@/types";
import { ChevronLeft, ChevronRight, Save } from "lucide-react";

const statusConfig: Record<AttendanceStatus, { label: string; className: string; short: string }> = {
  keldi: { label: "Keldi", className: "bg-green-100 text-green-700 border border-green-200", short: "K" },
  kelmadi: { label: "Kelmadi", className: "bg-red-100 text-red-700 border border-red-200", short: "X" },
  kech_keldi: { label: "Kech keldi", className: "bg-yellow-100 text-yellow-700 border border-yellow-200", short: "KK" },
  sababli: { label: "Sababli", className: "bg-blue-100 text-blue-700 border border-blue-200", short: "S" },
};

const ALL_STATUSES: AttendanceStatus[] = ["keldi", "kelmadi", "kech_keldi", "sababli"];

export default function AttendancePage() {
  const [selectedGroup, setSelectedGroup] = useState("g1");
  const [attendance, setAttendance] = useState<Record<string, AttendanceStatus>>(
    Object.fromEntries(MOCK_ATTENDANCE.map((a) => [a.studentId, a.status]))
  );

  const groupStudents = MOCK_ATTENDANCE.filter((a) => a.groupId === selectedGroup);

  const stats = {
    keldi: Object.values(attendance).filter((s) => s === "keldi").length,
    kelmadi: Object.values(attendance).filter((s) => s === "kelmadi").length,
    kech_keldi: Object.values(attendance).filter((s) => s === "kech_keldi").length,
    sababli: Object.values(attendance).filter((s) => s === "sababli").length,
  };

  const cycleStatus = (studentId: string) => {
    setAttendance((prev) => {
      const current = prev[studentId] || "keldi";
      const nextIndex = (ALL_STATUSES.indexOf(current) + 1) % ALL_STATUSES.length;
      return { ...prev, [studentId]: ALL_STATUSES[nextIndex] };
    });
  };

  return (
    <div>
      <TopHeader
        title="Davomat"
        subtitle="24 Iyun 2024, Dushanba"
        action={{ label: "Saqlash" }}
      />

      <div className="p-6 space-y-5">
        {/* Date nav */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium px-2">24 Iyun 2024</span>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Group selector */}
          <div className="flex gap-2 flex-wrap">
            {MOCK_GROUPS.filter((g) => g.status === "active").map((group) => (
              <button
                key={group.id}
                onClick={() => setSelectedGroup(group.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  selectedGroup === group.id
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white dark:bg-neutral-900 text-gray-600 dark:text-neutral-400 border-gray-200 dark:border-neutral-700 hover:border-gray-300"
                }`}
              >
                {group.name}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          {(Object.entries(statusConfig) as [AttendanceStatus, typeof statusConfig[AttendanceStatus]][]).map(([key, cfg]) => (
            <Card key={key} className="border-0 shadow-sm">
              <CardContent className="p-3 text-center">
                <p className={`text-2xl font-bold mb-0.5 ${key === "keldi" ? "text-green-700" : key === "kelmadi" ? "text-red-700" : key === "kech_keldi" ? "text-yellow-700" : "text-blue-700"}`}>
                  {stats[key]}
                </p>
                <p className="text-xs text-gray-500 dark:text-neutral-400">{cfg.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Attendance hint */}
        <p className="text-xs text-gray-500 dark:text-neutral-400 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100">
          💡 Statusni o'zgartirish uchun tugmachaga bosing: <strong>Keldi → Kelmadi → Kech keldi → Sababli</strong>
        </p>

        {/* Table */}
        <Card className="border-0 shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 dark:bg-neutral-800/60">
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-neutral-400 w-8">#</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-neutral-400">O'quvchi</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-neutral-400 text-center">Davomat</TableHead>
                <TableHead className="text-xs font-semibold text-gray-600 dark:text-neutral-400 text-center">Izoh</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groupStudents.map((record, idx) => {
                const status = attendance[record.studentId] || "keldi";
                const cfg = statusConfig[status];
                return (
                  <TableRow key={record.studentId} className="hover:bg-gray-50 dark:hover:bg-neutral-800">
                    <TableCell className="text-xs text-gray-400 dark:text-neutral-500 font-mono">{idx + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                          {record.studentName[0]}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-neutral-100">{record.studentName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <button
                        onClick={() => cycleStatus(record.studentId)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-80 ${cfg.className}`}
                      >
                        {cfg.label}
                      </button>
                    </TableCell>
                    <TableCell className="text-center">
                      {status === "sababli" && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">Izoh kiriting</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>

        <div className="flex justify-end">
          <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
            <Save className="w-4 h-4" />
            Davomatni saqlash
          </Button>
        </div>
      </div>
    </div>
  );
}
