/**
 * Protects admin routes: only users with role === 'Admin' can access.
 * Otherwise redirects to home or shows 403 when not authenticated.
 */
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isAdmin = user.role != null && String(user.role).toLowerCase() === 'admin';
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <h1 className="text-xl font-semibold text-gray-800">Không có quyền truy cập</h1>
        <p className="text-gray-600 mt-2">Chỉ tài khoản Admin mới có thể vào trang này.</p>
        <Link to="/" className="mt-4 text-blue-600 hover:underline">
          Về trang chủ
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
