'use client';

import React from 'react';
import { 
  AlertCircle, 
  Clock, 
  UserMinus, 
  Zap 
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';

interface OperationalAlertsProps {
  rooms: any[];
}

export function OperationalAlerts({ rooms }: OperationalAlertsProps) {
  const alerts: any[] = [];

  rooms.forEach(room => {
    // 1. Delayed Session
    if (room.currentAppointment?.startTime) {
      const start = new Date(room.currentAppointment.startTime).getTime();
      const elapsedMins = Math.floor((new Date().getTime() - start) / 60000);
      if (elapsedMins > room.currentAppointment.estimatedDuration) {
        alerts.push({
          id: `delay-${room.id}`,
          type: 'warning',
          title: 'Treatment Delay',
          message: `${room.name}: ${room.currentAppointment.patientName} is +${elapsedMins - room.currentAppointment.estimatedDuration}m over estimated time.`,
          icon: Clock
        });
      }
    }

    // 2. Staffing Shortage
    if (room.status === 'BUSY' && room.staff.length < 1) {
      alerts.push({
        id: `staff-${room.id}`,
        type: 'critical',
        title: 'Staffing Missing',
        message: `${room.name} is BUSY but no staff assigned.`,
        icon: UserMinus
      });
    }

    // 3. High Queue Load
    if (room.queue.length >= 3) {
      alerts.push({
        id: `queue-${room.id}`,
        type: 'info',
        title: 'High Queue Load',
        message: `${room.name} has ${room.queue.length} patients waiting.`,
        icon: Zap
      });
    }
  });

  return (
    <Card className="border-2 border-slate-100 dark:border-slate-800">
      <CardHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-500" />
          <CardTitle className="text-sm font-bold uppercase tracking-tight">Active Operational Alerts</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-[300px] overflow-y-auto">
          <AnimatePresence mode="popLayout">
            {alerts.length > 0 ? alerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`p-4 flex gap-3 transition-colors ${
                  alert.type === 'critical' ? 'bg-rose-50/50 dark:bg-rose-900/10' : 
                  alert.type === 'warning' ? 'bg-amber-50/50 dark:bg-amber-900/10' : 
                  'bg-blue-50/50 dark:bg-blue-900/10'
                }`}
              >
                <alert.icon className={`w-4 h-4 shrink-0 mt-0.5 ${
                  alert.type === 'critical' ? 'text-rose-500' : 
                  alert.type === 'warning' ? 'text-amber-500' : 
                  'text-blue-500'
                }`} />
                <div className="space-y-1">
                  <p className="text-[11px] font-bold leading-none">{alert.title}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{alert.message}</p>
                </div>
              </motion.div>
            )) : (
              <div className="p-8 text-center space-y-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-xs font-medium text-slate-500">All systems optimal</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
