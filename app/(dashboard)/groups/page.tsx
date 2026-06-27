"use client";

import { useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { MOCK_GROUPS } from "@/lib/mock-data";
import type { Group } from "@/types";
import { Search, Users, Clock, MapPin, CalendarDays, Eye } from "lucide-react";

const statusConfig = {
  active: { label: "Faol", className: "bg-green-100 text-green-700" },
  completed: { label: "Tugagan", className: "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400" },
  upcoming: { label: "Keladi", className: "bg-blue-100 text-blue-700" },
};

export default function GroupsPage() {
  const [search, setSearch] = useState("");

  const filtered = MOCK_GROUPS.filter(
    (g) =>
      g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.teacherName.toLowerCase().includes(search.toLowerCase()) ||
      g.courseName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <TopHeader
        title="Guruhlar"
        subtitle={`Jami ${MOCK_GROUPS.length} ta guruh`}
        action={{ label: "Yangi guruh" }}
      />

      <div className="p-6 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Faol guruhlar", value: MOCK_GROUPS.filter((g) => g.status === "active").length, color: "text-green-700" },
            { label: "Jami o'quvchi", value: MOCK_GROUPS.reduce((s, g) => s + g.studentCount, 0), color: "text-blue-700" },
            { label: "Bo'sh joylar", value: MOCK_GROUPS.reduce((s, g) => s + (g.maxStudents - g.studentCount), 0), color: "text-orange-700" },
          ].map((item) => (
            <Card key={item.label} className="border-0 shadow-sm">
              <CardContent className="p-4">
                <p className="text-xs text-gray-500 dark:text-neutral-400 mb-1">{item.label}</p>
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-neutral-500" />
          <Input
            placeholder="Guruh, o'qituvchi, kurs..."
            className="pl-9 h-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((group) => {
            const occupancy = Math.round((group.studentCount / group.maxStudents) * 100);
            const cfg = statusConfig[group.status];
            return (
              <Card key={group.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-neutral-100">{group.name}</h3>
                      <p className="text-xs text-blue-600 mt-0.5">{group.courseName}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${cfg.className}`}>
                      {cfg.label}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-neutral-400">
                      <Users className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 shrink-0" />
                      <span>{group.teacherName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-neutral-400">
                      <CalendarDays className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 shrink-0" />
                      <span>{group.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-neutral-400">
                      <Clock className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 shrink-0" />
                      <span>{group.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-neutral-400">
                      <MapPin className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500 shrink-0" />
                      <span>{group.room}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 dark:border-neutral-800 pt-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-neutral-400 mb-1.5">
                      <span>To'lganlik</span>
                      <span className="font-semibold text-gray-700 dark:text-neutral-300">
                        {group.studentCount}/{group.maxStudents}
                      </span>
                    </div>
                    <Progress
                      value={occupancy}
                      className={`h-2 ${occupancy >= 100 ? "[&>div]:bg-red-500" : occupancy >= 80 ? "[&>div]:bg-yellow-500" : "[&>div]:bg-green-500"}`}
                    />
                  </div>

                  <Button variant="outline" size="sm" className="w-full mt-3 gap-1.5 text-xs">
                    <Eye className="w-3.5 h-3.5" />
                    Ko'rish
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
