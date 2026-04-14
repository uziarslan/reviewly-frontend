import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import logo from '../Assets/logo.png';
import { useAuth } from '../context/AuthContext';
import { trialAPI } from '../services/api';
import {
  ShareOutIcon,
  VerbalAbilityLogoIcon,
  AnalyticalAbilityLogoIcon,
  ClericalAbilityLogoIcon,
  NumericalAbilityLogoIcon,
  GeneralInformationLogoIcon,
} from '../components/Icons';
import { SaveIcon, ComputeIcon, FindIcon, PrepareIcon } from '../components/LoadingStepIcons';
import ShareModal from '../components/ShareModal';
import { examAPI } from '../services/api';

const PAGE_CLASSES = 'min-h-screen bg-[#F5F4FF]';

const normalizeSection = (s) => (s || '').toLowerCase().trim();
const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

const SectionLogoByName = ({ sectionName, className = 'w-[22px] h-[22px]' }) => {
  const section = normalizeSection(sectionName);
  if (section.includes('verbal')) return <VerbalAbilityLogoIcon className={className} />;
  if (section.includes('analytical')) return <AnalyticalAbilityLogoIcon className={className} />;
  if (section.includes('clerical')) return <ClericalAbilityLogoIcon className={className} />;
  if (section.includes('numerical')) return <NumericalAbilityLogoIcon className={className} />;
  return <GeneralInformationLogoIcon className={className} />;
};

/* ── Minimal nav (same as TrialAssessment) ────── */
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

/* ── Semi-circle gauge ─────────────────────────── */
const SemiCircleGauge = ({ percentage }) => {
  const pct = Math.min(100, Math.max(0, Number(percentage) || 0));
  const W = 220;
  const cx = W / 2;
  const cy = 100;
  const r = 88;
  const sw = 13;

  const toRad = (deg) => (deg * Math.PI) / 180;
  const startX = cx - r;
  const endX = cx + r;
  const angle = 180 - (pct / 100) * 180;
  const px = cx + r * Math.cos(toRad(angle));
  const py = cy - r * Math.sin(toRad(angle));
  const H = cy + sw / 2 + 4;
  const dotColor = pct >= 75 ? '#4ADE80' : pct >= 50 ? '#FBBF24' : '#F87171';

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <defs>
        <linearGradient id="trialGaugeGrad" x1={startX} y1="0" x2={endX} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="40%" stopColor="#FB923C" />
          <stop offset="70%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#4ADE80" />
        </linearGradient>
      </defs>
      <path d={`M ${startX} ${cy} A ${r} ${r} 0 0 0 ${endX} ${cy}`} fill="none" stroke="#E5E7EB" strokeWidth={sw} strokeLinecap="round" />
      {pct > 0 && (
        <path d={`M ${startX} ${cy} A ${r} ${r} 0 0 0 ${px} ${py}`} fill="none" stroke="url(#trialGaugeGrad)" strokeWidth={sw} strokeLinecap="round" />
      )}
      {pct > 0 && <circle cx={px} cy={py} r={sw * 0.58} fill={dotColor} />}
    </svg>
  );
};

/* ════════════════════════════════════════════════
   MAIN: TrialResult
   ════════════════════════════════════════════════ */
