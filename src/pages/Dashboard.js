import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashNav from '../components/DashNav';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, reviewerAPI } from '../services/api';

/* ─── Constants ─────────────────────────────────────── */

const LOADING_STEPS = [
  'Analyzing your assessment results',
  'Identifying weakest topics',
  'Prioritizing high-impact areas',
  'Finalizing your 7-day plan',
];

const MOCK_SLUG_BY_LEVEL = {
  professional: 'cse-professional',
  subprofessional: 'cse-subprofessional',
};

const TASK_ICON_BY_TYPE = {
  topic_practice: 'book',
  reinforcement_dual_topic: 'book',
  section_mixed: 'book',
  secondary_section_practice: 'book',
  primary_section_reinforcement: 'gear',
  timed_mixed_check: 'timer',
};

/* ─── Helpers ─────────────────────────────────── */

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const getReadinessBadgeStyle = (badge) => {
  if (!badge) return null;
  if (badge === 'Safe Zone') return { color: '#16A34A', bg: '#DCFCE7' };
  if (badge === 'Near Passing') return { color: '#D97706', bg: '#FEF3C7' };
  return { color: '#2563EB', bg: '#DBEAFE' }; // Getting Ready
};

const STATUS_CONFIG = {
  Weak:      { dot: '#DC2626', text: 'text-[#232027]' },
  Improving: { dot: '#FACC15', text: 'text-[#232027]' },
  Strong:    { dot: '#16A34A', text: 'text-[#232027]' },
};

const PRIORITY_CONFIG = {
  High:   'bg-[#FDE7EA] text-[#FF4D5E]',
  Medium: 'bg-[#FEF6DE] text-[#C89200]',
  Low:    'bg-[#DCFCE7] text-[#16A34A]',
};

const EXAM_LEVEL_LABEL = {
  professional: 'Professional',
  subprofessional: 'Sub-Professional',
};

const ICON_PATHS = {
  book:  'M4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2H19C19.2652 2 19.5196 2.10536 19.7071 2.29289C19.8946 2.48043 20 2.73478 20 3V21C20 21.2652 19.8946 21.5196 19.7071 21.7071C19.5196 21.8946 19.2652 22 19 22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5ZM4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20M8 13L12 6L16 13M9.09998 11H14.8',
  gear:  'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
  timer: 'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 5v5l3 3',
};

/* ─── UI Primitives ─────────────────────────── */

