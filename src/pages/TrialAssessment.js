import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import logo from '../Assets/logo.png';
import trailImg from '../Assets/trail.png';
import { useAuth } from '../context/AuthContext';
import { trialAPI } from '../services/api';

/* ── Icons ─────────────────────────────────────── */
const ProfessionalIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12H12.01M16 6V4C16 3.46957 15.7893 2.96086 15.4142 2.58579C15.0391 2.21071 14.5304 2 14 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4V6M22 13C19.0328 14.959 15.5555 16.0033 12 16.0033C8.44445 16.0033 4.96721 14.959 2 13M4 6H20C21.1046 6 22 6.89543 22 8V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V8C2 6.89543 2.89543 6 4 6Z" stroke="#6E43B9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const SubProfessionalIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M16 20V4C16 3.46957 15.7893 2.96086 15.4142 2.58579C15.0391 2.21071 14.5304 2 14 2H10C9.46957 2 8.96086 2.21071 8.58579 2.58579C8.21071 2.96086 8 3.46957 8 4V20M4 6H20C21.1046 6 22 6.89543 22 8V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V8C2 6.89543 2.89543 6 4 6Z" stroke="#6E43B9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* ── Nav ────────────────────────────────────────── */
const TrialNav = ({ user }) => {
  const initials = user
    ? `${(user.firstName || '')[0] || ''}${(user.lastName || '')[0] || ''}`.toUpperCase()
    : '';
  return (
    <nav className="bg-white border-b border-[#F2F4F7]">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between h-[64px] px-6 sm:px-8 lg:px-20">
        <NavLink to="/" className="flex items-center">
          <img src={logo} alt="Reviewly" className="h-9 w-auto object-contain" />
        </NavLink>
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-[#6E43B9]/10 flex items-center justify-center">
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

/* ── Step progress ──────────────────────────────── */
const StepProgress = ({ current, total }) => (
  <div className="mb-8">
    <p className="font-inter text-[13px] text-[#9CA3AF] mb-[10px]">Step {current} of {total}</p>
    <div className="flex gap-[6px]">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-[3px] rounded-full flex-1 transition-colors duration-300 ${i < current ? 'bg-[#1A1A2E]' : 'bg-[#E5E7EB]'}`}
        />
      ))}
    </div>
  </div>
);

/* ── Right-side illustration (trail.png already contains chat + students) */
const IllustrationPanel = () => (
  <div className="hidden lg:flex items-center justify-center">
    <img
      src={trailImg}
      alt=""
      className="w-full max-w-[520px] h-auto object-contain"
    />
  </div>
);

/* ════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════ */
const TrialAssessment = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState(null);
  const [reviewers, setReviewers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

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

  useEffect(() => {
    if (user?.trialAssessment === true) {
      navigate('/dashboard/all-reviewers', { replace: true });
    }
  }, [user, navigate]);

  const getReviewerByType = (type) =>
    type === 'professional'
      ? reviewers.find((r) => r.slug === 'trial-professional')
      : reviewers.find((r) => r.slug === 'trial-subprofessional');

  const handleSkip = async () => {
    try {
      await trialAPI.skip();
      setUser({ ...user, trialAssessment: true });
    } catch {
      /* no-op */
    } finally {
      navigate('/dashboard/all-reviewers', { replace: true });
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F3FF] flex flex-col">
        <TrialNav user={user} />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-[3px] border-[#E5E7EB] border-t-[#6E43B9] rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const firstName = user?.firstName || 'there';

  /* Step 3 — centered exam overview card */
  if (step === 3) {
    return (
      <div className="min-h-screen bg-[#F5F3FF] flex flex-col">
        <TrialNav user={user} />
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <div className="w-full max-w-[560px] bg-white rounded-[20px] p-8 sm:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-[#F5F3FF] rounded-[10px] flex items-center justify-center shrink-0">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#6E43B9" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h1 className="font-inter font-bold text-[22px] text-[#1A1A2E]">CSE Assessment</h1>
            </div>

            <p className="font-inter text-[14px] text-[#6B7280] mb-6">
              Find out your readiness — and exactly what to improve next.
            </p>

            <h2 className="font-inter font-semibold text-[14px] text-[#1A1A2E] mb-3">What to expect</h2>
            <ul className="font-inter text-[14px] text-[#45464E] mb-5 space-y-1.5 list-disc pl-5">
              <li>50 questions</li>
              <li>About 60 minutes</li>
              <li>Timed exam</li>
              <li>Covers major subject areas</li>
            </ul>

            <h2 className="font-inter font-semibold text-[14px] text-[#1A1A2E] mb-3">After the assessment, you'll get:</h2>
            <ul className="font-inter text-[14px] text-[#45464E] mb-5 space-y-1.5 list-disc pl-5">
              <li>Your readiness score</li>
              <li>Your performance by subject</li>
              <li>Your weakest topics</li>
              <li>Clear next steps</li>
            </ul>

            <p className="font-inter text-[13px] text-[#9CA3AF] mb-8">
              This is not your final score — it's your starting point.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleStartExam}
                disabled={starting}
                className="font-inter font-bold text-[14px] text-[#421A83] bg-[#FFC92A] hover:bg-[#FFD54F] py-3 px-6 rounded-[8px] transition-colors disabled:opacity-60 flex items-center gap-2"
              >
                {starting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#421A83]/30 border-t-[#421A83] rounded-full animate-spin" />
                    Starting...
                  </>
                ) : 'Start Exam'}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={starting}
                className="font-inter font-medium text-[14px] text-[#45464E] bg-white border border-[#D1D5DB] hover:bg-gray-50 py-3 px-6 rounded-[8px] transition-colors"
              >
                Back
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* Steps 1 & 2 — two-column layout */
  return (
    <div className="min-h-screen bg-[#F5F3FF] flex flex-col">
      <TrialNav user={user} />
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 sm:px-8 lg:px-20 py-10 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center lg:min-h-[calc(100vh-64px)]">

          {/* Left — content */}
          <div className="max-w-[460px] py-10 lg:py-0">
            <StepProgress current={step} total={2} />

            {step === 1 ? (
              <>
                <h1 className="font-inter font-bold text-[28px] sm:text-[32px] lg:text-[34px] text-[#1A1A2E] leading-[1.2] mb-4">
                  <span role="img" aria-label="wave">👋</span> Hi, {firstName}! Which Civil Service Exam are you preparing for?
                </h1>
                <p className="font-inter text-[15px] text-[#6B7280] leading-relaxed mb-8">
                  We'll use this to match the right coverage, mock exams, and feedback for you.
                </p>

                {/* Type cards */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  {[
                    { key: 'professional', label: 'Professional', sub: 'Higher coverage / difficulty.', Icon: ProfessionalIcon },
                    { key: 'subprofessional', label: 'Sub-Professional', sub: 'Clerical / non-prof roles.', Icon: SubProfessionalIcon },
                  ].map(({ key, label, sub, Icon }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedType(key)}
                      className={`flex-1 flex flex-col items-start gap-3 p-5 rounded-[12px] border bg-white text-left transition-all duration-200 ${
                        selectedType === key
                          ? 'border-[#6E43B9] shadow-[0_0_0_1px_#6E43B9]'
                          : 'border-[#E5E7EB] hover:border-[#C4B5FD]'
                      }`}
                    >
                      <Icon />
                      <div>
                        <p className="font-inter font-semibold text-[15px] text-[#1A1A2E]">{label}</p>
                        <p className="font-inter text-[13px] text-[#6B7280] mt-0.5">{sub}</p>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => selectedType && setStep(2)}
                  disabled={!selectedType}
                  className={`font-inter font-bold text-[14px] flex items-center gap-2 py-3 px-6 rounded-[8px] transition-all duration-200 ${
                    selectedType
                      ? 'bg-[#FFC92A] text-[#421A83] hover:bg-[#FFD54F] cursor-pointer'
                      : 'bg-[#F3F4F6] text-[#9CA3AF] cursor-not-allowed'
                  }`}
                >
                  Continue <span aria-hidden="true">→</span>
                </button>

                <p className="font-inter text-[13px] text-[#9CA3AF] mt-4">
                  You can change this later in Account Settings.
                </p>
              </>
            ) : (
              <>
                <h1 className="font-inter font-bold text-[28px] sm:text-[32px] lg:text-[34px] text-[#1A1A2E] leading-[1.2] mb-4">
                  Let's check your starting point.
                </h1>
                <p className="font-inter text-[15px] text-[#6B7280] leading-relaxed mb-5">
                  Before you start reviewing, take the CSE Assessment (50 items).
                </p>

                <p className="font-inter text-[14px] text-[#6B7280] mb-2">You'll get:</p>
                <ul className="font-inter text-[14px] text-[#45464E] space-y-1.5 list-disc pl-5 mb-5">
                  <li>Your readiness score</li>
                  <li>Your weakest subjects &amp; topics</li>
                  <li>A clear next-step plan</li>
                </ul>

                <p className="font-inter text-[14px] text-[#6B7280] mb-8">
                  No pressure — this is just your starting point.
                </p>

                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="font-inter font-bold text-[14px] text-[#421A83] bg-[#FFC92A] hover:bg-[#FFD54F] py-3 px-6 rounded-[8px] transition-colors"
                  >
                    Start Assessment
                  </button>
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="font-inter font-medium text-[14px] text-[#45464E] bg-white border border-[#D1D5DB] hover:bg-gray-50 py-3 px-6 rounded-[8px] transition-colors"
                  >
                    Skip for now
                  </button>
                </div>

                <p className="font-inter text-[13px] text-[#9CA3AF]">
                  You can take it anytime from the Dashboard.
                </p>
              </>
            )}
          </div>

          {/* Right — illustration */}
          <IllustrationPanel />
        </div>
      </main>
    </div>
  );
};

export default TrialAssessment;
