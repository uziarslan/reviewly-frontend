import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import logo from '../Assets/logo.png';
import trailImg from '../Assets/trail.png';
import { useAuth } from '../context/AuthContext';
import { trialAPI } from '../services/api';

/* ── SVG Icons (inline) ────────────────────────── */
const ProfessionalIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12H12.01M16 6V4C16 3.46957 15.7893 2.96086 15.4142 2.58579C15.0391 2.21071 14.5304 2 14 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4V6M22 13C19.0328 14.959 15.5555 16.0033 12 16.0033C8.44445 16.0033 4.96721 14.959 2 13M4 6H20C21.1046 6 22 6.89543 22 8V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V8C2 6.89543 2.89543 6 4 6Z" stroke="#6E43B9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SubProfessionalIcon = ({ className = 'w-6 h-6' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 20V4C16 3.46957 15.7893 2.96086 15.4142 2.58579C15.0391 2.21071 14.5304 2 14 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4V20M4 6H20C21.1046 6 22 6.89543 22 8V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V8C2 6.89543 2.89543 6 4 6Z" stroke="#6E43B9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-4 h-4 text-[#6B7280] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Minimal nav for trial flow ────────────────── */
const TrialNav = ({ user }) => {
  const initials = user
    ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase()
    : '??';

  return (
    <nav className="bg-white">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between py-4 px-4 sm:px-6 lg:px-20 border-b border-[#F2F4F7]">
        <NavLink to="/dashboard/all-reviewers" className="flex items-center">
          <img src={logo} alt="Reviewly" className="h-9 w-auto object-contain" />
        </NavLink>
        <div className="w-10 h-10 rounded-full border-2 border-[#6E43B9]/30 bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
          {user?.profilePic ? (
            <img src={user.profilePic} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            <span className="text-sm font-semibold text-[#6E43B9]">{initials}</span>
          )}
        </div>
      </div>
    </nav>
  );
};

/* ── Progress bar ──────────────────────────────── */
const StepProgress = ({ current, total }) => (
  <div className="mb-10">
    <p className="font-inter font-normal text-[13px] text-[#9CA3AF] mb-2">Step {current} of {total}</p>
    <div className="flex gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-[3px] flex-1 rounded-full transition-colors duration-300 ${i < current ? 'bg-[#1A1A2E]' : 'bg-[#E5E7EB]'
            }`}
        />
      ))}
    </div>
  </div>
);

/* ── Chat bubbles (right side illustration) ────── */
const ChatIllustration = () => (
  <div className="hidden lg:flex flex-col items-center justify-center relative">
    {/* Chat bubbles */}
    <div className="relative w-full max-w-[420px]">
      <div className="flex flex-col gap-3 mb-6">
        <div className="self-end bg-white border border-[#E5E7EB] rounded-[16px] rounded-tr-[4px] px-4 py-2.5 shadow-sm max-w-[280px]">
          <p className="font-inter text-[13px] text-[#1A1A2E]">Nagp-practice ka na for CSE?</p>
        </div>
        <div className="self-start bg-[#FFF8E1] border border-[#FFC92A]/30 rounded-[16px] rounded-tl-[4px] px-4 py-2.5 shadow-sm max-w-[300px]">
          <p className="font-inter text-[13px] text-[#1A1A2E]">Oo, self-paced lang—mock exam muna.</p>
        </div>
        <div className="self-end bg-white border border-[#E5E7EB] rounded-[16px] rounded-tr-[4px] px-4 py-2.5 shadow-sm max-w-[220px]">
          <p className="font-inter text-[13px] text-[#1A1A2E]">May breakdown ba?</p>
        </div>
        <div className="self-start bg-[#FFF8E1] border border-[#FFC92A]/30 rounded-[16px] rounded-tl-[4px] px-4 py-2.5 shadow-sm max-w-[340px]">
          <p className="font-inter text-[13px] text-[#1A1A2E]">Meron—per section at topics, tapos may next steps.</p>
        </div>
      </div>
    </div>

    {/* Illustration image */}
    <div className="w-full max-w-[420px]">
      <img
        src={trailImg}
        alt="Students chatting about CSE preparation"
        className="w-full h-auto object-contain"
      />
    </div>
  </div>
);

/* ════════════════════════════════════════════════
   MAIN COMPONENT: TrialAssessment (multi-step)
   ════════════════════════════════════════════════ */
const TrialAssessment = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [step, setStep] = useState(1); // 1 = choose type, 2 = start/skip
  const [selectedType, setSelectedType] = useState(null); // 'professional' | 'subprofessional'
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  // Fetch trial reviewers on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await trialAPI.getReviewers();
        if (res.success) setReviewers(res.data);
      } catch (err) {
        console.error('Failed to fetch trial reviewers', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // If user already completed trial, redirect
  useEffect(() => {
    if (user?.trialAssessment === true) {
      navigate('/dashboard/all-reviewers', { replace: true });
    }
  }, [user, navigate]);

  const getReviewerByType = (type) => {
    if (type === 'professional') {
      return reviewers.find((r) => r.slug === 'trial-professional');
    }
    return reviewers.find((r) => r.slug === 'trial-subprofessional');
  };

  const handleContinue = () => {
    if (!selectedType) return;
    setStep(2);
  };

  const handleSkip = async () => {
    try {
      await trialAPI.skip();
      setUser({ ...user, trialAssessment: true });
      navigate('/dashboard/all-reviewers', { replace: true });
    } catch (err) {
      console.error('Failed to skip trial', err);
      navigate('/dashboard/all-reviewers', { replace: true });
    }
  };

  const handleStartAssessment = () => {
    setStep(3);
  };

  const handleStartExam = async () => {
    const reviewer = getReviewerByType(selectedType);
    if (!reviewer) return;
    setStarting(true);
    try {
      const res = await trialAPI.start(reviewer._id);
      if (res.success) {
        navigate(`/trial/exam/${reviewer._id}`, {
          state: { attempt: res.data, reviewerTitle: reviewer.title },
        });
      }
    } catch (err) {
      console.error('Failed to start trial exam', err);
    } finally {
      setStarting(false);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F4FF]">
        <TrialNav user={user} />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-[3px] border-[#E5E7EB] border-t-[#6E43B9] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const firstName = user?.firstName || 'there';

  /* ── STEP 1: Choose exam type ────────────────── */
  if (step === 1) {
    return (
      <div className="min-h-screen bg-[#F5F4FF]">
        <TrialNav user={user} />
        <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 pt-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left side */}
            <div className="max-w-[480px]">
              <StepProgress current={1} total={2} />

              <h1 className="font-inter font-bold text-[28px] sm:text-[32px] text-[#1A1A2E] leading-tight mb-4">
                <span role="img" aria-label="wave">👋</span> Hi, {firstName}! Which Civil Service Exam are you preparing for?
              </h1>
              <p className="font-inter font-normal text-[15px] text-[#6B7280] mb-8 leading-relaxed">
                We'll use this to match the right coverage, mock exams, and feedback for you.
              </p>

              {/* Type selection cards */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button
                  type="button"
                  onClick={() => setSelectedType('professional')}
                  className={`flex-1 flex flex-col items-start gap-3 p-5 rounded-[12px] border-2 transition-all duration-200 text-left ${selectedType === 'professional'
                    ? 'border-[#6E43B9] bg-white shadow-md'
                    : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB]'
                    }`}
                >
                  <ProfessionalIcon className="w-6 h-6" />
                  <div>
                    <p className="font-inter font-semibold text-[15px] text-[#1A1A2E]">Professional</p>
                    <p className="font-inter font-normal text-[13px] text-[#6B7280] mt-0.5">Higher coverage / difficulty.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedType('subprofessional')}
                  className={`flex-1 flex flex-col items-start gap-3 p-5 rounded-[12px] border-2 transition-all duration-200 text-left ${selectedType === 'subprofessional'
                    ? 'border-[#6E43B9] bg-white shadow-md'
                    : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB]'
                    }`}
                >
                  <SubProfessionalIcon className="w-6 h-6" />
                  <div>
                    <p className="font-inter font-semibold text-[15px] text-[#1A1A2E]">Sub-Professional</p>
                    <p className="font-inter font-normal text-[13px] text-[#6B7280] mt-0.5">Clerical / non-prof roles.</p>
                  </div>
                </button>
              </div>

              {/* Continue button */}
              <button
                type="button"
                onClick={handleContinue}
                disabled={!selectedType}
                className={`font-inter font-bold text-[14px] py-[11px] px-6 rounded-[8px] transition-all duration-200 flex items-center gap-2 ${selectedType
                  ? 'text-[#421A83] bg-[#FFC92A] hover:bg-[#FFD54F] cursor-pointer'
                  : 'text-[#9CA3AF] bg-[#F3F4F6] cursor-not-allowed'
                  }`}
              >
                Continue <span aria-hidden="true">→</span>
              </button>

              <p className="font-inter font-normal text-[13px] text-[#9CA3AF] mt-4">
                You can change this later in Account Settings.
              </p>
            </div>

            {/* Right side */}
            <ChatIllustration />
          </div>
        </main>
      </div>
    );
  }

  /* ── STEP 2: Start assessment or skip ────────── */
  if (step === 2) {
    return (
      <div className="min-h-screen bg-[#F5F4FF]">
        <TrialNav user={user} />
        <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 pt-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left side */}
            <div className="max-w-[480px]">
              <StepProgress current={2} total={2} />

              <h1 className="font-inter font-bold text-[28px] sm:text-[32px] text-[#1A1A2E] leading-tight mb-4">
                Let's check your starting point.
              </h1>
              <p className="font-inter font-normal text-[15px] text-[#6B7280] mb-2 leading-relaxed">
                Before you start reviewing, take the CSE Assessment (50 items).
              </p>
              <p className="font-inter font-normal text-[14px] text-[#6B7280] mb-5 flex items-center gap-1.5">
                <ClockIcon /> Takes around 60 minutes.
              </p>

              <p className="font-inter font-normal text-[15px] text-[#6B7280] mb-2">You'll get:</p>
              <ul className="font-inter font-normal text-[15px] text-[#45464E] mb-6 space-y-1.5 list-disc pl-5">
                <li>Your readiness score</li>
                <li>Your weakest subjects &amp; topics</li>
                <li>A clear next-step plan</li>
              </ul>

              <p className="font-inter font-normal text-[15px] text-[#45464E] mb-8">
                No pressure — this is just your starting point.
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <button
                  type="button"
                  onClick={handleStartAssessment}
                  className="font-inter font-bold text-[14px] text-[#421A83] bg-[#FFC92A] hover:bg-[#FFD54F] py-[11px] px-6 rounded-[8px] transition-colors"
                >
                  Start Assessment
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="font-inter font-medium text-[14px] text-[#45464E] bg-white border border-[#D1D5DB] hover:bg-gray-50 py-[11px] px-6 rounded-[8px] transition-colors"
                >
                  Skip for now
                </button>
              </div>

              <p className="font-inter font-normal text-[13px] text-[#9CA3AF]">
                You can take it anytime from the Dashboard.
              </p>
            </div>

            {/* Right side */}
            <ChatIllustration />
          </div>
        </main>
      </div>
    );
  }

  /* ── STEP 3: Exam overview / confirmation ────── */
  if (step === 3) {
    const reviewer = getReviewerByType(selectedType);
    const typeLabel = selectedType === 'professional' ? 'Professional' : 'Sub-Professional';

    return (
      <div className="min-h-screen bg-[#F5F4FF]">
        <TrialNav user={user} />
        <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 pt-8 pb-16 flex items-start justify-center">
          <div className="w-full max-w-[600px] bg-white rounded-[16px] p-8 sm:p-10 shadow-sm">
            {/* Header with icon */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#F5F4FF] rounded-[10px] flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#6E43B9" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="font-inter font-bold text-[22px] text-[#1A1A2E]">CSE Assessment</h1>
            </div>

            <p className="font-inter font-normal text-[15px] text-[#6B7280] mb-6">
              Find out your readiness — and exactly what to improve next.
            </p>

            {/* What to expect */}
            <h2 className="font-inter font-semibold text-[15px] text-[#1A1A2E] mb-3">What to expect</h2>
            <ul className="font-inter font-normal text-[14px] text-[#45464E] mb-6 space-y-2 list-disc pl-5">
              <li>50 questions</li>
              <li>About 60 minutes</li>
              <li>Timed exam</li>
              <li>Covers major subject areas</li>
            </ul>

            {/* After the assessment */}
            <h2 className="font-inter font-semibold text-[15px] text-[#1A1A2E] mb-3">After the assessment, you'll get:</h2>
            <ul className="font-inter font-normal text-[14px] text-[#45464E] mb-6 space-y-2 list-disc pl-5">
              <li>Your readiness score</li>
              <li>Your performance by subject</li>
              <li>Your weakest topics</li>
              <li>Clear next steps</li>
            </ul>

            <p className="font-inter font-normal text-[14px] text-[#6B7280] mb-8">
              This is not your final score — it's your starting point.
            </p>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleStartExam}
                disabled={starting}
                className="font-inter font-bold text-[14px] text-[#421A83] bg-[#FFC92A] hover:bg-[#FFD54F] py-[11px] px-6 rounded-[8px] transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {starting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#421A83]/30 border-t-[#421A83] rounded-full animate-spin" />
                    Starting...
                  </>
                ) : (
                  'Start Exam'
                )}
              </button>
              <button
                type="button"
                onClick={handleBack}
                disabled={starting}
                className="font-inter font-medium text-[14px] text-[#45464E] bg-white border border-[#D1D5DB] hover:bg-gray-50 py-[11px] px-6 rounded-[8px] transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return null;
};

export default TrialAssessment;
