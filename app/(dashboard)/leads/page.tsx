"use client";

import { useState } from "react";
import { TopHeader } from "@/components/layout/top-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MOCK_LEADS } from "@/lib/mock-data";
import type { Lead, LeadStatus } from "@/types";
import { Phone, MessageCircle, Search, Filter, MoreHorizontal, Plus } from "lucide-react";

const statusConfig: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  yangi: { label: "Yangi", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  aloqa_qilingan: { label: "Aloqa qilindi", color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200" },
  sinov_darsi: { label: "Sinov darsi", color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
  to_landi: { label: "To'ladi", color: "text-green-700", bg: "bg-green-50 border-green-200" },
  bekor: { label: "Bekor", color: "text-red-700", bg: "bg-red-50 border-red-200" },
};

const COLUMNS: LeadStatus[] = ["yangi", "aloqa_qilingan", "sinov_darsi", "to_landi", "bekor"];

const sourceColors: Record<string, string> = {
  Instagram: "bg-pink-100 text-pink-700",
  Telegram: "bg-blue-100 text-blue-700",
  "Do'st orqali": "bg-green-100 text-green-700",
  Website: "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-neutral-300",
};

function LeadCard({ lead }: { lead: Lead }) {
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-700 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {lead.name[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-neutral-100 leading-tight">{lead.name}</p>
            <p className="text-xs text-gray-500 dark:text-neutral-400">{lead.phone}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0">
          <MoreHorizontal className="w-3 h-3" />
        </Button>
      </div>

      {lead.course && (
        <p className="text-xs text-gray-600 dark:text-neutral-400 mb-2 bg-gray-50 dark:bg-neutral-800/60 rounded px-2 py-1">
          📚 {lead.course}
        </p>
      )}

      {lead.note && (
        <p className="text-xs text-orange-600 mb-2 bg-orange-50 rounded px-2 py-1">
          💬 {lead.note}
        </p>
      )}

      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${sourceColors[lead.source] || "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400"}`}>
          {lead.source}
        </span>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 dark:text-neutral-500 hover:text-green-600">
            <Phone className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 dark:text-neutral-500 hover:text-blue-600">
            <MessageCircle className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {lead.assignedTo && (
        <p className="text-xs text-gray-400 dark:text-neutral-500 mt-2 pt-2 border-t border-gray-100 dark:border-neutral-800">
          👤 {lead.assignedTo}
        </p>
      )}
    </div>
  );
}

export default function LeadsPage() {
  const [search, setSearch] = useState("");

  const filteredLeads = MOCK_LEADS.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.phone.includes(search) ||
      l.course?.toLowerCase().includes(search.toLowerCase())
  );

  const getColumnLeads = (status: LeadStatus) =>
    filteredLeads.filter((l) => l.status === status);

  const totalByStatus = COLUMNS.reduce((acc, s) => {
    acc[s] = MOCK_LEADS.filter((l) => l.status === s).length;
    return acc;
  }, {} as Record<LeadStatus, number>);

  return (
    <div>
      <TopHeader
        title="Lidlar (CRM)"
        subtitle="Potentsial o'quvchilarni boshqarish"
        action={{ label: "Yangi lid" }}
      />

      <div className="p-6">
        {/* Summary */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {COLUMNS.map((status) => {
            const cfg = statusConfig[status];
            return (
              <div key={status} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-medium ${cfg.bg} ${cfg.color}`}>
                <span>{cfg.label}</span>
                <span className="font-bold">{totalByStatus[status]}</span>
              </div>
            );
          })}
        </div>

        {/* Search & Filter */}
        <div className="flex gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-neutral-500" />
            <Input
              placeholder="Ism, telefon, kurs..."
              className="pl-9 h-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            Filter
          </Button>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((status) => {
            const cfg = statusConfig[status];
            const leads = getColumnLeads(status);
            return (
              <div key={status} className="flex-shrink-0 w-64">
                <div className={`flex items-center justify-between mb-3 px-1`}>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
                    <span className="bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-neutral-400 text-xs font-bold px-1.5 py-0.5 rounded-full">
                      {leads.length}
                    </span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <Plus className="w-3.5 h-3.5 text-gray-400 dark:text-neutral-500" />
                  </Button>
                </div>
                <div className="space-y-2 min-h-32">
                  {leads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} />
                  ))}
                  {leads.length === 0 && (
                    <div className="border-2 border-dashed border-gray-200 dark:border-neutral-700 rounded-lg p-4 text-center text-gray-400 dark:text-neutral-500 text-xs">
                      Bo'sh
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
