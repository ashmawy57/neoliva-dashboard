"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Clock, User } from "lucide-react";

export function RoomScheduleDialog({ 
  room,
  isOpen, 
  onClose 
}: { 
  room: any;
  isOpen: boolean; 
  onClose: () => void;
}) {
  const allAppointments = room?.roomChairs?.flatMap((chair: any) => 
    chair.appointments.map((app: any) => ({ ...app, chairName: chair.name }))
  ) || [];

  // Sort by time
  allAppointments.sort((a: any, b: any) => {
    return new Date(a.time).getTime() - new Date(b.time).getTime();
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Today's Schedule - {room?.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {allAppointments.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              No appointments scheduled for today in this room.
            </div>
          ) : (
            <div className="space-y-3">
              {allAppointments.map((app: any) => {
                const isCurrent = app.status === 'IN_PROGRESS';
                const isWaiting = app.status === 'WAITING';
                const isDone = app.status === 'COMPLETED';
                
                return (
                  <div 
                    key={app.id} 
                    className={`flex flex-col p-3 rounded-lg border ${
                      isCurrent ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800' :
                      isWaiting ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' :
                      isDone ? 'bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 opacity-75' :
                      'bg-card border-border'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className={`w-4 h-4 ${isCurrent ? 'text-emerald-500 animate-pulse' : 'text-muted-foreground'}`} />
                        <span className="font-semibold text-sm">
                          {format(new Date(app.time), 'hh:mm a')}
                        </span>
                        <span className="text-xs text-muted-foreground">({app.duration}m)</span>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${
                        isCurrent ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                        isWaiting ? 'bg-amber-100 text-amber-700 border-amber-200' : ''
                      }`}>
                        {app.status}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{app.patient?.name || 'Unknown Patient'}</span>
                    </div>
                    
                    {room.roomChairs?.length > 1 && (
                      <div className="mt-2 text-xs text-muted-foreground bg-muted/50 p-1 rounded w-fit px-2">
                        Chair: {app.chairName}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
