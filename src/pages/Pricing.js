import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AOS from 'aos';
import GoogleAuthButton from '../components/GoogleAuthButton';
import {
  TimerIcon,
  FileChartIcon,
  RocketIcon,
  YellowUnderline,
} from '../components/Icons';
import PlanCards from '../components/PlanCards';

const Chevron = ({ isOpen }) => (
  <svg
    width="20" height="20" viewBox="0 0 20 20" fill="none"
    xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
    style={{ transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
  >
    <path d="M5 7.5L10 12.5L15 7.5" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AccordionItem = ({ faq, index, isOpen, onToggle }) => {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden"
      data-aos="fade-up" data-aos-delay={50 + index * 50}
    >
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
        aria-expanded={isOpen}
      >
        <span className="font-inter font-semibold text-[#0F172A] text-[14px] sm:text-[16px]">
          {index + 1}. {faq.question}
        </span>
        <Chevron isOpen={isOpen} />
      </button>
      <div ref={contentRef} style={{ height, overflow: 'hidden', transition: 'height 0.3s ease' }}>
        <div className="font-inter font-normal px-6 pb-4 text-[#45464E] text-[13px] sm:text-[15px] leading-[1.7]">
          {faq.answer}
        </div>
      </div>
    </div>
  );
};

const Pricing = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  useEffect(() => {
    AOS.refresh();
  }, []);

  const faqs = [
    {
      question: "What's the difference between Free and Premium?",
      answer: "Free is for checking readiness (mock + score + explanations). Premium is for improvement (topic-level breakdown, sprint plans, focused practice packs, and extra mock forms)."
    },
    {
      question: "Is the Readiness Check really free?",
      answer: "Yes. No card needed. Start free and view your results anytime."
    },
    {
      question: "What do I get in Premium?",
      answer: "Premium unlocks: topic-level breakdown inside each subject, 7-day / 14-day sprint plans (daily missions), focused practice packs per weak topic, extra full mocks (Form B + C), and mistake review + progress tracking."
    },
    {
      question: "How long does Premium access last?",
      answer: "Premium is one-time exam-cycle access — valid until the August CSE."
    },
    {
      question: "Can I upgrade later?",
      answer: "Yes. Start free first, then upgrade anytime when you're ready for a more structured path."
    },
    {
      question: "Is Premium a subscription?",
      answer: "No — it's exam-cycle access (one-time), valid until the August CSE."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="bg-[#F5F4FF] py-[64px] sm:py-[80px] lg:py-[100px] px-6 sm:px-8">
          <div className="max-w-[720px] mx-auto text-center">
            <h1
              className="font-inter font-semibold text-[#0F172A] text-[28px] sm:text-[36px] lg:text-[52px] leading-[1.2] mb-[40px]"
              data-aos="fade-up" data-aos-duration="500" data-aos-delay="0"
            >
              Start free. Upgrade when you're{' '}
              <span className="relative inline-block pb-[15px]">
                ready to improve.
                <YellowUnderline className="absolute left-0 bottom-0 w-full h-[15px]" />
              </span>
            </h1>

            <p
              className="font-inter text-[#0F172A] text-[16px] sm:text-[18px] lg:text-[22px] leading-[1.7] max-w-[660px] mx-auto mb-[40px]"
              data-aos="fade-up" data-aos-duration="500" data-aos-delay="100"
            >
              Take the Readiness Check for free. Unlock sprint plans + topic-level breakdown when you want a clearer path to passing.
            </p>

            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-[24px]"
              data-aos="fade-up" data-aos-duration="500" data-aos-delay="200"
            >
              <GoogleAuthButton
                label="Start Free Readiness Check"
                redirectTo="/dashboard/all-reviewers"
                className="w-full sm:w-auto px-[20px] sm:px-[24px] py-[12px] sm:py-[14px] lg:h-[56px] lg:py-0 rounded-[8px] bg-[#FFC92A] hover:bg-[#f0bb1f] font-inter font-bold text-[16px] sm:text-[18px] lg:text-[20px] text-[#3B1A71] transition-colors flex items-center justify-center whitespace-nowrap"
              />
              <a
                href="#plans"
                className="w-full sm:w-auto px-[20px] sm:px-[24px] py-[12px] sm:py-[14px] lg:h-[56px] lg:py-0 rounded-[8px] border border-[#0F172ACC] font-inter font-semibold text-[16px] sm:text-[18px] lg:text-[20px] text-[#0F172ACC] hover:bg-[#0F172ACC] hover:text-white transition-colors flex items-center justify-center whitespace-nowrap"
              >
                See Premium Features
              </a>
            </div>

            <p
              className="font-inter text-[#0F172A] text-[13px] sm:text-[14px] lg:text-[18px]"
              data-aos="fade-up" data-aos-duration="500" data-aos-delay="250"
            >
              No credit card for free. Upgrade anytime.
            </p>
          </div>
        </section>

        {/* Pricing Cards - AOS on scroll */}
        <section id="plans" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-[-64px] pb-[70px]">
          <PlanCards />
        </section>

        {/* How It Works Section - AOS on scroll */}
        <section className="font-sans mx-auto max-w-[1000px] mb-[40px] px-4 sm:px-6 lg:px-8">
          <h2 className="text-[28px] font-normal text-center text-[#0F172A] mb-6" data-aos="fade-up" data-aos-delay="0">
            How upgrading works
          </h2>
          <p className="text-[16px] font-normal text-center text-[#0F172A] mb-6" data-aos="fade-up" data-aos-delay="50">
            Start free, then upgrade only when you want a structured plan.
          </p>

          {/* Responsive grid: 1 col (stacked) on mobile with in-flow connectors; 5 cols on desktop so connectors stay visible in 16px gaps */}
          <div className="mb-[24px] grid grid-cols-1 md:grid-cols-[1fr_16px_1fr_16px_1fr] gap-y-4 md:gap-y-0 gap-x-0 md:gap-x-4 items-start">
            {/* Step 1 — max 282px */}
            <div className="flex flex-col items-center text-center w-full max-w-[282px] mx-auto md:mx-0 md:justify-self-center" data-aos="fade-up" data-aos-delay="100">
              <div className="w-[56px] h-[56px] bg-[#F6F4F9] rounded-[16px] flex items-center justify-center shadow-sm mb-4">
                <TimerIcon className="w-[23px] h-[23px]" />
              </div>
              <h3 className="text-[14px] font-bold text-[#45464E] mb-2">Start with the free Readiness Check</h3>
              <p className="text-[12px] font-normal text-center text-[#45464E] max-w-[242px]">
                Take a mock and view your Readiness Score + breakdown.
              </p>
            </div>

            {/* Connector 1 — vertical on mobile (centered), horizontal on desktop (aligned to icon center) */}
            <div className="flex flex-col md:flex-row items-center justify-center py-2 md:py-0 md:relative md:min-h-0 md:justify-self-center overflow-visible" data-aos="fade" data-aos-delay="150" aria-hidden="true">
              <div className="flex flex-col md:flex-row items-center w-auto md:w-[160px] md:absolute md:left-1/2 md:top-[28px] md:-translate-x-1/2 md:-translate-y-1/2">
                <span className="w-2 h-2 rounded-full bg-[#FFC92A] flex-shrink-0" />
                <div className="w-0 flex-1 border-l md:border-l-0 md:border-t border-dashed border-[#FFC92A] min-h-[60px] md:min-h-0 md:h-0 min-w-0 md:flex-1" style={{ borderWidth: '1px' }} />
                <span className="w-2 h-2 rounded-full bg-[#FFC92A] flex-shrink-0" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center w-full max-w-[282px] mx-auto md:mx-0 md:justify-self-center" data-aos="fade-up" data-aos-delay="200">
              <div className="w-[56px] h-[56px] bg-[#F6F4F9] rounded-[16px] flex items-center justify-center shadow-sm mb-4">
                <FileChartIcon className="w-[22px] h-6" />
              </div>
              <h3 className="text-[14px] font-bold text-[#45464E] mb-2">Decide if you want an improvement plan</h3>
              <p className="text-[12px] font-normal text-center text-[#45464E] max-w-[242px]">
                If you’re happy just checking readiness, stay on Free. No pressure.
              </p>
            </div>

            {/* Connector 2 — vertical on mobile (centered), horizontal on desktop (aligned to icon center) */}
            <div className="flex flex-col md:flex-row items-center justify-center py-2 md:py-0 md:relative md:min-h-0 md:justify-self-center overflow-visible" data-aos="fade" data-aos-delay="250" aria-hidden="true">
              <div className="flex flex-col md:flex-row items-center w-auto md:w-[160px] md:absolute md:left-1/2 md:top-[28px] md:-translate-x-1/2 md:-translate-y-1/2">
                <span className="w-2 h-2 rounded-full bg-[#FFC92A] flex-shrink-0" />
                <div className="w-0 flex-1 border-l md:border-l-0 md:border-t border-dashed border-[#FFC92A] min-h-[60px] md:min-h-0 md:h-0 min-w-0 md:flex-1" style={{ borderWidth: '1px' }} />
                <span className="w-2 h-2 rounded-full bg-[#FFC92A] flex-shrink-0" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center w-full max-w-[282px] mx-auto md:mx-0 md:justify-self-center" data-aos="fade-up" data-aos-delay="300">
              <div className="w-[56px] h-[56px] bg-[#F6F4F9] rounded-[16px] flex items-center justify-center shadow-sm mb-4">
                <RocketIcon className="w-6 h-6" />
              </div>
              <h3 className="text-[14px] font-bold text-[#45464E] mb-2">Upgrade to unlock Premium until the CSE</h3>
              <p className="text-[12px] font-normal text-center text-[#45464E] max-w-[242px]">
                Get topic-level breakdown, sprint plans, focused practice packs, and multiple mock forms.
              </p>
            </div>
          </div>
          <p className='font-inter text-[16px] text-center text-[#45464E]' data-aos="fade-up" data-aos-delay="350">
            Premium is one-time exam-cycle access — valid until the August CSE.
          </p>
        </section>

        {/* FAQ Section - AOS on scroll */}
        <section className="py-[56px] bg-[#F5F4FF] px-4 sm:px-6 lg:px-8">
          <h2 className="font-inter text-[24px] sm:text-[28px] lg:text-[32px] font-normal text-center text-[#0F172A] mb-10" data-aos="fade-up" data-aos-delay="0">
            Pricing FAQ
          </h2>

          <div className="flex flex-col gap-3 max-w-[720px] mx-auto">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                faq={faq}
                index={index}
                isOpen={openFaqIndex === index}
                onToggle={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
              />
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;