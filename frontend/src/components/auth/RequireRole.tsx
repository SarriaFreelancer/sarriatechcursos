import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { getDefaultRoute } from '../../lib/roles';

type RequireRoleProps = {
  roleNames: string[];
  children: ReactNode;
  fallback?: string;
};

export function RequireRole({ roleNames, children, fallback }: RequireRoleProps) {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !roleNames.includes(user.roleName)) {
    return <Navigate to={fallback ?? getDefaultRoute(user?.roleName)} replace />;
  }

  return children;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const token = useAuthStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
