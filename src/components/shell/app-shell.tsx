"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, WifiOff } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";
import { uz } from "@/lib/i18n/uz";
import { cn } from "@/lib/utils";
import { NAV, isActive, type NavKey } from "./nav-items";
import { useOnline } from "./use-online";

type ShellUser = { fullName: string; role: "admin" | "owner" | "seller" };

export function AppShell({ navKey, user, children }: { navKey: NavKey; user: ShellUser; children: React.ReactNode }) {
  const nav = NAV[navKey];
  const pathname = usePathname();
  const router = useRouter();
  const online = useOnline();

  async function signOut() {
    await supabaseBrowser().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-40 flex h-13 items-stretch border-b border-ink bg-cell">
        <Link href={nav[0].href} className="flex items-center gap-2.5 border-r border-ink px-4" aria-label={uz.brand}>
          <Image src="/brand/unity-mark.png" alt="" width={28} height={28} priority />
          <span className="text-[0.95rem] font-bold tracking-tight">{uz.brand}</span>
        </Link>
        <nav aria-label="Asosiy" className="hidden items-stretch md:flex">
          {nav.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 border-r border-ink px-5 text-sm font-semibold transition-colors duration-150",
                  active ? "bg-ink text-cell" : "text-ink hover:bg-paper",
                )}
              >
                <item.icon className="size-4" aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="ml-auto flex items-stretch">
          <div className="hidden flex-col justify-center border-l border-ink px-4 leading-tight sm:flex">
            <span className="text-sm font-semibold">{user.fullName}</span>
            <span className="caption">{uz.roles[user.role]}</span>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="flex items-center gap-2 border-l border-ink px-4 text-sm font-semibold hover:bg-paper"
          >
            <LogOut className="size-4" aria-hidden />
            <span className="hidden sm:inline">{uz.common.signOut}</span>
            <span className="sr-only sm:hidden">{uz.common.signOut}</span>
          </button>
        </div>
      </header>

      {!online && (
        <div role="status" className="sticky top-13 z-30 flex items-center gap-2 border-b border-warn/40 bg-warn-soft px-4 py-2 text-sm font-medium text-warn">
          <WifiOff className="size-4" aria-hidden />
          {uz.common.offline}
        </div>
      )}

      <main className="flex flex-1 flex-col px-3 pt-4 pb-24 md:px-6 md:pt-6 md:pb-8">{children}</main>

      <nav
        aria-label="Asosiy"
        className="fixed inset-x-0 bottom-0 z-40 grid border-t border-ink bg-cell pb-[env(safe-area-inset-bottom)] md:hidden"
        style={{ gridTemplateColumns: `repeat(${nav.length}, minmax(0, 1fr))` }}
      >
        {nav.map((item, i) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex h-16 flex-col items-center justify-center gap-1 text-[0.72rem] font-semibold",
                i > 0 && "border-l border-ink",
                active ? "bg-ink text-cell" : "text-ink",
              )}
            >
              <item.icon className="size-5" aria-hidden />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
