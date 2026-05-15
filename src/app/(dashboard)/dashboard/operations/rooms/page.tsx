import { getTenantContext } from "@/lib/tenant-context";
import { RoomOperationalService } from "@/services/room-operational.service";
import { LiveRoomMonitor } from "@/components/operations/LiveRoomMonitor";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserPermissions } from "@/lib/rbac";
import { PermissionCode } from "@/types/permissions";
import { redirect } from "next/navigation";

export default async function RoomOperationsPage() {
  const permissions = await getUserPermissions();
  if (!permissions.has(PermissionCode.ROOM_VIEW)) {
    redirect("/dashboard");
  }

  const { tenantId } = await getTenantContext();
  const initialData = await RoomOperationalService.getLiveRoomStatus(tenantId);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-slate-50/50 dark:bg-slate-950/50">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-500 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Live Room Operations
          </h2>
          <p className="text-muted-foreground">
            Enterprise Monitoring & Clinic Flow Management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Active Rooms</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold">{initialData.length}</h3>
            <div className="text-[10px] text-emerald-500 font-bold bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded">ONLINE</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Current Patients</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold">{initialData.filter(r => r.currentAppointment).length}</h3>
            <div className="text-[10px] text-amber-500 font-bold bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded">IN TREATMENT</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Waiting Total</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold">{initialData.reduce((acc, r) => acc + r.queue.length, 0)}</h3>
            <div className="text-[10px] text-blue-500 font-bold bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">QUEUE</div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Average Wait</p>
          <div className="flex items-end justify-between">
            <h3 className="text-2xl font-bold">12m</h3>
            <div className="text-[10px] text-rose-500 font-bold bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded">ESTIMATED</div>
          </div>
        </div>
      </div>

      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <LiveRoomMonitor initialData={initialData} />
      </Suspense>
    </div>
  );
}
