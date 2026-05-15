"use client";

import { useState } from "react";
import { DoorOpen, Stethoscope, Users, Clock, Settings, MoreVertical, Trash, Edit2, Wrench, Ban, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateRoomStatusAction } from "@/app/actions/rooms";
import { toast } from "sonner";
import { AssignStaffModal } from "./AssignStaffModal";
import { EditRoomModal } from "./EditRoomModal";

const statusColors: Record<string, string> = {
  AVAILABLE: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200",
  BUSY: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200",
  CLEANING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200",
  MAINTENANCE: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200",
  OFFLINE: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400 border-slate-200",
};

const statusDotColors: Record<string, string> = {
  AVAILABLE: "bg-emerald-500",
  BUSY: "bg-red-500",
  CLEANING: "bg-yellow-500",
  MAINTENANCE: "bg-orange-500",
  OFFLINE: "bg-slate-500",
};

export function RoomCard({ 
  room, 
  canManageRooms,
  canAssignStaff,
  onViewSchedule
}: { 
  room: any;
  canManageRooms: boolean;
  canAssignStaff: boolean;
  onViewSchedule: () => void;
}) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAssignStaffOpen, setIsAssignStaffOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Derive active patients from current chairs
  const activeAppointments = room.roomChairs?.flatMap((chair: any) => chair.appointments) || [];
  const currentPatient = activeAppointments.find((a: any) => a.status === 'IN_PROGRESS')?.patient?.name;
  const waitingPatientsCount = activeAppointments.filter((a: any) => a.status === 'WAITING').length;
  
  // Get assigned doctors & assistants
  const assignedDoctors = room.roomStaff?.filter((rs: any) => rs.role === 'DOCTOR') || [];
  const assignedAssistants = room.roomStaff?.filter((rs: any) => rs.role === 'ASSISTANT') || [];

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      const result = await updateRoomStatusAction(room.id, newStatus);
      if (result.success) {
        toast.success(`Room marked as ${newStatus.toLowerCase()}`);
      } else {
        toast.error(result.error || "Failed to update room status");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <>
      <Card className="flex flex-col overflow-hidden transition-all hover:shadow-md border-border/50">
        {/* Top color bar */}
        <div className={`h-1.5 w-full ${statusDotColors[room.status] || "bg-gray-200"}`} />
        
        <CardHeader className="pb-3 pt-4 px-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1 w-full">
              <div className="flex justify-between items-center w-full">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <DoorOpen className="w-5 h-5 text-muted-foreground" />
                  {room.name}
                </CardTitle>
                
                {canManageRooms && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuLabel>Room Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      
                      {/* Status Quick Actions */}
                      <DropdownMenuItem onClick={() => handleStatusUpdate('AVAILABLE')} disabled={isUpdatingStatus || room.status === 'AVAILABLE'}>
                        <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500" /> Mark Available
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusUpdate('BUSY')} disabled={isUpdatingStatus || room.status === 'BUSY'}>
                        <Users className="w-4 h-4 mr-2 text-red-500" /> Mark Busy
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusUpdate('CLEANING')} disabled={isUpdatingStatus || room.status === 'CLEANING'}>
                        <Ban className="w-4 h-4 mr-2 text-yellow-500" /> Start Cleaning
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusUpdate('MAINTENANCE')} disabled={isUpdatingStatus || room.status === 'MAINTENANCE'}>
                        <Wrench className="w-4 h-4 mr-2 text-orange-500" /> Maintenance Mode
                      </DropdownMenuItem>
                      
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                        <Edit2 className="w-4 h-4 mr-2" /> Edit Room
                      </DropdownMenuItem>
                      {canAssignStaff && (
                        <DropdownMenuItem onClick={() => setIsAssignStaffOpen(true)}>
                          <Users className="w-4 h-4 mr-2" /> Manage Staff
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs font-normal">
                  {room.type}
                </Badge>
                <Badge variant="outline" className={`text-xs font-medium border ${statusColors[room.status]}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${statusDotColors[room.status]}`} />
                  {room.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-4 py-3 flex-1 space-y-4">
          {/* Staff Assignment */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <Stethoscope className="w-3.5 h-3.5 mr-1.5" />
              <span className="font-medium text-foreground text-xs uppercase tracking-wider">Assigned Staff</span>
            </div>
            {assignedDoctors.length === 0 && assignedAssistants.length === 0 ? (
              <div className="text-xs text-muted-foreground italic bg-muted/30 p-2 rounded-md">
                No staff assigned.
              </div>
            ) : (
              <div className="space-y-1.5">
                {assignedDoctors.map((rs: any) => (
                  <div key={rs.user.id} className="text-sm flex items-center gap-2 bg-blue-50 dark:bg-blue-900/10 p-1.5 rounded-md text-blue-700 dark:text-blue-400">
                    <div className="w-5 h-5 rounded-full bg-blue-200 dark:bg-blue-800 flex items-center justify-center text-[10px] font-bold">
                      {rs.user.name?.charAt(0) || 'D'}
                    </div>
                    <span className="font-medium truncate">{rs.user.name}</span>
                    <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1.5 bg-blue-100 dark:bg-blue-800">Doctor</Badge>
                  </div>
                ))}
                {assignedAssistants.map((rs: any) => (
                  <div key={rs.user.id} className="text-sm flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-md text-slate-700 dark:text-slate-300">
                    <div className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                      {rs.user.name?.charAt(0) || 'A'}
                    </div>
                    <span className="truncate">{rs.user.name}</span>
                    <Badge variant="secondary" className="ml-auto text-[10px] h-4 px-1.5">Assistant</Badge>
                  </div>
                ))}
              </div>
            )}
            
            {canAssignStaff && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-xs h-7 text-muted-foreground hover:text-foreground mt-1"
                onClick={() => setIsAssignStaffOpen(true)}
              >
                <Plus className="w-3 h-3 mr-1" /> Add Staff
              </Button>
            )}
          </div>

          {/* Current Activity */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex items-center text-sm text-muted-foreground">
              <Activity className="w-3.5 h-3.5 mr-1.5" />
              <span className="font-medium text-foreground text-xs uppercase tracking-wider">Current Activity</span>
            </div>
            
            {currentPatient ? (
              <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-900/10 p-2 rounded-md border border-emerald-100 dark:border-emerald-900/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium text-emerald-800 dark:text-emerald-400 truncate max-w-[140px]">{currentPatient}</span>
                </div>
                <Badge variant="outline" className="text-[10px] h-4 px-1 border-emerald-200 bg-emerald-100 text-emerald-700">IN PROGRESS</Badge>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground py-1">
                Room is currently empty.
              </div>
            )}
            
            {waitingPatientsCount > 0 && (
              <div className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5 mt-1">
                <Clock className="w-3.5 h-3.5" /> 
                {waitingPatientsCount} patient{waitingPatientsCount > 1 ? 's' : ''} waiting
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="px-4 py-3 bg-muted/30 border-t border-border/50 flex gap-2">
          <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={onViewSchedule}>
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            Schedule
          </Button>
          <Button 
            variant={room.status === 'AVAILABLE' ? 'default' : 'secondary'} 
            size="sm" 
            className="w-full text-xs h-8"
            onClick={() => handleStatusUpdate(room.status === 'AVAILABLE' ? 'BUSY' : 'AVAILABLE')}
            disabled={isUpdatingStatus}
          >
            {room.status === 'AVAILABLE' ? 'Mark Busy' : 'Make Available'}
          </Button>
        </CardFooter>
      </Card>

      {isAssignStaffOpen && (
        <AssignStaffModal 
          roomId={room.id} 
          roomName={room.name}
          currentStaff={room.roomStaff}
          isOpen={isAssignStaffOpen} 
          onClose={() => setIsAssignStaffOpen(false)} 
        />
      )}

      {isEditOpen && (
        <EditRoomModal
          room={room}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
        />
      )}
    </>
  );
}
