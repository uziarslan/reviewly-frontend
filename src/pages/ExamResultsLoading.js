import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import AOS from 'aos';
import html2canvas from 'html2canvas';
import DashNav from '../components/DashNav';
import {
  ShareOutIcon,
  VerbalAbilityLogoIcon,
  AnalyticalAbilityLogoIcon,
  ClericalAbilityLogoIcon,
  NumericalAbilityLogoIcon,
  GeneralInformationLogoIcon,
  RulerIcon,
  ChartPieIcon
} from '../components/Icons';
import { examAPI } from '../services/api';
import ExamResultsLoadingSkeleton from '../components/skeletons/ExamResultsLoadingSkeleton';
import { SaveIcon, ComputeIcon, FindIcon, PrepareIcon } from '../components/LoadingStepIcons';
import ShareModal from '../components/ShareModal';
import MockScoreCard from '../components/MockScoreCard';
import {
  trackResultsViewed,
  trackResultsShareClicked,
  trackResultsRetakeClicked,
  trackResultsReviewAnswersClicked,
  trackResultsGoToDashboardClicked,
} from '../services/analytics';

const getRetakeLabel = (reviewer = {}) => {
  const title = String(reviewer.title || '');
  const type = String(reviewer.type || '').toLowerCase();
  const normalizedTitle = title.trim();

  if (type === 'mock') {
    const lower = normalizedTitle.toLowerCase();
    if (lower.includes('sub-professional') || lower.includes('subprofessional') || lower.includes('sub professional') || lower.includes('sub prof')) {
      return 'Retake Sub Prof';
    }
    if (lower.includes('professional')) return 'Retake Full Mock';
  }

  if (type === 'practice' || type === 'demo') {
    const match = normalizedTitle.match(/\(([^)]+)\)/);
    if (match && match[1]) {
      const firstWord = match[1].trim().split(/\s+/)[0];
      return `Retake ${firstWord} Exam`;
    }
  }

  const baseTitle = normalizedTitle.replace(/\s*\([^)]*\)/, '').trim();
  if (baseTitle) return `Retake ${baseTitle}`;
  return 'Retake Exam';
};

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

  // The gauge is a full circle (320×320) clipped to its top half (320×160).
  // Circle centre sits at the bottom-centre of the visible area.
  const outerR = 160;                               // half of 320px container width
  const trackW = 15;                                // ring thickness in px
  const midR = outerR - trackW / 2;               // 152.5 — for handle placement
  const innerPct = ((outerR - trackW) / outerR * 100).toFixed(3); // 90.625%

  const progressDeg = (pct / 100) * 180;
  const pd = progressDeg.toFixed(2);

  // Handle position as % of the visible 320×160 area.
  // Circle centre is at (160, 160) in that space.
  const toRad = (d) => (d * Math.PI) / 180;
  const angle = 180 - (pct / 100) * 180;
  const handleX = outerR + midR * Math.cos(toRad(angle));
  const handleY = outerR - midR * Math.sin(toRad(angle));

  // Two-layer background:
  //  Bottom: smooth colour gradient across the full 180° arc.
  //          Red → Orange → Green with soft blending at every transition.
  //  Top:    conic mask — transparent over [0, progressDeg] so the colour shows through,
  //          #E5E7EB over the remaining track, white over the bottom half.
  const colorLayer = `conic-gradient(from -90deg,
    #9F0B1D   0deg,
    #C95B2A  40deg,
    #FFA153  80deg,
    #FFC170 100deg,
    #8DC96A 130deg,
    #06A561 180deg,
    white   180deg 360deg)`;

  const maskConic = pct <= 0
    ? `conic-gradient(from -90deg, #E5E7EB 0deg, #E5E7EB 180deg, white 180deg, white 360deg)`
    : `conic-gradient(from -90deg, transparent 0deg, transparent ${pd}deg, #E5E7EB ${pd}deg, #E5E7EB 180deg, white 180deg, white 360deg)`;

  const bg = `${maskConic}, ${colorLayer}`;

  return (
    <div className="relative w-full" style={{ maxWidth: "240px" }}>
      {/* paddingTop 50% locks height = half the width — always a perfect semicircle */}
      <div className="relative w-full overflow-hidden" style={{ paddingTop: '50%' }}>

        {/* Full circle; overflow-hidden on parent reveals only the top 160px */}
        <div
          className="absolute inset-x-0 top-0"
          style={{ height: '200%', borderRadius: '50%', background: bg }}
        >
          {/* Donut hole — white inner circle creates the ring effect */}
          <div
            className="absolute rounded-full bg-white"
            style={{
              width: `${innerPct}%`,
              aspectRatio: '1',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        {/* Handle at the arc tip — border colour matches the current zone */}
        {pct > 0 && (
          <div
            className="absolute rounded-full"
            style={{
              width: 16,
              height: 16,
              background: '#ffffff',
              border: `3px solid ${pct <= 33.33 ? '#9F0B1D' : pct <= 66.66 ? '#FFA153' : '#06A561'}`,
              left: `${(handleX / (outerR * 2)) * 100}%`,
              top: `${(handleY / outerR) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        )}

        {/* Percentage — floats in the open bowl near the bottom */}
        <div className="absolute inset-x-0 bottom-0 flex justify-center">
          <span className="font-inter font-medium text-[#232027] text-[38px]">
            {percentage}%
          </span>
        </div>

      </div>
    </div>
  );
};

const STEP_TIME_OPTIONS = [3, 3.5, 4, 4.5, 5];
const getRandomStepDurations = () => Array.from({ length: 4 }, () => STEP_TIME_OPTIONS[Math.floor(Math.random() * STEP_TIME_OPTIONS.length)]);

const ExamResultsLoading = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromLibrary = new URLSearchParams(location.search).get('from') === 'library';
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stepDurations, setStepDurations] = useState([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [stepTimerDone, setStepTimerDone] = useState(false);
  const [backendStatus, setBackendStatus] = useState(null);
  const [backendReady, setBackendReady] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [shareLinkLoading, setShareLinkLoading] = useState(false);
  const cardRef = useRef(null);
  const resultViewedTracked = useRef(false);
  const [shouldPlayLoadingFlow] = useState(() => location.state?.showLoadingFlow === true);

  const backUrl = fromLibrary ? '/dashboard/library' : '/dashboard/all-reviewers';
  const dashboardUrl = '/dashboard';

  const handleOpenShare = useCallback(async () => {
    trackResultsShareClicked({ examName: attempt?.reviewer?.title });
    setShowShareModal(true);
    if (shareUrl) return; // already fetched
    setShareLinkLoading(true);
    try {
      // Run share-link generation and card capture in parallel for speed
      const captureCard = cardRef.current
        ? html2canvas(cardRef.current, { scale: 1, useCORS: true, backgroundColor: '#FFFFFF' })
          .catch(() => null)
        : Promise.resolve(null);

      const [res, canvas] = await Promise.all([
        examAPI.generateShareLink(attemptId),
        captureCard,
      ]);

      if (res.success && res.shareToken) {
        const url = `${window.location.origin}/share/${res.shareToken}`;

        // Upload the score-card image and WAIT for it before exposing the share URL.
        // This ensures Facebook's crawler sees the Cloudinary image (not og-share.png)
        // when the user copies and pastes the link. We cap the wait at 10 s so a slow
        // network never blocks the modal indefinitely.
        if (canvas) {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          const timeout = new Promise((resolve) => setTimeout(resolve, 10000));
          await Promise.race([
            examAPI.uploadShareImage(attemptId, dataUrl).catch(() => { }),
            timeout,
          ]);
        }

        setShareUrl(url);
      }
    } catch (err) {
      console.error('Failed to generate share link', err);
    } finally {
      setShareLinkLoading(false);
    }
  }, [attemptId, shareUrl, cardRef]);

  const result = attempt?.result || {};
  const retakeLabel = getRetakeLabel(attempt?.reviewer);
  // stepIndex is driven by the step timer and backend completion state.

  useEffect(() => {
    setStepDurations(getRandomStepDurations());
    setStepIndex(0);
    setStepTimerDone(false);
    setBackendStatus(null);
    setBackendReady(false);
  }, [attemptId]);

  useEffect(() => {
    if (location.state?.showLoadingFlow !== true) return;
    navigate(`${location.pathname}${location.search}`, { replace: true, state: {} });
  }, [location.pathname, location.search, location.state, navigate]);

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
        if (res.success) {
          setBackendStatus(res.status);
          setBackendReady(res.status === 'completed');
          setAttempt(res.data);
        }
      } catch (e) { console.error('Failed to load results:', e); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [attemptId]);

  useEffect(() => {
    if (!attemptId || backendStatus !== 'processing') return;
    let cancelled = false;
    const iv = setInterval(async () => {
      if (cancelled) return;
      try {
        const res = await examAPI.getResult(attemptId);
        if (!res.success) return;
        if (cancelled) return;
        setBackendStatus(res.status);
        setBackendReady(res.status === 'completed');
        setAttempt(res.data);
        if (res.status === 'completed') {
          clearInterval(iv);
        }
      } catch (_) {
        // ignore polling errors
      }
    }, 2500);
    return () => { cancelled = true; clearInterval(iv); };
  }, [attemptId, backendStatus]);

  // Auto-advance step indicator while loading screen is visible.
  // When processing completes, snap to 4 so all steps show as done.
  useEffect(() => {
    if (!attemptId || (!shouldPlayLoadingFlow && backendStatus !== 'processing')) return;
    if (stepIndex >= stepDurations.length) return;
    setStepTimerDone(false);
    const timer = setTimeout(() => setStepTimerDone(true), stepDurations[stepIndex] * 1000);
    return () => clearTimeout(timer);
  }, [attemptId, backendStatus, stepIndex, stepDurations, shouldPlayLoadingFlow]);

  useEffect(() => {
    if (!stepTimerDone || !backendReady) return;
    if (stepIndex >= stepDurations.length) return;
    setStepIndex((prev) => Math.min(prev + 1, stepDurations.length));
    setStepTimerDone(false);
  }, [stepTimerDone, backendReady, stepIndex, stepDurations.length]);

  useEffect(() => {
    if (!attempt || !backendReady || resultViewedTracked.current) return;
    resultViewedTracked.current = true;
    trackResultsViewed({
      examName: attempt.reviewer?.title,
      score: parseFloat(attempt.result?.percentage || 0),
      passed: attempt.result?.passed,
      examType: attempt.reviewer?.type,
    });
  }, [attempt, backendReady]);

  if (loading) return <ExamResultsLoadingSkeleton />;

  const showLoadingScreen = shouldPlayLoadingFlow && stepIndex < stepDurations.length;

  if (showLoadingScreen) {
    return (
      <div className={PAGE_CLASSES}>
        <DashNav />
        <main className={`${MAIN_CLASSES} pt-[24px] pb-[40px]`}>
          <section className="bg-white rounded-[16px] p-[24px] sm:p-[40px] max-w-[620px] mx-auto shadow-sm" data-aos="fade-up" data-aos-duration="400" data-aos-delay="50">
            <h2 className="font-inter font-bold text-[18px] text-[#1A1A2E] mb-[4px]">Checking your results...</h2>
            <p className="font-inter font-normal text-[14px] text-[#6B7280] mb-[24px]">Submitting your answers and generating your breakdown.</p>
            <div className="flex flex-col gap-[12px] mb-[24px]">
              {['Saving your answers', 'Computing your score', 'Finding your weak sections', 'Preparing your next steps'].map((title, i) => {
                const allDone = stepIndex >= 4;
                const stepCompleted = i < stepIndex || allDone;
                const stepActive = i === stepIndex && !allDone;
                const iconState = stepCompleted ? 'done' : stepActive ? 'active' : 'idle';
                const stepDescriptions = [
                  'Securing your responses for this attempt.',
                  'Calculating your latest score using CSE section weights.',
                  'Spotting the areas that pulled your score down.',
                  'Building your recommended focus and Sprint Plan starting point.',
                ];
                const StepIcon = [SaveIcon, ComputeIcon, FindIcon, PrepareIcon][i];
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-[16px] p-[16px] rounded-[12px] border transition-all duration-300 ${stepActive
                      ? 'border-[#E5E7EB] bg-white shadow-sm'
                      : stepCompleted
                        ? 'border-[#E5E7EB] bg-white'
                        : 'border-[#F3F4F6] bg-[#FAFAFA]'
                      }`}
                  >
                    <StepIcon state={iconState} />
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-inter font-semibold text-[15px] leading-[20px] transition-colors duration-300 ${stepActive || stepCompleted ? 'text-[#1A1A2E]' : 'text-[#B0A3CC]'}`}>
                        {title}
                      </h4>
                      <p className={`font-inter font-normal text-[13px] leading-[18px] mt-[2px] transition-colors duration-300 ${stepActive || stepCompleted ? 'text-[#6B7280]' : 'text-[#D1D5DB]'}`}>
                        {stepDescriptions[i]}
                      </p>
                    </div>
                    <div className="w-[24px] h-[24px] flex items-center justify-center shrink-0">
                      {stepActive && <div className="w-[22px] h-[22px] border-[2px] border-[#E5E7EB] border-t-[#6E43B9] rounded-full animate-spin" />}
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
            <p className="font-inter font-normal text-[13px] text-[#9CA3AF]">No pressure – this usually takes a few seconds.</p>
          </section>
        </main>
      </div>
    );
  }

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

  const durationSeconds = Number.isFinite(result.duration)
    ? Math.max(0, Math.round(result.duration))
    : attempt.submittedAt && attempt.startedAt
      ? Math.max(0, Math.round((new Date(attempt.submittedAt) - new Date(attempt.startedAt)) / 1000))
      : 0;
  const durationMin = Math.floor(durationSeconds / 60);
  const durationH = Math.floor(durationMin / 60);
  const durationM = durationMin % 60;
  const duration = durationH > 0
    ? `${durationH} hour${durationH !== 1 ? 's' : ''} ${durationM} min${durationM !== 1 ? 's' : ''}`
    : `${durationM} minute${durationM !== 1 ? 's' : ''}`;


  const breadcrumb = (
    <nav className="mb-[24px]" aria-label="Breadcrumb" data-aos="fade-up" data-aos-duration="400" data-aos-delay="0">
      <Link to={backUrl} className={BREADCRUMB_LINK}>{fromLibrary ? 'My Library' : 'All Reviewers'}</Link>
      <span className="mx-2">›</span>
      <span className={BREADCRUMB_ACTIVE}>{title}</span>
    </nav>
  );

  if (!attempt || backendStatus === 'processing' || showLoadingScreen) {
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
                const allDone = stepIndex >= 4;
                const stepCompleted = i < stepIndex || allDone;
                const stepActive = i === stepIndex && !allDone;
                const iconState = stepCompleted ? 'done' : stepActive ? 'active' : 'idle';
                return (
                  <div
                    key={i}
                    className={`flex items-center gap-[16px] p-[16px] rounded-[12px] border transition-all duration-300 ${stepActive
                      ? 'border-[#E5E7EB] bg-white shadow-sm'
                      : stepCompleted
                        ? 'border-[#E5E7EB] bg-white'
                        : 'border-[#F3F4F6] bg-[#FAFAFA]'
                      }`}
                  >
                    <step.Icon state={iconState} />
                    <div className="flex-1 min-w-0">
                      <h4
                        className={`font-inter font-semibold text-[15px] leading-[20px] transition-colors duration-300 ${stepActive || stepCompleted ? 'text-[#1A1A2E]' : 'text-[#B0A3CC]'
                          }`}
                      >
                        {step.title}
                      </h4>
                      <p
                        className={`font-inter font-normal text-[13px] leading-[18px] mt-[2px] transition-colors duration-300 ${stepActive || stepCompleted ? 'text-[#6B7280]' : 'text-[#D1D5DB]'
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
        {/* ── Score Overview Card ───────────────────────────────────────── */}
        <section
          className="bg-white rounded-[12px] px-[24px] py-[24px] mb-[24px] max-w-[840px] mx-auto"
          data-aos="fade-up" data-aos-duration="400" data-aos-delay="50"
        >
          {/* Card header */}
          <div className="flex items-start justify-between gap-4 mb-[28px] items-center">
            <h2 className="font-inter font-bold text-[16px] text-[#45464E] leading-snug">{title}</h2>
            <button
              type="button"
              onClick={handleOpenShare}
              className="shrink-0 flex items-center gap-[6px] font-inter font-regular text-[14px] text-[#6C737F] border-[0.5px] border-[#6C737F] bg-white hover:bg-gray-50 transition-colors py-[8px] px-[12px] rounded-[8px]"
            >
              <ShareOutIcon className="w-[16px] h-[16px]" />
              Share
            </button>
          </div>

          {/* Gauge + Stats */}
          <div className="flex flex-col md:flex-row gap-[20px] md:gap-[24px] items-center">
            {/* Left: gauge */}
            <div className="flex flex-col items-center w-full max-w-[320px] shrink-0">
              <SemiCircleGauge percentage={overallPercentage} />
              <p className="font-inter font-regular text-[14px] text-[#0F172ABF]">Exam Score</p>
              <p className="font-inter font-regular text-[14px] text-[#45464E80] mt-[4px] text-center max-w-[261px]">
                This score is for this exam attempt only
              </p>
            </div>

            {/* Right: stats + status message */}
            <div className="flex-1 min-w-0 max-w-[448px] w-full">
              <div className="divide-y divide-[#181D1F1A]">
                <div className="flex items-center justify-between py-[13px]">
                  <span className="font-inter font-regular text-[14px] text-[#181D1F]">Mock Exam Score</span>
                  <span className="font-inter font-regular text-[14px] text-[#181D1F]">{overallPercentage}%</span>
                </div>
                <div className="flex items-center justify-between py-[13px]">
                  <span className="font-inter font-regular text-[14px] text-[#181D1F]">Correct Items</span>
                  <span className="font-inter font-regular text-[14px] text-[#181D1F]">{totalCorrect} / {result.totalItems}</span>
                </div>
                <div className="flex items-center justify-between py-[13px]">
                  <span className="font-inter font-regular text-[14px] text-[#181D1F]">Status</span>
                  <span className="font-inter font-regular text-[14px] text-[#181D1F]">{readiness.label}</span>
                </div>
                <div className="flex items-center justify-between py-[13px]">
                  <span className="font-inter font-regular text-[14px] text-[#181D1F]">Total Time</span>
                  <span className="font-inter font-regular text-[14px] text-[#181D1F]">{duration}</span>
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
          className="bg-white rounded-[12px] px-[24px] py-[24px] mb-[24px] max-w-[840px] mx-auto"
          data-aos="fade-up" data-aos-duration="400" data-aos-delay="75"
        >
          <h3 className="font-inter font-bold text-[16px] text-[#45464E] mb-[8px]">Detailed Exam Breakdown</h3>
          <p className="font-inter font-regular text-[14px] text-[#0F172ABF] mb-[24px]">Your performance breakdown for this exam attempt.</p>

          <div className="overflow-x-auto mb-[28px]">
            <table className="w-full font-inter text-[14px] border-collapse">
              <thead>
                <tr className="border-b border-[#181D1F26]" style={{ background: "linear-gradient(0deg, #FAFAFB, #FAFAFB),linear-gradient(0deg, rgba(0, 0, 0, 0.02), rgba(0, 0, 0, 0.02))" }}>
                  {['Section', 'Items', 'Correct', 'Incorrect', 'Unanswered', 'Your Score'].map((h) => (
                    <th key={h} className="text-left py-[11px] px-[14px] font-bold text-[#45464E] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {breakdown.map((row, i) => (
                  <tr key={i} className="border-b border-[#181D1F1A] hover:bg-[#FAFAFA] transition-colors">
                    <td className="py-[12px] px-[14px] text-[#181D1F]">{capitalize(row.section)}</td>
                    <td className="py-[12px] px-[14px] text-[#181D1F]">{row.totalItems}</td>
                    <td className="py-[12px] px-[14px] text-[#181D1F]">{row.correct}</td>
                    <td className="py-[12px] px-[14px] text-[#181D1F]">{row.incorrect}</td>
                    <td className="py-[12px] px-[14px] text-[#181D1F]">{row.unanswered}</td>
                    <td className="py-[12px] px-[14px] text-[#181D1F]">{row.score} %</td>
                  </tr>
                ))}
                <tr className="border-b border-[#181D1F1A]">
                  <td className="py-[12px] px-[14px] font-bold text-[#1A1A2E]">Total</td>
                  <td className="py-[12px] px-[14px] font-bold text-[#1A1A2E]">{result.totalItems}</td>
                  <td className="py-[12px] px-[14px] font-bold text-[#1A1A2E]">{totalCorrect}</td>
                  <td className="py-[12px] px-[14px] font-bold text-[#1A1A2E]">{totalIncorrect}</td>
                  <td className="py-[12px] px-[14px] font-bold text-[#1A1A2E]">{totalUnanswered}</td>
                  <td className={`py-[12px] px-[14px] font-bold ${passed ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>{overallPercentage} %</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-wrap gap-[10px] mb-[14px]">
            <button
              type="button"
              onClick={() => { trackResultsGoToDashboardClicked(); navigate(dashboardUrl); }}
              className="font-inter font-regular text-[14px] text-[#421A83] bg-[#FFC92A] hover:opacity-95 transition-opacity py-[11px] px-[20px] rounded-[8px] whitespace-nowrap text-center flex-[1_1_calc(50%-5px)] min-w-[170px] sm:flex-[0_1_auto] sm:w-auto"
            >
              Go to Dashboard
            </button>
            <button
              type="button"
              onClick={() => { trackResultsReviewAnswersClicked(); navigate(`/dashboard/review/${attemptId}${fromLibrary ? '?from=library' : ''}`); }}
              className="font-inter font-normal text-[14px] text-[#45464E] border border-[#D1D5DB] bg-white hover:bg-gray-50 transition-colors py-[11px] px-[20px] rounded-[8px] whitespace-nowrap text-center flex-[1_1_calc(50%-5px)] min-w-[170px] sm:flex-[0_1_auto] sm:w-auto"
            >
              Review Answers
            </button>
            {(() => {
              const reviewer = attempt.reviewer;
              const reviewerId = reviewer?._id;
              if (!reviewerId) return null;
              const handleClick = () => {
                trackResultsRetakeClicked({ examName: reviewer?.title });
                navigate(`/dashboard/exam/${reviewerId}${fromLibrary ? '?from=library' : ''}`);
              };
              return (
                <button
                  type="button"
                  onClick={handleClick}
                  className="font-inter font-normal text-[14px] text-[#45464E] border border-[#D1D5DB] bg-white hover:bg-gray-50 transition-colors py-[11px] px-[20px] rounded-[8px] flex items-center justify-center gap-[6px] whitespace-nowrap flex-[1_1_calc(50%-5px)] min-w-[170px] sm:flex-[0_1_auto] sm:w-auto"
                >
                  {retakeLabel}
                </button>
              );
            })()}
            <button
              type="button"
              onClick={handleOpenShare}
              className="font-inter font-normal text-[14px] text-[#45464E] border border-[#D1D5DB] bg-white hover:bg-gray-50 transition-colors py-[11px] px-[20px] rounded-[8px] flex items-center justify-center gap-[7px] whitespace-nowrap flex-[1_1_calc(50%-5px)] min-w-[170px] sm:flex-[0_1_auto] sm:w-auto"
            >
              Share Mock Score Card
            </button>
          </div>

          <p className="font-inter font-normal text-[14px] text-[#45464E80]">
            See your topic-level breakdown + Day 1 task on your Dashboard.
          </p>
          {!passed && passingScore > 0 && (
            <p className="font-inter font-normal text-[14px] text-[#45464E80] mt-[4px]">
              Passing target: {passingScore} correct ({passingThreshold}%)
            </p>
          )}
        </section>

        {/* ── Recommended Focus Card ────────────────────────────────────── */}
        {!passed && lowestSection && !['practice', 'demo'].includes((attempt.reviewer?.type || '').toLowerCase()) && (
          <section
            className="bg-white rounded-[12px] px-[24px] py-[24px] mb-[24px] max-w-[840px] mx-auto"
            data-aos="fade-up" data-aos-duration="400" data-aos-delay="100"
          >
            <h3 className="font-inter font-bold text-[16px] text-[#45464E] mb-[8px]">Recommended Focus</h3>
            <p className="font-inter font-regular text-[14px] text-[#0F172ABF] mb-[16px]">
              Improving this section will raise your next mock score the fastest.
            </p>

            <div className="flex flex-col sm:flex-row gap-[16px]">
              {/* Section to focus */}
              <div className="flex items-center gap-[16px] max-w-[248px] w-full">
                <div className="w-[48px] h-[48px] rounded-[8px] bg-[#F6F4F9] flex items-center justify-center shrink-0">
                  <SectionLogoByName sectionName={lowestSection.section} />
                </div>
                <div>
                  <p className="font-inter font-semibold text-[14px] text-[#0F172A]">{capitalize(lowestSection.section)}</p>
                  <p className="font-inter font-normal text-[14px] text-[#45464E]">Section to focus</p>
                </div>
              </div>

              {/* Items to pass */}
              {gapToPass > 0 && (
                <div className="flex items-center gap-[16px] max-w-[248px] w-full">
                  <div className="w-[48px] h-[48px] rounded-[8px] bg-[#F6F4F9] flex items-center justify-center shrink-0">
                    <RulerIcon className="w-[24px] h-[24px] rotate-[7.8deg]" />
                  </div>
                  <div>
                    <p className="font-inter font-semibold text-[14px] text-[#0F172A]">{gapToPass} item{gapToPass !== 1 ? 's' : ''}</p>
                    <p className="font-inter font-normal text-[14px] text-[#45464E]">To pass</p>
                  </div>
                </div>
              )}

              {/* Section weight */}
              {focusSectionWeight > 0 && (
                <div className="flex items-center gap-[14px]">
                  <div className="w-[48px] h-[48px] rounded-[8px] bg-[#F6F4F9] flex items-center justify-center shrink-0">
                    <ChartPieIcon className="w-[24px] h-[24px]" />
                  </div>
                  <div>
                    <p className="font-inter font-semibold text-[15px] text-[#1A1A2E]">{focusSectionWeight}%</p>
                    <p className="font-inter font-normal text-[13px] text-[#6B7280]">Section weight</p>
                  </div>
                </div>
              )}
            </div>

            <p className="font-inter font-normal text-[14px] text-[#45464E80] mt-[24px]">
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
        linkLoading={shareLinkLoading}
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
        reviewerType={attempt.reviewer?.type}
      />
    </div>
  );
};

export default ExamResultsLoading;

