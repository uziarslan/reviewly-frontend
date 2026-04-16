import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingField from '../components/FloatingField';
import gcashQR from '../Assets/gcashQR.png';

const UpgradeToPremium = () => {
  const [form, setForm] = useState({
    email: '',
    gcashRef: '',
    gcashName: '',
    proof: null,
  });
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    if (file) setForm({ ...form, proof: file });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // submission logic here
  };

  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      <Header />

      <main className="max-w-[1240px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Breadcrumb */}
        <nav className="text-[12px] sm:text-[14px] text-[#45464E] mb-[16px] sm:mb-[24px] flex items-center gap-1">
          <Link to="/pricing" className="hover:underline text-[#45464E]">Pricing</Link>
          <span>&gt;</span>
          <span className="text-[#6E43B9] font-medium">Upgrade to Premium</span>
        </nav>

        {/* Section 1: Product overview */}
        <div className="max-w-[960px] mx-auto bg-white rounded-[12px] border border-[#EFF0F6] py-[24px] sm:py-[40px] px-[16px] sm:px-[24px] mb-[16px] sm:mb-[24px]" style={{ boxShadow: '0px 1px 8px 0px #14142B0A' }}>
          <h1 className="font-inter font-medium text-[#45464E] text-[16px] sm:text-[18px] lg:text-[20px] mb-[16px] sm:mb-[24px]">
            Upgrade to Premium
          </h1>
          <p className="font-inter text-[#45464E] text-[13px] sm:text-[15px] lg:text-[16px] leading-[1.7]">
            Unlock the full Reviewly improvement system for this exam cycle. Get a clear picture of your readiness, and a guided system to improve your weakest areas before the exam.
          </p>
          <p className="font-inter font-bold text-[#45464E] text-[13px] sm:text-[15px] lg:text-[16px] mb-[16px] sm:mb-[24px]">
            Know exactly what to fix — and follow a clear path to passing the CSE.
          </p>

          <div className="mb-[4px] flex items-center gap-[8px]">
            <span className="font-inter font-extrabold text-[#45464E] text-[22px] sm:text-[28px]">₱349</span>
            <span className="font-inter text-[#45464E] text-[12px] sm:text-[14px] lg:text-[16px]">/ Access valid until August 9 CSE only</span>
          </div>
          <p className="font-inter font-bold text-[#45464E] text-[13px] sm:text-[15px] lg:text-[16px] mb-[16px] sm:mb-[24px]">Premium - Improvement Pack</p>

          <p className="font-inter font-bold text-[#45464E] text-[13px] sm:text-[15px] lg:text-[16px] mb-2">What Premium unlocks</p>
          <ul className="space-y-2 pl-3">
            {[
              'More realistic mock exams (not just one set)',
              'Topic-level breakdown so you know exactly what to fix',
              'A guided 7-day plan based on your weakest areas',
              'Retake anytime with new question sets',
              'Practice packs focused on your weak topics',
              'Track your progress and fix recurring mistakes',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 font-inter text-[#45464E] text-[13px] sm:text-[15px] lg:text-[16px]">
                <span className="mt-[6px] w-[5px] h-[5px] rounded-full bg-[#45464E] flex-shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Section 2: How to upgrade */}
        <div className="max-w-[960px] mx-auto bg-white rounded-[12px] border border-[#EFF0F6] py-[24px] sm:py-[40px] px-[16px] sm:px-[24px] mb-[16px] sm:mb-[24px]" style={{ boxShadow: '0px 1px 8px 0px #14142B0A' }}>
          <h2 className="font-inter font-medium text-[#45464E] text-[16px] sm:text-[18px] lg:text-[20px] mb-[16px] sm:mb-[24px]">
            How to upgrade
          </h2>

          <div className="flex flex-col sm:flex-row gap-8">
            {/* Steps */}
            <div className="flex-1 max-w-[390px]">
              <ol className="space-y-3 mb-2">
                {[
                  'Scan the QR code using GCash and complete your payment',
                  'Save your GCash reference number',
                  'Fill out the form below',
                  "We'll verify and activate your account",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2 font-inter text-[#45464E] text-[13px] sm:text-[15px] lg:text-[16px]">
                    <span className="flex-shrink-0">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
              <p className="font-inter text-[#45464E] text-[13px] sm:text-[15px] lg:text-[16px] leading-[1.7] mb-[16px] sm:mb-[24px]">
                Activation time: usually <strong>within 1–6 hours</strong><br />
                You'll get access automatically once your payment is verified.
              </p>
              <div className="font-inter text-[#45464E] text-[13px] sm:text-[15px] lg:text-[16px]">
                <p className="font-bold mb-2">Temporary payment setup</p>
                <p className="leading-[1.7]">
                  Payments are currently received via our Product Lead (Jochelle Santos) while we finalize our official merchant account.<br />
                  All payments are verified and securely applied to your Reviewly account.
                </p>
              </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center flex-shrink-0">
              <p className="font-inter font-bold text-[#45464E] text-[13px] sm:text-[15px] lg:text-[16px] mb-[10px]">Scan to Pay (GCash)</p>
              <img
                src={gcashQR}
                alt="GCash QR code"
                className="w-[140px] h-[140px] sm:w-[260px] sm:h-[260px] lg:w-[340px] lg:h-[340px] object-cover"
              />
              <p className="font-inter text-[#45464E] text-[12px] sm:text-[14px] lg:text-[16px] mt-[10px] text-center">
                ₱349 – Exact amount already set
              </p>
            </div>
          </div>
        </div>

        {/* Section 3: Payment Confirmation Form */}
        <div className="max-w-[960px] mx-auto bg-white rounded-[12px] border border-[#EFF0F6] py-[24px] sm:py-[40px] px-[16px] sm:px-[24px] mb-[16px] sm:mb-[24px]" style={{ boxShadow: '0px 1px 8px 0px #14142B0A' }}>
          <h2 className="font-inter font-bold text-[#45464E] text-[16px] sm:text-[18px] lg:text-[20px] mb-[16px] sm:mb-[24px]">
            Payment Confirmation
          </h2>
          <p className="font-inter text-[#45464E] text-[13px] sm:text-[15px] lg:text-[16px] mb-[16px] sm:mb-[24px]">
            Already paid? Fill this out so we can activate your Premium access.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="w-full sm:max-w-[440px]">
              <FloatingField
                id="email"
                label="Email Address"
                type="email"
                value={form.email}
                onChange={(val) => setForm({ ...form, email: val })}
                required
              />
              <span className="font-inter text-[#6C737F] text-[11px] sm:text-[12px] mt-1 block">Use the same email you used to sign in to Reviewly.</span>
            </div>

            {/* GCash fields */}
            <div className="flex flex-col sm:flex-row gap-[16px]">
              <div className="flex-1">
                <FloatingField
                  id="gcashRef"
                  label="GCash Reference Number"
                  value={form.gcashRef}
                  onChange={(val) => setForm({ ...form, gcashRef: val })}
                  required
                />
                <span className="font-inter text-[#6C737F] text-[11px] sm:text-[12px] mt-1 block">You can find this in your GCash receipt after payment.</span>
              </div>
              <div className="flex-1">
                <FloatingField
                  id="gcashName"
                  label="GCash Account Name"
                  value={form.gcashName}
                  onChange={(val) => setForm({ ...form, gcashName: val })}
                  required
                />
                <span className="font-inter text-[#6C737F] text-[11px] sm:text-[12px] mt-1 block">This helps us verify your payment faster.</span>
              </div>
            </div>

            {/* Proof of payment upload */}
            <div className="flex flex-col gap-[16px] sm:gap-[24px]">
              <div
                className={`rounded-[8px] border border-[#D2D6DB] py-[20px] sm:py-[32px] px-[16px] sm:px-[24px] flex flex-col sm:flex-row items-start gap-4 cursor-pointer transition-colors ${dragOver ? 'bg-[#F5F4FF] border-[#6137A8]' : 'bg-white'}`}
                onClick={() => fileInputRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <div className="flex-1">
                  <p className="font-inter text-[#111927] text-[13px] sm:text-[14px] mb-[6px] sm:mb-[8px]">Proof of payment</p>
                  <p className="font-inter text-[#6C737F] text-[12px] sm:text-[14px]">
                    Upload a screenshot of your GCash payment receipt <em>(recommended)</em>
                  </p>
                </div>
                <div className="flex flex-row items-center gap-[12px] sm:gap-[16px] sm:py-[48px] sm:px-[56px]">
                  <div className="w-[48px] h-[48px] sm:w-[64px] sm:h-[64px] rounded-full bg-[#E5E7EB] flex items-center justify-center flex-shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#45464E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <p className="font-inter text-[#111927] text-[12px] sm:text-[14px] mb-[4px] sm:mb-[8px]">
                      {form.proof ? form.proof.name : 'Click to upload or drag and drop'}
                    </p>
                    {!form.proof && <p className="font-inter text-[#6C737F] text-[11px] sm:text-[14px]">(JPG or PNG file)</p>}
                  </div>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto self-start px-[20px] sm:px-[28px] py-[10px] sm:h-[48px] rounded-[8px] bg-[#FFC92A] hover:bg-[#f0bb1f] font-inter font-medium text-[#421A83] text-[14px] sm:text-[16px] transition-colors"
            >
              Confirm Payment
            </button>

            <p className="font-inter text-[#45464E] text-[12px] sm:text-[14px] lg:text-[16px]">
              Make sure your email matches your Reviewly account so we can activate access correctly.
            </p>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UpgradeToPremium;
