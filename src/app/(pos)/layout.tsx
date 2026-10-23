import { AppShell } from "@/components/shell/app-shell";
import { POS_NAV } from "@/components/shell/nav-items";
import { requireRole } from "@/lib/auth/session";

export default async function PosLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["owner", "seller"]);
  return (
    <AppShell nav={POS_NAV} user={{ fullName: profile.fullName || profile.username, role: profile.role }}>
      {children}
    </AppShell>
  );
}
