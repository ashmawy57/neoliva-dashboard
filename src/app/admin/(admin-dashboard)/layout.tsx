export const dynamic = 'force-dynamic';

import { verifySuperAdmin } from "@/lib/admin-guard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifySuperAdmin();
  return <>{children}</>;
}
