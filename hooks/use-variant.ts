"use client";

import { useContext } from "react";
import { VariantContext } from "@/components/variant-provider";

export type { VariantId } from "@/components/variant-provider";
export { VARIANT_LIST } from "@/components/variant-provider";

export function useVariant() {
  return useContext(VariantContext);
}
