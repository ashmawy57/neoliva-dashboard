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

  if (!can(session.role, resource, action)) {
    throw new UnauthorizedError(
      `Role '${session.role}' is not allowed to '${action}' on '${resource}'`
    );
  }

  return fn(session);
}
