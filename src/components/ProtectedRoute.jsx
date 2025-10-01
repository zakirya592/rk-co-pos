import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user } = useAuth();
  const location = useLocation();

  // If user is not logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no specific roles are required or user has the required role, render the children
  if (allowedRoles.length === 0 || (user.role && allowedRoles.includes(user.role))) {
    return children;
  }
 toast.error("You are not authorized to use this page");
  // If user doesn't have the required role, redirect to dashboard or home
  return <Navigate to="/Navigation" replace />;
};

export default ProtectedRoute;