const TrialResult = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const { user, setUser } = useAuth();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  const handleOpenShare = useCallback(async () => {
    setShowShareModal(true);
    if (shareUrl) return;
    try {
      const res = await examAPI.generateShareLink(attemptId);
      if (res.success && res.shareToken) {
        setShareUrl(`${window.location.origin}/share/${res.shareToken}`);
      }
    } catch (err) {
      console.error('Failed to generate share link', err);
    }
  }, [attemptId, shareUrl]);

  // Fetch result
  useEffect(() => {
    if (!attemptId) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await trialAPI.getResult(attemptId);
        if (cancelled) return;
        if (res.success) setAttempt(res.data);
      } catch (e) {
        console.error('Failed to load trial result:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [attemptId]);

  // Advance loading steps animation
  useEffect(() => {
    if (!loading || activeStep >= 4) return;
    const timer = setTimeout(() => setActiveStep((p) => Math.min(p + 1, 4)), 1800);
    return () => clearTimeout(timer);
  }, [loading, activeStep]);

  // Mark user as having completed trial (in case they land here directly)
  useEffect(() => {
    if (attempt && user && !user.trialAssessment) {
      setUser({ ...user, trialAssessment: true });
    }
  }, [attempt, user, setUser]);

  if (loading) {
    const LOADING_STEPS = [
      { title: 'Saving your answers', description: 'Securing your responses.', Icon: SaveIcon },
      { title: 'Computing your score', description: 'Calculating section scores.', Icon: ComputeIcon },
      { title: 'Finding your weak sections', description: 'Spotting areas to improve.', Icon: FindIcon },
      { title: 'Preparing your results', description: 'Building your diagnostic report.', Icon: PrepareIcon },
    ];

    return (
      <div className={PAGE_CLASSES}>
        <TrialNav user={user} />
        <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 pt-8 pb-16">
          <section className="bg-white rounded-[16px] p-[24px] sm:p-[40px] max-w-[620px] mx-auto shadow-sm">
            <h2 className="font-inter font-bold text-[18px] text-[#1A1A2E] mb-[4px]">Checking your results...</h2>
            <p className="font-inter font-normal text-[14px] text-[#6B7280] mb-[24px]">Submitting your answers and generating your breakdown.</p>
            <div className="flex flex-col gap-[12px] mb-[24px]">
              {LOADING_STEPS.map((step, i) => {
                const allDone = activeStep >= 4;
                const stepCompleted = i < activeStep || allDone;
                const stepActive = i === activeStep && !allDone;
                const iconState = stepCompleted ? 'done' : stepActive ? 'active' : 'idle';
                return (
                  <div key={i} className={`flex items-center gap-[16px] p-[16px] rounded-[12px] border transition-all duration-300 ${stepActive ? 'border-[#E5E7EB] bg-white shadow-sm' : stepCompleted ? 'border-[#E5E7EB] bg-white' : 'border-[#F3F4F6] bg-[#FAFAFA]'}`}>
                    <step.Icon state={iconState} />
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-inter font-semibold text-[15px] leading-[20px] transition-colors duration-300 ${stepActive || stepCompleted ? 'text-[#1A1A2E]' : 'text-[#B0A3CC]'}`}>{step.title}</h4>
                      <p className={`font-inter font-normal text-[13px] leading-[18px] mt-[2px] transition-colors duration-300 ${stepActive || stepCompleted ? 'text-[#6B7280]' : 'text-[#D1D5DB]'}`}>{step.description}</p>
                    </div>
                    <div className="w-[24px] h-[24px] flex items-center justify-center shrink-0">
                      {stepActive && <div className="w-[22px] h-[22px] border-[2px] border-[#E5E7EB] border-t-[#6E43B9] rounded-full animate-spin" />}
                      {stepCompleted && (
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M6 11.5l3.5 3.5L16 8" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="font-inter font-normal text-[13px] text-[#9CA3AF]">No pressure – this usually takes a few seconds.</p>
          </section>
        </main>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className={PAGE_CLASSES}>
        <TrialNav user={user} />
        <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 pt-8 pb-16">
          <p className="font-inter text-[#45464E]">Results not found.</p>
          <button onClick={() => navigate('/dashboard/all-reviewers')} className="font-inter text-[#6E43B9] hover:underline mt-4 inline-block">
            Go to Dashboard
          </button>
        </main>
      </div>
    );
  }

  const result = attempt.result || {};
  const title = attempt.reviewer?.title || 'CSE Assessment';
  const breakdown = result.sectionScores || [];
  const totalCorrect = result.correct || 0;
  const totalIncorrect = result.incorrect || 0;
  const totalUnanswered = result.unanswered || 0;
  const overallPercentage = (result.percentage != null ? result.percentage : 0).toFixed(2);
  const pctNum = parseFloat(overallPercentage);

  const readiness = pctNum >= 85
    ? { label: 'Exam Ready', textColor: 'text-[#16A34A]', message: 'You are above the passing threshold.' }
    : pctNum >= 75
      ? { label: 'Almost Ready', textColor: 'text-[#D97706]', message: 'A few improvements can push you to passing.' }
      : pctNum >= 60
        ? { label: 'Needs Improvement', textColor: 'text-[#2563EB]', message: "You're within reach but need more practice." }
        : { label: 'Early Stage', textColor: 'text-[#6E43B9]', message: 'Focus on building fundamentals first.' };

  const subMessage = pctNum >= 75
    ? "This is your starting point — your readiness becomes more accurate as you take full mock exams."
    : "This is your starting point — your readiness becomes more accurate as you take full mock exams.";

  // Find weakest section
  const sorted = [...breakdown].sort((a, b) => a.score - b.score);
  const weakest = sorted[0] || null;

  // Section weight for weakest
  const sectionDistribution = [
    { section: 'verbal', weight: 30 },
    { section: 'analytical', weight: 34 },
    { section: 'clerical', weight: 34 },
    { section: 'numerical', weight: 30 },
    { section: 'general information', weight: 6 },
  ];
  const weakestWeight = weakest
    ? sectionDistribution.find((sd) => normalizeSection(sd.section) === normalizeSection(weakest.section))?.weight || Math.round((weakest.totalItems / (result.totalItems || 50)) * 100)
    : 0;

  const gapItems = weakest ? weakest.totalItems - weakest.correct : 0;

  // Duration calculation
  const durationMs = attempt.submittedAt && attempt.startedAt
    ? new Date(attempt.submittedAt) - new Date(attempt.startedAt) : 0;
  const durationMin = Math.floor(durationMs / 60000);

  return (
    <div className={PAGE_CLASSES}>
      <TrialNav user={user} />
      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 pt-8 pb-16">

        {/* ── Score Overview Card ─────────────────── */}
        <section className="bg-white rounded-[16px] px-[24px] py-[28px] sm:px-[32px] sm:py-[32px] mb-[16px]">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-[28px]">
            <h2 className="font-inter font-semibold text-[17px] text-[#1A1A2E] leading-snug">
              Civil Service Exam - Assessment Result
            </h2>
            <button
              type="button"
              onClick={handleOpenShare}
              className="shrink-0 flex items-center gap-[6px] font-inter font-normal text-[13px] text-[#45464E] border border-[#D1D5DB] bg-white hover:bg-gray-50 transition-colors py-[7px] px-[14px] rounded-[8px]"
            >
              <ShareOutIcon className="w-[15px] h-[15px]" />
              Share
            </button>
          </div>

          {/* Gauge + Stats */}
          <div className="flex flex-col md:flex-row gap-[32px] md:gap-[48px]">
            <div className="flex flex-col items-center md:w-[240px] shrink-0">
              <SemiCircleGauge percentage={overallPercentage} />
              <p className="font-inter font-bold text-[32px] text-[#1A1A2E] leading-none -mt-[6px]">
                {overallPercentage}%
              </p>
              <p className="font-inter font-normal text-[13px] text-[#6B7280] mt-[6px]">Initial Readiness</p>
            </div>

            <div className="flex-1 min-w-0">
              <div className="divide-y divide-[#F3F4F6]">
                <div className="flex items-center justify-between py-[13px]">
                  <span className="font-inter font-normal text-[14px] text-[#6B7280]">Initial Readiness</span>
                  <span className="font-inter font-semibold text-[14px] text-[#1A1A2E]">{overallPercentage} %</span>
                </div>
                <div className="flex items-center justify-between py-[13px]">
                  <span className="font-inter font-normal text-[14px] text-[#6B7280]">Correct Items</span>
                  <span className="font-inter font-semibold text-[14px] text-[#1A1A2E]">{totalCorrect} / {result.totalItems || 50}</span>
                </div>
                <div className="flex items-center justify-between py-[13px]">
                  <span className="font-inter font-normal text-[14px] text-[#6B7280]">Status</span>
                  <span className={`font-inter font-semibold text-[14px] ${readiness.textColor}`}>{readiness.label}</span>
                </div>
                <div className="flex items-center justify-between py-[13px]">
                  <span className="font-inter font-normal text-[14px] text-[#6B7280]">Total Time</span>
                  <span className="font-inter font-semibold text-[14px] text-[#1A1A2E]">{durationMin} min</span>
                </div>
              </div>

              <div className="mt-[16px]">
                <p className="font-inter font-medium text-[14px] text-[#45464E]">{readiness.message}</p>
                <p className="font-inter font-normal text-[13px] text-[#9CA3AF] mt-[6px] leading-[20px]">
                  {subMessage}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Detailed Exam Breakdown ───────────── */}
        <section className="bg-white rounded-[16px] px-[24px] py-[28px] sm:px-[32px] sm:py-[32px] mb-[16px]">
          <h3 className="font-inter font-semibold text-[18px] text-[#1A1A2E] mb-[4px]">Detailed Exam Breakdown</h3>
          <p className="font-inter font-normal text-[14px] text-[#6B7280] mb-[20px]">
            Your performance based on your 50-item assessment.
          </p>

          <div className="overflow-x-auto mb-[28px]">
            <table className="w-full font-inter text-[14px] border-collapse">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  {['Section', 'Items', 'Correct', 'Incorrect', 'Unanswered', 'Your Score'].map((h) => (
                    <th key={h} className="text-left py-[11px] px-[14px] font-medium text-[#6B7280] text-[13px] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {breakdown.map((row, i) => (
                  <tr key={i} className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA] transition-colors">
                    <td className="py-[12px] px-[14px] text-[#45464E]">{capitalize(row.section)}</td>
                    <td className="py-[12px] px-[14px] text-[#45464E]">{row.totalItems}</td>
                    <td className="py-[12px] px-[14px] text-[#45464E]">{row.correct}</td>
                    <td className="py-[12px] px-[14px] text-[#45464E]">{row.incorrect}</td>
                    <td className="py-[12px] px-[14px] text-[#45464E]">{row.unanswered}</td>
                    <td className="py-[12px] px-[14px] font-semibold text-[#45464E]">{row.score?.toFixed(2)} %</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-[#E5E7EB]">
                  <td className="py-[12px] px-[14px] font-semibold text-[#1A1A2E]">Total</td>
                  <td className="py-[12px] px-[14px] font-semibold text-[#1A1A2E]">{result.totalItems || 50}</td>
                  <td className="py-[12px] px-[14px] font-semibold text-[#1A1A2E]">{totalCorrect}</td>
                  <td className="py-[12px] px-[14px] font-semibold text-[#1A1A2E]">{totalIncorrect}</td>
                  <td className="py-[12px] px-[14px] font-semibold text-[#1A1A2E]">{totalUnanswered}</td>
                  <td className="py-[12px] px-[14px] font-bold text-[#1A1A2E]">{overallPercentage} %</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-[10px] mb-[14px]">
            <button
              type="button"
              onClick={() => navigate('/dashboard/all-reviewers')}
              className="font-inter font-bold text-[14px] text-[#421A83] bg-[#FFC92A] hover:opacity-95 transition-opacity py-[11px] px-[20px] rounded-[8px]"
            >
              Go to Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate(`/dashboard/review/${attemptId}`)}
              className="font-inter font-normal text-[14px] text-[#45464E] border border-[#D1D5DB] bg-white hover:bg-gray-50 transition-colors py-[11px] px-[20px] rounded-[8px]"
            >
              Review Answers
            </button>
          </div>

          <p className="font-inter font-normal text-[13px] text-[#9CA3AF]">
            Section weights are aligned with the actual Civil Service Exam.
          </p>
          <p className="font-inter font-normal text-[13px] text-[#9CA3AF] mt-[2px]">
            General Information has fewer items, so results may vary — take a full mock exam to confirm.
          </p>
        </section>

        {/* ── Weakest Area Card ─────────────────── */}
        {weakest && (
          <section className="bg-white rounded-[16px] px-[24px] py-[28px] sm:px-[32px] sm:py-[32px]">
            <h3 className="font-inter font-semibold text-[18px] text-[#1A1A2E] mb-[4px]">Your weakest area right now</h3>
            <p className="font-inter font-normal text-[14px] text-[#6B7280] mb-[24px]">
              This is your biggest opportunity to increase your score fastest.
            </p>

            <div className="flex flex-col sm:flex-row gap-[20px] sm:gap-[32px]">
              {/* Section to focus */}
              <div className="flex items-center gap-[14px]">
                <div className="w-[44px] h-[44px] rounded-[10px] bg-[#F5F4FF] flex items-center justify-center shrink-0">
                  <SectionLogoByName sectionName={weakest.section} />
                </div>
                <div>
                  <p className="font-inter font-semibold text-[15px] text-[#1A1A2E]">{capitalize(weakest.section)}</p>
                  <p className="font-inter font-normal text-[13px] text-[#6B7280]">Section to focus</p>
                </div>
              </div>

              {/* Gap items */}
              {gapItems > 0 && (
                <div className="flex items-center gap-[14px]">
                  <div className="w-[44px] h-[44px] rounded-[10px] bg-[#FFF9EC] flex items-center justify-center shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-inter font-semibold text-[15px] text-[#1A1A2E]">{gapItems} item{gapItems !== 1 ? 's' : ''}</p>
                    <p className="font-inter font-normal text-[13px] text-[#6B7280]">Gap to pass</p>
                  </div>
                </div>
              )}

              {/* Section weight */}
              {weakestWeight > 0 && (
                <div className="flex items-center gap-[14px]">
                  <div className="w-[44px] h-[44px] rounded-[10px] bg-[#F0FDF4] flex items-center justify-center shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke="#16A34A" strokeWidth="1.5" />
                      <path d="M12 2a10 10 0 0 1 10 10H12V2Z" fill="#16A34A" fillOpacity="0.2" stroke="#16A34A" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-inter font-semibold text-[15px] text-[#1A1A2E]">{weakestWeight}%</p>
                    <p className="font-inter font-normal text-[13px] text-[#6B7280]">Section weight</p>
                  </div>
                </div>
              )}
            </div>

            <p className="font-inter font-normal text-[13px] text-[#9CA3AF] mt-[20px]">
              Focus here first — this is what your Sprint Plan will prioritize.
            </p>
          </section>
        )}
      </main>

      {showShareModal && (
        <ShareModal
          url={shareUrl}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default TrialResult;
