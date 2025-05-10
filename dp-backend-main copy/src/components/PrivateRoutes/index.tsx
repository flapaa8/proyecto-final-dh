import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks';

export const PrivateRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="tw-w-full tw-h-full tw-flex tw-items-center tw-justify-center">
        <p>Cargando...</p>
      </div>
    );
  }
  

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};
