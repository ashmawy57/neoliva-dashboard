import { getUserSession } from '@/lib/rbac/session';
import { can } from '@/lib/rbac/permissions';
import type { Resource, Action } from '@/lib/rbac/permissions';

type Props = {
  resource: Resource;
  action: Action;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

// Server Component — no "use client"
export async function PermissionGate({ resource, action, children, fallback = null }: Props) {
  const session = await getUserSession();
  if (!session) return <>{fallback}</>;
  return can(session.role, resource, action) ? <>{children}</> : <>{fallback}</>;
}
