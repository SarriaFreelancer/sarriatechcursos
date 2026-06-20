export type RoleName = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';

export const ROLE_LABELS: Record<RoleName, string> = {
  ADMIN: 'Administrador',
  INSTRUCTOR: 'Formador',
  STUDENT: 'Estudiante',
};

export function getRoleLabel(roleName?: string): string {
  if (!roleName) return 'Estudiante';
  return ROLE_LABELS[roleName as RoleName] ?? roleName;
}

export function getDefaultRoute(roleName?: string): string {
  switch (roleName) {
    case 'ADMIN':
      return '/admin';
    case 'INSTRUCTOR':
      return '/instructor';
    default:
      return '/dashboard';
  }
}

export function isInstructorOrAdmin(roleName?: string): boolean {
  return roleName === 'INSTRUCTOR' || roleName === 'ADMIN';
}
