import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AOS from 'aos';
import {
  CompassIcon,
  ToothIcon,
  PlaneIcon,
  PauseWindowIcon,
  BankIcon,
  BackpackIcon,
  HeartBeatIcon,
  CardWalletIcon,
  TriangleFreePlanIcon,
  CirclePremiumWeeklyIcon,
  RectanglePremiumMonthlyIcon,
  HexagonPremiumQuarterlyIcon,
  CheckmarkIcon,
  SendIcon,
  DocumentIcon,
  TwoToneStarIcon
} from '../components/Icons';
import circle1 from '../Assets/1.png';
import circle2 from '../Assets/2.png';
import circle3 from '../Assets/3.png';
import circle4 from '../Assets/4.png';
import circle5 from '../Assets/5.png';
import circle6 from '../Assets/6.png';
import circle7 from '../Assets/7.png';
import circle8 from '../Assets/8.png';
import circle9 from '../Assets/9.png';
import circle10 from '../Assets/10.png';
import circle11 from '../Assets/11.png';

const Pricing = () => {
  const [openFaq, setOpenFaq] = useState(0);

  useEffect(() => {
    AOS.refresh();
  }, []);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? -1 : index);
  };

  const faqs = [
    {
      question: "Do all Premium plans have the same features?",
      answer: "Yes — only the duration and price change."
    },
    {
      question: "Why is the Free Plan limited?",
      answer: "The Free Plan helps you try out Reviewly with limited access. Upgrade to Premium for full features and unlimited usage."
    },
    {
      question: "How do I subscribe to Premium?",
      answer: "Choose your preferred plan, submit the Google Form with your payment details, and we'll activate your account within 24 hours."
    },
    {
      question: "Can I renew Premium later?",
      answer: "Yes, you can renew your subscription anytime by submitting a new payment through the Google Form."
    },
    {
      question: "Will automated payments come in the future?",
      answer: "We're working on implementing automated payment systems to make renewals seamless and convenient."
    },
    {
      question: "Can I switch from Weekly to Monthly or Quarterly?",
      answer: "Yes, you can upgrade your plan anytime. Contact us and we'll help you switch to a different plan duration."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100/30 via-white to-purple-50/40 relative overflow-hidden">
      <Header />

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section - 3 layers: background, decorations, content */}
        <div className='bg-[#F5F4FF]'>
          <section className="relative h-[596px] max-w-[1440px] mx-auto flex items-center">
            {/* Layer 1: Background */}
            <div className="absolute inset-0" aria-hidden="true" />

            {/* Layer 2: Decorative elements (above background, below text) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Profile Images - AOS zoom-in */}
              <div className="absolute top-[10.47px] left-[419px] w-[96px] h-[96px] rounded-full shadow-md overflow-hidden" data-aos="zoom-in" data-aos-duration="500" data-aos-delay="200">
                <img src={circle1} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-[46.47px] left-[95px] w-[56px] h-[56px] rounded-full shadow-md overflow-hidden" data-aos="zoom-in" data-aos-duration="500" data-aos-delay="250">
                <img src={circle2} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-[146.47px] left-[255px] w-[96px] h-[96px] rounded-full shadow-md overflow-hidden" data-aos="zoom-in" data-aos-duration="500" data-aos-delay="300">
                <img src={circle3} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-[219.47px] left-[22px] w-[80px] h-[80px] rounded-full shadow-md overflow-hidden" data-aos="zoom-in" data-aos-duration="500" data-aos-delay="350">
                <img src={circle4} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-[336px] left-[206px] w-[128px] h-[128px] rounded-full shadow-md overflow-hidden" data-aos="zoom-in" data-aos-duration="500" data-aos-delay="400">
                <img src={circle5} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-[519.5px] left-[26px] w-[72px] h-[72px] rounded-full shadow-md overflow-hidden" data-aos="zoom-in" data-aos-duration="500" data-aos-delay="450">
                <img src={circle6} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-[24.47px] left-[891px] w-[80px] h-[80px] rounded-full shadow-md overflow-hidden" data-aos="zoom-in" data-aos-duration="500" data-aos-delay="250">
                <img src={circle7} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-[9.47px] left-[1308px] w-[120px] h-[120px] rounded-full shadow-md overflow-hidden" data-aos="zoom-in" data-aos-duration="500" data-aos-delay="300">
                <img src={circle8} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-[151.47px] left-[1160px] w-[88px] h-[88px] rounded-full shadow-md overflow-hidden" data-aos="zoom-in" data-aos-duration="500" data-aos-delay="350">
                <img src={circle9} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-[299px] left-[1065px] w-[128px] h-[128px] rounded-full shadow-md overflow-hidden" data-aos="zoom-in" data-aos-duration="500" data-aos-delay="400">
                <img src={circle10} alt="" className="w-full h-full object-cover" />
              </div>
              <div className="absolute top-[465.47px] left-[1294px] w-[88px] h-[88px] rounded-full shadow-md overflow-hidden" data-aos="zoom-in" data-aos-duration="500" data-aos-delay="450">
                <img src={circle11} alt="" className="w-full h-full object-cover" />
              </div>

              {/* Decorative Icons - AOS fade-up */}
              <div className="absolute top-[-3.97px] left-[207px]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="350">
                <CompassIcon className="w-10 h-10" />
              </div>
              <div className="absolute top-[154.49px] left-[389px]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="400">
                <ToothIcon className="w-7 h-8" />
              </div>
              <div className="absolute top-[289.84px] left-[155px]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="450">
                <PlaneIcon className="w-7 h-8" />
              </div>
              <div className="absolute top-[469.95px] left-[97px]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="500">
                <BankIcon className="w-7 h-8" />
              </div>
              <div className="absolute top-[38.8px] left-[1106px]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="400">
                <BackpackIcon className="w-10 h-11" />
              </div>
              <div className="absolute top-[127.73px] left-[1304px]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="450">
                <HeartBeatIcon className="w-10 h-11" />
              </div>
              <div className="absolute top-[321.53px] left-[1333px]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="500">
                <CardWalletIcon className="w-10 h-10" />
              </div>
              <div className="absolute top-[407px] left-[484px]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="550">
                <PauseWindowIcon className="w-9 h-9" />
              </div>
            </div>

            {/* Layer 3: Hero content (on top, clickable) - AOS on load */}
            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
              <h1 className="font-sans text-[40px] font-normal text-center text-[#0F172A] mb-[10px]" data-aos="fade-up" data-aos-duration="600" data-aos-delay="0">
                The Reviewly Plans
              </h1>
              <p className="font-sans text-base font-normal text-center text-[#0F172A] mb-[50px] max-w-[480px] mx-auto" data-aos="fade-up" data-aos-duration="600" data-aos-delay="150">
                All-access tools for every reviewer.<br /> Start free, upgrade anytime, review for as long as you need.
              </p>
              <button className="w-full max-w-[270px] h-[80px] rounded-lg bg-yellow-400 hover:bg-yellow-500 font-bold text-[28px] text-[#421A83] tracking-[0.5px] shadow-md transition-all transform hover:scale-105" style={{ fontFamily: 'Roboto, sans-serif' }} data-aos="fade-up" data-aos-duration="600" data-aos-delay="300">
                Start for Free
              </button>
            </div>
          </section>
        </div>

        {/* Pricing Cards - AOS on scroll */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 md:-mt-[120px] pb-[70px]">
          <div className="flex flex-wrap justify-center gap-4">
            {/* Free Plan */}
            <div className="font-sans bg-white h-auto rounded-[12px] px-[20px] py-[24px] shadow-sm text-left relative max-w-[240px] border border-[#EFF0F6]" data-aos="fade-up" data-aos-delay="0">
              <div className="w-[56px] h-[56px] bg-[#EDE8F3] rounded-[16px] flex items-center justify-center mb-4">
                <TriangleFreePlanIcon className="w-7 h-6" />
              </div>
              <div className="mb-1">
                <span className="text-[28px] font-extrabold text-[#45464E]">₱0</span>
                <span className="text-[16px] font-medium text-[#45464E] ml-1">/ always free</span>
              </div>
              <h3 className="text-[16px] font-bold text-[#45464E] mb-4">Free Plan</h3>
              <p className="text-[14px] font-normal text-[#45464E] mb-4">
                For learners trying out Reviewly with limited access.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
                    <CheckmarkIcon className="w-3 h-3" />
                  </span>
                  <span className="text-[14px] font-normal text-[#45464E]">20-item Reviewers</span>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
                    <CheckmarkIcon className="w-3 h-3" />
                  </span>
                  <span className="text-[14px] font-normal text-[#45464E]">Basic Scoring</span>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
                    <CheckmarkIcon className="w-3 h-3" />
                  </span>
                  <span className="text-[14px] font-normal text-[#45464E]">No time limit</span>
                </li>
              </ul>
              <p className="text-[14px] font-normal text-[#431C86]">
                **Great for trying Reviewly before upgrading
              </p>
            </div>

            {/* Premium Weekly */}
            <div className="font-sans bg-white h-auto rounded-[12px] px-[20px] py-[24px] shadow-sm text-left relative max-w-[240px] border border-[#EFF0F6]" data-aos="fade-up" data-aos-delay="100">
              <div className="w-[56px] h-[56px] bg-[#EDE8F3] rounded-[16px] flex items-center justify-center mb-4">
                <CirclePremiumWeeklyIcon className="w-8 h-8" />
              </div>
              <div className="mb-1">
                <span className="text-[28px] font-extrabold text-[#45464E]">₱99</span>
                <span className="text-[16px] font-medium text-[#45464E] ml-1">/ 7 days</span>
              </div>
              <h3 className="text-[16px] font-bold text-[#45464E] mb-4">Premium Weekly</h3>
              <p className="text-[14px] font-normal text-[#45464E] mb-4">
                Full access for a full week — perfect for fast-paced reviewers.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
                    <CheckmarkIcon className="w-3 h-3" />
                  </span>
                  <span className="text-[14px] font-normal text-[#45464E]">Full mock exams</span>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
                    <CheckmarkIcon className="w-3 h-3" />
                  </span>
                  <span className="text-[14px] font-normal text-[#45464E]">AI evaluations & insights</span>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
                    <CheckmarkIcon className="w-3 h-3" />
                  </span>
                  <span className="text-[14px] font-normal text-[#45464E]">Unlimited AI-generated questions</span>
                </li>
              </ul>
              <p className="text-[14px] font-normal text-[#431C86]">
                **Affordable, flexible, and great for quick coverage.
              </p>
            </div>

            {/* Premium Monthly - Popular */}
            <div className="font-sans bg-white h-auto rounded-[12px] px-[20px] py-[24px] shadow-sm text-left relative max-w-[240px] border border-[#EFF0F6]" data-aos="fade-up" data-aos-delay="200">
              <div className="absolute top-4 right-4 bg-[#FFF5CC] text-[#45464E] text-xs font-semibold px-3 py-1.5 rounded-full">
                Popular
              </div>
              <div className="w-[56px] h-[56px] bg-[#EDE8F3] rounded-[16px] flex items-center justify-center mb-4">
                <RectanglePremiumMonthlyIcon className="w-8 h-8" />
              </div>
              <div className="mb-1">
                <span className="text-[28px] font-extrabold text-[#45464E]">₱199</span>
                <span className="text-[16px] font-medium text-[#45464E] ml-1">/ 30 days</span>
              </div>
              <h3 className="text-[16px] font-bold text-[#45464E] mb-4">Premium Monthly</h3>
              <p className="text-[14px] font-normal text-[#45464E] mb-4">
                A full month of all-access — ideal for the typical CSE review timeline.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
                    <CheckmarkIcon className="w-3 h-3" />
                  </span>
                  <span className="text-[14px] font-normal text-[#45464E]">Everything in Premium Weekly</span>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
                    <CheckmarkIcon className="w-3 h-3" />
                  </span>
                  <span className="text-[14px] font-normal text-[#45464E]">Better long-term value</span>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
                    <CheckmarkIcon className="w-3 h-3" />
                  </span>
                  <span className="text-[14px] font-normal text-[#45464E]">Perfect for structured study plans</span>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
                    <CheckmarkIcon className="w-3 h-3" />
                  </span>
                  <span className="text-[14px] font-normal text-[#45464E]">Save about 50% compared to Weekly</span>
                </li>
              </ul>
              <p className="text-[14px] font-normal text-[#431C86]">
                **Great for consistent daily review
              </p>
            </div>

            {/* Premium Quarterly */}
            <div className="font-sans bg-white h-auto rounded-[12px] px-[20px] py-[24px] shadow-sm text-left relative max-w-[240px] border border-[#EFF0F6]" data-aos="fade-up" data-aos-delay="300">
              <div className="w-[56px] h-[56px] bg-[#EDE8F3] rounded-[16px] flex items-center justify-center mb-4">
                <HexagonPremiumQuarterlyIcon className="w-8 h-9" />
              </div>
              <div className="mb-1">
                <span className="text-[28px] font-extrabold text-[#45464E]">₱499</span>
                <span className="text-[16px] font-medium text-[#45464E] ml-1">/ 90 days</span>
              </div>
              <h3 className="text-[16px] font-bold text-[#45464E] mb-4">Premium Quarterly</h3>
              <p className="text-[14px] font-normal text-[#45464E] mb-4">
                Three months of full-access review tools for the best long-term value.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start">
                  <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
                    <CheckmarkIcon className="w-3 h-3" />
                  </span>
                  <span className="text-[14px] font-normal text-[#45464E]">All Premium Monthly features</span>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
                    <CheckmarkIcon className="w-3 h-3" />
                  </span>
                  <span className="text-[14px] font-normal text-[#45464E]">Save over 60% compared to Weekly plans</span>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
                    <CheckmarkIcon className="w-3 h-3" />
                  </span>
                  <span className="text-[14px] font-normal text-[#45464E]">Save over 16% compared to Monthly plans</span>
                </li>
                <li className="flex items-start">
                  <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
                    <CheckmarkIcon className="w-3 h-3" />
                  </span>
                  <span className="text-[14px] font-normal text-[#45464E]">More time = deeper mastery</span>
                </li>
              </ul>
              <p className="text-[14px] font-normal text-[#431C86]">
                **Perfect for long-term or multi-exam preparation
              </p>
            </div>
          </div>
        </section>

        {/* How It Works Section - AOS on scroll */}
        <section className="font-sans mx-auto max-w-[878px] mb-[40px] px-4 sm:px-6 lg:px-8">
          <h2 className="text-[28px] font-normal text-center text-[#0F172A] mb-6" data-aos="fade-up" data-aos-delay="0">
            How It Works
          </h2>
          <p className="text-[16px] font-normal text-center text-[#0F172A] mb-6" data-aos="fade-up" data-aos-delay="50">
            No complicated steps — just pick a plan, send your details, and start reviewing.
          </p>

          {/* Responsive grid: 1 col (stacked) on mobile with in-flow connectors; 5 cols on desktop so connectors stay visible in 16px gaps */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_16px_1fr_16px_1fr] gap-y-4 md:gap-y-0 gap-x-0 md:gap-x-4 items-start">
            {/* Step 1 — max 282px */}
            <div className="flex flex-col items-center text-center w-full max-w-[282px] mx-auto md:mx-0 md:justify-self-center" data-aos="fade-up" data-aos-delay="100">
              <div className="w-[56px] h-[56px] bg-[#F6F4F9] rounded-[16px] flex items-center justify-center shadow-sm mb-4">
                <SendIcon className="w-[23px] h-[23px]" />
              </div>
              <h3 className="text-[14px] font-bold text-[#45464E] mb-2">Pick a Plan</h3>
              <p className="text-[12px] font-normal text-center text-[#45464E] max-w-[242px]">
                Choose the plan that works best for your study style and timeline.
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
                <DocumentIcon className="w-[22px] h-6" />
              </div>
              <h3 className="text-[14px] font-bold text-[#45464E] mb-2">Submit the Google Form</h3>
              <p className="text-[12px] font-normal text-center text-[#45464E] max-w-[242px]">
                You start on Free. To upgrade, send your google form and your payment receipt.
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
                <TwoToneStarIcon className="w-6 h-6" />
              </div>
              <h3 className="text-[14px] font-bold text-[#45464E] mb-2">We activate your account</h3>
              <p className="text-[12px] font-normal text-center text-[#45464E] max-w-[242px]">
                We verify your payment ASAP so you can start reviewing.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section - AOS on scroll */}
        <section className="py-[56px] bg-[#F5F4FF] px-4 sm:px-6 lg:px-8">
          <h2 className="font-sans text-[32px] font-normal text-center text-[#0F172A] mb-10" data-aos="fade-up" data-aos-delay="0">
            Pricing FAQ
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="max-w-[720px] mx-auto bg-white rounded-lg shadow-md overflow-hidden" data-aos="fade-up" data-aos-delay={50 + index * 50}>
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="font-sans text-base font-semibold text-[#0F172A]">
                    {index + 1}. {faq.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transform transition-transform ${openFaq === index ? 'rotate-180' : ''
                      }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="font-sans text-base font-normal px-6 pb-4 text-[#0F172A]">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;
