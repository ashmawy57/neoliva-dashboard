'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';

interface UtilizationAnalyticsProps {
  rooms: any[];
}

export function UtilizationAnalytics({ rooms }: UtilizationAnalyticsProps) {
  // 1. Calculate Utilization Rate based on actual status and progress
  const utilizationData = rooms.map(room => {
    let utilization = 0;
    if (room.status === 'BUSY' && room.currentAppointment) {
      // If busy, utilization is high, but we can reflect progress
      const start = new Date(room.currentAppointment.startTime).getTime();
      const now = new Date().getTime();
      const elapsedMins = Math.floor((now - start) / 60000);
      const est = room.currentAppointment.estimatedDuration || 30;
      utilization = Math.min(Math.floor((elapsedMins / est) * 100), 100);
      // Give a boost to show it's active
      utilization = Math.max(utilization, 60);
    } else if (room.status === 'CLEANING') {
      utilization = 15;
    } else if (room.status === 'AVAILABLE' && room.queue.length > 0) {
      utilization = 30; // Ready but has queue
    } else if (room.status === 'MAINTENANCE') {
      utilization = 0;
    } else {
      utilization = 5; // Idle
    }

    return {
      name: room.name,
      utilization,
      status: room.status
    };
  });

  // 2. Calculate Room Status Distribution
  const statusCounts = rooms.reduce((acc: any, room) => {
    acc[room.status] = (acc[room.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.keys(statusCounts).map(key => ({
    name: key,
    value: statusCounts[key]
  }));

  const COLORS = {
    BUSY: '#f43f5e', // rose-500
    WAITING: '#f59e0b', // amber-500
    AVAILABLE: '#10b981', // emerald-500
    MAINTENANCE: '#64748b' // slate-500
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-2 border-slate-100 dark:border-slate-800">
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-sm font-bold uppercase tracking-tight">Room Utilization (%)</CardTitle>
          <CardDescription className="text-[10px]">Real-time capacity tracking per unit</CardDescription>
        </CardHeader>
        <CardContent className="p-4 h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={utilizationData} layout="vertical" margin={{ left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fontSize: 10, fontWeight: 500 }} 
                width={80}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="utilization" radius={[0, 4, 4, 0]} barSize={20}>
                {utilizationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.status as keyof typeof COLORS] || '#6366f1'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-2 border-slate-100 dark:border-slate-800">
        <CardHeader className="p-4 border-b">
          <CardTitle className="text-sm font-bold uppercase tracking-tight">Status Distribution</CardTitle>
          <CardDescription className="text-[10px]">Current clinic-wide room allocation</CardDescription>
        </CardHeader>
        <CardContent className="p-4 h-[250px] flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#6366f1'} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-2 ml-4">
            {statusData.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[s.name as keyof typeof COLORS] }} />
                <span className="text-[10px] font-medium uppercase tracking-wider">{s.name}: {s.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
