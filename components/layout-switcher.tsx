import { TorNav } from "@/components/navs/tor-nav";

export function LayoutSwitcher({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <TorNav />
      <main className="flex-1 min-h-screen min-w-0">
        {children}
      </main>
    </div>
  );
}
