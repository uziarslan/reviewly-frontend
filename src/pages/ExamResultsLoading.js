import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import AOS from 'aos';
import html2canvas from 'html2canvas';
import DashNav from '../components/DashNav';
import {
  LockIcon,
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

const ExamResultsLoading = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromLibrary = new URLSearchParams(location.search).get('from') === 'library';
  const { isAuthenticated, user } = useAuth();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(0);
  const [processingDone, setProcessingDone] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [minTimeDone, setMinTimeDone] = useState(false);
  const cardRef = useRef(null);

  const backUrl = fromLibrary ? '/dashboard/library' : '/dashboard/all-reviewers';

  const handleOpenShare = useCallback(async () => {
    setShowShareModal(true);
    if (shareUrl) return; // already fetched
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
        const url = res.shareUrl || `${window.location.origin}/share/${res.shareToken}`;
        setShareUrl(url);

        // Upload the score-card image in the background so the Facebook OG preview
        // shows the actual breakdown image instead of a generic icon.
        if (canvas) {
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          examAPI.uploadShareImage(attemptId, dataUrl).catch(() => {/* non-critical */});
        }
      }
    } catch (err) {
      console.error('Failed to generate share link', err);
    }
  }, [attemptId, shareUrl, cardRef]);

  const checkAccess = (r) => canAccessReviewer(r, { isAuthenticated, user });
  const result = attempt?.result || {};
  // Still processing if attempt hasn't loaded or AI analysis is in progress
  const aiStatus = attempt?.result?.aiStatus ?? null;
  const isProcessing = !processingDone && (!attempt || aiStatus === 'pending' || aiStatus === 'processing');
  // activeStep is driven by the auto-advance useEffect below

  // Always show the loading steps screen for at least MIN_LOADING_MS,
  // so users see the calculation steps even when the API responds quickly.
  const MIN_LOADING_MS = 3500;
  useEffect(() => {
    const t = setTimeout(() => setMinTimeDone(true), MIN_LOADING_MS);
    return () => clearTimeout(t);
  }, []);

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
          setAttempt(res.data);
          const status = res.data?.result?.aiStatus ?? null;
          if (status === 'complete' || status === 'failed' || status === null) {
            setProcessingDone(true);
          }
        }
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
        setProcessingDone(true);
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
          if (status === 'complete' || status === 'failed') {
            clearInterval(iv);
            setProcessingDone(true);
          }
          setAttempt(res.data);
        }
      } catch { /* ignore */ }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(iv);
  }, [attemptId, isProcessing]);

  // Auto-advance step indicator while loading screen is visible.
  // When processing completes, snap to 4 so all steps show as done.
  useEffect(() => {
    if (!isProcessing && minTimeDone) return; // loading screen hidden, nothing to drive
    if (!isProcessing) {
      setActiveStep(4); // snap all steps to complete
      return;
    }
    if (activeStep >= 4) return;
    const timer = setTimeout(() => {
      setActiveStep((prev) => Math.min(prev + 1, 4));
    }, 1800);
    return () => clearTimeout(timer);
  }, [isProcessing, activeStep, minTimeDone]);

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

  if (isProcessing || !minTimeDone) {
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
              onClick={() => navigate(backUrl)}
              className="font-inter font-regular text-[14px] text-[#421A83] bg-[#FFC92A] hover:opacity-95 transition-opacity py-[11px] px-[20px] rounded-[8px]"
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
            {(() => {
              if (retakeMockRec) {
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
              }
              const reviewer = attempt.reviewer;
              const reviewerId = reviewer?._id;
              if (!reviewerId) return null;
              const showUpgrade = !checkAccess(reviewer);
              const handleClick = () => showUpgrade
                ? navigate('/dashboard/settings/update-subscription')
                : navigate(`/dashboard/exam/${reviewerId}${fromLibrary ? '?from=library' : ''}`);
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
        {!passed && lowestSection && (
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

