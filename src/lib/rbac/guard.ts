import 'server-only';
import { getUserSession } from './session';
import { can } from './permissions';
import type { Resource, Action } from './permissions';
import type { UserSession } from './session';

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export async function withPermission<T>(
  resource: Resource,
  action: Action,
  fn: (session: UserSession) => Promise<T>
): Promise<T> {
  const session = await getUserSession();

  if (!session) {
    throw new UnauthorizedError('Not authenticated');
  }

  // Normalize role to uppercase to match PERMISSIONS keys
  let normalizedRole = session.role ? session.role.toUpperCase() as Role : session.role;
  if (normalizedRole === 'SUPER_ADMIN' as any) {
    normalizedRole = 'OWNER';
  }

  console.log('[RBAC_GUARD] role:', session.role, 'normalized:', normalizedRole, 'resource:', resource, 'action:', action);
  const isAllowed = can(normalizedRole, resource, action);
  console.log('[RBAC_GUARD] can result:', isAllowed);

  if (!isAllowed) {
    throw new UnauthorizedError(
      `Role '${session.role}' (normalized: ${normalizedRole}) is not allowed to '${action}' on '${resource}'`
    );
  }

  return fn(session);
}
