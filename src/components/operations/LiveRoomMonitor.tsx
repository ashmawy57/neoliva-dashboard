'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RoomCard } from './RoomCard';
import { OperationalAlerts } from './OperationalAlerts';
import { UtilizationAnalytics } from './UtilizationAnalytics';
import { getLiveRoomStatusAction } from '@/app/actions/operational-rooms';
import { Button } from '@/components/ui/button';
import { RefreshCw, LayoutGrid, LayoutList, AlertCircle, Activity } from 'lucide-react';
import { toast } from 'sonner';

interface LiveRoomMonitorProps {
  initialData: any[];
}

export function LiveRoomMonitor({ initialData }: LiveRoomMonitorProps) {
  const [rooms, setRooms] = useState(initialData);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    const result = await getLiveRoomStatusAction();
    if (result.success) {
      setRooms(result.data);
      setLastUpdated(new Date());
    } else {
      toast.error("Failed to refresh operational data");
    }
    setIsRefreshing(false);
  }, []);

  // Poll every 30 seconds for "Live" updates
  useEffect(() => {
    const interval = setInterval(refreshData, 30000);
    return () => clearInterval(interval);
  }, [refreshData]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 space-y-6">
        {/* Controls Bar */}
        <div className="flex items-center justify-between bg-white/50 dark:bg-slate-900/50 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold animate-pulse">
              <Activity className="w-3 h-3" />
              LIVE MONITORING
            </div>
            <span className="text-xs text-muted-foreground">
              Last update: {lastUpdated.toLocaleTimeString()}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode('list')}
              >
                <LayoutList className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={isRefreshing}
              onClick={refreshData}
              className="h-9 gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Room Grid */}
        <motion.div 
          layout
          className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}
        >
          <AnimatePresence mode="popLayout">
            {rooms.map((room) => (
              <RoomCard 
                key={room.id} 
                room={room} 
                viewMode={viewMode}
                onUpdate={refreshData}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Sidebar Operations */}
      <div className="space-y-6">
        <OperationalAlerts rooms={rooms} />
        <UtilizationAnalytics rooms={rooms} />
      </div>
    </div>
  );
}
