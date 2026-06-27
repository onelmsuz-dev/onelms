"use client";

import { ThemeProvider } from "next-themes";
import { VariantProvider } from "@/components/variant-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <VariantProvider>
        {children}
      </VariantProvider>
    </ThemeProvider>
  );
}
