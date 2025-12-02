import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Wait for auth initialization before redirecting
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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