"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { PermissionCode } from '@/types/permissions';

interface PermissionContextType {
  permissions: Set<string>;
  isLoading: boolean;
}

const PermissionContext = createContext<PermissionContextType>({
  permissions: new Set(),
  isLoading: true,
});

export function PermissionProvider({ 
  children, 
  initialPermissions = [] 
}: { 
  children: ReactNode; 
  initialPermissions?: string[];
}) {
  const permissionsSet = new Set(initialPermissions);

  return (
    <PermissionContext.Provider value={{ permissions: permissionsSet, isLoading: false }}>
      {children}
    </PermissionContext.Provider>
  );
}

export function usePermission() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }

  const hasPermission = (permission: PermissionCode | string) => {
    return context.permissions.has(permission);
  };

  const hasAnyPermission = (permissions: (PermissionCode | string)[]) => {
    return permissions.some(p => context.permissions.has(p));
  };

  return {
    ...context,
    hasPermission,
    hasAnyPermission,
  };
}

/**
 * Declarative component for permission-based rendering.
 * Strictly for UX (Hiding/Showing elements).
 */
export function Can({ 
  permission, 
  anyOf,
  children,
  fallback = null
}: { 
  permission?: PermissionCode | string;
  anyOf?: (PermissionCode | string)[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasPermission, hasAnyPermission } = usePermission();
  
  let allowed = false;
  if (permission) allowed = hasPermission(permission);
  else if (anyOf) allowed = hasAnyPermission(anyOf);

  if (!allowed) return <>{fallback}</>;
  
  return <>{children}</>;
}
