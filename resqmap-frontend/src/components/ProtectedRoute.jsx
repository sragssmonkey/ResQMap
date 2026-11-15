
import React from 'react';
import { Navigate } from 'react-router-dom';
import { getSavedUser } from '../services/api';

export default function ProtectedRoute({ children, role }) {

  const token = sessionStorage.getItem('resqmap_access');
  const user = getSavedUser();

  // No authenticated session
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Rescue team must be verified
  if (
    user.role === 'RESCUE_TEAM' &&
    user.is_verified !== true
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Strict role-based access
  if (role && user.role !== role) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
