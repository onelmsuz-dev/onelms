"use client";

import { TopHeader } from "@/components/layout/top-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from "recharts";
import { MOCK_REVENUE, MOCK_COURSES, formatCurrency } from "@/lib/mock-data";
import { useChartColors } from "@/hooks/use-chart-colors";

const studentsByMonth = [
  { month: "Yan", count: 198 },
  { month: "Fev", count: 210 },
  { month: "Mar", count: 225 },
  { month: "Apr", count: 218 },
  { month: "May", count: 235 },
  { month: "Iyn", count: 247 },
];

const courseDistribution = MOCK_COURSES.map((c) => ({
  name: c.name,
  value: c.studentCount,
}));

const PIE_COLORS = ["#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4"];

const attendanceByWeek = [
  { week: "1-hafta", foiz: 89 },
  { week: "2-hafta", foiz: 85 },
  { week: "3-hafta", foiz: 91 },
  { week: "4-hafta", foiz: 87 },
];

export default function ReportsPage() {
  const chart = useChartColors();

  return (
    <div>
      <TopHeader
        title="Hisobotlar"
        subtitle="Analitika va statistika"
      />

      <div className="p-6 space-y-6">
        {/* Revenue bar chart */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Moliyaviy hisobot (6 oy)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={MOCK_REVENUE}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: chart.axis }} />
                  <YAxis tick={{ fontSize: 11, fill: chart.axis }} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <Tooltip formatter={(v: unknown) => formatCurrency(v as number)}  contentStyle={{ background: chart.tooltip, border: `1px solid ${chart.tooltipBorder}`, borderRadius: 8, color: chart.tooltipText }} />
                  <Bar dataKey="kirim" name="Kirim" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="chiqim" name="Chiqim" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">O'quvchilar bo'yicha kurs taqsimoti</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={courseDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {courseDistribution.map((_, index) => (
                      <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: unknown) => `${v} ta`} />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Students growth */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">O'quvchilar o'sishi</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={studentsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: chart.axis }} />
                  <YAxis tick={{ fontSize: 11, fill: chart.axis }} domain={[180, 260]} />
                  <Tooltip formatter={(v: unknown) => `${v} ta o'quvchi`} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#8b5cf6"
                    strokeWidth={2.5}
                    dot={{ fill: "#8b5cf6", r: 4 }}
                    name="O'quvchilar"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Attendance by week */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Davomat (iyun oyi bo'yicha)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={attendanceByWeek}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chart.grid} />
                  <XAxis dataKey="week" tick={{ fontSize: 12, fill: chart.axis }} />
                  <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: chart.axis }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v: unknown) => `${v}%`} />
                  <Bar dataKey="foiz" name="Davomat" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Summary table */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Kurslar bo'yicha umumiy ko'rsatkich</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-neutral-800">
              {MOCK_COURSES.map((course, idx) => (
                <div key={course.id} className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 dark:hover:bg-neutral-800">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 dark:text-neutral-500 w-4 font-mono">{idx + 1}</span>
                    <div className={`w-2 h-8 rounded-full ${course.color}`} />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-neutral-100">{course.name}</p>
                      <p className="text-xs text-gray-500 dark:text-neutral-400">{course.groupCount} ta guruh</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-neutral-100">{course.studentCount} ta</p>
                    <p className="text-xs text-green-600 font-medium">{formatCurrency(course.price * course.studentCount)}/oy</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
