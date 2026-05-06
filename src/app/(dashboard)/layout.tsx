import { Sidebar } from "@/components/layout/Sidebar";
import { TopBanner } from "@/components/layout/TopBanner";
import { resolveTenantContext } from "@/lib/tenant-context";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Force tenant resolution - this will check for APPROVED status
    await resolveTenantContext();
  } catch (error: any) {
    if (error.code === 'PENDING') {
      redirect("/pending-approval");
    }
    if (error.code === 'REJECTED') {
      redirect("/rejected");
    }
    // If user is authenticated but has no tenant access, redirect
    redirect("/unauthorized");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBanner />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
