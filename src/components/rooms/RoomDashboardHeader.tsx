'use client';

import { Button } from '@/components/ui/button';
import { Plus, LayoutGrid, ListFilter } from 'lucide-react';
import { usePermission } from '@/components/providers/permission-provider';
import { PermissionCode } from '@/types/permissions';
import { useState } from 'react';
import { CreateRoomModal } from './CreateRoomModal';

export function RoomDashboardHeader() {
  const { hasPermission } = usePermission();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  return (
    <div className="flex items-center justify-between space-y-2">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Clinic Rooms</h2>
        <p className="text-muted-foreground">
          Monitor and manage your clinical operational units in real-time.
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm">
          <ListFilter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline" size="sm">
          <LayoutGrid className="mr-2 h-4 w-4" />
          View
        </Button>
        {hasPermission(PermissionCode.ROOM_MANAGE) && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Room
          </Button>
        )}
      </div>

      <CreateRoomModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </div>
  );
}
