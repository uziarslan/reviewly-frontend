import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import AOS from 'aos';
import DashNav from '../components/DashNav';
import {
  LockIcon,
  ShareOutIcon,
  VerbalAbilityLogoIcon,
  AnalyticalAbilityLogoIcon,
  ClericalAbilityLogoIcon,
  NumericalAbilityLogoIcon,
  GeneralInformationLogoIcon,
} from '../components/Icons';
import { examAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ExamResultsLoadingSkeleton from '../components/skeletons/ExamResultsLoadingSkeleton';
import { canAccessReviewer } from '../utils/subscription';
import { SaveIcon, ComputeIcon, FindIcon, PrepareIcon } from '../components/LoadingStepIcons';
import ShareModal from '../components/ShareModal';
import MockScoreCard from '../components/MockScoreCard';

const PAGE_CLASSES = 'min-h-screen bg-[#F5F4FF]';
const MAIN_CLASSES = 'max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20';
const BREADCRUMB_LINK = 'text-[#45464E] font-inter font-normal not-italic text-[14px] hover:text-[#6E43B9] transition-colors';
const BREADCRUMB_ACTIVE = 'text-[#6E43B9] font-inter font-normal not-italic text-[14px]';

const normalizeSection = (sectionName) => (sectionName || '').toLowerCase().trim();

const SectionLogoByName = ({ sectionName, className = 'w-[22px] h-[22px]' }) => {
  const section = normalizeSection(sectionName);
  if (section.includes('verbal')) return <VerbalAbilityLogoIcon className={className} />;
  if (section.includes('analytical')) return <AnalyticalAbilityLogoIcon className={className} />;
  if (section.includes('clerical')) return <ClericalAbilityLogoIcon className={className} />;
  if (section.includes('numerical')) return <NumericalAbilityLogoIcon className={className} />;
  if (section.includes('general')) return <GeneralInformationLogoIcon className={className} />;

  // Fallback keeps the same visual language when section names vary.
  return <GeneralInformationLogoIcon className={className} />;
};

/** Semi-circle speedometer gauge rendered as an inline SVG. */
const SemiCircleGauge = ({ percentage }) => {
  const pct = Math.min(100, Math.max(0, Number(percentage) || 0));
  const W = 220;
  const cx = W / 2;
  const cy = 100; // y coordinate of the arc's base (centre of the full circle)
  const r = 88;
  const sw = 13; // stroke width

  const toRad = (deg) => (deg * Math.PI) / 180;

  // Upper semicircle: from left (cx-r, cy) counter-clockwise (sweep=0) to right (cx+r, cy)
  const startX = cx - r;
  const endX = cx + r;

  // Progress end point: angle decreases from 180° (0%) to 0° (100%)
  const angle = 180 - (pct / 100) * 180;
  const px = cx + r * Math.cos(toRad(angle));
  const py = cy - r * Math.sin(toRad(angle));

  const H = cy + sw / 2 + 4;

  const dotColor = pct >= 75 ? '#4ADE80' : pct >= 50 ? '#FBBF24' : '#F87171';

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <defs>
        {/* Gradient aligned to the arc's x extent */}
        <linearGradient id="scoreGaugeGrad" x1={startX} y1="0" x2={endX} y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F87171" />
          <stop offset="40%" stopColor="#FB923C" />
          <stop offset="70%" stopColor="#FBBF24" />
          <stop offset="100%" stopColor="#4ADE80" />
        </linearGradient>
      </defs>

      {/* Track */}
      <path
        d={`M ${startX} ${cy} A ${r} ${r} 0 0 0 ${endX} ${cy}`}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth={sw}
        strokeLinecap="round"
      />

      {/* Progress arc */}
      {pct > 0 && (
        <path
          d={`M ${startX} ${cy} A ${r} ${r} 0 0 0 ${px} ${py}`}
          fill="none"
          stroke="url(#scoreGaugeGrad)"
          strokeWidth={sw}
          strokeLinecap="round"
        />
      )}

      {/* Progress dot */}
      {pct > 0 && (
        <circle cx={px} cy={py} r={sw * 0.58} fill={dotColor} />
      )}
    </svg>
  );
};

