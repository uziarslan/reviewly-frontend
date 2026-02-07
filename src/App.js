import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Pricing from './pages/Pricing';
import AOS from 'aos';
import 'aos/dist/aos.css';

function App() {
  useEffect(() => {
    AOS.init({
      once: true,
      offset: 80,
      duration: 600,
      easing: 'ease-out-cubic',
    });
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
      </Routes>
    </Router>
  );
}

export default App;
