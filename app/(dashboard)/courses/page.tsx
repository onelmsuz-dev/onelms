"use client";

import { TopHeader } from "@/components/layout/top-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MOCK_COURSES, formatCurrency } from "@/lib/mock-data";
import { Users, BookOpen, Clock, Wallet, Edit, Trash2 } from "lucide-react";

export default function CoursesPage() {
  return (
    <div>
      <TopHeader
        title="Kurslar"
        subtitle={`Jami ${MOCK_COURSES.length} ta kurs`}
        action={{ label: "Yangi kurs" }}
      />

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {MOCK_COURSES.map((course) => (
            <Card key={course.id} className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className={`h-1.5 ${course.color}`} />
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-neutral-100 text-base">{course.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-neutral-400 mt-0.5">{course.description}</p>
                  </div>
                  <div className="flex gap-1 shrink-0 ml-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 dark:text-neutral-500 hover:text-blue-600">
                      <Edit className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 dark:text-neutral-500 hover:text-red-600">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-neutral-400 mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-xs">Davomiyligi</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-neutral-100">{course.duration}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-neutral-400 mb-1">
                      <Wallet className="w-3.5 h-3.5" />
                      <span className="text-xs">Narxi</span>
                    </div>
                    <p className="text-sm font-bold text-blue-700">{formatCurrency(course.price)}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-neutral-400 mb-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span className="text-xs">Guruhlar</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-neutral-100">{course.groupCount} ta</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-neutral-800/60 rounded-lg p-3">
                    <div className="flex items-center gap-1.5 text-gray-500 dark:text-neutral-400 mb-1">
                      <Users className="w-3.5 h-3.5" />
                      <span className="text-xs">O'quvchilar</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900 dark:text-neutral-100">{course.studentCount} ta</p>
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
