"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoomCard } from "./RoomCard";
import { CreateRoomModal } from "./CreateRoomModal";
import { RoomScheduleDialog } from "./RoomScheduleDialog";
import { Button } from "@/components/ui/button";
import { DoorOpen, Plus, Activity, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function RoomList({ 
  initialRooms, 
  canManageRooms, 
  canAssignStaff 
}: { 
  initialRooms: any[];
  canManageRooms: boolean;
  canAssignStaff: boolean;
}) {
  const router = useRouter();
  const [rooms, setRooms] = useState(initialRooms);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [scheduleRoom, setScheduleRoom] = useState<any | null>(null);

  // Poll for real-time updates without Redis
  useEffect(() => {
    const intervalId = setInterval(() => {
      // router.refresh() will re-fetch Server Components, which fetches new data
      // but to smoothly update client state without flashing, we can fetch via a server action or API
      router.refresh();
    }, 15000); // refresh every 15 seconds

    return () => clearInterval(intervalId);
  }, [router]);

  // Sync initialRooms to state when they arrive from server
  useEffect(() => {
    setRooms(initialRooms);
    // update scheduleRoom if it's currently open
    if (scheduleRoom) {
      const updated = initialRooms.find(r => r.id === scheduleRoom.id);
      if (updated) setScheduleRoom(updated);
    }
  }, [initialRooms]);

  const filteredRooms = rooms.filter((r) => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto">
          {canManageRooms && (
            <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Room
            </Button>
          )}
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl bg-muted/20">
          <div className="h-16 w-16 bg-blue-100/50 rounded-full flex items-center justify-center mb-4">
            <DoorOpen className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No rooms configured</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            You haven't set up any rooms yet. Create a room to start managing appointments, staff, and equipment.
          </p>
          {canManageRooms && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Room
            </Button>
          )}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center p-12 text-muted-foreground">
          No rooms match your search query.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRooms.map((room) => (
            <RoomCard 
              key={room.id} 
              room={room} 
              canManageRooms={canManageRooms}
              canAssignStaff={canAssignStaff}
              onViewSchedule={() => setScheduleRoom(room)}
            />
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <CreateRoomModal 
          isOpen={isCreateModalOpen} 
          onClose={() => setIsCreateModalOpen(false)} 
        />
      )}

      {scheduleRoom && (
        <RoomScheduleDialog
          room={scheduleRoom}
          isOpen={!!scheduleRoom}
          onClose={() => setScheduleRoom(null)}
        />
      )}
    </div>
  );
}
