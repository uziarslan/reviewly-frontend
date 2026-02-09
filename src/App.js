import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
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
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/dashboard" element={<Navigate to="/dashboard/all-reviewers" replace />} />
        <Route path="/dashboard/all-reviewers" element={<AllReviewers />} />
        <Route path="/dashboard/library" element={<MyLibrary />} />
        <Route path="/dashboard/settings" element={<AccountSettings />} />
        <Route path="/dashboard/settings/update-subscription" element={<UpdateSubscription />} />
        <Route path="/dashboard/help" element={<HelpCenter />} />
        <Route path="/dashboard/exam/:id/start" element={<Exam />} />
        <Route path="/dashboard/exam/:id/results" element={<ExamResultsLoading />} />
        <Route path="/dashboard/exam/:id/review" element={<ExamReview />} />
        <Route path="/dashboard/exam/:id" element={<ExamDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
