import { Suspense } from "react";
import { getTenantContext } from "@/lib/tenant-context";
import { RoomService } from "@/services/room.service";
import { getUserPermissions } from "@/lib/rbac";
import { PermissionCode } from "@/types/permissions";
import { RoomList } from "@/components/rooms/RoomList";
import { redirect } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Rooms Dashboard | Dental Clinic",
};

export default async function RoomsPage() {
  const { tenantId, user } = await getTenantContext();
  
  if (!user) {
    redirect("/auth/sign-in");
  }

  const permissions = await getUserPermissions();
  
  // Ensure we use the correct Set method .has() for RSC RBAC checks
  if (!permissions.has(PermissionCode.ROOM_VIEW)) {
    redirect("/dashboard");
  }

  const canManageRooms = permissions.has(PermissionCode.ROOM_MANAGE);
  const canAssignStaff = permissions.has(PermissionCode.ROOM_STAFF_ASSIGN);
  
  // Fetch initial data
  const initialRooms = await RoomService.getRoomsLiveStatus(tenantId);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Rooms Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and manage clinic rooms, active appointments, and assignments.
          </p>
        </div>
      </div>
      <div className="h-full">
        <Suspense fallback={<RoomListSkeleton />}>
          <RoomList 
            initialRooms={initialRooms as any} 
            canManageRooms={canManageRooms}
            canAssignStaff={canAssignStaff}
          />
        </Suspense>
      </div>
    </div>
  );
}

function RoomListSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex flex-col space-y-3 rounded-xl border p-4">
          <div className="flex justify-between items-center">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-1/2" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-8 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}
