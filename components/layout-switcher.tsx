"use client";

import { useVariant } from "@/hooks/use-variant";
import { KlassikNav } from "@/components/navs/klassik-nav";
import { YuqoriNav } from "@/components/navs/yuqori-nav";
import { QoraNavi } from "@/components/navs/qora-nav";
import { TorNav } from "@/components/navs/tor-nav";
import { KengNav } from "@/components/navs/keng-nav";

/* Main content offset per variant */
const MAIN_CLASS: Record<string, string> = {
  klassik: "ml-64 min-h-screen",
  yuqori:  "pt-[92px] min-h-screen",
  qora:    "ml-[240px] min-h-screen flex flex-col",
  tor:     "ml-[72px] min-h-screen",
  keng:    "ml-[300px] min-h-screen",
};

/* Background per variant */
const BG_CLASS: Record<string, string> = {
  klassik: "bg-neutral-50 dark:bg-neutral-950",
  yuqori:  "bg-stone-50 dark:bg-neutral-950",
  qora:    "bg-[#0d0d12] dark:bg-[#080810]",
  tor:     "bg-neutral-50 dark:bg-neutral-950",
  keng:    "bg-neutral-100 dark:bg-neutral-950",
};

/* Content area bg (for qora — light content on dark chrome) */
const CONTENT_CLASS: Record<string, string> = {
  qora: "flex-1 bg-neutral-50 dark:bg-neutral-950",
};

export function LayoutSwitcher({ children }: { children: React.ReactNode }) {
  const { variantId, mounted } = useVariant();

  /* Use "klassik" as default until client hydrates to avoid mismatch */
  const v = mounted ? variantId : "klassik";

  const mainClass = MAIN_CLASS[v] ?? MAIN_CLASS.klassik;
  const bgClass   = BG_CLASS[v]   ?? BG_CLASS.klassik;
  const contentClass = CONTENT_CLASS[v];

  return (
    <div className={`min-h-screen ${bgClass}`}>
      {/* Nav — only this swaps, never unmounts the page */}
      {v === "klassik" && <KlassikNav />}
      {v === "yuqori"  && <YuqoriNav />}
      {v === "qora"    && <QoraNavi />}
      {v === "tor"     && <TorNav />}
      {v === "keng"    && <KengNav />}

      {/* Page content — stable, never remounts */}
      <div className={mainClass}>
        {contentClass ? (
          <div className={contentClass}>{children}</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
