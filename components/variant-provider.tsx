"use client";

import { createContext, useState, useEffect } from "react";

export type VariantId = "klassik" | "yuqori" | "qora" | "tor" | "keng";

export interface VariantMeta {
  id: VariantId;
  name: string;
  desc: string;
}

export const VARIANT_LIST: VariantMeta[] = [
  { id: "klassik", name: "Klassik", desc: "Chap sidebar, standart" },
  { id: "yuqori",  name: "Yuqori",  desc: "Tepada navigatsiya" },
  { id: "qora",    name: "Qora",    desc: "Qorang'i professional" },
  { id: "tor",     name: "Tor",     desc: "Kichik ikonalar paneli" },
  { id: "keng",    name: "Keng",    desc: "Keng sidebar, batafsil" },
];

interface VariantContextValue {
  variantId: VariantId;
  setVariant: (id: VariantId) => void;
  mounted: boolean;
}

export const VariantContext = createContext<VariantContextValue>({
  variantId: "klassik",
  setVariant: () => {},
  mounted: false,
});

const STORAGE_KEY = "onelms-layout-v3";
const VALID: VariantId[] = ["klassik", "yuqori", "qora", "tor", "keng"];

export function VariantProvider({ children }: { children: React.ReactNode }) {
  const [variantId, setVariantId] = useState<VariantId>("klassik");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as VariantId | null;
    const id = saved && VALID.includes(saved) ? saved : "klassik";
    setVariantId(id);
    setMounted(true);
  }, []);

  const setVariant = (id: VariantId) => {
    setVariantId(id);
    localStorage.setItem(STORAGE_KEY, id);
  };

  return (
    <VariantContext.Provider value={{ variantId, setVariant, mounted }}>
      {children}
    </VariantContext.Provider>
  );
}
