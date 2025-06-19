// src/components/ProtectedRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Adjust path if necessary

interface ProtectedRouteProps {
  children?: React.ReactNode;
  // If you need different levels of protection (e.g., admin, regular user)
  // you might add a 'requiredRole' prop. For now, we'll keep it simple
  // with just checking if authenticated.
  // requiredRole?: 'admin' | 'user';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // If still loading authentication status, show a loading indicator
  if (loading) {
    // You can replace this with a more sophisticated loading spinner or skeleton
    return <div>Loading authentication...</div>;
  }

  // If not authenticated, redirect to the admin login page
  if (!isAuthenticated) {
    return <Navigate to="/admin" replace />;
  }

  // If authenticated, render the child routes or the element
  return children ? children : <Outlet />;
};

export default ProtectedRoute;