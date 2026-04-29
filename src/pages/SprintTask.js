import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashNav from '../components/DashNav';
import { dashboardAPI } from '../services/api';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const SECTION_TAG_COLORS = {
  verbal:               { bg: '#CCFBF1', fg: '#0F766E' },
  analytical:           { bg: '#DBEAFE', fg: '#1D4ED8' },
  clerical:             { bg: '#DBEAFE', fg: '#1D4ED8' },
  numerical:            { bg: '#FEF3C7', fg: '#B45309' },
  'general information':{ bg: '#FCE7F3', fg: '#BE185D' },
};

const TOPIC_TAG_COLORS = {
  verbal:               { bg: '#CCFBF1', fg: '#0F766E' },
  analytical:           { bg: '#DBEAFE', fg: '#1D4ED8' },
  clerical:             { bg: '#DBEAFE', fg: '#1D4ED8' },
  numerical:            { bg: '#FEF3C7', fg: '#B45309' },
  'general information':{ bg: '#FCE7F3', fg: '#BE185D' },
};

function titleCase(str) {
  return (str || '').replace(/\b\w/g, (c) => c.toUpperCase());
}

function Tag({ text, palette }) {
  if (!text) return null;
  return (
    <span
      className="inline-block font-inter font-medium text-[12px] px-2.5 py-1 rounded-full"
      style={{ background: palette.bg, color: palette.fg }}
    >
      {text}
    </span>
  );
}

