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
import ExamDetails from './pages/ExamDetails';
import Exam from './pages/Exam';
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
        <Route path="/dashboard/exam/:id/start" element={<Exam />} />
        <Route path="/dashboard/exam/:id" element={<ExamDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
