"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RoomCard } from "./RoomCard";
import { CreateRoomModal } from "./CreateRoomModal";
import { RoomScheduleDialog } from "./RoomScheduleDialog";
import { Button } from "@/components/ui/button";
import { DoorOpen, Plus, Search } from "lucide-react";
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
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between bg-card/30 p-4 rounded-2xl border border-border/40 backdrop-blur-sm">
        <div className="relative w-full md:max-w-md group">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search by name or type..."
            className="pl-10 h-11 bg-background/50 border-border/40 rounded-xl focus:ring-primary/20 focus:border-primary/30 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 rounded-lg border border-border/30 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            {rooms.length} Total Rooms
          </div>
          {canManageRooms && (
            <Button onClick={() => setIsCreateModalOpen(true)} className="h-11 px-6 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all font-bold">
              <Plus className="mr-2 h-5 w-5" />
              New Room
            </Button>
          )}
        </div>
      </div>

      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-3xl bg-muted/5 border-border/40">
          <div className="h-24 w-24 bg-primary/5 rounded-3xl flex items-center justify-center mb-6 rotate-3">
            <DoorOpen className="h-12 w-12 text-primary/40" />
          </div>
          <h3 className="text-2xl font-bold mb-3 tracking-tight">No rooms configured</h3>
          <p className="text-muted-foreground text-center max-w-sm mb-8 font-medium leading-relaxed">
            Organize your clinic by adding rooms. Monitor staff assignments and patient activity in real-time.
          </p>
          {canManageRooms && (
            <Button onClick={() => setIsCreateModalOpen(true)} size="lg" className="rounded-2xl px-8 font-bold h-12 shadow-xl shadow-primary/10">
              <Plus className="mr-2 h-5 w-5" />
              Configure Your First Room
            </Button>
          )}
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-muted/5 rounded-3xl border border-border/20">
          <Search className="h-10 w-10 mb-4 opacity-20" />
          <p className="text-lg font-semibold tracking-tight">No matching rooms found</p>
          <p className="text-sm">Try adjusting your search query</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
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
