"use client";

import { TopHeader } from "@/components/layout/top-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_SCHEDULE } from "@/lib/mock-data";

const DAYS = ["Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"];

export default function SchedulePage() {
  const getEntries = (day: string) => MOCK_SCHEDULE.filter((s) => s.day === day);

  return (
    <div>
      <TopHeader
        title="Jadval"
        subtitle="Haftalik dars jadvali"
        action={{ label: "Dars qo'shish" }}
      />

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {DAYS.map((day) => {
            const entries = getEntries(day);
            return (
              <Card key={day} className="border-0 shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-gray-700 dark:text-neutral-300 flex items-center justify-between">
                    {day}
                    <span className="text-xs font-normal text-gray-400 dark:text-neutral-500 bg-gray-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                      {entries.length} dars
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {entries.length === 0 ? (
                    <div className="text-center py-6 text-gray-300 dark:text-neutral-600 text-sm border-2 border-dashed border-gray-100 dark:border-neutral-800 rounded-lg">
                      Dars yo'q
                    </div>
                  ) : (
                    entries.map((entry) => (
                      <div
                        key={entry.id}
                        className={`rounded-lg border-l-4 p-3 cursor-pointer hover:opacity-90 transition-opacity ${entry.color}`}
                      >
                        <p className="font-semibold text-sm leading-tight">{entry.groupName}</p>
                        <p className="text-xs mt-0.5 opacity-80">{entry.courseName}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs font-medium opacity-75">⏰ {entry.time}</span>
                          <span className="text-xs opacity-75">📍 {entry.room}</span>
                        </div>
                        <p className="text-xs opacity-70 mt-1">👤 {entry.teacherName}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
