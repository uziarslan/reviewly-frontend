import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import DashboardPageSkeleton from "./skeletons/DashboardPageSkeleton";

/**
 * Wraps a route so only authenticated users can access it.
 * Shows a dashboard-style skeleton while auth is being checked.
 * If skipTrialGate is false (default), redirects users to /trial if either:
 *   - they haven't completed their trial assessment yet, or
 *   - they don't have an examType picked. The dashboard, sprint, and mock
 *     recommendations all key off examType — without one, the dashboard
 *     would default to "Professional" with zero data and look broken.
 *     This catches legacy users created before examType existed.
 */
const ProtectedRoute = ({ children, skipTrialGate = false }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <DashboardPageSkeleton />;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!skipTrialGate && user) {
    const needsTrial = user.trialAssessment !== true;
    const needsExamType = !user.examType;
    if (needsTrial || needsExamType) {
      return <Navigate to="/trial" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
