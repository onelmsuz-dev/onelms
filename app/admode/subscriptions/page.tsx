"use client";

import useSWR from "swr";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle, Building2, CreditCard, TrendingUp, Calendar } from "lucide-react";

const fetcher = (url: string) => fetch(url).then(r => r.json());

const PLAN_PRICE: Record<string, number> = {
  BASIC:      299_000,
  PRO:        599_000,
  ENTERPRISE: 999_000,
};

const PLAN_CFG = {
  BASIC:      { label: "Basic",      badge: "bg-neutral-700 text-neutral-300", ring: "border-neutral-700", head: "bg-neutral-800/60" },
  PRO:        { label: "Pro",        badge: "bg-blue-900/60 text-blue-300 border border-blue-800/40", ring: "border-blue-900/40", head: "bg-blue-900/10" },
  ENTERPRISE: { label: "Enterprise", badge: "bg-purple-900/60 text-purple-300 border border-purple-800/40", ring: "border-purple-900/40", head: "bg-purple-900/10" },
} as const;

function fmtMoney(v: number) {
  return new Intl.NumberFormat("uz-UZ", { style: "currency", currency: "UZS", maximumFractionDigits: 0 }).format(v);
}

function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-neutral-800 rounded-lg", className)} />;
}

export default function SubscriptionsPage() {
  const { data, isLoading } = useSWR("/api/admode/stats", fetcher, { refreshInterval: 60_000 });
  const orgs: any[] = data?.orgs ?? [];

  const grouped = {
    ENTERPRISE: orgs.filter(o => o.plan === "ENTERPRISE"),
    PRO:        orgs.filter(o => o.plan === "PRO"),
    BASIC:      orgs.filter(o => o.plan === "BASIC"),
  };

  const totalMrr = orgs.reduce((sum, o) => sum + (PLAN_PRICE[o.plan] ?? 0), 0);
  const activeMrr = orgs.filter(o => o.isActive).reduce((sum, o) => sum + (PLAN_PRICE[o.plan] ?? 0), 0);
  const activeCount = orgs.filter(o => o.isActive).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white">Obunalar</h1>
        <p className="text-sm text-neutral-500 mt-0.5">Tarif rejalari va taxminiy oylik daromad</p>
      </div>

      {/* MRR Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4 space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-7 w-32" />
            </div>
          ))
        ) : (
          <>
            <div className="bg-neutral-900 border border-emerald-900/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Taxminiy MRR</p>
              </div>
              <p className="text-[20px] font-black text-emerald-400">{fmtMoney(activeMrr)}</p>
              <p className="text-[10px] text-neutral-600 mt-1">faqat faol markazlar</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-3.5 h-3.5 text-blue-400" />
                <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Potensial MRR</p>
              </div>
              <p className="text-[20px] font-black text-blue-400">{fmtMoney(totalMrr)}</p>
              <p className="text-[10px] text-neutral-600 mt-1">barcha markazlar</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-3.5 h-3.5 text-purple-400" />
                <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Faol obunalar</p>
              </div>
              <p className="text-[20px] font-black text-white">{activeCount}</p>
              <p className="text-[10px] text-neutral-600 mt-1">jami {orgs.length} tadan</p>
            </div>
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-3.5 h-3.5 text-yellow-400" />
                <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">O'rtacha tarif</p>
              </div>
              <p className="text-[20px] font-black text-white">
                {orgs.length ? fmtMoney(Math.round(totalMrr / orgs.length)) : "—"}
              </p>
              <p className="text-[10px] text-neutral-600 mt-1">markaz boshiga</p>
            </div>
          </>
        )}
      </div>

      {/* Plan groups */}
      <div className="space-y-4">
        {(["ENTERPRISE", "PRO", "BASIC"] as const).map(plan => {
          const cfg  = PLAN_CFG[plan];
          const list = grouped[plan];
          if (!isLoading && list.length === 0) return null;

          return (
            <div key={plan} className={cn("border rounded-2xl overflow-hidden", cfg.ring)}>
              {/* Plan header */}
              <div className={cn("px-5 py-3 flex items-center justify-between border-b", cfg.ring, cfg.head)}>
                <div className="flex items-center gap-2.5">
                  <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full", cfg.badge)}>
                    {cfg.label}
                  </span>
                  <span className="text-[12px] text-neutral-500">
                    {isLoading ? "..." : `${list.length} ta markaz`}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-[11px] text-neutral-500">
                    Narx: <span className="font-semibold text-neutral-300">{fmtMoney(PLAN_PRICE[plan])}/oy</span>
                  </p>
                  {!isLoading && (
                    <p className="text-[11px] text-neutral-500">
                      Jami: <span className="font-bold text-white">{fmtMoney(list.filter(o => o.isActive).length * PLAN_PRICE[plan])}/oy</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Orgs list */}
              <div className="divide-y divide-neutral-800/50">
                {isLoading ? (
                  Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="px-5 py-4 flex items-center gap-4">
                      <Skeleton className="w-9 h-9 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-3.5 w-40" />
                        <Skeleton className="h-2.5 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))
                ) : list.length === 0 ? (
                  <div className="px-5 py-6 text-center text-[12px] text-neutral-600">
                    Bu tarifda markaz yo'q
                  </div>
                ) : (
                  list.map(org => (
                    <div key={org.id} className="px-5 py-4 flex items-center gap-4 hover:bg-neutral-800/20 transition-colors">
                      <div className="w-9 h-9 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center shrink-0">
                        <Building2 className="w-4 h-4 text-neutral-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-white">{org.name}</p>
                        <p className="text-[11px] text-neutral-500">{org.subdomain}.oneroom.uz</p>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <p className="text-[10px] text-neutral-600">O'quvchilar</p>
                          <p className="text-[13px] font-bold text-neutral-300">{org._count.students}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-neutral-600">Daromad</p>
                          <p className="text-[12px] font-bold text-emerald-400">
                            {org.revenue >= 1_000_000 ? `${(org.revenue / 1_000_000).toFixed(1)}M` : org.revenue ? `${(org.revenue / 1_000).toFixed(0)}K` : "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-neutral-600">Qo'shilgan</p>
                          <p className="text-[11px] text-neutral-400">{new Date(org.createdAt).toLocaleDateString("uz-UZ")}</p>
                        </div>
                        <div className="flex items-center gap-1.5 min-w-[70px] justify-end">
                          {org.isActive ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[11px] text-emerald-400 font-medium">Faol</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5 text-red-400" />
                              <span className="text-[11px] text-red-400 font-medium">Blok</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!isLoading && orgs.length === 0 && (
        <div className="text-center py-16">
          <CreditCard className="w-8 h-8 mx-auto mb-2 text-neutral-700" />
          <p className="text-[13px] text-neutral-600">Hali tashkilot yo'q</p>
        </div>
      )}
    </div>
  );
}
