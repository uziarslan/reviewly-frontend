import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardPageSkeleton from "./skeletons/DashboardPageSkeleton";

/**
 * Wraps a route so only authenticated users can access it.
 * Shows a dashboard-style skeleton while auth is being checked.
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <DashboardPageSkeleton />;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