const ChevronIcon = ({ open }) => (
  <svg
    className={`w-4 h-4 text-[#6C737F] transition-transform duration-200 ${open ? 'rotate-90' : ''}`}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const StatusLabel = ({ status }) => {
  if (!status) return <span className="font-inter text-[12px] text-[#9CA3AF]">–</span>;
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Improving;
  return (
    <span className={`inline-flex items-center gap-1.5 font-inter text-[13px] ${cfg.text}`}>
      <span
        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-[inset_0_1px_1px_rgba(255,255,255,0.45)]"
        style={{ background: `linear-gradient(180deg, rgba(255,255,255,0.35) 0%, ${cfg.dot} 100%)` }}
      />
      {status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  if (!priority) return <span className="font-inter text-[12px] text-[#9CA3AF]">–</span>;
  return (
    <span className={`inline-block font-inter font-medium text-[11px] px-2.5 py-0.5 rounded-full ${PRIORITY_CONFIG[priority] || ''}`}>
      {priority}
    </span>
  );
};

/* ─── Semi-circle gauge ───────────────────────── */

const SemiCircleGauge = ({ percentage, badge }) => {
  const pct = Math.min(100, Math.max(0, Number(percentage) || 0));
  const outerR = 160;
  const trackW = 15;
  const midR = outerR - trackW / 2;
  const innerPct = (((outerR - trackW) / outerR) * 100).toFixed(3);
  const pd = ((pct / 100) * 180).toFixed(2);
  const toRad = (d) => (d * Math.PI) / 180;
  const angle = 180 - (pct / 100) * 180;
  const handleX = outerR + midR * Math.cos(toRad(angle));
  const handleY = outerR - midR * Math.sin(toRad(angle));

  const colorLayer = `conic-gradient(from -90deg,
    #9F0B1D   0deg,
    #C95B2A  40deg,
    #FFA153  80deg,
    #FFC170 100deg,
    #8DC96A 130deg,
    #06A561 180deg,
    white   180deg 360deg)`;
  const maskConic = `conic-gradient(from -90deg, transparent 0deg, transparent ${pd}deg, #E5E7EB ${pd}deg, #E5E7EB 180deg, white 180deg, white 360deg)`;
  const bg = `${maskConic}, ${colorLayer}`;
  const badgeStyle = getReadinessBadgeStyle(badge);

  return (
    <div className="relative w-full mx-auto" style={{ maxWidth: '200px' }}>
      <div className="relative w-full overflow-hidden" style={{ paddingTop: '50%' }}>
        <div
          className="absolute inset-x-0 top-0"
          style={{ height: '200%', borderRadius: '50%', background: bg }}
        >
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
        <div
          className="absolute rounded-full"
          style={{
            width: 14,
            height: 14,
            background: '#ffffff',
            border: `3px solid ${pct <= 33.33 ? '#9F0B1D' : pct <= 66.66 ? '#FFA153' : '#06A561'}`,
            left: `${(handleX / (outerR * 2)) * 100}%`,
            top: `${(handleY / outerR) * 100}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 flex justify-center pb-1">
          <span className="font-inter font-bold text-[28px] text-[#232027]">
            {pct.toFixed(2)}%
          </span>
        </div>
      </div>
      {badgeStyle && (
        <div className="flex justify-center mt-2">
          <span
            className="inline-flex items-center gap-1 font-inter font-medium text-[11px] px-2.5 py-1 rounded-full"
            style={{ background: badgeStyle.bg, color: badgeStyle.color }}
          >
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
              <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.5" />
              <path d="M3.5 6l1.5 1.5L8.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {badge}
          </span>
        </div>
      )}
    </div>
  );
};

const NoDataSemiCircle = () => {
  const outerR = 160;
  const trackW = 15;
  const innerPct = (((outerR - trackW) / outerR) * 100).toFixed(3);
  const bg = `conic-gradient(from -90deg, #E5E7EB 0deg, #E5E7EB 180deg, white 180deg, white 360deg)`;

  return (
    <div className="relative w-full mx-auto" style={{ maxWidth: '220px' }}>
      <div className="relative w-full overflow-hidden" style={{ paddingTop: '50%' }}>
        <div
          className="absolute inset-x-0 top-0"
          style={{ height: '200%', borderRadius: '50%', background: bg }}
        >
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
        <div className="absolute inset-x-0 bottom-0 flex justify-center pb-1">
          <span className="font-inter font-medium text-[15px] text-[#9CA3AF]">No data yet</span>
        </div>
      </div>
      <p className="font-inter text-[12px] text-[#9CA3AF] text-center mt-2 leading-snug">
        Take an assessment or full mock exam to{' '}
        <span className="font-semibold">see your readiness score.</span>
      </p>
    </div>
  );
};

/* ─── Section row ──────────────────────────────── */

const SectionRow = ({ section, isExpanded, onToggle, hasData }) => {
  const hasTopics = section.topics && section.topics.length > 0;
  return (
    <>
      <tr
        className={`border-b ${hasData ? 'border-[#E6E2EE]' : 'border-[#F2F4F7]'} ${hasTopics ? 'cursor-pointer hover:bg-[#FCFBFE]' : ''}`}
        onClick={hasTopics ? onToggle : undefined}
      >
        <td className="py-3 pl-4 pr-2">
          <div className="flex items-center gap-2">
            {hasTopics ? <ChevronIcon open={isExpanded} /> : <span className="w-4 h-4 shrink-0" />}
            <span className={`font-inter ${hasData ? 'font-semibold' : 'font-medium'} text-[13px] text-[#1A1A2E]`}>
              {section.label}
            </span>
          </div>
        </td>
        <td className="py-3 px-2 text-left font-inter font-medium text-[13px] text-[#1A1A2E]">
          {section.scoreDisplay}
        </td>
        <td className="py-3 px-2 text-left font-inter text-[13px] text-[#232027]">
          {section.weightDisplay}
        </td>
        <td className="py-3 px-2 text-left"><StatusLabel status={section.status} /></td>
        <td className="py-3 px-2 text-left"><PriorityBadge priority={section.priority} /></td>
        <td className="py-3 px-2 text-left font-inter font-medium text-[13px] text-[#232027]">
          {section.action || '–'}
        </td>
      </tr>
      {isExpanded && hasTopics && (
        <>
          {hasData && (
            <tr className="bg-[#F7F3FB] border-b border-[#E6E2EE]">
              <td className="py-2 pl-10 pr-2 font-inter font-semibold text-[11px] text-[#6B6676] uppercase tracking-wide">Topic</td>
              <td className="py-2 px-2 text-left font-inter font-semibold text-[11px] text-[#6B6676] uppercase tracking-wide">Score</td>
              <td className="py-2 px-2 text-left font-inter font-semibold text-[11px] text-[#6B6676] uppercase tracking-wide">Result</td>
              <td className="py-2 px-2 text-left font-inter font-semibold text-[11px] text-[#6B6676] uppercase tracking-wide">Status</td>
              <td className="py-2 px-2" /><td className="py-2 px-2" />
            </tr>
          )}
          {section.topics.map((topic) => (
            <tr key={topic.name} className={`border-b ${hasData ? 'border-[#EDE9F3] hover:bg-[#FCFBFE]' : 'border-[#F2F4F7] bg-[#FAFAFA]'}`}>
              <td className="py-2.5 pl-10 pr-2 font-inter text-[13px] text-[#45464E]">{topic.name}</td>
              <td className="py-2.5 px-2 text-left font-inter text-[13px] text-[#1A1A2E]">{topic.scoreDisplay}</td>
              <td className="py-2.5 px-2 text-left font-inter text-[13px] text-[#232027]">{topic.result}</td>
              <td className="py-2.5 px-2 text-left"><StatusLabel status={topic.status} /></td>
              <td className="py-2.5 px-2" /><td className="py-2.5 px-2" />
            </tr>
          ))}
        </>
      )}
    </>
  );
};

/* ─── Main Dashboard Component ─────────────────── */

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const [planState, setPlanState] = useState('idle'); // 'idle' | 'loading' | 'ready'
  const [loadingStep, setLoadingStep] = useState(0);
  const [activeTask, setActiveTask] = useState(null);
  const [generateError, setGenerateError] = useState(null);
  const [startingTaskId, setStartingTaskId] = useState(null);
  const [mockReviewerId, setMockReviewerId] = useState(null);

  const refreshDashboard = useCallback(async () => {
    try {
      const res = await dashboardAPI.get();
      if (res.success) {
        setDashboard(res.data);
        // Default-expand the first section that has topics with data.
        if (res.data?.sectionBreakdown?.sections?.length) {
          const firstWithData = res.data.sectionBreakdown.sections.find((s) => s.score != null);
          if (firstWithData) {
            setExpandedSections((prev) => (prev[firstWithData.key] ? prev : { ...prev, [firstWithData.key]: true }));
          }
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  // Resolve the mock reviewer ID for the user's level so CTAs that route to a
  // mock exam navigate to the correct one.
  useEffect(() => {
    if (!dashboard?.examLevel) return;
    const slug = MOCK_SLUG_BY_LEVEL[dashboard.examLevel] || MOCK_SLUG_BY_LEVEL.professional;
    reviewerAPI
      .getBySlug(slug)
      .then((res) => { if (res.success && res.data?._id) setMockReviewerId(res.data._id); })
      .catch(() => {});
  }, [dashboard?.examLevel]);

  // Loading-step animation when generating a plan.
  useEffect(() => {
    if (planState !== 'loading') return;
    const timers = [
      setTimeout(() => setLoadingStep(1), 700),
      setTimeout(() => setLoadingStep(2), 1400),
      setTimeout(() => setLoadingStep(3), 2100),
      setTimeout(() => setLoadingStep(4), 2800),
    ];
    return () => timers.forEach(clearTimeout);
  }, [planState]);

  const handleGeneratePlan = async () => {
    if (planState !== 'idle') return;
    setGenerateError(null);
    setPlanState('loading');
    setLoadingStep(0);

    // Run animation + API call concurrently. Wait for the longer of the two
    // (animation has a min duration so the experience never feels instant).
    const animationDelay = new Promise((resolve) => setTimeout(resolve, 3300));

    try {
      const [res] = await Promise.all([dashboardAPI.generateSprint(), animationDelay]);
      if (res.success) {
        await refreshDashboard();
        setPlanState('ready');
      } else {
        setGenerateError(res.message || 'Could not generate plan');
        setPlanState('idle');
      }
    } catch (err) {
      setGenerateError(err.message || 'Could not generate plan');
      setPlanState('idle');
    }
  };

  const handleStartTask = async (task) => {
    if (!task) return;
    setStartingTaskId(task.taskId);
    try {
      await dashboardAPI.startTask(task.taskId);
      navigate(`/dashboard/sprint/task/${task.taskId}`);
    } catch (err) {
      setError(err.message || 'Could not start task');
      setStartingTaskId(null);
    }
  };

  const toggleSection = (key) =>
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));

  /* ── Derived state ── */
  const greeting = useMemo(() => getGreeting(), []);
  const firstName = user?.firstName || 'there';

  const hasData = dashboard?.hasData ?? false;
  const sprintPlan = dashboard?.sprintPlan ?? null;
  const readiness = dashboard?.readiness ?? null;
  const breakdown = dashboard?.sectionBreakdown ?? null;
  const recommendedFocus = dashboard?.recommendedFocus ?? null;
  const examLevel = dashboard?.examLevel || 'professional';
  const examLevelLabel = EXAM_LEVEL_LABEL[examLevel] || 'Professional';

  const completedTasks = sprintPlan?.completedTasks ?? 0;
  const totalTasks = sprintPlan?.totalTasks ?? 7;
  const planDone = sprintPlan && completedTasks >= totalTasks;
  const nextTask = sprintPlan?.nextTask || null;

  // "Your Next Step" state machine.
  const stepState = useMemo(() => {
    if (planState === 'loading') return 'LOADING';
    if (!hasData) return 'A';
    if (!sprintPlan) return 'B';
    if (planDone) return 'E';
    if (completedTasks === 0) return 'C';
    return 'D';
  }, [planState, hasData, sprintPlan, planDone, completedTasks]);

  // The trial assessment is a one-time gated exam. /trial routes the user to
  // the right reviewer (or back to all-reviewers if they've already taken/skipped it).
  const onTakeAssessment = () => navigate('/trial');
  const onTakeMock = () => {
    if (mockReviewerId) navigate(`/dashboard/exam/${mockReviewerId}`);
    else navigate('/dashboard/all-reviewers');
  };

  /* ── Sprint Task drill-in view (preview before starting) ── */
  if (activeTask) {
    const iconKey = TASK_ICON_BY_TYPE[activeTask.type] || 'book';
    const iconPath = ICON_PATHS[iconKey];
    const isStarting = startingTaskId === activeTask.taskId;

    return (
      <div className="min-h-screen bg-[#F5F4FF]">
        <DashNav />
        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 pt-6 pb-16">
          <div className="max-w-[560px] mx-auto">
            <nav className="flex items-center gap-1.5 mb-6 font-inter text-[13px]">
              <button
                type="button"
                onClick={() => setActiveTask(null)}
                className="text-[#6C737F] hover:text-[#1A1A2E] transition-colors"
              >
                Dashboard
              </button>
              <span className="text-[#9CA3AF]">›</span>
              <span className="text-[#6E43B9] font-medium">Sprint Task</span>
            </nav>

            <div className="w-full bg-white rounded-[16px] px-8 py-8 border border-[#F1EEF8]">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-[10px] bg-white border border-[#FFC92A] flex items-center justify-center shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d={iconPath} stroke="#4B5563" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h1 className="font-inter font-bold text-[24px] text-[#45464E] leading-snug tracking-[-0.02em]">
                  {activeTask.title}
                </h1>
              </div>

              <p className="font-inter text-[14px] text-[#45464E] mb-3">
                {activeTask.questionCount} questions • ~{activeTask.estimatedMinutes} minutes • {activeTask.label}
              </p>

              <p className="font-inter text-[14px] text-[#5F6470] mb-2 leading-[1.45]">
                This task focuses on {activeTask.topics?.length > 0 ? activeTask.topics.join(', ') : `${activeTask.sectionLabel} as a whole`}.
              </p>
              <p className="font-inter text-[14px] text-[#5F6470] mb-7 leading-[1.45] max-w-[470px]">
                Answer all questions first, then review your results and explanations after submitting.
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={isStarting}
                  onClick={() => handleStartTask(activeTask)}
                  className="min-w-[141px] h-12 font-inter font-medium text-[14px] text-[#232027] bg-[#FFC92A] hover:bg-[#FFB800] active:bg-[#E6A800] px-6 rounded-[4px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isStarting ? 'Starting…' : 'Start Task'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTask(null)}
                  className="min-w-[210px] h-12 font-inter font-medium text-[14px] text-[#7A7F8A] bg-white border border-[#AEB3BD] hover:bg-[#F8F8FB] px-6 rounded-[4px] transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F4FF]">
        <DashNav />
        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 pt-6 pb-16">
          <div className="bg-white rounded-[16px] px-6 py-10 text-center font-inter text-[14px] text-[#6C737F]">
            Loading your dashboard…
          </div>
        </main>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F4FF]">
        <DashNav />
        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 pt-6 pb-16">
          <div className="bg-white rounded-[16px] px-6 py-10 text-center">
            <p className="font-inter font-semibold text-[15px] text-[#1A1A2E] mb-2">We couldn’t load your dashboard.</p>
            <p className="font-inter text-[13px] text-[#6C737F] mb-4">{error}</p>
            <button
              type="button"
              onClick={() => { setError(null); setLoading(true); refreshDashboard(); }}
              className="font-inter font-semibold text-[13px] text-[#1A1A2E] bg-[#FFC92A] hover:bg-[#FFB800] px-5 py-2.5 rounded-[10px]"
            >
              Try again
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* ── Sections list ── */
  const sections = breakdown?.sections || [];

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      <DashNav />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 pt-6 pb-16">
        <div className="flex flex-col lg:flex-row gap-5">

          {/* ═══════════ LEFT COLUMN ═══════════ */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* ── Welcome Banner ── */}
            <div
              className="rounded-[16px] px-6 py-6 sm:px-8 sm:py-7 relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #6E43B9 0%, #4B2D99 60%, #3A1F85 100%)' }}
            >
              <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #fff 0%, transparent 70%)' }} />
              <div className="absolute bottom-0 right-16 w-24 h-24 rounded-full opacity-10 pointer-events-none"
                style={{ background: 'radial-gradient(circle, #FFC92A 0%, transparent 70%)' }} />

              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="font-inter font-bold text-[22px] sm:text-[26px] text-white leading-snug mb-1">
                    {greeting}, {firstName} 👋
                  </h1>
                  <div className="flex items-center gap-1.5">
                    <span className="font-inter text-[13px] text-white/70">
                      Civil Service Exam • {examLevelLabel}
                    </span>
                    <svg className="w-3.5 h-3.5 text-white/50 shrink-0" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.5 2L12 4.5L4.5 12H2V9.5L9.5 2Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  {!hasData && (
                    <p className="font-inter text-[13px] text-white/60 mt-2">
                      No data yet — take an exam to start your improvement plan.
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap gap-2.5 sm:shrink-0">
                  {!hasData ? (
                    <>
                      <button type="button" onClick={onTakeAssessment}
                        className="font-inter font-semibold text-[13px] text-[#1A1A2E] bg-[#FFC92A] hover:bg-[#FFB800] active:bg-[#E6A800] px-5 py-2.5 rounded-[10px] transition-colors shadow-sm">
                        Take Assessment Exam
                      </button>
                      <button type="button" onClick={onTakeMock}
                        className="font-inter font-semibold text-[13px] text-white bg-white/15 hover:bg-white/25 border border-white/30 px-5 py-2.5 rounded-[10px] transition-colors">
                        Take Full Mock Exam
                      </button>
                    </>
                  ) : (
                    <>
                      {nextTask && !planDone ? (
                        <button
                          type="button"
                          disabled={startingTaskId === nextTask.taskId}
                          onClick={() => handleStartTask(nextTask)}
                          className="font-inter font-semibold text-[13px] text-[#1A1A2E] bg-[#FFC92A] hover:bg-[#FFB800] active:bg-[#E6A800] px-5 py-2.5 rounded-[10px] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {startingTaskId === nextTask.taskId ? 'Starting…' : 'Start Task'}
                        </button>
                      ) : !sprintPlan ? (
                        <button
                          type="button"
                          onClick={planState === 'idle' ? handleGeneratePlan : undefined}
                          disabled={planState !== 'idle'}
                          className={`font-inter font-semibold text-[13px] px-5 py-2.5 rounded-[10px] transition-colors shadow-sm ${
                            planState === 'loading'
                              ? 'bg-white/20 text-white/50 cursor-not-allowed'
                              : 'text-[#1A1A2E] bg-[#FFC92A] hover:bg-[#FFB800] active:bg-[#E6A800]'
                          }`}
                        >
                          Generate 7-Day Plan
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={planState !== 'loading' ? onTakeMock : undefined}
                        disabled={planState === 'loading'}
                        className={`font-inter font-semibold text-[13px] text-white border border-white/30 px-5 py-2.5 rounded-[10px] transition-colors ${
                          planState === 'loading' ? 'bg-white/10 opacity-50 cursor-not-allowed' : 'bg-white/15 hover:bg-white/25'
                        }`}
                      >
                        Take Full Mock Exam
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ── Your Next Step ── */}
            <div className="bg-white rounded-[16px] px-6 py-5 sm:px-7 sm:py-6">

              {/* State A — No Data */}
              {stepState === 'A' && (
                <>
                  <h2 className="font-inter font-semibold text-[15px] text-[#1A1A2E] mb-1">
                    Your Next Step
                  </h2>
                  <p className="font-inter text-[13px] text-[#6C737F] mb-4">
                    Start by taking a quick assessment or full mock exam.<br />
                    We’ll use your results to guide your study plan.
                  </p>
                  <div className="border border-[#FFC92A] bg-[#FFFBEF] rounded-[12px] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-inter font-semibold text-[14px] text-[#1A1A2E] mb-0.5">
                        Take Assessment Exam
                      </h3>
                      <p className="font-inter text-[12px] text-[#6C737F]">
                        Take a quick 50-item exam to check your current level.
                      </p>
                      <p className="font-inter text-[11px] text-[#9CA3AF] mt-1">
                        ~45 minutes • Recommended starting point
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onTakeAssessment}
                      className="shrink-0 font-inter font-semibold text-[13px] text-[#1A1A2E] bg-[#FFC92A] hover:bg-[#FFB800] active:bg-[#E6A800] px-5 py-2.5 rounded-[10px] transition-colors shadow-sm"
                    >
                      Start Assessment
                    </button>
                  </div>
                </>
              )}

              {/* State B — Has data, no plan */}
              {stepState === 'B' && (
                <>
                  <h2 className="font-inter font-semibold text-[15px] text-[#1A1A2E] mb-1">
                    Your Next Step
                  </h2>
                  <p className="font-inter text-[13px] text-[#6C737F] mb-4">
                    Turn your results into a clear 7-day plan.
                  </p>
                  <div className="border border-[#FFC92A] bg-[#FFFBEF] rounded-[12px] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-inter font-semibold text-[14px] text-[#1A1A2E] mb-0.5">
                        Generate Your 7-Day Plan
                      </h3>
                      <p className="font-inter text-[12px] text-[#6C737F]">
                        We’ll create a personalized plan based on your weakest areas.
                      </p>
                      <p className="font-inter text-[11px] text-[#9CA3AF] mt-1">
                        7 short sessions • Focused on high-impact topics
                      </p>
                      {generateError && (
                        <p className="font-inter text-[11px] text-[#DC2626] mt-2">{generateError}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleGeneratePlan}
                      className="shrink-0 font-inter font-semibold text-[13px] text-[#1A1A2E] bg-[#FFC92A] hover:bg-[#FFB800] active:bg-[#E6A800] px-5 py-2.5 rounded-[10px] transition-colors shadow-sm"
                    >
                      Generate 7-Day Plan
                    </button>
                  </div>
                </>
              )}

              {/* Loading — animate plan build steps */}
              {stepState === 'LOADING' && (
                <>
                  <h2 className="font-inter font-bold text-[17px] text-[#1A1A2E] mb-1">
                    Building your 7-day plan...
                  </h2>
                  <p className="font-inter text-[13px] text-[#6C737F] mb-4">
                    This is tailored to your current level and target score.
                  </p>
                  <div className="border border-[#FFC92A] bg-[#FFFBEF] rounded-[12px] px-4 divide-y divide-[#F5EFD6]">
                    {LOADING_STEPS.map((step, idx) => {
                      if (loadingStep < idx) return null;
                      const isDone = loadingStep > idx;
                      return (
                        <div key={idx} className="flex items-center justify-between py-3.5">
                          <span className="font-inter text-[13px] text-[#1A1A2E]">{step}</span>
                          {isDone ? (
                            <svg className="w-5 h-5 shrink-0 text-[#16A34A]" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                              <path stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5l4 4 7-8" />
                            </svg>
                          ) : (
                            <div className="w-4 h-4 shrink-0 rounded-full border-2 border-[#6E43B9] border-t-transparent animate-spin" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* States C / D — Plan exists, show next task */}
              {(stepState === 'C' || stepState === 'D') && nextTask && (
                <>
                  <div className="flex items-start justify-between mb-1">
                    <h2 className="font-inter font-semibold text-[15px] text-[#1A1A2E]">Your Next Step</h2>
                    <span className="font-inter text-[12px] text-[#9CA3AF]">{completedTasks}/{totalTasks} Completed</span>
                  </div>
                  <p className="font-inter text-[13px] text-[#6C737F] mb-4">
                    {stepState === 'C'
                      ? 'Your 7-day path to passing is ready. Start here — this is your highest-impact task.'
                      : 'Complete this to move forward →'}
                  </p>
                  <div className="border border-[#FFC92A] bg-[#FFFBEF] rounded-[12px] p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-[10px] bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d={ICON_PATHS[TASK_ICON_BY_TYPE[nextTask.type] || 'book']} stroke="#434E5F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-inter font-semibold text-[14px] text-[#1A1A2E] mb-0.5">{nextTask.title}</h3>
                      <p className="font-inter text-[12px] text-[#9CA3AF]">{nextTask.meta}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTask(nextTask)}
                      className="shrink-0 font-inter font-semibold text-[13px] text-[#1A1A2E] bg-[#FFC92A] hover:bg-[#FFB800] active:bg-[#E6A800] px-4 py-2.5 rounded-[10px] transition-colors shadow-sm"
                    >
                      Start Task
                    </button>
                  </div>
                </>
              )}

              {/* State E — Plan completed */}
              {stepState === 'E' && (
                <>
                  <h2 className="font-inter font-semibold text-[15px] text-[#1A1A2E] mb-1">
                    Your Next Step
                  </h2>
                  <p className="font-inter text-[13px] text-[#6C737F] mb-4">
                    You’ve completed your 7-day plan. Time to measure your progress.
                  </p>
                  <div className="border border-[#FFC92A] bg-[#FFFBEF] rounded-[12px] p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-inter font-semibold text-[14px] text-[#1A1A2E] mb-0.5">
                        Take Full Mock Exam
                      </h3>
                      <p className="font-inter text-[12px] text-[#6C737F]">
                        Validate your improvement with a full-length exam.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onTakeMock}
                      className="shrink-0 font-inter font-semibold text-[13px] text-[#1A1A2E] bg-[#FFC92A] hover:bg-[#FFB800] active:bg-[#E6A800] px-5 py-2.5 rounded-[10px] transition-colors shadow-sm"
                    >
                      Take Full Mock
                    </button>
                  </div>
                </>
              )}

              {/* Recommended Focus – shown when has data */}
              {hasData && recommendedFocus && (
                <div className="mt-5">
                  <h3 className="font-inter font-semibold text-[14px] text-[#1A1A2E] mb-1">
                    Recommended Focus
                  </h3>
                  <p className="font-inter text-[13px] text-[#6C737F] mb-3">
                    {recommendedFocus.reason}
                  </p>
                  <div className="flex items-stretch divide-x divide-[#F2F4F7] border border-[#F2F4F7] rounded-[12px] overflow-hidden">
                    <div className="flex-1 flex items-center gap-3 px-3 py-3 sm:px-4">
                      <div className="w-9 h-9 rounded-[8px] bg-[#F5F4FF] flex items-center justify-center shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d={ICON_PATHS.book} stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="font-inter font-bold text-[14px] text-[#1A1A2E] truncate">{recommendedFocus.section}</p>
                        <p className="font-inter text-[11px] text-[#9CA3AF]">Section to focus</p>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-3 px-3 py-3 sm:px-4">
                      <div className="w-9 h-9 rounded-[8px] bg-[#F5F4FF] flex items-center justify-center shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 15.0001V11.9861M16 15.0001V11.9861M20 6H4M20 8V4M4 8V4M8 15.0001V11.9861M4 12H20C20.5523 12 21 12.4477 21 13V18C21 18.5523 20.5523 19 20 19H4C3.44772 19 3 18.5523 3 18V13C3 12.4477 3.44772 12 4 12Z" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-inter font-bold text-[14px] text-[#1A1A2E]">{recommendedFocus.gapDisplay}</p>
                        <p className="font-inter text-[11px] text-[#9CA3AF]">Gap to pass</p>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center gap-3 px-3 py-3 sm:px-4">
                      <div className="w-9 h-9 rounded-[8px] bg-[#F5F4FF] flex items-center justify-center shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21.2104 15.8906C20.5742 17.395 19.5792 18.7208 18.3123 19.7519C17.0454 20.783 15.5452 21.488 13.9428 21.8053C12.3405 22.1227 10.6848 22.0427 9.12055 21.5724C7.55627 21.102 6.13103 20.2556 4.96942 19.1072C3.80782 17.9588 2.94522 16.5433 2.45704 14.9845C1.96886 13.4257 1.86996 11.7711 2.169 10.1652C2.46804 8.55935 3.1559 7.05119 4.17245 5.7726C5.189 4.494 6.50329 3.48388 8.0004 2.83057M21.0004 12.0004C21.5524 12.0004 22.0054 11.5514 21.9504 11.0024C21.7198 8.70658 20.7025 6.56111 19.0707 4.92973C17.439 3.29835 15.2933 2.28144 12.9974 2.05141C12.4474 1.99641 11.9994 2.44941 11.9994 3.00141V11.0014C11.9994 11.2666 12.1047 11.521 12.2923 11.7085C12.4798 11.8961 12.7342 12.0014 12.9994 12.0014L21.0004 12.0004Z" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-inter font-bold text-[14px] text-[#1A1A2E]">{recommendedFocus.weightDisplay}</p>
                        <p className="font-inter text-[11px] text-[#9CA3AF]">Section weight</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Section and Topic Breakdown ── */}
            <div className="bg-white rounded-[16px] overflow-hidden">
              <div className="px-6 py-4 sm:px-7 border-b border-[#F2F4F7]">
                <h2 className="font-inter font-semibold text-[15px] text-[#1A1A2E] mb-0.5">
                  Section and Topic Breakdown
                </h2>
                <p className="font-inter text-[12px] text-[#9CA3AF]">
                  {breakdown?.subtitle || 'Your performance breakdown will appear after your first exam.'}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#DED8E8] bg-[#F7F5FA]">
                      <th className="py-2.5 pl-4 pr-2 text-left font-inter font-semibold text-[11px] text-[#4E4958] uppercase tracking-wide w-[35%]">Section</th>
                      <th className="py-2.5 px-2 text-left font-inter font-semibold text-[11px] text-[#4E4958] uppercase tracking-wide">Score</th>
                      <th className="py-2.5 px-2 text-left font-inter font-semibold text-[11px] text-[#4E4958] uppercase tracking-wide">Weight</th>
                      <th className="py-2.5 px-2 text-left font-inter font-semibold text-[11px] text-[#4E4958] uppercase tracking-wide">Status</th>
                      <th className="py-2.5 px-2 text-left font-inter font-semibold text-[11px] text-[#4E4958] uppercase tracking-wide">Priority</th>
                      <th className="py-2.5 px-2 text-left font-inter font-semibold text-[11px] text-[#4E4958] uppercase tracking-wide">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.map((section) => (
                      <SectionRow
                        key={section.key}
                        section={section}
                        isExpanded={!!expandedSections[section.key]}
                        onToggle={() => toggleSection(section.key)}
                        hasData={!!breakdown?.hasData}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="px-6 py-3 border-t border-[#F2F4F7]">
                <p className="font-inter text-[12px] text-[#9CA3AF]">
                  {breakdown?.footnote || 'Take an exam to unlock your performance breakdown and weakest areas.'}
                </p>
              </div>
            </div>

            {/* ── 7-Day Sprint Progress ── */}
            <div className="bg-white rounded-[16px] px-6 py-5 sm:px-7 sm:py-6">
              <h2 className="font-inter font-semibold text-[15px] text-[#1A1A2E] mb-0.5">
                7-Day Sprint Progress
              </h2>
              {sprintPlan ? (
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-inter text-[13px] text-[#6C737F] leading-snug">Your next 7 study sessions based on your weakest areas</p>
                    <p className="font-inter text-[13px] text-[#6C737F] leading-snug">Complete this sprint, then retake a mock to verify your progress.</p>
                  </div>
                  <span className="font-inter text-[12px] text-[#9CA3AF] shrink-0 ml-4 mt-0.5">{completedTasks}/{totalTasks} Completed</span>
                </div>
              ) : (
                <p className="font-inter text-[13px] text-[#6C737F] mb-4">
                  Your personalized study plan will appear here once generated.
                </p>
              )}

              {sprintPlan ? (
                <div className="flex flex-col gap-2">
                  {sprintPlan.tasks.map((task) => {
                    const isCurrent = task.taskId === sprintPlan.nextTask?.taskId;
                    const isCompleted = task.status === 'completed';
                    const iconKey = TASK_ICON_BY_TYPE[task.type] || 'book';
                    return (
                      <div
                        key={task.taskId}
                        className={`flex items-center gap-3.5 p-4 rounded-[12px] border ${
                          isCurrent ? 'border-[#FFC92A] bg-[#FFFBEF]' : 'border-[#F2F4F7] bg-white'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-[10px] bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d={ICON_PATHS[iconKey]} stroke="#434E5F" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="font-inter font-semibold text-[13px] text-[#1A1A2E] mb-0.5 truncate">{task.title}</p>
                          <p className="font-inter text-[12px] text-[#9CA3AF] truncate">{task.meta}</p>
                        </div>

                        {isCurrent && !isCompleted ? (
                          <button
                            type="button"
                            onClick={() => setActiveTask(task)}
                            className="shrink-0 font-inter font-semibold text-[13px] text-[#1A1A2E] bg-[#FFC92A] hover:bg-[#FFB800] active:bg-[#E6A800] px-4 py-2 rounded-[10px] transition-colors shadow-sm"
                          >
                            Start Task
                          </button>
                        ) : isCompleted ? (
                          <div className="shrink-0 text-right">
                            <span className="inline-flex items-center gap-1.5 font-inter font-semibold text-[12px] text-[#06A561]">
                              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18.1708 8.33357C18.5513 10.2013 18.2801 12.1431 17.4023 13.8351C16.5245 15.527 15.0932 16.8669 13.347 17.6313C11.6009 18.3957 9.64545 18.5384 7.80684 18.0355C5.96823 17.5327 4.35758 16.4147 3.24349 14.8681C2.12939 13.3214 1.57919 11.4396 1.68464 9.53639C1.79009 7.63318 2.54482 5.82364 3.82297 4.40954C5.10111 2.99545 6.82541 2.06226 8.70831 1.76561C10.5912 1.46897 12.5189 1.82679 14.1699 2.7794M7.50325 9.16691L10.0032 11.6669L18.3366 3.33358" stroke="#06A561" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                              DONE
                            </span>
                            {task.result && (
                              <p className="font-inter text-[11px] text-[#9CA3AF] mt-0.5">
                                +{task.result.correct}/{task.result.totalItems} correct
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="shrink-0 inline-flex items-center gap-1.5 font-inter font-medium text-[12px] text-[#9CA3AF]">
                            <span className="w-2 h-2 rounded-full bg-[#F87171] shrink-0" />
                            NOT STARTED
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border border-[#FFC92A] rounded-[12px] p-5 flex items-start gap-4 bg-[#FFFBEF]">
                  <div className="w-10 h-10 rounded-[10px] bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d={ICON_PATHS.book} stroke="#434E5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <p className="font-inter font-semibold text-[13px] text-[#1A1A2E] mb-0.5">
                      No active plan yet
                    </p>
                    <p className="font-inter text-[12px] text-[#9CA3AF]">
                      {hasData ? (
                        <>Generate your 7-day plan to start a guided study routine based on your assessment.<br />Includes smart daily tasks, topic drills, and progress tracking.</>
                      ) : (
                        <>Your 7-day study plan will be created after your first exam.<br />Includes daily tasks, topic drills, and progress tracking.</>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══════════ RIGHT SIDEBAR ═══════════ */}
          <div className="w-full lg:w-[300px] xl:w-[320px] shrink-0 flex flex-col gap-4">

            {/* ── Readiness Checker ── */}
            <div className="bg-white rounded-[16px] px-5 py-5">
              <h3 className="font-inter font-semibold text-[14px] text-[#1A1A2E] mb-1">
                Readiness Checker
              </h3>
              <p className="font-inter text-[12px] text-[#9CA3AF] mb-3 text-center">
                Civil Service Exam ({examLevelLabel})
              </p>

              {readiness && readiness.mode !== 'no_data' && readiness.readinessScore != null
                ? <SemiCircleGauge percentage={readiness.readinessScore * 100} badge={readiness.badge} />
                : <NoDataSemiCircle />}

              {readiness?.label && (
                <p className="font-inter text-[12px] text-[#1A1A2E] text-center mt-2 font-semibold">
                  {readiness.label}
                </p>
              )}
              {readiness?.sourceLabel && (
                <p className="font-inter text-[11px] text-[#9CA3AF] text-center mt-0.5">
                  {readiness.sourceLabel}
                </p>
              )}

              {/* Stats row */}
              <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#F2F4F7]">
                <div className="flex flex-col items-center gap-0.5">
                  <span className="font-inter font-bold text-[18px] text-[#6E43B9]">
                    {readiness ? `${Math.round(readiness.passingScore * 100)}%` : '80%'}
                  </span>
                  <span className="font-inter text-[10px] text-[#9CA3AF] text-center leading-tight">Passing<br />Score</span>
                </div>
                <div className="w-px h-8 bg-[#F2F4F7]" />
                <div className="flex flex-col items-center gap-0.5">
                  <span className="font-inter font-bold text-[18px] text-[#10B981]">
                    {readiness ? `${Math.round(readiness.safeZone * 100)}%` : '85%'}
                  </span>
                  <span className="font-inter text-[10px] text-[#9CA3AF] text-center leading-tight">Safe<br />Zone</span>
                </div>
                {readiness?.daysBeforeExam != null && (
                  <>
                    <div className="w-px h-8 bg-[#F2F4F7]" />
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="font-inter font-bold text-[18px] text-[#F59E0B]">
                        {readiness.daysBeforeExam}
                      </span>
                      <span className="font-inter text-[10px] text-[#9CA3AF] text-center leading-tight">days<br />before CSE</span>
                    </div>
                  </>
                )}
              </div>

              {readiness?.supportingMessage && (
                <p className="font-inter text-[12px] text-[#6C737F] mt-3 text-center">
                  {readiness.supportingMessage}
                </p>
              )}
            </div>

            {/* ── CSE Updates ── */}
            <div className="bg-white rounded-[16px] px-5 py-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base leading-none">📌</span>
                <h3 className="font-inter font-semibold text-[14px] text-[#1A1A2E]">
                  CSE Updates
                </h3>
              </div>
              <p className="font-inter text-[13px] text-[#6C737F] leading-relaxed">
                Filing now available. Check them on the official CSC portal:{' '}
                <a
                  href="https://www.csc.gov.ph"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[#6E43B9] font-medium hover:underline"
                >
                  Go to Official Site
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
