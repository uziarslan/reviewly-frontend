import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardPageSkeleton from "./skeletons/DashboardPageSkeleton";

/**
 * Wraps a route so only authenticated users can access it.
 * Shows a dashboard-style skeleton while auth is being checked.
 * If skipTrialGate is false (default), redirects users who haven't
 * completed their trial assessment to /trial.
 */
const ProtectedRoute = ({ children, skipTrialGate = false }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <DashboardPageSkeleton />;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!skipTrialGate && user && user.trialAssessment === false) {
    return <Navigate to="/trial" replace />;
  }

  return children;
};

export default ProtectedRoute;