function formatElapsed(totalSec) {
  const t = Math.max(0, Math.floor(totalSec || 0));
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const pad = (n) => String(n).padStart(2, '0');
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/**
 * Status tier per the V1 product spec (passing threshold = 80%):
 *   85%+    → Exam Ready        — You are above the passing threshold.
 *   75–84%  → Almost Ready      — A few improvements can push you to passing.
 *   60–74%  → Needs Improvement — You're within reach but need more practice.
 *   <60%    → Early Stage       — Focus on building fundamentals first.
 */
function statusTierFromScore(percentage) {
  const pct = Math.round(percentage || 0);
  if (pct >= 85) return { label: 'Exam Ready', message: 'You are above the passing threshold.' };
  if (pct >= 75) return { label: 'Almost Ready', message: 'A few improvements can push you to passing.' };
  if (pct >= 60) return { label: 'Needs Improvement', message: "You're within reach but need more practice." };
  return { label: 'Early Stage', message: 'Focus on building fundamentals first.' };
}

function statusMessageFromScore(percentage) {
  const tier = statusTierFromScore(percentage);
  return `${tier.label} — ${tier.message}`;
}

function topicLabelForTask(task) {
  if (!task) return '–';
  if (task.topics && task.topics.length === 1) return task.topics[0];
  if (task.topics && task.topics.length > 1) return task.topics.join(' + ');
  if (task.sectionLabel) return task.sectionLabel;
  return titleCase(task.section || '–');
}

const SprintTask = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});         // { [index]: 'A'|'B'|'C'|'D' }
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [result, setResult] = useState(null);
  const [sprintPlan, setSprintPlan] = useState(null);
  const [review, setReview] = useState([]);            // populated after submit
  const [reviewMode, setReviewMode] = useState(false); // shows review UI after submit

  const debounceRef = useRef(null);
  const pendingAnswers = useRef({});
  const startTsRef = useRef(Date.now());
  const [elapsed, setElapsed] = useState(0);

  // Start the task on mount.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await dashboardAPI.startTask(taskId);
        if (cancelled) return;
        if (res.success) {
          setTask(res.data.task);
          setQuestions(res.data.questions || []);
          if (res.data.savedAnswers) setAnswers(res.data.savedAnswers);
          startTsRef.current = Date.now();
        } else {
          setError(res.message || 'Could not start task');
        }
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not start task');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [taskId]);

  // Time-elapsed counter (paused after submit).
  useEffect(() => {
    if (loading || result) return;
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTsRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [loading, result]);

  // Debounced autosave.
  const flushPending = useCallback(async () => {
    const pending = pendingAnswers.current;
    const entries = Object.entries(pending);
    if (entries.length === 0) return;
    pendingAnswers.current = {};
    try {
      await Promise.all(
        entries.map(([idx, val]) =>
          dashboardAPI.saveTaskAnswer(taskId, parseInt(idx, 10), val)
        )
      );
    } catch (_err) {
      // Best-effort. Answers are still in client state and will be sent on submit.
    }
  }, [taskId]);

  const queueSave = useCallback((idx, val) => {
    pendingAnswers.current[idx] = val;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(flushPending, 600);
  }, [flushPending]);

  const handleSelect = (choice) => {
    if (submitting || result) return;
    setAnswers((prev) => ({ ...prev, [currentIndex]: choice }));
    queueSave(currentIndex, choice);
  };

  const goToQuestion = (idx) => {
    if (submitting || result) return;
    if (idx < 0 || idx >= questions.length) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    flushPending();
    setCurrentIndex(idx);
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setShowSubmitConfirm(false);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    await flushPending();

    try {
      const res = await dashboardAPI.submitTask(taskId, answers);
      if (res.success) {
        setResult(res.data.result);
        setSprintPlan(res.data.sprintPlan || null);
        setReview(res.data.review || []);
      } else {
        setError(res.message || 'Could not submit task');
      }
    } catch (err) {
      setError(err.message || 'Could not submit task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveAndExit = async () => {
    if (submitting) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    try {
      await flushPending();
    } catch (_err) {
      // Best-effort save; navigation continues regardless.
    }
    navigate('/dashboard');
  };

  // Flush any pending saves on unmount.
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      flushPending();
    };
  }, [flushPending]);

  const answeredCount = useMemo(
    () => Object.values(answers).filter(Boolean).length,
    [answers]
  );

  /* ── Loading / error ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F4FF]">
        <DashNav />
        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-16">
          <div className="bg-white rounded-[16px] px-6 py-10 text-center font-inter text-[14px] text-[#6C737F]">
            Preparing your sprint task…
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F5F4FF]">
        <DashNav />
        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-16">
          <div className="bg-white rounded-[16px] px-6 py-10 text-center">
            <p className="font-inter font-semibold text-[15px] text-[#1A1A2E] mb-2">Something went wrong.</p>
            <p className="font-inter text-[13px] text-[#6C737F] mb-4">{error}</p>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="font-inter font-semibold text-[13px] text-[#1A1A2E] bg-[#FFC92A] hover:bg-[#FFB800] px-5 py-2.5 rounded-[10px]"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  /* ── Result view (Task Complete card or Review Answers) ── */
  if (result) {
    const pct = result.percentage || 0;
    const completedTasks = sprintPlan?.completedTasks ?? 0;
    const totalTasks = sprintPlan?.totalTasks ?? 7;
    const nextTask = sprintPlan?.nextTask || null;
    const planDone = completedTasks >= totalTasks;

    /* Review Answers view — paginated single-question, mirrors runner layout */
    if (reviewMode) {
      const reviewIndex = Math.min(currentIndex, Math.max(0, review.length - 1));
      const rq = review[reviewIndex];
      if (!rq) {
        // Defensive fallback while review payload is loading.
        return (
          <div className="min-h-screen bg-[#F5F4FF]">
            <DashNav />
            <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-16">
              <div className="bg-white rounded-[16px] px-6 py-10 text-center font-inter text-[14px] text-[#6C737F]">
                Loading review…
              </div>
            </main>
          </div>
        );
      }
      const sectionKey = (rq.section || '').toLowerCase().trim();
      const sectionPalette = SECTION_TAG_COLORS[sectionKey] || { bg: '#EDE9F3', fg: '#6E43B9' };
      const topicPalette = TOPIC_TAG_COLORS[sectionKey] || { bg: '#EDE9F3', fg: '#6E43B9' };
      const isFirst = reviewIndex === 0;
      const isLast = reviewIndex === review.length - 1;
      const correctLetter = rq.correctAnswer;
      const correctText = correctLetter ? rq[`choice${correctLetter}`] : '';

      return (
        <div className="min-h-screen bg-[#F5F4FF] pb-16">
          <DashNav />
          <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 pt-6">
            <nav className="flex items-center gap-1.5 mb-4 font-inter text-[13px]">
              <button type="button" onClick={() => navigate('/dashboard')} className="text-[#6C737F] hover:text-[#1A1A2E]">
                Dashboard
              </button>
              <span className="text-[#9CA3AF]">›</span>
              <span className="text-[#6C737F]">Sprint Task</span>
              <span className="text-[#9CA3AF]">›</span>
              <span className="text-[#6E43B9] font-medium">{task?.title}</span>
            </nav>

            <div className="flex flex-col lg:flex-row gap-5">
              {/* Question card */}
              <div className="flex-1 min-w-0">
                <div className="bg-white rounded-[16px] px-6 py-6 sm:px-8 sm:py-7">
                  <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                    <span className="font-inter font-medium text-[15px] text-[#45464E] shrink-0">
                      Question {reviewIndex + 1} of {review.length}
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag text={titleCase(sectionKey)} palette={sectionPalette} />
                      {rq.topic && <Tag text={rq.topic} palette={topicPalette} />}
                    </div>
                  </div>

                  <p className="font-inter font-medium text-[#0F172A] text-[16px] leading-relaxed mb-6 whitespace-pre-wrap">
                    {rq.questionText}
                  </p>

                  <div className="flex flex-col gap-2.5">
                    {OPTION_LABELS.map((label) => {
                      const text = rq[`choice${label}`];
                      if (!text) return null;
                      const isUserPick = rq.selectedAnswer === label;
                      const isCorrect = rq.correctAnswer === label;
                      let cls = 'border-[#E5E7EB] bg-white';
                      let circleCls = 'bg-[#F3F4F6] text-[#6C737F]';
                      let trailing = null;
                      if (isCorrect) {
                        cls = 'border-[#5EEAD4] bg-[#CCFBF1]';
                        circleCls = 'bg-[#14B8A6] text-white';
                        trailing = (
                          <svg className="w-5 h-5 shrink-0 text-[#14B8A6]" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <path d="M4.5 10.5l4 4 7-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        );
                      } else if (isUserPick && !isCorrect) {
                        cls = 'border-[#F3596D33] bg-[#FEF2F3]';
                        circleCls = 'bg-[#F3596D] text-white';
                        trailing = (
                          <svg className="w-5 h-5 shrink-0 text-[#F3596D]" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                          </svg>
                        );
                      }
                      return (
                        <div
                          key={label}
                          className={`flex items-center gap-3 px-4 py-3.5 rounded-[12px] border ${cls}`}
                        >
                          <span className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-inter font-semibold text-[14px] ${circleCls}`}>
                            {label}
                          </span>
                          <span className="font-inter text-[14px] text-[#1A1A2E] leading-relaxed flex-1">
                            {text}
                          </span>
                          {trailing}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation panel */}
                  {(rq.explanationCorrect || rq.explanationWrong || correctLetter) && (
                    <div className="mt-6 rounded-[10px] py-4 px-4 mb-4 bg-[#F5F4FF]">
                      {correctLetter && (
                        <p className="font-inter text-[14px] text-[#45464E] leading-relaxed">
                          <span className="font-semibold">Correct Answer: {correctLetter}</span>
                          {(rq.explanationCorrect || correctText) && (
                            <span> — {rq.explanationCorrect || correctText}</span>
                          )}
                        </p>
                      )}
                      {rq.explanationWrong && (
                        <p className="font-inter text-[13px] text-[#45464E] leading-relaxed mt-3 whitespace-pre-wrap">
                          {rq.explanationWrong}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Reviewly Tip */}
                  {rq.reviewlyTip && (
                    <div className="rounded-[10px] py-3.5 px-4 mb-2 bg-[#FFF8E6]">
                      <p className="font-inter text-[14px] text-[#53545C] leading-relaxed">
                        💡 <span className="font-semibold">Reviewly Tip:</span> {rq.reviewlyTip}
                      </p>
                    </div>
                  )}

                  {/* Nav buttons */}
                  <div className="flex items-center justify-between pt-5 mt-4 border-t border-[#F2F4F7]">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCurrentIndex((i) => Math.min(review.length - 1, i + 1))}
                        disabled={isLast}
                        className="font-inter font-semibold text-[14px] text-[#421A83] py-2.5 px-6 rounded-[8px] bg-[#FFC92A] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                        disabled={isFirst}
                        className="font-inter font-normal text-[15px] text-[#6C737F] py-2.5 px-5 rounded-[8px] border border-[#D1D5DB] bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate('/dashboard')}
                      className="font-inter font-normal text-[15px] text-[#6C737F] py-2.5 px-5 rounded-[8px] border border-[#D1D5DB] bg-white hover:bg-gray-50 transition-colors"
                    >
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar — Review summary + question grid */}
              <div className="w-full lg:w-[404px] shrink-0">
                <div className="bg-white rounded-[16px] p-[24px] lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
                  <div className="divide-y divide-[#F3F4F6] border-b border-[#F3F4F6] mb-5">
                    <div className="flex items-center justify-between py-3">
                      <span className="font-inter text-[14px] text-[#45464E]">Correct Answers</span>
                      <span className="font-inter font-bold text-[24px] text-[#6E43B9]">
                        {result.correct} / {result.totalItems}
                      </span>
                    </div>
                    <div className="flex items-start justify-between py-3 gap-3">
                      <span className="font-inter text-[14px] text-[#45464E] shrink-0">Status</span>
                      <span className="font-inter text-[13px] text-[#6C737F] text-right leading-snug">
                        {statusMessageFromScore(pct)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="font-inter text-[14px] text-[#45464E]">Topic</span>
                      <span className="font-inter text-[14px] text-[#45464E] font-medium text-right">
                        {topicLabelForTask(task)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <span className="font-inter text-[14px] text-[#45464E]">Sprint Progress</span>
                      <span className="font-inter text-[13px] text-[#45464E] font-medium text-right">
                        {completedTasks} of {totalTasks} tasks completed
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-[20px] h-[20px] rounded-[4px] bg-[#DAF9EC]" aria-hidden />
                      <span className="font-inter text-[13px] text-[#53545C]">Correct Answer</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-[20px] h-[20px] rounded-[4px] bg-[#FDE7EA]" aria-hidden />
                      <span className="font-inter text-[13px] text-[#53545C]">Incorrect Answer</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-10 gap-[4px]">
                    {review.map((q, idx) => {
                      const isCurrent = idx === reviewIndex;
                      const isCorrect = q.isCorrect;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentIndex(idx)}
                          className={`w-full aspect-square rounded-[4px] font-inter font-medium text-[12px] transition-colors flex items-center justify-center
                            ${isCorrect ? 'bg-[#DAF9EC] text-[#53545C]' : 'bg-[#FDE7EA] text-[#53545C]'}
                            ${isCurrent ? 'ring-2 ring-[#6E43B9] ring-offset-1' : ''}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      );
    }

    /* Task Complete card — centered, four rows + three CTAs (per Figma) */
    return (
      <div className="min-h-screen bg-[#F5F4FF]">
        <DashNav />
        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-16">
          <nav className="flex items-center gap-1.5 mb-6 font-inter text-[13px] justify-center">
            <button type="button" onClick={() => navigate('/dashboard')} className="text-[#6C737F] hover:text-[#1A1A2E]">
              Dashboard
            </button>
            <span className="text-[#9CA3AF]">›</span>
            <span className="text-[#6C737F]">Sprint Task</span>
            <span className="text-[#9CA3AF]">›</span>
            <span className="text-[#6E43B9] font-medium">{task?.title}</span>
          </nav>

          <div className="max-w-[560px] mx-auto bg-white rounded-[16px] px-7 py-6 sm:px-8 sm:py-7 border border-[#F1EEF8]">
            <h1 className="font-inter font-bold text-[20px] text-[#1A1A2E] mb-1">
              Task Complete
            </h1>
            <p className="font-inter text-[13px] text-[#6C737F] mb-5">
              Nice work — one step closer.
            </p>

            <div className="divide-y divide-[#F2F4F7] border-t border-b border-[#F2F4F7]">
              <div className="flex items-center justify-between py-3.5">
                <span className="font-inter text-[14px] text-[#1A1A2E]">Correct Answers</span>
                <span className="font-inter font-bold text-[20px] text-[#6E43B9]">
                  {result.correct} / {result.totalItems}
                </span>
              </div>
              <div className="flex items-center justify-between py-3.5">
                <span className="font-inter text-[14px] text-[#1A1A2E]">Status</span>
                <span className="font-inter text-[13px] text-[#6C737F] text-right max-w-[60%]">
                  {statusMessageFromScore(pct)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3.5">
                <span className="font-inter text-[14px] text-[#1A1A2E]">Topic</span>
                <span className="font-inter text-[13px] text-[#1A1A2E] text-right">
                  {topicLabelForTask(task)}
                </span>
              </div>
              <div className="flex items-center justify-between py-3.5">
                <span className="font-inter text-[14px] text-[#1A1A2E]">Sprint Progress</span>
                <span className="font-inter text-[13px] text-[#1A1A2E]">
                  {completedTasks} of {totalTasks} tasks completed
                </span>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-3 mt-5">
              <button
                type="button"
                onClick={() => { setCurrentIndex(0); setReviewMode(true); }}
                disabled={!review.length}
                className="font-inter font-semibold text-[13px] text-[#1A1A2E] bg-[#FFC92A] hover:bg-[#FFB800] active:bg-[#E6A800] px-5 py-2.5 rounded-[10px] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review Answers
              </button>
              <button
                type="button"
                onClick={() => nextTask && navigate(`/dashboard/sprint/task/${nextTask.taskId}`)}
                disabled={!nextTask || planDone}
                className="font-inter font-medium text-[13px] text-[#1A1A2E] bg-white border border-[#AEB3BD] hover:bg-[#F8F8FB] px-5 py-2.5 rounded-[10px] disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Start Next Task
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="font-inter font-medium text-[13px] text-[#1A1A2E] bg-white border border-[#AEB3BD] hover:bg-[#F8F8FB] px-5 py-2.5 rounded-[10px]"
              >
                Back to Dashboard
              </button>
            </div>

            {nextTask && !planDone && (
              <p className="font-inter text-[13px] text-[#6C737F] mt-4">
                <span className="font-medium text-[#1A1A2E]">Next:</span> {nextTask.title}
              </p>
            )}
            {planDone && (
              <p className="font-inter text-[13px] text-[#16A34A] mt-4 font-medium">
                You've completed your 7-day plan! Take a full mock to validate your progress.
              </p>
            )}
          </div>
        </main>
      </div>
    );
  }

  /* ── Question runner (paginated, single question) ── */
  const currentQ = questions[currentIndex];
  const sectionKey = (currentQ?.section || '').toLowerCase().trim();
  const sectionPalette = SECTION_TAG_COLORS[sectionKey] || { bg: '#EDE9F3', fg: '#6E43B9' };
  const topicPalette = TOPIC_TAG_COLORS[sectionKey] || { bg: '#EDE9F3', fg: '#6E43B9' };
  const selected = answers[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const isFirst = currentIndex === 0;

  return (
    <div className="min-h-screen bg-[#F5F4FF] pb-16">
      <DashNav />

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 pt-6">
        <nav className="flex items-center gap-1.5 mb-4 font-inter text-[13px]">
          <button type="button" onClick={() => navigate('/dashboard')} className="text-[#6C737F] hover:text-[#1A1A2E]">
            Dashboard
          </button>
          <span className="text-[#9CA3AF]">›</span>
          <span className="text-[#6C737F]">Sprint Task</span>
          <span className="text-[#9CA3AF]">›</span>
          <span className="text-[#6E43B9] font-medium">{task?.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Question card */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-[16px] px-6 py-6 sm:px-8 sm:py-7">
              <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                <span className="font-inter font-semibold text-[14px] text-[#1A1A2E]">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag text={titleCase(sectionKey)} palette={sectionPalette} />
                  {currentQ?.topic && <Tag text={currentQ.topic} palette={topicPalette} />}
                </div>
              </div>

              <p className="font-inter text-[15px] sm:text-[16px] text-[#1A1A2E] mb-5 leading-relaxed whitespace-pre-wrap">
                {currentQ?.questionText}
              </p>

              <div className="flex flex-col gap-2.5">
                {OPTION_LABELS.map((label) => {
                  const text = currentQ?.[`choice${label}`];
                  if (!text) return null;
                  const isSelected = selected === label;
                  return (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleSelect(label)}
                      className={`text-left flex items-start gap-3 px-4 py-3.5 rounded-[12px] border transition-colors ${
                        isSelected
                          ? 'border-[#6E43B9] bg-[#F5F4FF]'
                          : 'border-[#E5E7EB] bg-white hover:border-[#C7BAEB]'
                      }`}
                    >
                      <span
                        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-inter font-semibold text-[14px] ${
                          isSelected
                            ? 'bg-[#6E43B9] text-white'
                            : 'bg-[#F3F4F6] text-[#6C737F]'
                        }`}
                      >
                        {label}
                      </span>
                      <span className="font-inter text-[14px] text-[#1A1A2E] leading-relaxed mt-1">
                        {text}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-7">
                {isLast ? (
                  <button
                    type="button"
                    onClick={() => setShowSubmitConfirm(true)}
                    disabled={submitting}
                    className="font-inter font-semibold text-[13px] text-[#1A1A2E] bg-[#FFC92A] hover:bg-[#FFB800] active:bg-[#E6A800] px-5 py-2.5 rounded-[10px] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Submitting…' : 'Submit Task'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => goToQuestion(currentIndex + 1)}
                    className="font-inter font-semibold text-[13px] text-[#1A1A2E] bg-[#FFC92A] hover:bg-[#FFB800] active:bg-[#E6A800] px-5 py-2.5 rounded-[10px] shadow-sm"
                  >
                    Next
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => goToQuestion(currentIndex - 1)}
                  disabled={isFirst}
                  className="font-inter font-medium text-[13px] text-[#1A1A2E] bg-white border border-[#AEB3BD] hover:bg-[#F8F8FB] px-5 py-2.5 rounded-[10px] disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndExit}
                  disabled={submitting}
                  className="ml-auto font-inter font-medium text-[13px] text-[#7A7F8A] bg-white border border-[#AEB3BD] hover:bg-[#F8F8FB] px-5 py-2.5 rounded-[10px] disabled:opacity-50"
                >
                  Save and Exit
                </button>
              </div>

              <p className="font-inter italic text-[12px] text-[#9CA3AF] mt-4">
                You can skip questions and return to them anytime.
              </p>
            </div>
          </div>

          {/* Sidebar — Time Elapsed + question grid */}
          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-white rounded-[16px] px-6 py-5">
              <div className="flex items-center justify-between mb-4">
                <span className="font-inter font-semibold text-[20px] text-[#45464E]">Time Elapsed</span>
                <span className="font-inter font-bold text-[32px] text-[#431C86] tabular-nums leading-none">
                  {formatElapsed(elapsed)}
                </span>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-[20px] h-[20px] rounded-[4px] bg-[#F1F1F1]" aria-hidden />
                  <span className="font-inter text-[14px] text-[#53545C]">Unanswered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[20px] h-[20px] rounded-[4px] bg-[#CDC3DD]" aria-hidden />
                  <span className="font-inter text-[14px] text-[#53545C]">Answered</span>
                </div>
              </div>

              <div className="grid grid-cols-10 gap-[4px]">
                {questions.map((_, idx) => {
                  const isAnswered = !!answers[idx];
                  const isCurrent = idx === currentIndex;
                  let cls;
                  if (isCurrent) {
                    cls = 'bg-[#6E43B9] text-white border-transparent';
                  } else if (isAnswered) {
                    cls = 'bg-[#CDC3DD] text-[#45464E] border-transparent';
                  } else {
                    cls = 'bg-[#F1F1F1] text-[#AEAEAE] border-transparent hover:bg-[#E8E3F0]';
                  }
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => goToQuestion(idx)}
                      className={`w-full aspect-square rounded-[6px] border font-inter font-medium text-[12px] transition-colors ${cls}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Submit confirm modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-[12px] max-w-[460px] w-full p-6 shadow-xl">
            <div className="flex items-start justify-between gap-3 mb-3">
              <h3 className="font-inter font-medium text-[17px] text-[#1A1A2E]">
                Ready to see how you did?
              </h3>
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                aria-label="Close"
                className="text-[#9CA3AF] hover:text-[#1A1A2E] -mt-1 -mr-1 p-1"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6L18 18M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <p className="font-inter text-[13px] text-[#1A1A2E] mb-1">
              You answered {answeredCount} of {questions.length} questions.
            </p>
            <p className="font-inter text-[13px] text-[#6C737F] mb-5">
              Review your answers first — or submit to see your results.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowSubmitConfirm(false)}
                className="font-inter font-medium text-[13px] text-[#1A1A2E] bg-white border border-[#AEB3BD] hover:bg-[#F8F8FB] px-4 py-2.5 rounded-[10px]"
              >
                Review Answers
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="font-inter font-semibold text-[13px] text-[#1A1A2E] bg-[#FFC92A] hover:bg-[#FFB800] px-5 py-2.5 rounded-[10px]"
              >
                Submit Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SprintTask;