const ExamResultsLoading = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromLibrary = new URLSearchParams(location.search).get('from') === 'library';
  const { isAuthenticated, user } = useAuth();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const cardRef = useRef(null);

  const backUrl = fromLibrary ? '/dashboard/library' : '/dashboard/all-reviewers';

  const handleOpenShare = useCallback(async () => {
    setShowShareModal(true);
    if (shareUrl) return; // already fetched
    try {
      const res = await examAPI.generateShareLink(attemptId);
      if (res.success && res.shareToken) {
        const origin = window.location.origin;
        setShareUrl(`${origin}/share/${res.shareToken}`);
      }
    } catch (err) {
      console.error('Failed to generate share link', err);
    }
  }, [attemptId, shareUrl]);

  const checkAccess = (r) => canAccessReviewer(r, { isAuthenticated, user });
  const result = attempt?.result || {};
  const aiStatus = result.aiStatus ?? null;
  const isProcessing =
    attempt &&
    ((attempt.status !== 'submitted' && attempt.status !== 'timed_out') ||
      aiStatus === 'pending' ||
      aiStatus === 'processing');

  useEffect(() => {
    const t = requestAnimationFrame(() => AOS.refresh());
    return () => cancelAnimationFrame(t);
  }, [attempt]);

  useEffect(() => {
    if (!attemptId) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await examAPI.getResult(attemptId);
        if (cancelled) return;
        if (res.success) setAttempt(res.data);
      } catch (e) { console.error('Failed to load results:', e); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [attemptId]);

  useEffect(() => {
    if (!attemptId || !isProcessing) return;
    let pollCount = 0;
    const MAX_POLLS = 60;
    const POLL_INTERVAL_MS = 2500;
    const iv = setInterval(async () => {
      pollCount += 1;
      if (pollCount > MAX_POLLS) {
        clearInterval(iv);
        setAttempt((prev) => {
          if (!prev?.result) return prev;
          return { ...prev, result: { ...prev.result, aiStatus: 'failed' } };
        });
        return;
      }
      try {
        const res = await examAPI.getResult(attemptId);
        if (res.success && (res.data?.status === 'submitted' || res.data?.status === 'timed_out')) {
          const status = res.data?.result?.aiStatus ?? null;
          if (status === 'complete' || status === 'failed') clearInterval(iv);
          setAttempt(res.data);
        }
      } catch { /* ignore */ }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(iv);
  }, [attemptId, isProcessing]);

  useEffect(() => {
    if (!isProcessing) return;
    if (activeStep >= 4) return;
    const timer = setTimeout(() => {
      setActiveStep((prev) => Math.min(prev + 1, 4));
    }, 1800);
    return () => clearTimeout(timer);
  }, [isProcessing, activeStep]);

  if (loading) return <ExamResultsLoadingSkeleton />;

  if (!attempt) {
    return (
      <div className={PAGE_CLASSES}>
        <DashNav />
        <main className={`${MAIN_CLASSES} py-8`}>
          <p className="font-inter text-[#45464E]">Results not found.</p>
          <Link to={backUrl} className="font-inter text-[#6E43B9] hover:underline mt-4 inline-block">
            Back to {fromLibrary ? 'My Library' : 'All Reviewers'}
          </Link>
        </main>
      </div>
    );
  }

  const title = attempt.reviewer?.title || 'Exam';
  const breakdown = result.sectionScores || [];
  const recommendations = result.recommendedNextStep?.ctas ?? [];
  const totalCorrect = result.correct || 0;
  const totalIncorrect = result.incorrect || 0;
  const totalUnanswered = result.unanswered || 0;
  const overallPercentage = (result.percentage != null ? result.percentage : 0).toFixed(2);
  const passingThreshold = attempt.reviewer?.examConfig?.passingThreshold || 80;
  const passingScore = result.passingScore ?? Math.ceil((passingThreshold / 100) * (result.totalItems || 0));
  const passed = result.passed;

  const sortedSections = [...breakdown].sort((a, b) => b.score - a.score);
  const lowestSection = sortedSections[sortedSections.length - 1] || null;
  const gapToPass = passed ? 0 : Math.max(0, passingScore - totalCorrect);

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const durationMs = attempt.submittedAt && attempt.startedAt
    ? new Date(attempt.submittedAt) - new Date(attempt.startedAt) : 0;
  const durationMin = Math.floor(durationMs / 60000);
  const durationH = Math.floor(durationMin / 60);
  const durationM = durationMin % 60;
  const duration = durationH > 0
    ? `${durationH} hour${durationH !== 1 ? 's' : ''} ${durationM} min${durationM !== 1 ? 's' : ''}`
    : `${durationM} minute${durationM !== 1 ? 's' : ''}`;


  const getRecAction = (rec) => {
    const reviewerId = rec.reviewer?._id || rec.reviewerId;
    const route = rec.type === 'review_answers'
      ? `/dashboard/review/${attemptId}`
      : rec.type === 'go_to_dashboard' ? backUrl
        : reviewerId ? `/dashboard/exam/${reviewerId}${fromLibrary ? '?from=library' : ''}` : null;
    const showUpgrade = rec.reviewer != null && !checkAccess(rec.reviewer);
    const handleClick = () => {
      if (showUpgrade) navigate('/dashboard/settings/update-subscription');
      else if (rec.type === 'go_to_dashboard') navigate(backUrl);
      else if (route) navigate(route);
    };
    return { route, showUpgrade, handleClick };
  };

  const breadcrumb = (
    <nav className="mb-[24px]" aria-label="Breadcrumb" data-aos="fade-up" data-aos-duration="400" data-aos-delay="0">
      <Link to={backUrl} className={BREADCRUMB_LINK}>{fromLibrary ? 'My Library' : 'All Reviewers'}</Link>
      <span className="mx-2">›</span>
      <span className={BREADCRUMB_ACTIVE}>{title}</span>
    </nav>
  );

  if (isProcessing) {
    const LOADING_STEPS = [
      { title: 'Saving your answers', description: 'Securing your responses for this attempt.', Icon: SaveIcon },
      { title: 'Computing your score', description: 'Calculating your latest score using CSE section weights.', Icon: ComputeIcon },
      { title: 'Finding your weak sections', description: 'Spotting the areas that pulled your score down.', Icon: FindIcon },
      { title: 'Preparing your next steps', description: 'Building your recommended focus and Sprint Plan starting point.', Icon: PrepareIcon },
    ];

    return (
      <div className={PAGE_CLASSES}>
        <DashNav />
        <main className={`${MAIN_CLASSES} pt-[24px] pb-[40px]`}>
          {breadcrumb}
          <h1 className="font-inter font-medium text-[#45464E] text-[20px] mb-[24px]" data-aos="fade-up" data-aos-duration="400" data-aos-delay="25">{title}</h1>
          <section className="bg-white rounded-[16px] p-[24px] sm:p-[40px] max-w-[620px] mx-auto shadow-sm" data-aos="fade-up" data-aos-duration="400" data-aos-delay="50">
            <h2 className="font-inter font-bold text-[18px] text-[#1A1A2E] mb-[4px]">
              Checking your results...
            </h2>
            <p className="font-inter font-normal text-[14px] text-[#6B7280] mb-[24px]">
              Submitting your answers and generating your breakdown.
            </p>
            <div className="flex flex-col gap-[12px] mb-[24px]">
              {LOADING_STEPS.map((step, i) => {
                const allDone = activeStep >= 4;
                const stepCompleted = i < activeStep || allDone;
                const stepActive = i === activeStep && !allDone;
                const iconState = stepCompleted ? 'done' : stepActive ? 'active' : 'idle';
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-[16px] p-[16px] rounded-[12px] border transition-all duration-300 ${
                      stepActive
                        ? 'border-[#E5E7EB] bg-white shadow-sm'
                        : stepCompleted
                        ? 'border-[#E5E7EB] bg-white'
                        : 'border-[#F3F4F6] bg-[#FAFAFA]'
                    }`}
                  >
                    <step.Icon state={iconState} />
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`font-inter font-semibold text-[15px] leading-[20px] transition-colors duration-300 ${
                          stepActive || stepCompleted ? 'text-[#1A1A2E]' : 'text-[#B0A3CC]'
                        }`}
                      >
                        {step.title}
                      </h4>
                      <p
                        className={`font-inter font-normal text-[13px] leading-[18px] mt-[2px] transition-colors duration-300 ${
                          stepActive || stepCompleted ? 'text-[#6B7280]' : 'text-[#D1D5DB]'
                        }`}
                      >
                        {step.description}
                      </p>
                    </div>
                    <div className="w-[24px] h-[24px] flex items-center justify-center shrink-0">
                      {stepActive && (
                        <div className="w-[22px] h-[22px] border-[2px] border-[#E5E7EB] border-t-[#6E43B9] rounded-full animate-spin" />
                      )}
                      {stepCompleted && (
                        <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                          <path d="M6 11.5l3.5 3.5L16 8" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="font-inter font-normal text-[13px] text-[#9CA3AF]">
              No pressure – this usually takes a few seconds.
            </p>
          </section>
        </main>
      </div>
    );
  }

  const retakeMockRec = recommendations.find((r) => r.type === 'retake_full_mock') || null;

  // Section distribution for weight calculations
  const sectionDistribution = attempt.reviewer?.examConfig?.sectionDistribution || [];
  const lowestSectionDist = lowestSection
    ? sectionDistribution.find((sd) => sd.section?.toLowerCase() === lowestSection.section?.toLowerCase())
    : null;
  const focusSectionWeight = lowestSection
    ? Math.round(((lowestSectionDist?.count ?? lowestSection.totalItems) / result.totalItems) * 100)
    : 0;

  const shortSectionName = (name) => {
    const lower = (name || '').toLowerCase();
    if (lower.includes('general')) return 'Gen Info';
    return capitalize(lower);
  };

  const sectionWeightsText = sectionDistribution.length > 0
    ? sectionDistribution.map((sd) => `${shortSectionName(sd.section)} ${Math.round((sd.count / result.totalItems) * 100)}%`).join(', ')
    : null;

  const pctNum = parseFloat(overallPercentage);
  const readiness = pctNum >= 85
    ? { label: 'Exam Ready', textColor: 'text-[#16A34A]', message: 'You are above the passing threshold.' }
    : pctNum >= 75
      ? { label: 'Almost Ready', textColor: 'text-[#D97706]', message: 'A few improvements can push you to passing.' }
      : pctNum >= 60
        ? { label: 'Needs Improvement', textColor: 'text-[#2563EB]', message: "You're within reach but need more practice." }
        : { label: 'Early Stage', textColor: 'text-[#6E43B9]', message: 'Focus on building fundamentals first.' };

  return (
    <div className={PAGE_CLASSES}>
      <DashNav />
      <main className={`${MAIN_CLASSES} pt-[24px] pb-[40px]`}>
        {breadcrumb}
        <h1 className="font-inter font-medium text-[#45464E] text-[20px] mb-[20px]" data-aos="fade-up" data-aos-duration="400" data-aos-delay="25">{title}</h1>

        {/* ── Score Overview Card ───────────────────────────────────────── */}
        <section
          className="bg-white rounded-[16px] px-[24px] py-[28px] sm:px-[32px] sm:py-[32px] mb-[16px]"
          data-aos="fade-up" data-aos-duration="400" data-aos-delay="50"
        >
          {/* Card header */}
          <div className="flex items-start justify-between gap-4 mb-[28px]">
            <h2 className="font-inter font-semibold text-[17px] text-[#1A1A2E] leading-snug">{title}</h2>
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
            {/* Left: gauge */}
            <div className="flex flex-col items-center md:w-[240px] shrink-0">
              <SemiCircleGauge percentage={overallPercentage} />
              <p className="font-inter font-bold text-[32px] text-[#1A1A2E] leading-none -mt-[6px]">
                {overallPercentage}%
              </p>
              <p className="font-inter font-normal text-[13px] text-[#6B7280] mt-[6px]">Exam Score</p>
              <p className="font-inter font-normal text-[11px] text-[#9CA3AF] mt-[4px] text-center max-w-[180px]">
                This score is for this exam attempt only
              </p>
            </div>

            {/* Right: stats + status message */}
            <div className="flex-1 min-w-0">
              <div className="divide-y divide-[#F3F4F6]">
                <div className="flex items-center justify-between py-[13px]">
                  <span className="font-inter font-normal text-[14px] text-[#6B7280]">Exam Score</span>
                  <span className="font-inter font-semibold text-[14px] text-[#1A1A2E]">{overallPercentage}%</span>
                </div>
                <div className="flex items-center justify-between py-[13px]">
                  <span className="font-inter font-normal text-[14px] text-[#6B7280]">Correct Items</span>
                  <span className="font-inter font-semibold text-[14px] text-[#1A1A2E]">{totalCorrect} / {result.totalItems}</span>
                </div>
                <div className="flex items-center justify-between py-[13px]">
                  <span className="font-inter font-normal text-[14px] text-[#6B7280]">Status</span>
                  <span className={`font-inter font-semibold text-[14px] ${readiness.textColor}`}>{readiness.label}</span>
                </div>
                <div className="flex items-center justify-between py-[13px]">
                  <span className="font-inter font-normal text-[14px] text-[#6B7280]">Total Time</span>
                  <span className="font-inter font-semibold text-[14px] text-[#1A1A2E]">{duration}</span>
                </div>
              </div>

              <div className="mt-[16px]">
                <p className="font-inter font-medium text-[14px] text-[#45464E]">{readiness.message}</p>
                {sectionWeightsText && (
                  <p className="font-inter font-normal text-[13px] text-[#9CA3AF] mt-[6px] leading-[20px]">
                    Weighted by section coverage:<br />{sectionWeightsText}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── Detailed Exam Breakdown Card ─────────────────────────────── */}
        <section
          className="bg-white rounded-[16px] px-[24px] py-[28px] sm:px-[32px] sm:py-[32px] mb-[16px]"
          data-aos="fade-up" data-aos-duration="400" data-aos-delay="75"
        >
          <h3 className="font-inter font-semibold text-[18px] text-[#1A1A2E] mb-[4px]">Detailed Exam Breakdown</h3>
          <p className="font-inter font-normal text-[14px] text-[#6B7280] mb-[20px]">Your performance breakdown for this exam attempt.</p>

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
                    <td className="py-[12px] px-[14px] font-semibold text-[#45464E]">{row.score} %</td>
                  </tr>
                ))}
                <tr className="border-t-2 border-[#E5E7EB]">
                  <td className="py-[12px] px-[14px] font-semibold text-[#1A1A2E]">Total</td>
                  <td className="py-[12px] px-[14px] font-semibold text-[#1A1A2E]">{result.totalItems}</td>
                  <td className="py-[12px] px-[14px] font-semibold text-[#1A1A2E]">{totalCorrect}</td>
                  <td className="py-[12px] px-[14px] font-semibold text-[#1A1A2E]">{totalIncorrect}</td>
                  <td className="py-[12px] px-[14px] font-semibold text-[#1A1A2E]">{totalUnanswered}</td>
                  <td className={`py-[12px] px-[14px] font-bold ${passed ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>{overallPercentage} %</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-[10px] mb-[14px]">
            <button
              type="button"
              onClick={() => navigate(backUrl)}
              className="font-inter font-bold text-[14px] text-[#421A83] bg-[#FFC92A] hover:opacity-95 transition-opacity py-[11px] px-[20px] rounded-[8px]"
            >
              Go to Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate(`/dashboard/review/${attemptId}${fromLibrary ? '?from=library' : ''}`)}
              className="font-inter font-normal text-[14px] text-[#45464E] border border-[#D1D5DB] bg-white hover:bg-gray-50 transition-colors py-[11px] px-[20px] rounded-[8px]"
            >
              Review Answers
            </button>
            {retakeMockRec && (() => {
              const { showUpgrade, handleClick } = getRecAction(retakeMockRec);
              return (
                <button
                  type="button"
                  onClick={handleClick}
                  className="font-inter font-normal text-[14px] text-[#45464E] border border-[#D1D5DB] bg-white hover:bg-gray-50 transition-colors py-[11px] px-[20px] rounded-[8px] flex items-center gap-[6px]"
                >
                  {showUpgrade && <LockIcon className="w-[14px] h-[14px] shrink-0" />}
                  Retake Full Mock
                </button>
              );
            })()}
            <button
              type="button"
              onClick={handleOpenShare}
              className="font-inter font-normal text-[14px] text-[#45464E] border border-[#D1D5DB] bg-white hover:bg-gray-50 transition-colors py-[11px] px-[20px] rounded-[8px] flex items-center gap-[7px]"
            >
              <ShareOutIcon className="w-[15px] h-[15px]" />
              Share Score Card
            </button>
          </div>

          <p className="font-inter font-normal text-[13px] text-[#9CA3AF]">
            See your topic-level breakdown + Day 1 task on your Dashboard.
          </p>
          {!passed && passingScore > 0 && (
            <p className="font-inter font-normal text-[13px] text-[#9CA3AF] mt-[2px]">
              Passing target: {passingScore} correct ({passingThreshold}%)
            </p>
          )}
        </section>

        {/* ── Recommended Focus Card ────────────────────────────────────── */}
        {!passed && lowestSection && (
          <section
            className="bg-white rounded-[16px] px-[24px] py-[28px] sm:px-[32px] sm:py-[32px]"
            data-aos="fade-up" data-aos-duration="400" data-aos-delay="100"
          >
            <h3 className="font-inter font-semibold text-[18px] text-[#1A1A2E] mb-[4px]">Recommended Focus</h3>
            <p className="font-inter font-normal text-[14px] text-[#6B7280] mb-[24px]">
              Improving this section will raise your next mock score the fastest.
            </p>

            <div className="flex flex-col sm:flex-row gap-[20px] sm:gap-[32px]">
              {/* Section to focus */}
              <div className="flex items-center gap-[14px]">
                <div className="w-[44px] h-[44px] rounded-[10px] bg-[#F5F4FF] flex items-center justify-center shrink-0">
                  <SectionLogoByName sectionName={lowestSection.section} />
                </div>
                <div>
                  <p className="font-inter font-semibold text-[15px] text-[#1A1A2E]">{capitalize(lowestSection.section)}</p>
                  <p className="font-inter font-normal text-[13px] text-[#6B7280]">Section to focus</p>
                </div>
              </div>

              {/* Items to pass */}
              {gapToPass > 0 && (
                <div className="flex items-center gap-[14px]">
                  <div className="w-[44px] h-[44px] rounded-[10px] bg-[#FFF9EC] flex items-center justify-center shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-inter font-semibold text-[15px] text-[#1A1A2E]">{gapToPass} item{gapToPass !== 1 ? 's' : ''}</p>
                    <p className="font-inter font-normal text-[13px] text-[#6B7280]">To pass</p>
                  </div>
                </div>
              )}

              {/* Section weight */}
              {focusSectionWeight > 0 && (
                <div className="flex items-center gap-[14px]">
                  <div className="w-[44px] h-[44px] rounded-[10px] bg-[#F0FDF4] flex items-center justify-center shrink-0">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke="#16A34A" strokeWidth="1.5" />
                      <path d="M12 2a10 10 0 0 1 10 10H12V2Z" fill="#16A34A" fillOpacity="0.2" stroke="#16A34A" strokeWidth="1.5" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-inter font-semibold text-[15px] text-[#1A1A2E]">{focusSectionWeight}%</p>
                    <p className="font-inter font-normal text-[13px] text-[#6B7280]">Section weight</p>
                  </div>
                </div>
              )}
            </div>

            <p className="font-inter font-normal text-[13px] text-[#9CA3AF] mt-[20px]">
              This is what your Sprint Plan will prioritize first.
            </p>
          </section>
        )}
      </main>

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareUrl={shareUrl}
        cardRef={cardRef}
      />

      {/* Hidden off-screen card for html2canvas capture */}
      <MockScoreCard
        ref={cardRef}
        title={title}
        submittedAt={attempt.submittedAt}
        result={result}
        passingThreshold={passingThreshold}
        lowestSection={lowestSection}
        gapToPass={gapToPass}
        focusSectionWeight={focusSectionWeight}
        sectionWeightsText={sectionWeightsText}
      />
    </div>
  );
};

export default ExamResultsLoading;

