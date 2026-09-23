import type { RoleName, User } from '@/types/api';

export const ROLES = {
  admin: 'Admin',
  supervisor: 'Supervisor',
  analyst: 'Analyst',
  client: 'Client',
} as const satisfies Record<string, RoleName>;

export const ALL_ROLES: RoleName[] = ['Admin', 'Supervisor', 'Analyst', 'Client'];
export const STAFF_ROLES: RoleName[] = ['Admin', 'Supervisor', 'Analyst'];

export function roleOf(user: Pick<User, 'role'> | null | undefined): RoleName | null {
  return user?.role?.name ?? null;
}

export function hasRole(user: Pick<User, 'role'> | null | undefined, roles: RoleName | readonly RoleName[]): boolean {
  const role = roleOf(user);
  if (!role) return false;
  return (Array.isArray(roles) ? roles : [roles]).includes(role);
}
