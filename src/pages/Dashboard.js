import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashNav from '../components/DashNav';
import DashboardSkeleton from '../components/skeletons/DashboardSkeleton';
import PaywallModal from '../components/PaywallModal';
import { useAuth } from '../context/AuthContext';
import { dashboardAPI, reviewerAPI } from '../services/api';
import { isPremiumActive } from '../utils/subscription';
import {
  trackDashboardGeneratePlanClicked,
  trackDashboardStartTaskClicked,
  trackDashboardTakeMockClicked,
  trackDashboardTakeAssessmentClicked,
} from '../services/analytics';

const PAYWALL_DISMISSED_KEY = 'reviewly:paywall:after_plan_dismissed';

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

const STATUS_CONFIG = {
  Weak: { emoji: '🔴', text: 'text-[#232027]' },
  Improving: { emoji: '🟡', text: 'text-[#232027]' },
  Strong: { emoji: '🟢', text: 'text-[#232027]' },
};

const PRIORITY_CONFIG = {
  High: 'bg-[#F0142F1A] text-[#F0142F]',
  Medium: 'bg-[#FFC92A1A] text-[#BC8C00]',
  Low: 'bg-[#14B8A61A] text-[#14B8A6]',
};

const EXAM_LEVEL_LABEL = {
  professional: 'Professional',
  subprofessional: 'Sub-Professional',
};

const ICON_PATHS = {
  book: 'M4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2H19C19.2652 2 19.5196 2.10536 19.7071 2.29289C19.8946 2.48043 20 2.73478 20 3V21C20 21.2652 19.8946 21.5196 19.7071 21.7071C19.5196 21.8946 19.2652 22 19 22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5ZM4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20M8 13L12 6L16 13M9.09998 11H14.8',
  gear: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
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
  if (!status) return <span className="font-inter text-[14px] text-[#181D1F]">–</span>;
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Improving;
  return (
    <span className={`font-inter text-[14px] ${cfg.text}`}>
      {cfg.emoji}{" "}{status}
    </span>
  );
};

