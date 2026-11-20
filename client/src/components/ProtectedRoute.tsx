import { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store/hooks';
import type { UserRole } from '@/types';

function isTokenValid(token: string): boolean {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    if (typeof payload.exp !== 'number') return false;
    return Date.now() < payload.exp * 1000;
  } catch {
    return false;
  }
}

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);

  // Redirect to dashboard after showing access denied message briefly
  useEffect(() => {
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [allowedRoles, user, navigate]);

  if (!token || !isTokenValid(token)) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div
        className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center p-8"
        data-icod-id="src_components_protectedroute_tsx_6f1c">
        <h2
          className="text-2xl font-bold text-foreground"
          data-icod-id="src_components_protectedroute_tsx_e1fb">Access Denied</h2>
        <p
          className="text-muted-foreground"
          data-icod-id="src_components_protectedroute_tsx_3767">
          You do not have permission to view this page. Your current role is{' '}
          <span
            className="font-semibold capitalize"
            data-icod-id="src_components_protectedroute_tsx_d193">{user.role}</span>.
          {' '}Redirecting to dashboard...
        </p>
      </div>
    );
  }

  return <Outlet />;
}
