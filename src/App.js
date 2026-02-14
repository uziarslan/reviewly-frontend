import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import AllReviewers from './pages/AllReviewers';
import MyLibrary from './pages/MyLibrary';
import AccountSettings from './pages/AccountSettings';
import UpdateSubscription from './pages/UpdateSubscription';
import HelpCenter from './pages/HelpCenter';
import ExamDetails from './pages/ExamDetails';
import LibraryExamDetails from './pages/LibraryExamDetails';
import Exam from './pages/Exam';
import ExamResultsLoading from './pages/ExamResultsLoading';
import ExamReview from './pages/ExamReview';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { AOS_CONFIG } from './config/aos';

function App() {
  useEffect(() => {
    AOS.init(AOS_CONFIG);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        {/* Protected dashboard routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Navigate to="/dashboard/all-reviewers" replace /></ProtectedRoute>} />
        <Route path="/dashboard/all-reviewers" element={<ProtectedRoute><AllReviewers /></ProtectedRoute>} />
        <Route path="/dashboard/library" element={<ProtectedRoute><MyLibrary /></ProtectedRoute>} />
        <Route path="/dashboard/library/:id" element={<ProtectedRoute><LibraryExamDetails /></ProtectedRoute>} />
        <Route path="/dashboard/settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
        <Route path="/dashboard/settings/update-subscription" element={<ProtectedRoute><UpdateSubscription /></ProtectedRoute>} />
        <Route path="/dashboard/help" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
        <Route path="/dashboard/exam/:id/start" element={<ProtectedRoute><Exam /></ProtectedRoute>} />
        <Route path="/dashboard/results/:attemptId" element={<ProtectedRoute><ExamResultsLoading /></ProtectedRoute>} />
        <Route path="/dashboard/review/:attemptId" element={<ProtectedRoute><ExamReview /></ProtectedRoute>} />
        <Route path="/dashboard/exam/:id" element={<ProtectedRoute><ExamDetails /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