const PriorityBadge = ({ priority }) => {
  if (!priority) return <span className="font-inter text-[14px] text-[#181D1F]">–</span>;
  return (
    <span className={`inline-block font-inter font-medium text-[14px] px-[12px] py-[2px] rounded-full ${PRIORITY_CONFIG[priority] || ''}`}>
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

  return (
    <div className="relative w-full mx-auto" style={{ maxWidth: '240px' }}>
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
        <div className="absolute inset-x-0 top-[70%] -translate-y-1/2 flex justify-center pb-1">
          <span className="font-inter font-medium text-[38px] text-[#232027]">
            {pct.toFixed(2)}%
          </span>
        </div>
      </div>
      {badge && (
        <div className="flex justify-center">
          <span
            className="inline-flex items-center gap-[8px] font-inter font-medium text-[14px] px-[12px] py-[2px] rounded-full"
            style={{ background: '#14B8A61A', color: '#00824A' }}
          >
            {badge}
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.41667 10.0833V7.41667M7.41667 4.75H7.42333M14.0833 7.41667C14.0833 11.0986 11.0986 14.0833 7.41667 14.0833C3.73477 14.0833 0.75 11.0986 0.75 7.41667C0.75 3.73477 3.73477 0.75 7.41667 0.75C11.0986 0.75 14.0833 3.73477 14.0833 7.41667Z" stroke="#00824A" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
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
    <div className="relative w-full mx-auto mb-[55px]" style={{ maxWidth: '240px' }}>
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
        <div className="absolute inset-x-0 top-[70%] -translate-y-1/2 flex justify-center pb-1">
          <span className="font-inter font-medium text-[14px] text-[#232027]">No data yet</span>
        </div>
      </div>
      <p className="max-w-[200px] mx-auto text-center font-inter italic text-[12px] text-[#45464E] mt-2 leading-snug">
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
        className={`border-b border-[#181D1F1A] ${hasTopics ? 'cursor-pointer hover:bg-[#FCFBFE]' : ''}`}
        onClick={hasTopics ? onToggle : undefined}
      >
        <td className="py-3 pl-[16px] pr-[16px]">
          <div className="flex items-center gap-[12px]">
            {hasTopics ? <ChevronIcon open={isExpanded} /> : <span className="w-4 h-4 shrink-0" />}
            <span className={`font-inter ${hasData ? 'font-semibold' : 'font-medium'} text-[13px] text-[#1A1A2E]`}>
              {section.label}
            </span>
          </div>
        </td>
        <td className="py-3 px-[16px] text-left font-inter font-medium text-[14px] text-[#1A1A2E]">
          {section.scoreDisplay}
        </td>
        <td className="py-3 px-[16px] text-left font-inter text-[14px] text-[#232027]">
          {section.weightDisplay}
        </td>
        <td className="py-3 px-[16px] text-left"><StatusLabel status={section.status} /></td>
        <td className="py-3 px-[16px] text-left"><PriorityBadge priority={section.priority} /></td>
        <td className="py-3 px-[16px] text-left font-inter text-[14px] text-[#232027]">
          {section.action || '–'}
        </td>
      </tr>
      {isExpanded && (
        <>
          <tr className="bg-[#F7F3FB] border-b border-[#E6E2EE]">
            <th scope="col" className="py-2 pl-[40px] pr-[16px] text-left font-inter font-semibold text-[14px] text-[#45464ECC] tracking-wide">Topic</th>
            <th scope="col" className="py-2 px-[16px] text-left font-inter font-semibold text-[14px] text-[#45464ECC] tracking-wide">Score</th>
            <th scope="col" className="py-2 px-[16px] text-left font-inter font-semibold text-[14px] text-[#45464ECC] tracking-wide">Result</th>
            <th scope="col" className="py-2 px-[16px] text-left font-inter font-semibold text-[14px] text-[#45464ECC] tracking-wide">Status</th>
            <th scope="col" className="py-2 px-[16px]" />
            <th scope="col" className="py-2 px-[16px]" />
          </tr>
          {section.topics.map((topic) => (
            <tr key={topic.name} className={`border-b ${hasData ? 'border-[#EDE9F3] hover:bg-[#FCFBFE]' : 'border-[#F2F4F7] bg-[#FAFAFA]'}`}>
              <td className="py-2.5 pl-[40px] pr-[16px] font-inter text-[14px] text-[#181D1F]">{topic.name}</td>
              <td className="py-2.5 px-[16px] text-left font-inter text-[14px] text-[#181D1F]">{topic.scoreDisplay}</td>
              <td className="py-2.5 px-[16px] text-left font-inter text-[14px] text-[#181D1F]">{topic.result}</td>
              <td className="py-2.5 px-[16px] text-left"><StatusLabel status={topic.status} /></td>
              <td className="py-2.5 px-[16px]" /><td className="py-2.5 px-[16px]" />
            </tr>
          ))}
        </>
      )}
    </>
  );
};

const SectionCard = ({ section, isExpanded, onToggle, hasData }) => {
  const hasTopics = section.topics && section.topics.length > 0;
  return (
    <div
      className={`rounded-[14px] border border-[#E6E2EE] bg-white p-[14px] ${hasTopics ? 'cursor-pointer hover:bg-[#FCFBFE]' : ''}`}
      onClick={hasTopics ? onToggle : undefined}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-[8px] min-w-0">
          {hasTopics ? <ChevronIcon open={isExpanded} /> : <span className="w-4 h-4 shrink-0" />}
          <span className={`font-inter ${hasData ? 'font-semibold' : 'font-medium'} text-[14px] text-[#1A1A2E] truncate`}>
            {section.label}
          </span>
        </div>
        <div className="flex items-center gap-[8px] shrink-0">
          <span className="font-inter text-[12px] text-[#6C737F]">Priority</span>
          <PriorityBadge priority={section.priority} />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-[8px] mt-[12px]">
        <div>
          <div className="font-inter font-medium text-[13px] text-[#1A1A2E]">{section.scoreDisplay}</div>
          <div className="font-inter text-[11px] text-[#6C737F] mt-[2px]">Score</div>
        </div>
        <div>
          <div className="font-inter font-medium text-[13px] text-[#1A1A2E]">{section.weightDisplay}</div>
          <div className="font-inter text-[11px] text-[#6C737F] mt-[2px]">Weight</div>
        </div>
        <div>
          <div className="font-inter text-[13px] text-[#1A1A2E] truncate">
            {section.status ? `${(STATUS_CONFIG[section.status] || STATUS_CONFIG.Improving).emoji} ${section.status}` : '–'}
          </div>
          <div className="font-inter text-[11px] text-[#6C737F] mt-[2px]">Status</div>
        </div>
        <div>
          <div className="font-inter text-[13px] text-[#1A1A2E]">{section.action || '–'}</div>
          <div className="font-inter text-[11px] text-[#6C737F] mt-[2px]">Action</div>
        </div>
      </div>

      {isExpanded && hasTopics && (
        <div className="mt-[14px] space-y-[14px] border-t border-[#EDE9F3] pt-[14px]">
          {section.topics.map((topic) => (
            <div key={topic.name}>
              <div className="flex items-center gap-[8px] mb-[8px]">
                <span className="font-inter text-[11px] text-[#6C737F]">Topic</span>
                <span className="font-inter font-medium text-[13px] text-[#1A1A2E] truncate">{topic.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-[8px]">
                <div>
                  <div className="font-inter text-[13px] text-[#1A1A2E]">{topic.scoreDisplay}</div>
                  <div className="font-inter text-[11px] text-[#6C737F] mt-[2px]">Score</div>
                </div>
                <div>
                  <div className="font-inter text-[13px] text-[#1A1A2E]">{topic.result}</div>
                  <div className="font-inter text-[11px] text-[#6C737F] mt-[2px]">Result</div>
                </div>
                <div>
                  <div className="font-inter text-[13px] text-[#1A1A2E] truncate">
                    {topic.status ? `${(STATUS_CONFIG[topic.status] || STATUS_CONFIG.Improving).emoji} ${topic.status}` : '–'}
                  </div>
                  <div className="font-inter text-[11px] text-[#6C737F] mt-[2px]">Status</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
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
  const [generateError, setGenerateError] = useState(null);
  const [startingTaskId, setStartingTaskId] = useState(null);
  const [mockReviewerId, setMockReviewerId] = useState(null);

  // Paywall state. `paywallVariant` drives both visibility and copy; null
  // means closed.
  const [paywallVariant, setPaywallVariant] = useState(null);

  const isPremium = isPremiumActive(user);

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
      .catch(() => { });
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

  // Whether this user has already dismissed the after-plan-generation modal
  // in a prior session. Persisted to localStorage so it doesn't re-pop on
  // every page load.
  const wasAfterPlanDismissed = () => {
    try {
      return localStorage.getItem(PAYWALL_DISMISSED_KEY) === '1';
    } catch (_) {
      return false;
    }
  };
  const markAfterPlanDismissed = () => {
    try { localStorage.setItem(PAYWALL_DISMISSED_KEY, '1'); } catch (_) {}
  };

  const handleGeneratePlan = async () => {
    if (planState !== 'idle') return;
    if (!hasData) return; // no exam taken yet — backend would reject anyway
    trackDashboardGeneratePlanClicked({
      isRegeneration: canRegenerateSprint,
      planType: user?.subscription?.plan || 'free',
    });
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
        // Trigger 1 — after first plan generation, show the paywall (free
        // users only, and only if they haven't already dismissed it).
        if (!isPremium && !wasAfterPlanDismissed()) {
          setPaywallVariant('after_plan_generation');
        }
      } else {
        // 402 from server when free user tries to regenerate after completion.
        if (res.code === 'premium_required') {
          setPaywallVariant('regenerate_sprint');
        } else if (res.code === 'needs_new_mock') {
          setGenerateError('Take a full mock exam first — regeneration uses your latest score to build a different plan.');
        } else {
          setGenerateError(res.message || 'Could not generate plan');
        }
        setPlanState('idle');
      }
    } catch (err) {
      if (err.status === 402 || err.apiResponse?.code === 'premium_required') {
        setPaywallVariant('regenerate_sprint');
      } else if (err.apiResponse?.code === 'needs_new_mock') {
        setGenerateError('Take a full mock exam first — regeneration uses your latest score to build a different plan.');
      } else {
        setGenerateError(err.message || 'Could not generate plan');
      }
      setPlanState('idle');
    }
  };

  const openTaskOverview = (task) => {
    if (!task) return;
    // Trigger 2 — Start Task is the canonical paywall trigger.
    if (!isPremium) {
      trackDashboardStartTaskClicked({
        taskId: task.taskId,
        taskType: task.type,
        taskTitle: task.title,
        triggeredPaywall: true,
        planType: user?.subscription?.plan || 'free',
      });
      setPaywallVariant('start_sprint_task');
      return;
    }
    trackDashboardStartTaskClicked({
      taskId: task.taskId,
      taskType: task.type,
      taskTitle: task.title,
      triggeredPaywall: false,
      planType: user?.subscription?.plan || 'free',
    });
    // Premium users go to the task overview page; the actual
    // dashboardAPI.startTask call happens when they click "Start Task" there.
    setStartingTaskId(task.taskId);
    navigate(`/dashboard/sprint/task/${task.taskId}/overview`);
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
  const regenerateGate = dashboard?.sprintRegenerate || null;
  const canRegenerateSprint = !!regenerateGate?.canRegenerate;

  // "Your Next Step" state machine.
  const stepState = useMemo(() => {
    if (planState === 'loading') return 'LOADING';
    if (!hasData) return 'A';
    if (!sprintPlan) return 'B';
    if (planDone) return 'E';
    if (completedTasks === 0) return 'C';
    return 'D';
  }, [planState, hasData, sprintPlan, planDone, completedTasks]);

  // The trial assessment page redirects authenticated users that have already
  // completed/skipped the trial back to the dashboard. The Dashboard's
  // assessment CTAs explicitly want to *retake* the trial, so we pass a flag
  // that tells /trial to skip that redirect.
  const onTakeAssessment = () => {
    trackDashboardTakeAssessmentClicked({ planType: user?.subscription?.plan || 'free' });
    navigate('/trial?retake=1');
  };
  const onTakeMock = () => {
    trackDashboardTakeMockClicked({ planType: user?.subscription?.plan || 'free' });
    if (mockReviewerId) navigate(`/dashboard/exam/${mockReviewerId}`);
    else navigate('/dashboard/all-reviewers');
  };

  const sections = useMemo(() => breakdown?.sections || [], [breakdown?.sections]);
  const sortedSections = useMemo(() => {
    const priorityOrder = { High: 0, Medium: 1, Low: 2 };
    return [...sections].sort((a, b) => {
      const aPriority = priorityOrder[a.priority] ?? 3;
      const bPriority = priorityOrder[b.priority] ?? 3;
      return aPriority - bPriority;
    });
  }, [sections]);

  /* ── Loading skeleton ── */
  if (loading) {
    return <DashboardSkeleton />;
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

  /* ── Readiness Checker (rendered in two locations: mobile under banner, desktop in sidebar) ── */
  const readinessCheckerCard = (
    <div className="bg-white rounded-[18px] p-[20px] sm:p-[24px]">
      <h3 className="font-inter font-bold text-[18px] text-[#1A1A2E] mb-[16px]">
        Readiness Checker
      </h3>
      <p className="font-inter text-[13px] text-[#45464E] mb-[22px] text-center">
        Civil Service Exam ({examLevelLabel})
      </p>

      {readiness && readiness.mode !== 'no_data' && readiness.readinessScore != null
        ? <SemiCircleGauge percentage={readiness.readinessScore * 100} badge={readiness.badge} />
        : <NoDataSemiCircle />}

      {readiness?.sourceLabel && (
        <p className="font-inter italic text-[13px] text-[#6C737F] text-center mt-[16px] mb-[24px]">
          {readiness.sourceLabel}
        </p>
      )}

      {/* Stats row */}
      <div className={`grid ${readiness?.daysBeforeExam != null ? 'grid-cols-3' : 'grid-cols-2'} divide-x divide-[#E5E7EB] text-center`}>
        <div className="py-[16px] px-[4px]">
          <span className="font-inter font-semibold text-[18px] text-[#6E43B9] block">
            {readiness ? `${Math.round(readiness.passingScore * 100)}%` : '80%'}
          </span>
          <span className="font-inter text-[12px] text-[#737373] block mt-[4px]">
            Passing Score
          </span>
        </div>
        <div className="py-[16px] px-[4px]">
          <span className="font-inter font-semibold text-[18px] text-[#6E43B9] block">
            {readiness ? `${Math.round(readiness.safeZone * 100)}%` : '85%'}
          </span>
          <span className="font-inter text-[12px] text-[#737373] block mt-[4px]">
            Safe Zone
          </span>
        </div>
        {readiness?.daysBeforeExam != null && (
          <div className="py-[16px] px-[4px]">
            <span className="font-inter font-semibold text-[18px] text-[#6E43B9] block">
              {readiness.daysBeforeExam} days
            </span>
            <span className="font-inter text-[12px] text-[#737373] block mt-[4px]">
              before CSE
            </span>
          </div>
        )}
      </div>

      {readiness?.mode !== 'no_data' && readiness?.supportingMessage && (
        <p className="font-inter text-[14px] text-[#45464E] mt-[22px]">
          {readiness.supportingMessage}
        </p>
      )}
    </div>
  );

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      <DashNav />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 pt-6 pb-16">
        <div className="flex flex-col lg:flex-row gap-5">

          {/* ═══════════ LEFT COLUMN ═══════════ */}
          <div className="flex-1 min-w-0 flex flex-col gap-[24px]">

            {/* ── Welcome Banner ── */}
            <div
              className="rounded-[12px] px-5 py-5 sm:px-[24px] sm:py-[29px] relative overflow-hidden"
              style={{ background: 'linear-gradient(98.48deg, #8156D1 2.51%, #421983 47.46%, #4945B3 107.59%)' }}
            >
              <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                <div>
                  <h1 className="font-inter font-bold text-[20px] sm:text-[24px] text-white leading-snug mb-[10px] sm:mb-[16px]">
                    {greeting}, {firstName} 👋
                  </h1>
                  <div className="flex items-center gap-1.5">
                    <span className="font-inter font-medium text-[14px] text-[#EEEEEE]">
                      Civil Service Exam • {examLevelLabel}
                    </span>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clip-path="url(#clip0_1392_15200)">
                        <path d="M7.49994 2.50024L9.49994 4.50024M10.587 3.40619C10.8513 3.1419 10.9999 2.78342 10.9999 2.40962C11 2.03581 10.8515 1.6773 10.5872 1.41294C10.3229 1.14859 9.96445 1.00005 9.59064 1C9.21684 0.999953 8.85832 1.1484 8.59397 1.41269L1.92097 8.08719C1.80488 8.20294 1.71902 8.34546 1.67097 8.50219L1.01047 10.6782C0.997545 10.7214 0.996569 10.7674 1.00764 10.8111C1.01872 10.8549 1.04143 10.8948 1.07337 10.9267C1.1053 10.9586 1.14528 10.9812 1.18905 10.9922C1.23282 11.0032 1.27875 11.0022 1.32197 10.9892L3.49847 10.3292C3.65505 10.2816 3.79755 10.1962 3.91347 10.0807L10.587 3.40619Z" stroke="#D8D8D8" stroke-linecap="round" stroke-linejoin="round" />
                      </g>
                      <defs>
                        <clipPath id="clip0_1392_15200">
                          <rect width="12" height="12" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  {!hasData && (
                    <p className="font-inter font-medium text-[14px] text-[#EEEEEE] mt-[4px]">
                      No data yet — take an exam to start your improvement plan.
                    </p>
                  )}
                </div>

                <div className="flex flex-row flex-wrap gap-2 sm:gap-2.5 sm:shrink-0">
                  {!hasData ? (
                    <>
                      <button type="button" onClick={onTakeAssessment}
                        className="flex-1 sm:flex-none font-inter font-medium text-[12px] sm:text-[14px] text-[#141415] bg-[#FFC92A] hover:bg-[#FFB800] active:bg-[#E6A800] px-[12px] py-[10px] sm:px-[16px] sm:py-[11.5px] rounded-[8px] transition-colors shadow-sm">
                        Take Assessment Exam
                      </button>
                      <button type="button" onClick={onTakeMock}
                        className="flex-1 sm:flex-none font-inter font-medium text-[12px] sm:text-[14px] text-white hover:bg-white/25 border border-[#FFFFFF] px-[12px] py-[10px] sm:px-[16px] sm:py-[11.5px] rounded-[8px] transition-colors">
                        Take Full Mock Exam
                      </button>
                    </>
                  ) : (
                    <>
                      {nextTask && !planDone ? (
                        <button
                          type="button"
                          disabled={startingTaskId === nextTask.taskId}
                          onClick={() => openTaskOverview(nextTask)}
                          className="flex-1 sm:flex-none font-inter font-medium text-[12px] sm:text-[14px] text-[#141415] bg-[#FFC92A] hover:bg-[#FFB800] active:bg-[#E6A800] px-[12px] py-[10px] sm:px-[16px] sm:py-[11.5px] rounded-[8px] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Start Task
                        </button>
                      ) : !sprintPlan ? (
                        <button
                          type="button"
                          onClick={planState === 'idle' ? handleGeneratePlan : undefined}
                          disabled={planState !== 'idle'}
                          className={`flex-1 sm:flex-none font-inter font-medium text-[12px] sm:text-[14px] px-[12px] py-[10px] sm:px-[16px] sm:py-[11.5px] rounded-[8px] transition-colors shadow-sm ${planState === 'loading'
                            ? 'bg-[#B0B0B0] text-[#141415] cursor-not-allowed'
                            : 'text-[#141415] bg-[#FFC92A] hover:bg-[#FFB800] active:bg-[#E6A800]'
                            }`}
                        >
                          Generate 7-Day Plan
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={planState !== 'loading' ? onTakeMock : undefined}
                        disabled={planState === 'loading'}
                        className={`flex-1 sm:flex-none font-inter font-medium text-[12px] sm:text-[14px] text-white border border-[#FFFFFF] px-[12px] py-[10px] sm:px-[16px] sm:py-[11.5px] rounded-[8px] transition-colors ${planState === 'loading' ? 'border-[#B0B0B0] text-[#B0B0B0] cursor-not-allowed' : ''
                          }`}
                      >
                        Take Full Mock Exam
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ── Readiness Checker (mobile only — sits under banner, before Your Next Step) ── */}
            <div className="lg:hidden">
              {readinessCheckerCard}
            </div>

            {/* ── Your Next Step ── */}
            <div className="bg-white rounded-[12px] p-[20px] sm:p-[24px]">

              {/* State A — No Data */}
              {stepState === 'A' && (
                <>
                  <h2 className="font-inter font-bold text-[20px] text-[#45464E] mb-[8px]">
                    Your Next Step
                  </h2>
                  <p className="font-inter text-[14px] text-[#0F172ABF] mb-[16px]">
                    Start by taking a quick assessment. You can take a full mock exam if you prefer the full experience.<br />
                    This will show you exactly where you stand — and what to fix.
                  </p>
                  <div className="border border-[#FFCC00] bg-[#FFF9E9] rounded-[8px] p-[16px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-inter font-semibold text-[14px] text-[#0F172A] mb-[4px]">
                        Take Assessment Exam
                      </h3>
                      <p className="font-inter text-[12px] text-[#0F172A]">
                        Take a quick 50-item exam to check your current level. We’ll use this to build your personalized 7-day plan.
                      </p>
                      <p className="font-inter text-[12px] text-[#0F172A] mt-[4px]">
                        ~45 minutes • Recommended starting point
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onTakeAssessment}
                      className="shrink-0 font-inter font-medium text-[14px] text-[#141415] bg-[#FFC92A] hover:bg-[#FFB800] active:bg-[#E6A800] px-[16px] py-[11.5px] rounded-[8px] transition-colors shadow-sm"
                    >
                      Start Assessment
                    </button>
                  </div>
                </>
              )}

              {/* State B — Has data, no plan */}
              {stepState === 'B' && (
                <>
                  <h2 className="font-inter font-bold text-[20px] text-[#45464E] mb-[8px]">
                    Your Next Step
                  </h2>
                  <p className="font-inter text-[14px] text-[#0F172ABF] mb-[16px]">
                    Turn your results into a clear 7-day plan.
                  </p>
                  <div className="border border-[#FFCC00] bg-[#FFF9E9] rounded-[8px] p-[16px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-inter font-semibold text-[14px] text-[#0F172A] mb-[4px]">
                        Generate Your 7-Day Plan
                      </h3>
                      <p className="font-inter text-[12px] text-[#0F172A]">
                        We’ll create a personalized plan based on your weakest areas to help you reach passing faster.
                      </p>
                      <p className="font-inter text-[12px] text-[#0F172A] mt-[4px]">
                        7 short sessions • Focused on your weakest topics
                      </p>
                      {generateError && (
                        <p className="font-inter text-[12px] text-[#DC2626] mt-[4px]">{generateError}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={handleGeneratePlan}
                      className="shrink-0 font-inter font-medium text-[14px] text-[#141415] bg-[#FFC92A] hover:bg-[#FFB800] active:bg-[#E6A800] px-[16px] py-[11.5px] rounded-[8px] transition-colors shadow-sm"
                    >
                      Generate 7-Day Plan
                    </button>
                  </div>
                </>
              )}

              {/* Loading — animate plan build steps */}
              {stepState === 'LOADING' && (
                <>
                  <h2 className="font-inter font-bold text-[20px] text-[#45464E] mb-[8px]">
                    Building your 7-day plan...
                  </h2>
                  <p className="font-inter text-[14px] text-[#0F172ABF] mb-[16px]">
                    This is tailored to your current level and target score.
                  </p>
                  <div className="border border-[#FFCC00] bg-[#FFF9E9] rounded-[8px] p-[16px]">
                    {LOADING_STEPS.map((step, idx) => {
                      const isDone = loadingStep > idx;
                      return (
                        <div key={idx} className="flex items-center justify-between py-[8px] px-[16px]">
                          <span className="font-inter text-[14px] text-[#45464E]">{step}</span>
                          {isDone ? (
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20 6L9 17L4 12" stroke="#14B8A6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                          ) : (
                            <div className="w-[24px] h-[24px] shrink-0 rounded-full border-2 border-[#8156D1] border-t-transparent animate-spin" />
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
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-[16px]">
                    <div>
                      <h2 className="font-inter font-bold text-[20px] text-[#45464E] mb-[8px]">Your Next Step</h2>
                      <p className="font-inter text-[14px] text-[#0F172ABF] max-w-xl">
                        {stepState === 'C'
                          ? 'Your 7-day path to passing is ready. Start here — this is your highest-impact task.'
                          : 'Complete this to move forward →'}
                      </p>
                    </div>
                    <div className="font-inter text-[14px] text-[#0F172ABF]">
                      {completedTasks}/{totalTasks} Completed
                    </div>
                  </div>
                  <div className="border border-[#FFCC00] bg-[#FFF9E9] rounded-[18px] p-[16px] sm:p-[18px] flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-[52px] h-[52px] rounded-[16px] bg-[#FFFFFFF2] border border-[#FFC92A] flex items-center justify-center shrink-0">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d={ICON_PATHS[TASK_ICON_BY_TYPE[nextTask.type] || 'book']} stroke="#434E5F" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-inter font-semibold text-[16px] text-[#141415] leading-tight mb-[4px]">
                        {nextTask.title}
                      </h3>
                      <p className="font-inter text-[13px] text-[#141415] mb-[4px]">
                        {nextTask.meta}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => openTaskOverview(nextTask)}
                      className="w-full sm:w-auto font-inter font-semibold text-[14px] text-[#141415] bg-[#FFC92A] hover:bg-[#FFB800] active:bg-[#E6A800] px-[16px] py-[13px] rounded-[12px] transition-colors shadow-sm"
                    >
                      Start Task
                    </button>
                  </div>
                </>
              )}

              {/* State E — Plan completed */}
              {stepState === 'E' && (
                <>
                  <h2 className="font-inter font-bold text-[20px] text-[#45464E] mb-[8px]">
                    Your Next Step
                  </h2>
                  <p className="font-inter text-[14px] text-[#0F172ABF] mb-[16px]">
                    {canRegenerateSprint
                      ? 'Great — your latest mock is in. Generate a fresh 7-day plan based on your new performance.'
                      : 'You’ve completed your 7-day plan. Take a full mock exam to reassess your progress — then you can regenerate a new plan.'}
                  </p>
                  <div className="border border-[#FFCC00] bg-[#FFF9E9] rounded-[8px] p-[16px] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-[16px]">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-inter font-semibold text-[14px] text-[#1A1A2E] mb-0.5">
                        {canRegenerateSprint ? 'Regenerate 7-Day Plan' : 'Take Full Mock Exam'}
                      </h3>
                      <p className="font-inter text-[12px] text-[#6C737F]">
                        {canRegenerateSprint
                          ? 'Build a new plan that targets your current weakest sections and topics.'
                          : 'Validate your improvement with a full-length exam, then regenerate a tailored plan.'}
                      </p>
                      {generateError && (
                        <p className="font-inter text-[12px] text-[#DC2626] mt-[6px]">{generateError}</p>
                      )}
                    </div>
                    {canRegenerateSprint ? (
                      <button
                        type="button"
                        onClick={handleGeneratePlan}
                        disabled={planState !== 'idle'}
                        className="shrink-0 font-inter font-semibold text-[14px] text-[#1A1A2E] bg-[#FFC92A] hover:bg-[#FFB800] active:bg-[#E6A800] px-[16px] py-[11.5px] rounded-[8px] transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {planState === 'loading' ? 'Generating…' : 'Regenerate Plan'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={onTakeMock}
                        className="shrink-0 font-inter font-semibold text-[14px] text-[#1A1A2E] bg-[#FFC92A] hover:bg-[#FFB800] active:bg-[#E6A800] px-[16px] py-[11.5px] rounded-[8px] transition-colors shadow-sm"
                      >
                        Take Full Mock
                      </button>
                    )}
                  </div>
                </>
              )}

              {/* Recommended Focus – shown when has data */}
              {hasData && recommendedFocus && (
                <div className="mt-[32px]">
                  <h3 className="font-inter font-bold text-[16px] text-[#45464E] mb-[8px]">
                    Recommended Focus
                  </h3>
                  <p className="font-inter text-[13px] text-[#6C737F] mb-[16px]">
                    Improving this section will raise your next mock score the fastest.
                  </p>
                  <div className="flex flex-col gap-[16px] sm:flex-row sm:gap-[16px]">
                    <div className="w-full sm:w-1/3 flex items-center gap-[16px]">
                      <div className="w-[48px] h-[48px] rounded-[8px] bg-[#F6F4F9] flex items-center justify-center shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d={ICON_PATHS.book} stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="font-inter font-semibold text-[14px] text-[#0F172A] truncate">{recommendedFocus.section}</p>
                        <p className="font-inter text-[14px] text-[#45464E]">Section to focus</p>
                      </div>
                    </div>
                    <div className="w-full sm:w-1/3 flex items-center gap-[16px]">
                      <div className="w-[48px] h-[48px] rounded-[8px] bg-[#F5F4FF] flex items-center justify-center shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 15.0001V11.9861M16 15.0001V11.9861M20 6H4M20 8V4M4 8V4M8 15.0001V11.9861M4 12H20C20.5523 12 21 12.4477 21 13V18C21 18.5523 20.5523 19 20 19H4C3.44772 19 3 18.5523 3 18V13C3 12.4477 3.44772 12 4 12Z" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-inter font-semibold text-[14px] text-[#0F172A] truncate">{recommendedFocus.gapDisplay}</p>
                        <p className="font-inter text-[14px] text-[#45464E]">Gap to pass</p>
                      </div>
                    </div>
                    <div className="w-full sm:w-1/3 flex items-center gap-[16px]">
                      <div className="w-[48px] h-[48px] rounded-[8px] bg-[#F5F4FF] flex items-center justify-center shrink-0">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M21.2104 15.8906C20.5742 17.395 19.5792 18.7208 18.3123 19.7519C17.0454 20.783 15.5452 21.488 13.9428 21.8053C12.3405 22.1227 10.6848 22.0427 9.12055 21.5724C7.55627 21.102 6.13103 20.2556 4.96942 19.1072C3.80782 17.9588 2.94522 16.5433 2.45704 14.9845C1.96886 13.4257 1.86996 11.7711 2.169 10.1652C2.46804 8.55935 3.1559 7.05119 4.17245 5.7726C5.189 4.494 6.50329 3.48388 8.0004 2.83057M21.0004 12.0004C21.5524 12.0004 22.0054 11.5514 21.9504 11.0024C21.7198 8.70658 20.7025 6.56111 19.0707 4.92973C17.439 3.29835 15.2933 2.28144 12.9974 2.05141C12.4474 1.99641 11.9994 2.44941 11.9994 3.00141V11.0014C11.9994 11.2666 12.1047 11.521 12.2923 11.7085C12.4798 11.8961 12.7342 12.0014 12.9994 12.0014L21.0004 12.0004Z" stroke="#6E43B9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-inter font-semibold text-[14px] text-[#0F172A] truncate">{recommendedFocus.weightDisplay}</p>
                        <p className="font-inter text-[14px] text-[#45464E]">Section weight</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Section and Topic Breakdown ── */}
            <div className="bg-white rounded-[12px] overflow-hidden">
              <div className="p-[20px] sm:p-[24px]">
                <h2 className="font-inter font-bold text-[16px] text-[#45464E] mb-[8px]">
                  Section and Topic Breakdown
                </h2>
                <p className="font-inter text-[14px] text-[#0F172ABF]">
                  Your performance breakdown based on the assessment/mock exam
                </p>
              </div>

              <div className="space-y-[12px] sm:hidden">
                {sortedSections.map((section) => (
                  <SectionCard
                    key={section.key}
                    section={section}
                    isExpanded={!!expandedSections[section.key]}
                    onToggle={() => toggleSection(section.key)}
                    hasData={!!breakdown?.hasData}
                  />
                ))}
              </div>

              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-y border-[#181D1F26] bg-[#F5F5F6]">
                      <th className="py-[15px] pl-[40px] pr-[16px] text-left font-inter font-bold text-[14px] text-[#45464E] tracking-wide w-[35%]">Section</th>
                      <th className="py-[15px] px-[16px] text-left font-inter font-bold text-[14px] text-[#45464E] tracking-wide">Score</th>
                      <th className="py-[15px] px-[16px] text-left font-inter font-bold text-[14px] text-[#45464E] tracking-wide">Weight</th>
                      <th className="py-[15px] px-[16px] text-left font-inter font-bold text-[14px] text-[#45464E] tracking-wide">Status</th>
                      <th className="py-[15px] px-[16px] text-left font-inter font-bold text-[14px] text-[#45464E] tracking-wide">Priority</th>
                      <th className="py-[15px] px-[16px] text-left font-inter font-bold text-[14px] text-[#45464E] tracking-wide">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedSections.map((section) => (
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

              <div className="px-[18px] py-[11.5px] mb-[24px] border-b border-[#181D1F1A]">
                <p className="font-inter text-[14px] text-[#45464EBF]">
                  {breakdown?.footnote || 'Take an exam to unlock your performance breakdown and weakest areas.'}
                </p>
              </div>
            </div>

            {/* ── 7-Day Sprint Progress ── */}
            <div className="bg-white rounded-[12px] p-[20px] sm:p-[24px]">
              <div className="flex items-center justify-between gap-3 mb-[8px]">
                <h2 className="font-inter font-bold text-[16px] text-[#45464E]">
                  7-Day Sprint Progress
                </h2>
                {sprintPlan && (
                  <span className="font-inter text-[13px] sm:text-[14px] text-[#0F172ABF] shrink-0">
                    {completedTasks}/{totalTasks} Completed
                  </span>
                )}
              </div>
              {sprintPlan ? (
                <div className="mb-[16px] sm:mb-[24px]">
                  <p className="font-inter text-[14px] text-[#0F172ABF] leading-snug">Your next 7 study sessions based on your weakest areas</p>
                  <p className="font-inter text-[14px] text-[#0F172ABF] leading-snug mt-[4px]">Complete this sprint, then retake a mock to verify your progress.</p>
                </div>
              ) : (
                <p className="font-inter text-[14px] text-[#0F172ABF] mb-[24px]">
                  Your personalized study plan will appear here once generated.
                </p>
              )}

              {sprintPlan ? (
                <div className="flex flex-col gap-[18px]">
                  {sprintPlan.tasks.map((task) => {
                    const isCurrent = task.taskId === sprintPlan.nextTask?.taskId;
                    const isCompleted = task.status === 'completed';
                    const iconKey = TASK_ICON_BY_TYPE[task.type] || 'book';
                    return (
                      <div
                        key={task.taskId}
                        className={`p-[16px] rounded-[16px] border ${isCurrent ? 'border-[#FFCC00] bg-[#FFF9E9]' : 'border-[#EBEBEB] bg-[#FCFBFC]'}`}
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                          {/* Icon + status: row on mobile (justify-between); on sm+ become flex children of outer */}
                          <div className="flex items-start justify-between gap-3 sm:contents">
                            <div className={`w-[52px] h-[52px] rounded-[14px] bg-white border ${isCurrent ? 'border-[#FFC92A]' : 'border-[#EBEBEB]'} flex items-center justify-center shrink-0`}>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d={ICON_PATHS[iconKey]} stroke="#434E5F" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            </div>

                            <div className="flex flex-col items-end gap-1 sm:order-3 shrink-0">
                              {isCurrent && !isCompleted ? (
                                <button
                                  type="button"
                                  onClick={() => openTaskOverview(task)}
                                  className="font-inter font-semibold text-[14px] text-[#141415] bg-[#FFC92A] hover:bg-[#FFB800] active:bg-[#E6A800] px-[16px] py-[10px] sm:py-[13px] rounded-[12px] transition-colors shadow-sm"
                                >
                                  Start Task
                                </button>
                              ) : isCompleted ? (
                                <>
                                  <span className="inline-flex items-center gap-[6px] font-inter font-medium text-[14px] text-[#06A561]">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                      <path d="M18.1708 8.33357C18.5513 10.2013 18.2801 12.1431 17.4023 13.8351C16.5245 15.527 15.0932 16.8669 13.347 17.6313C11.6009 18.3957 9.64545 18.5384 7.80684 18.0355C5.96823 17.5327 4.35758 16.4147 3.24349 14.8681C2.12939 13.3214 1.57919 11.4396 1.68464 9.53639C1.79009 7.63318 2.54482 5.82364 3.82297 4.40954C5.10111 2.99545 6.82541 2.06226 8.70831 1.76561C10.5912 1.46897 12.5189 1.82679 14.1699 2.7794M7.50325 9.16691L10.0032 11.6669L18.3366 3.33358" stroke="#06A561" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    DONE
                                  </span>
                                  {task.result && (
                                    <p className="font-inter text-[12px] text-[#0F172A]">+{task.result.correct}/{task.result.totalItems} correct</p>
                                  )}
                                </>
                              ) : (
                                <span className="inline-flex items-center gap-[6px] font-inter font-medium text-[13px] sm:text-[14px] text-[#181D1F] whitespace-nowrap">
                                  <span className="w-[8px] h-[8px] rounded-full bg-[#F3596D] shrink-0" />
                                  NOT STARTED
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Title + meta */}
                          <div className="flex-1 min-w-0 sm:order-2">
                            <p className="font-inter font-semibold text-[15px] text-[#141415] mb-[4px]">{task.title}</p>
                            <p className="font-inter text-[13px] text-[#141415]">{task.meta}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="border border-[#FFCC00] rounded-[12px] p-[16px] flex flex-col sm:flex-row sm:items-center gap-[16px] bg-[#FFF9E9]">
                  <div className="w-[48px] h-[48px] rounded-[12px] bg-white border border-[#FFC92A] flex items-center justify-center shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d={ICON_PATHS.book} stroke="#434E5F" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-inter font-semibold text-[14px] text-[#0F172A] mb-[4px]">No active plan yet</p>
                    <p className="font-inter text-[12px] text-[#0F172A]">
                      {hasData ? (
                        <>Generate your 7-day plan to start a guided study routine based on your assessment. Includes smart daily tasks, topic drills, and progress tracking.</>
                      ) : (
                        <>Your 7-day study plan will be created after your first exam. Includes daily tasks, topic drills, and progress tracking.</>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ═══════════ RIGHT SIDEBAR ═══════════ */}
          <div className="w-full lg:w-[300px] xl:w-[360px] shrink-0 flex flex-col gap-[24px]">

            {/* ── Readiness Checker (desktop only — mobile copy renders under the banner above) ── */}
            <div className="hidden lg:block">
              {readinessCheckerCard}
            </div>

            {/* ── CSE Updates ── */}
            <div className="bg-white rounded-[12px] p-[24px]">
              <h3 className="font-inter font-semibold text-[14px] text-[#1A1A2E] mb-[16px]">
                📌 CSE Updates
              </h3>
              <p className="font-inter text-[14px] text-[#45464E] leading-relaxed">
                Filing now available. Check them on the official CSC portal:{' '}
                <a
                  href="https://www.csc.gov.ph"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[#6E43B9] underline text-[#6E43B9]"
                >
                  Go to Official Site
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <PaywallModal
        open={!!paywallVariant}
        variant={paywallVariant || 'default'}
        onClose={() => {
          if (paywallVariant === 'after_plan_generation') markAfterPlanDismissed();
          setPaywallVariant(null);
        }}
      />
    </div>
  );
};

export default Dashboard;
