import { TorNav } from "@/components/navs/tor-nav";

export function LayoutSwitcher({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TorNav />
      <main className="ml-[72px] min-h-screen">
        {children}
      </main>
    </div>
  );
}
