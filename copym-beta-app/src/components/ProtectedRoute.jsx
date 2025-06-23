// src/components/ProtectedRoute.jsx
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // Show loading while checking auth
  if (!user) return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;
