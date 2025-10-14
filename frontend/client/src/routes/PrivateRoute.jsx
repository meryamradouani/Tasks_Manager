import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';

const PrivateRoute = ({ allowedRoles = [] }) => {
  const { user, loading, isInitialized } = useUser();

  // Afficher un loader pendant le chargement initial
  if (!isInitialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Rediriger vers login si pas d'utilisateur
  if (!user) {
    console.log("No user found, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // Vérifier les rôles si spécifiés
  if (allowedRoles.length > 0) {
    const userRole = user.role || 'user';
    console.log("Checking role:", userRole, "Allowed roles:", allowedRoles);
    
    if (!allowedRoles.includes(userRole)) {
      console.log("Role not allowed, redirecting");
      // Rediriger vers la page appropriée selon le rôle
      if (userRole === 'admin') {
        return <Navigate to="/admin/dashboard" replace />;
      } else {
        return <Navigate to="/user/dashboard" replace />;
      }
    }
  }

  console.log("User authenticated, rendering protected route");
  // Afficher les routes enfants
  return <Outlet />;
};

export default PrivateRoute;