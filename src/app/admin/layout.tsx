import { Settings, Users } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import type { NavItem } from "@/components/shell/nav-items";
import { requireRole } from "@/lib/auth/session";
import { uz } from "@/lib/i18n/uz";

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: uz.nav.admin, icon: Users },
  { href: "/admin/sozlamalar", label: uz.nav.settings, icon: Settings },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireRole(["admin"]);
  return (
    <AppShell nav={ADMIN_NAV} user={{ fullName: profile.fullName || profile.username, role: profile.role }}>
      {children}
    </AppShell>
  );
}
