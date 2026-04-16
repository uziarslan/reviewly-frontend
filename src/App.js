import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Refund from './pages/Refund';
import AllReviewers from './pages/AllReviewers';
import FAQ from './pages/FAQ';
import MyLibrary from './pages/MyLibrary';
import AccountSettings from './pages/AccountSettings';
import UpdateSubscription from './pages/UpdateSubscription';
import UpgradeToPremium from './pages/UpgradeToPremium';
import HelpCenter from './pages/HelpCenter';
import ExamDetails from './pages/ExamDetails';
import Exam from './pages/Exam';
import ExamResultsLoading from './pages/ExamResultsLoading';
import ExamReview from './pages/ExamReview';
import ShareResult from './pages/ShareResult';
import TrialAssessment from './pages/TrialAssessment';
import TrialResult from './pages/TrialResult';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { AOS_CONFIG } from './config/aos';
import { capturePageView } from './services/analytics';

function AppContent() {
  const location = useLocation();
  useEffect(() => {
    AOS.init(AOS_CONFIG);
  }, []);
  useEffect(() => {
    capturePageView(location.pathname);
  }, [location.pathname]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/refund" element={<Refund />} />
        <Route path="/pricing/upgrade" element={<UpgradeToPremium />} />
        <Route path="/share/:shareToken" element={<ShareResult />} />
        <Route path="/faq" element={<FAQ />} />

        {/* Trial assessment flow (shown once for new/existing users) */}
        <Route path="/trial" element={<ProtectedRoute skipTrialGate><TrialAssessment /></ProtectedRoute>} />
        <Route path="/trial/exam/:id" element={<ProtectedRoute skipTrialGate><Exam isTrial /></ProtectedRoute>} />
        <Route path="/trial/results/:attemptId" element={<ProtectedRoute skipTrialGate><TrialResult /></ProtectedRoute>} />

        {/* Protected dashboard routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Navigate to="/dashboard/all-reviewers" replace /></ProtectedRoute>} />
        <Route path="/dashboard/all-reviewers" element={<ProtectedRoute><AllReviewers /></ProtectedRoute>} />
        <Route path="/dashboard/library" element={<ProtectedRoute><MyLibrary /></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
        <Route path="/dashboard/settings/update-subscription" element={<ProtectedRoute><UpdateSubscription /></ProtectedRoute>} />
        <Route path="/dashboard/help" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
        <Route path="/dashboard/exam/:id/start" element={<ProtectedRoute><Exam /></ProtectedRoute>} />
        <Route path="/dashboard/results/:attemptId" element={<ProtectedRoute><ExamResultsLoading /></ProtectedRoute>} />
        <Route path="/dashboard/review/:attemptId" element={<ProtectedRoute><ExamReview /></ProtectedRoute>} />
        <Route path="/dashboard/exam/:id" element={<ProtectedRoute><ExamDetails /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
