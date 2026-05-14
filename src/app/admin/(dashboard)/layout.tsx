import { verifySuperAdmin } from "@/lib/admin-guard";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout is inside a (dashboard) group, 
  // so it only applies to protected admin routes.
  await verifySuperAdmin();

  return <>{children}</>;
}
