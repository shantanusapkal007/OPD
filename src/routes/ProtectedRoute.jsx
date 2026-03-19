import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { PageLoader } from '../components/common/LoadingSpinner';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (roles && user && !roles.includes(user.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <div className="w-16 h-16 rounded-full bg-danger-50 flex items-center justify-center mb-4">
          <span className="text-2xl">🚫</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Access Denied</h2>
        <p className="text-sm text-gray-500">You don't have permission to view this page.</p>
      </div>
    );
  }

  return children;
}
