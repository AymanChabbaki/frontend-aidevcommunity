import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles is specified, check if user has required role
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = user?.role || 'USER';
    
    if (!allowedRoles.includes(userRole)) {
      // Redirect to appropriate dashboard based on user role
      if (userRole === 'ADMIN') {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (userRole === 'STAFF') {
        return <Navigate to="/staff/dashboard" replace />;
      } else {
        return <Navigate to="/dashboard" replace />;
      }
    }
  }

  return <>{children}</>;
};