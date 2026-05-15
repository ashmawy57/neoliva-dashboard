'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Clock, 
  Stethoscope, 
  UserCircle, 
  MoreHorizontal, 
  Play, 
  CheckCircle2, 
  ArrowRightLeft,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { startSessionAction, endSessionAction, transferAppointmentAction, updateRoomStatusAction, prioritizeAppointmentAction } from '@/app/actions/operational-rooms';
import { toast } from 'sonner';

interface RoomCardProps {
  room: any;
  viewMode: 'grid' | 'list';
  onUpdate: () => void;
}

export function RoomCard({ room, viewMode, onUpdate }: RoomCardProps) {
  const [elapsed, setElapsed] = useState(0);

  // Calculate elapsed time for current appointment
  useEffect(() => {
    if (!room.currentAppointment?.startTime) return;
    
    const start = new Date(room.currentAppointment.startTime).getTime();
    const updateTimer = () => {
      const now = new Date().getTime();
      setElapsed(Math.floor((now - start) / 1000));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [room.currentAppointment?.startTime]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = room.currentAppointment 
    ? Math.min((elapsed / (room.currentAppointment.estimatedDuration * 60)) * 100, 100)
    : 0;

  const handleStartSession = async (aptId: string) => {
    const result = await startSessionAction(aptId);
    if (result.success) {
      toast.success("Session started");
      onUpdate();
    } else {
      toast.error(result.error);
    }
  };

  const handleEndSession = async (aptId: string) => {
    const result = await endSessionAction(aptId);
    if (result.success) {
      toast.success("Session completed");
      onUpdate();
    } else {
      toast.error(result.error);
    }
  };

  const handleFinishCleaning = async () => {
    const result = await updateRoomStatusAction(room.id, 'AVAILABLE');
    if (result.success) {
      toast.success("Room ready");
      onUpdate();
    } else {
      toast.error(result.error);
    }
  };

  const handlePrioritize = async (aptId: string) => {
    const result = await prioritizeAppointmentAction(aptId);
    if (result.success) {
      toast.success("Patient prioritized");
      onUpdate();
    } else {
      toast.error(result.error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-500';
      case 'BUSY': return 'bg-amber-500';
      case 'CLEANING': return 'bg-blue-500';
      case 'MAINTENANCE': return 'bg-rose-500';
      default: return 'bg-slate-400';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const data = e.dataTransfer.getData("appointmentId");
    if (!data) return;

    const { appointmentId, sourceRoomId } = JSON.parse(data);
    
    if (sourceRoomId === room.id) return;

    const result = await transferAppointmentAction(appointmentId, room.id);
    if (result.success) {
      toast.success(`Transferred to ${room.name}`);
      onUpdate();
    } else {
      toast.error(result.error);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Card className={`overflow-hidden border-2 transition-all hover:shadow-xl ${room.status === 'BUSY' ? 'border-amber-200 dark:border-amber-900/30' : 'border-slate-100 dark:border-slate-800'}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor(room.status)} shadow-[0_0_10px_rgba(0,0,0,0.1)]`} />
            <CardTitle className="text-lg font-bold">{room.name}</CardTitle>
            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter">
              {room.type}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => toast.info("Maintenance scheduled")}>
                Schedule Maintenance
              </DropdownMenuItem>
              <DropdownMenuItem className="text-rose-600">
                Emergency Block
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        
        <CardContent className="p-4 space-y-4">
          {/* Current State Area */}
          {room.currentAppointment ? (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">In Treatment</p>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{room.currentAppointment.patientName}</h3>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Stethoscope className="w-3 h-3 text-amber-500" />
                    <span>Dr. {room.currentAppointment.doctorName}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-mono font-bold ${progress > 100 ? 'text-rose-500 animate-pulse' : 'text-slate-900 dark:text-slate-100'}`}>
                    {formatTime(elapsed)}
                  </div>
                  <p className="text-[10px] text-muted-foreground">/ {room.currentAppointment.estimatedDuration}m est.</p>
                  <p className="text-[9px] text-slate-400 mt-1">
                    Ends ~{new Date(new Date(room.currentAppointment.startTime).getTime() + room.currentAppointment.estimatedDuration * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span>PROGRESS</span>
                  <span>{Math.floor(progress)}%</span>
                </div>
                <Progress value={progress} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 h-9"
                  onClick={() => handleEndSession(room.currentAppointment.id)}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Complete
                </Button>
                <div 
                  draggable 
                  onDragStart={(e) => {
                    e.dataTransfer.setData("appointmentId", JSON.stringify({ appointmentId: room.currentAppointment.id, sourceRoomId: room.id }));
                  }}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <Button variant="outline" className="h-9 w-9 p-0">
                    <ArrowRightLeft className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className={`py-6 flex flex-col items-center justify-center border-2 border-dashed rounded-xl ${room.status === 'CLEANING' ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10'}`}>
              {room.status === 'CLEANING' ? (
                <>
                  <Activity className="w-8 h-8 text-blue-400 mb-2 animate-spin-slow" />
                  <p className="text-xs font-bold text-blue-600">Room Cleaning...</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2 border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={handleFinishCleaning}
                  >
                    Finish Cleaning
                  </Button>
                </>
              ) : (
                <>
                  <UserCircle className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
                  <p className="text-xs font-medium text-slate-500">Room Available</p>
                  {room.queue.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2 text-emerald-600 hover:text-emerald-700 font-bold gap-2"
                      onClick={() => handleStartSession(room.queue[0].id)}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Next Patient
                    </Button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Queue & Staff Section */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  <span>Waiting ({room.queue.length})</span>
                </div>
                {room.queue.length > 0 && (
                  <span className="text-amber-600 dark:text-amber-400">
                    ~{room.queue.length * 25}m wait
                  </span>
                )}
              </div>
              {room.queue.length > 0 ? (
                <div className="space-y-1">
                  {room.queue.slice(0, 3).map((q: any) => (
                    <div 
                      key={q.id} 
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("appointmentId", JSON.stringify({ appointmentId: q.id, sourceRoomId: room.id }));
                      }}
                      className="group text-[11px] font-medium truncate flex items-center justify-between gap-1 cursor-grab active:cursor-grabbing hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1 rounded transition-colors"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <div className="w-1 h-1 rounded-full bg-slate-400" />
                        <span className="truncate">{q.patientName}</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:text-indigo-600 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrioritize(q.id);
                        }}
                        title="Prioritize"
                      >
                        <Play className="w-2.5 h-2.5 rotate-[-90deg] fill-current" />
                      </Button>
                    </div>
                  ))}
                  {room.queue.length > 3 && <div className="text-[10px] text-muted-foreground">+{room.queue.length - 3} more</div>}
                </div>
              ) : (
                <p className="text-[10px] text-muted-foreground italic">No queue</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase">
                <Users className="w-3 h-3" />
                <span>Assigned Staff</span>
              </div>
              <div className="flex -space-x-2 overflow-hidden">
                {room.staff.length > 0 ? room.staff.map((s: any) => (
                  <div 
                    key={s.userId} 
                    className="h-6 w-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-bold"
                    title={`${s.name} (${s.role})`}
                  >
                    {s.name.substring(0, 2).toUpperCase()}
                  </div>
                )) : (
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
