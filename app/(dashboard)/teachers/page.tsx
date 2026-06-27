"use client";

import { useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_TEACHERS, formatCurrency } from "@/lib/mock-data";
import { Search, Phone, Mail, Users, BookOpen, Wallet, Eye } from "lucide-react";

export default function TeachersPage() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_TEACHERS.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.phone.includes(search) ||
      t.subjects.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <TopHeader
        title="O'qituvchilar"
        subtitle={`Jami ${MOCK_TEACHERS.length} ta o'qituvchi`}
        action={{ label: "O'qituvchi qo'shish" }}
      />

      <div className="p-6 space-y-5">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Jami o'qituvchi", value: MOCK_TEACHERS.length, color: "text-blue-700" },
            { label: "Faol", value: MOCK_TEACHERS.filter((t) => t.status === "active").length, color: "text-green-700" },
            { label: "Jami o'quvchi", value: MOCK_TEACHERS.reduce((sum, t) => sum + t.studentCount, 0), color: "text-purple-700" },
          ].map((item) => (
            <Card key={item.label} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 dark:text-neutral-400 mb-1">{item.label}</p>
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-neutral-500" />
          <Input
            placeholder="Ism, fan, telefon..."
            className="pl-9 h-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((teacher) => (
            <Card key={teacher.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {teacher.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-neutral-100">{teacher.name}</p>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {teacher.subjects.map((sub) => (
                          <span key={sub} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Badge variant={teacher.status === "active" ? "default" : "secondary"} className={teacher.status === "active" ? "bg-green-100 text-green-700 border-0 text-xs" : "text-xs"}>
                    {teacher.status === "active" ? "Faol" : "Nofaol"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-lg p-2.5 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-neutral-400">O'quvchilar</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-neutral-100">{teacher.studentCount}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-lg p-2.5 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-neutral-400">Guruhlar</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-neutral-100">{teacher.groupCount}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-neutral-800 pt-3">
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-neutral-400">
                    <Wallet className="w-3.5 h-3.5 text-purple-500" />
                    <span className="font-semibold text-purple-700">
                      {teacher.salaryType === "fixed"
                        ? formatCurrency(teacher.salary)
                        : `${teacher.salary}% foiz`}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 dark:text-neutral-500 hover:text-blue-600">
                      <Phone className="w-3.5 h-3.5" />
                    </Button>
                    {teacher.email && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 dark:text-neutral-500 hover:text-green-600">
                        <Mail className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 dark:text-neutral-500 hover:text-indigo-600">
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
