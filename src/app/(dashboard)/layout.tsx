import { Sidebar } from "@/components/layout/Sidebar";
import { TopBanner } from "@/components/layout/TopBanner";
import { resolveTenantContext, TenantContextError } from "@/lib/tenant-context";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    // Force tenant resolution - this will throw/redirect if not APPROVED
    await resolveTenantContext();
  } catch (error: any) {
    // CRITICAL: Let Next.js redirect() errors propagate naturally.
    // redirect() works by throwing a special error internally — catching
    // it here would silently swallow the redirect.
    if (isRedirectError(error)) {
      throw error;
    }

    // Handle TenantContextError codes explicitly
    if (error instanceof TenantContextError) {
      if (error.code === 'PENDING') {
        redirect("/pending-approval");
      }
      if (error.code === 'REJECTED') {
        redirect("/rejected");
      }
      // NO_USER_RECORD, UNAUTHORIZED, etc.
      redirect("/unauthorized");
    }

    // Unknown error — log and redirect to unauthorized
    console.error('[DashboardLayout] Unexpected error resolving tenant context:', error);
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
