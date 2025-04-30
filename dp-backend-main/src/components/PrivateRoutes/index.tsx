import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks';

export const PrivateRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    
    return null;
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};
