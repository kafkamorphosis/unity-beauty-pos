import { AppShell } from "@/components/shell/app-shell";
import { requireRole } from "@/lib/auth/session";

export default async function PosLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["owner", "seller"]);
  return (
    <AppShell navKey="pos" user={{ fullName: profile.fullName || profile.username, role: profile.role }}>
      {children}
    </AppShell>
  );
}
