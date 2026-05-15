"use client";

import { useState } from "react";
import { DoorOpen, Stethoscope, Users, Clock, Settings, MoreVertical, Edit2, Wrench, Ban, CheckCircle2, Plus, Activity } from "lucide-react";
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
  DropdownMenuGroup,
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
      <Card className="group flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-border/40 bg-card/50 backdrop-blur-sm relative">
        {/* Animated Glow Effect on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        
        {/* Status Indicator Bar */}
        <div className={`h-1.5 w-full transition-colors duration-300 ${statusDotColors[room.status] || "bg-gray-200"}`} />
        
        <CardHeader className="pb-3 pt-5 px-5 relative">
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex justify-between items-start w-full gap-2">
                <CardTitle className="text-xl font-bold flex items-center gap-2.5 text-foreground/90 tracking-tight truncate">
                  <div className={`p-2 rounded-xl bg-muted/50 group-hover:bg-primary/10 transition-colors duration-300`}>
                    <DoorOpen className="w-5 h-5 text-primary/70 group-hover:text-primary transition-colors duration-300" />
                  </div>
                  <span className="truncate">{room.name}</span>
                </CardTitle>
                
                {canManageRooms && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/5 opacity-60 hover:opacity-100 transition-all">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-2xl shadow-2xl border-primary/10 backdrop-blur-md">
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 px-2 py-2">Quick Status</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleStatusUpdate('AVAILABLE')} disabled={isUpdatingStatus || room.status === 'AVAILABLE'} className="rounded-xl py-2.5">
                          <CheckCircle2 className="w-4 h-4 mr-2.5 text-emerald-500" /> <span className="font-medium">Available</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate('BUSY')} disabled={isUpdatingStatus || room.status === 'BUSY'} className="rounded-xl py-2.5">
                          <Users className="w-4 h-4 mr-2.5 text-red-500" /> <span className="font-medium">Occupied</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate('CLEANING')} disabled={isUpdatingStatus || room.status === 'CLEANING'} className="rounded-xl py-2.5">
                          <Ban className="w-4 h-4 mr-2.5 text-amber-500" /> <span className="font-medium">Cleaning</span>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      
                      <DropdownMenuSeparator className="my-1.5 bg-primary/5" />
                      
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70 px-2 py-2">Management</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => setIsEditOpen(true)} className="rounded-xl py-2.5">
                          <Edit2 className="w-4 h-4 mr-2.5 text-blue-500" /> <span className="font-medium">Edit Details</span>
                        </DropdownMenuItem>
                        {canAssignStaff && (
                          <DropdownMenuItem onClick={() => setIsAssignStaffOpen(true)} className="rounded-xl py-2.5">
                            <Users className="w-4 h-4 mr-2.5 text-indigo-500" /> <span className="font-medium">Manage Staff</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-[10px] font-bold tracking-wider uppercase bg-primary/5 text-primary/70 border-primary/10 px-2 py-0.5 rounded-lg">
                  {room.type}
                </Badge>
                <Badge className={`text-[10px] font-bold tracking-wider uppercase border px-2 py-0.5 rounded-lg shadow-sm ${statusColors[room.status]}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mr-2 ${statusDotColors[room.status]} animate-pulse`} />
                  {room.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-5 py-2 flex-1 space-y-5 relative">
          {/* Staff Assignment */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
                <Stethoscope className="w-3.5 h-3.5 mr-2" />
                Medical Staff
              </div>
              {assignedDoctors.length + assignedAssistants.length > 0 && (
                <span className="text-[10px] font-bold text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full">
                  {assignedDoctors.length + assignedAssistants.length} Active
                </span>
              )}
            </div>
            
            {assignedDoctors.length === 0 && assignedAssistants.length === 0 ? (
              <div className="text-xs text-muted-foreground/50 italic bg-muted/20 p-3 rounded-xl border border-dashed border-border/50 text-center">
                Waiting for assignment...
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {assignedDoctors.map((rs: any) => {
                  const staffName = rs.user.memberships?.[0]?.staffProfile?.name || rs.user.email || 'Doctor';
                  return (
                    <div key={rs.user.id} className="group/staff flex items-center gap-2 bg-blue-50/50 dark:bg-blue-900/10 hover:bg-blue-100/50 dark:hover:bg-blue-900/20 px-2 py-1.5 rounded-xl border border-blue-100/50 dark:border-blue-800/30 transition-all cursor-default">
                      <div className="w-6 h-6 rounded-lg bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm shadow-blue-200">
                        {staffName.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-blue-900 dark:text-blue-300 leading-none">{staffName}</span>
                        <span className="text-[9px] text-blue-500/70 font-semibold uppercase tracking-tighter mt-0.5">Doctor</span>
                      </div>
                    </div>
                  );
                })}
                {assignedAssistants.map((rs: any) => {
                  const staffName = rs.user.memberships?.[0]?.staffProfile?.name || rs.user.email || 'Assistant';
                  return (
                    <div key={rs.user.id} className="flex items-center gap-2 bg-slate-50/50 dark:bg-slate-800/40 px-2 py-1.5 rounded-xl border border-slate-100/50 dark:border-slate-700/30">
                      <div className="w-6 h-6 rounded-lg bg-slate-400 text-white flex items-center justify-center text-[10px] font-bold">
                        {staffName.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-none">{staffName}</span>
                        <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-tighter mt-0.5">Assistant</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {canAssignStaff && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full text-[10px] font-bold uppercase tracking-widest h-8 text-muted-foreground/60 hover:text-primary hover:bg-primary/5 border border-transparent hover:border-primary/10 rounded-xl transition-all"
                onClick={() => setIsAssignStaffOpen(true)}
              >
                <Plus className="w-3.5 h-3.5 mr-2" /> Assign Staff
              </Button>
            )}
          </div>

          {/* Current Activity */}
          <div className="space-y-3 pt-4 border-t border-primary/5">
            <div className="flex items-center text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              <Activity className="w-3.5 h-3.5 mr-2" />
              Real-time Activity
            </div>
            
            {currentPatient ? (
              <div className="group/activity flex items-center justify-between bg-emerald-50/50 dark:bg-emerald-900/10 p-3 rounded-2xl border border-emerald-100/50 dark:border-emerald-800/30 transition-all hover:bg-emerald-100/50">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 animate-pulse" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 truncate max-w-[120px]">{currentPatient}</span>
                    <span className="text-[9px] font-bold text-emerald-600/70 uppercase tracking-wider">In Progress</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-[11px] font-medium text-muted-foreground/40 text-center py-2">
                Currently No Active Patient
              </div>
            )}
            
            {waitingPatientsCount > 0 && (
              <div className="flex items-center justify-center gap-2 py-1.5 px-3 bg-amber-50/50 dark:bg-amber-900/10 rounded-xl border border-amber-100/30">
                <Clock className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" /> 
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                  {waitingPatientsCount} Patient{waitingPatientsCount > 1 ? 's' : ''} Next in Queue
                </span>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="px-5 py-4 bg-muted/10 border-t border-border/30 flex gap-2.5">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-[10px] font-bold uppercase tracking-widest h-9 rounded-xl border-border/50 hover:bg-primary/5 hover:text-primary transition-all shadow-sm" 
            onClick={onViewSchedule}
          >
            <Clock className="w-3.5 h-3.5 mr-2" />
            Schedule
          </Button>
          <Button 
            variant={room.status === 'AVAILABLE' ? 'default' : 'secondary'} 
            size="sm" 
            className={`flex-1 text-[10px] font-bold uppercase tracking-widest h-9 rounded-xl transition-all shadow-md active:scale-95 ${
              room.status === 'AVAILABLE' ? 'bg-primary hover:bg-primary/90 shadow-primary/20' : ''
            }`}
            onClick={() => handleStatusUpdate(room.status === 'AVAILABLE' ? 'BUSY' : 'AVAILABLE')}
            disabled={isUpdatingStatus}
          >
            {isUpdatingStatus ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              room.status === 'AVAILABLE' ? 'Mark Busy' : 'Available'
            )}
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
