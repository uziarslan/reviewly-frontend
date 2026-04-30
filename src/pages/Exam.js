import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import DashNav from '../components/DashNav';
import ExamSkeleton from '../components/skeletons/ExamSkeleton';
import Modal from '../components/Modal';
import { examAPI, reviewerAPI, trialAPI, dashboardAPI } from '../services/api';

import { trackExamStarted, trackExamCompleted } from '../services/analytics';

/** Format seconds as "HH:MM:SS" (non-negative). */
function secondsToTimeStr(totalSec) {
  if (totalSec <= 0) return '00:00:00';
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

/** Section → color map (matches Figma design). */
const SECTION_TAG_COLORS = {
  verbal: { color: '#14B8A6', darkText: true },
  analytical: { color: '#3B82F6', darkText: true },
  clerical: { color: '#3B82F6', darkText: true },
  numerical: { color: '#F59E0B', darkText: false },
  'general information': { color: '#EC4899', darkText: false },
  general_info: { color: '#EC4899', darkText: false },
};

/**
 * Returns containerStyle + textStyle for a tag based on the question's section key.
 * Pass the raw section string (e.g. "verbal", "general information").
 */
function getTagStyleBySection(sectionKey) {
  const key = (sectionKey || '').toLowerCase().trim();
  const { color, darkText } = SECTION_TAG_COLORS[key] || { color: '#14B8A6', darkText: true };

  const containerStyle = {
    background: `linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95)), linear-gradient(${color}, ${color})`,
    borderRadius: '8px',
    border: 'none',
    padding: '4px 12px',
    display: 'inline-block',
  };
  const textStyle = darkText
    ? {
      background: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), linear-gradient(${color}, ${color})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }
    : { color };

  return { containerStyle, textStyle };
}

function Exam({ isTrial = false }) {
  const { id, taskId } = useParams(); // reviewer id or sprint task id
  const routeId = id || taskId;
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const fromLibrary = !isTrial && queryParams.get('from') === 'library';
  const fromSprint = !isTrial && (Boolean(taskId) || queryParams.get('from') === 'sprint');
  const sprintTaskLabel = fromSprint ? (queryParams.get('taskLabel') || 'Sprint Task') : null;
  const isRestart = useMemo(
    () => new URLSearchParams(location.search).get('restart') === 'true',
    [location.search]
  );

  // API adapter: use trial endpoints when in trial mode
  const api = useMemo(() => {
    if (fromSprint) {
      return {
        start: dashboardAPI.startTask,
        saveAnswer: dashboardAPI.saveTaskAnswer,
        pause: async () => ({ success: true }),
        submit: async (taskId, _remainingSeconds, answers) => dashboardAPI.submitTask(taskId, answers),
      };
    }
    return isTrial
      ? { start: trialAPI.start, saveAnswer: trialAPI.saveAnswer, pause: trialAPI.pause, submit: trialAPI.submit }
      : { start: examAPI.start, saveAnswer: examAPI.saveAnswer, pause: examAPI.pause, submit: examAPI.submit };
  }, [fromSprint, isTrial]);
  const beaconPath = useMemo(() => isTrial ? 'trial-assessment' : 'exams', [isTrial]);
  const resultsPath = isTrial ? '/trial/results' : '/dashboard/results';

  // Exam data from API
  const [attemptId, setAttemptId] = useState(null);
  const [reviewer, setReviewer] = useState(null);
  const [task, setTask] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [loadingExam, setLoadingExam] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Exam state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(new Set());
  const [answers, setAnswers] = useState({}); // { index: 'A'|'B'|'C'|'D' }
  const [remainingSeconds, setRemainingSeconds] = useState(null);
  const [timeLeft, setTimeLeft] = useState('00:00:00');
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [showReloadWarningModal, setShowReloadWarningModal] = useState(!fromSprint);
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved'

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const startTsRef = useRef(Date.now());
  const endTimeRef = useRef(null);
  const timerRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const pendingAnswersRef = useRef({}); // { [questionIndex]: selectedAnswer }

  // Exam is frozen when time's up or when the initial reload modal is open
  const examFrozen = timeUp || showReloadWarningModal || loadingExam;

  const flushPendingAnswers = useCallback(async () => {
    const pending = pendingAnswersRef.current;
    const entries = Object.entries(pending);
    if (entries.length === 0 || !attemptId) return;
    pendingAnswersRef.current = {};
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    setSaveStatus('saving');
    try {
      for (const [questionIndexStr, selectedAnswer] of entries) {
        await api.saveAnswer(attemptId, parseInt(questionIndexStr, 10), selectedAnswer);
      }
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch (err) {
      console.error('Failed to save answers:', err);
      setSaveStatus(null);
    }
  }, [attemptId, api]);

  // Start or resume exam on mount
  useEffect(() => {
    let cancelled = false;
    async function loadExam() {
      try {
        let examRes;
        let revRes = { success: false };

        if (fromSprint) {
          examRes = await api.start(routeId);
        } else {
          [examRes, revRes] = await Promise.all([
            api.start(id, isRestart),
            isTrial ? Promise.resolve({ success: false }) : reviewerAPI.getById(id),
          ]);
        }

        if (cancelled) return;

        if (revRes.success) setReviewer(revRes.data);
        if (isTrial && !revRes.success) {
          setReviewer({ _id: id, title: location.state?.reviewerTitle || 'CSE Assessment', type: 'trial_assessment' });
        }

        if (fromSprint && examRes.success) {
          const data = examRes.data;
          setTask(data.task || null);
          setReviewer({ _id: routeId, title: sprintTaskLabel || data.task?.title || 'Sprint Task', type: 'sprint_task' });
          setAttemptId(routeId);
          setQuestions(data.questions);
          setTotalQuestions(data.totalQuestions);
          setCurrentIndex(data.currentIndex || 0);
          setRemainingSeconds(data.remainingSeconds ?? null);
          startTsRef.current = Date.now();
          setElapsedSeconds(0);

          const answeredSet = new Set();
          const answersMap = {};
          if (data.savedAnswers) {
            Object.entries(data.savedAnswers).forEach(([idx, answer]) => {
              const index = parseInt(idx, 10);
              answersMap[index] = answer;
              answeredSet.add(index + 1);
            });
          }
          setAnswered(answeredSet);
          setAnswers(answersMap);
          const currentAnswer = answersMap[data.currentIndex || 0];
          setSelectedOption(currentAnswer ? OPTION_LABELS.indexOf(currentAnswer) : null);
        }

        if (!fromSprint && examRes.success) {
          const data = examRes.data;
          setAttemptId(data.attemptId);
          setQuestions(data.questions);
          setTotalQuestions(data.totalQuestions);
          setCurrentIndex(data.currentIndex || 0);
          setRemainingSeconds(data.remainingSeconds);

          if (revRes.success) {
            trackExamStarted(id, revRes.data.title);
          }

          const answeredSet = new Set();
          const answersMap = {};
          if (data.answeredIndices) {
            data.answeredIndices.forEach((i) => answeredSet.add(i + 1));
          }
          if (data.userAnswers) {
            Object.entries(data.userAnswers).forEach(([idx, answer]) => {
              answersMap[parseInt(idx, 10)] = answer;
            });
          }
          setAnswered(answeredSet);
          setAnswers(answersMap);
          if (data.userAnswers && data.userAnswers[data.currentIndex || 0]) {
            const currentAnswer = data.userAnswers[data.currentIndex || 0];
            setSelectedOption(['A', 'B', 'C', 'D'].indexOf(currentAnswer));
          }

          if (data.remainingSeconds != null && data.remainingSeconds > 0) {
            setTimeLeft(secondsToTimeStr(data.remainingSeconds));
          }
        }
      } catch (err) {
        if (!cancelled) setErrorMsg(err.message || 'Failed to start exam');
      } finally {
        if (!cancelled) setLoadingExam(false);
      }
    }
    loadExam();
    return () => { cancelled = true; };
  }, [routeId, id, api, isRestart, isTrial, fromSprint, sprintTaskLabel, location.state?.reviewerTitle]);

  // Timer logic – starts after reload warning is dismissed
  useEffect(() => {
    if (loadingExam || showReloadWarningModal || timeUp) return;
    if (!fromSprint && (remainingSeconds == null || remainingSeconds <= 0)) return;

    if (fromSprint) {
      const intervalId = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTsRef.current) / 1000));
      }, 1000);
      return () => clearInterval(intervalId);
    }

    // Set end time from remaining seconds
    if (!endTimeRef.current) {
      endTimeRef.current = Date.now() + remainingSeconds * 1000;
    }

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(secondsToTimeStr(remaining));
      if (remaining <= 0) {
        setTimeUp(true);
        if (attemptId) {
          flushPendingAnswers().then(() => api.submit(attemptId, 0).catch(() => { }));
        }
        return true;
      }
      return false;
    };

    if (tick()) return;
    timerRef.current = setInterval(() => {
      if (tick()) clearInterval(timerRef.current);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loadingExam, showReloadWarningModal, timeUp, remainingSeconds, attemptId, flushPendingAnswers, api, fromSprint]);

  // beforeunload: send pending answers via beacon (sendBeacon survives tab close)
  useEffect(() => {
    const handler = () => {
      const pending = pendingAnswersRef.current;
      const entries = Object.entries(pending);
      if (entries.length === 0 || !attemptId) return;
      const token = localStorage.getItem('reviewly_token');
      if (!token) return;
      const apiBase = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const url = `${apiBase}/${beaconPath}/attempts/${attemptId}/beacon`;
      const body = JSON.stringify({ token, answers: pending });
      navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [attemptId, beaconPath]);

  // When time's up, close any other modals
  useEffect(() => {
    if (timeUp) {
      setShowPauseModal(false);
      setShowResetModal(false);
      setShowSubmitModal(false);
    }
  }, [timeUp]);

  const currentQuestion = questions[currentIndex];
  const unansweredCount = totalQuestions - answered.size;

  const handleOptionChange = useCallback((optionIndex) => {
    if (examFrozen) return;
    const letter = OPTION_LABELS[optionIndex];
    setSelectedOption(optionIndex);
    setAnswered((prev) => new Set(prev).add(currentIndex + 1));
    setAnswers((prev) => ({ ...prev, [currentIndex]: letter }));

    if (attemptId) {
      pendingAnswersRef.current = { ...pendingAnswersRef.current, [currentIndex]: letter };
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(flushPendingAnswers, 10000);
    }
  }, [examFrozen, currentIndex, attemptId, flushPendingAnswers]);

  const handleNext = () => {
    if (examFrozen) return;
    flushPendingAnswers();
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
      const nextIdx = currentIndex + 1;
      const prevAnswer = answers[nextIdx];
      setSelectedOption(prevAnswer ? OPTION_LABELS.indexOf(prevAnswer) : null);
    }
  };

  const handlePrev = () => {
    if (examFrozen) return;
    flushPendingAnswers();
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      const prevIdx = currentIndex - 1;
      const prevAnswer = answers[prevIdx];
      setSelectedOption(prevAnswer ? OPTION_LABELS.indexOf(prevAnswer) : null);
    }
  };

  const goToQuestion = (num) => {
    if (examFrozen) return;
    flushPendingAnswers();
    const idx = num - 1;
    setCurrentIndex(idx);
    const prevAnswer = answers[idx];
    setSelectedOption(prevAnswer ? OPTION_LABELS.indexOf(prevAnswer) : null);
  };

  const isLastQuestion = currentIndex === totalQuestions - 1;
  const hasTimeLimit = remainingSeconds != null && remainingSeconds > 0;
  const handleNextOrSubmit = () => {
    if (examFrozen) return;
    if (isLastQuestion) {
      if (fromSprint || hasTimeLimit) setShowSubmitModal(true);
      else handleConfirmSubmit();
    } else {
      handleNext();
    }
  };

  /** Format time left for modal display. */
  const formatTimeLeftForModal = () => {
    const parts = timeLeft.trim().split(':').map(Number);
    if (parts.length < 2 || parts.some(Number.isNaN)) return timeLeft;
    const [h = 0, m = 0, s = 0] = parts;
    if (h > 0) return `${h} hour${h !== 1 ? 's' : ''} and ${m} minute${m !== 1 ? 's' : ''}`;
    if (m > 0) return `${m} minute${m !== 1 ? 's' : ''} and ${s} second${s !== 1 ? 's' : ''}`;
    return `${s} second${s !== 1 ? 's' : ''}`;
  };

  const getRemainingSecondsNow = () => {
    if (!endTimeRef.current) return remainingSeconds || 0;
    return Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
  };

  const handlePauseAndExit = async () => {
    if (!attemptId) return;
    try {
      await flushPendingAnswers();
      await api.pause(attemptId, getRemainingSecondsNow(), currentIndex);
    } catch (err) {
      console.error('Pause failed:', err);
    }
    setShowPauseModal(false);
    if (isTrial) {
      navigate('/dashboard');
    } else if (fromSprint) {
      navigate('/dashboard');
    } else {
      navigate(`/dashboard/exam/${id}${fromLibrary ? '?from=library' : ''}`);
    }
  };

  const handleResetExam = async () => {
    if (examFrozen || !attemptId) return;
    pendingAnswersRef.current = {};
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    try {
      await api.submit(attemptId);
    } catch (_) { }
    setLoadingExam(true);
    endTimeRef.current = null;
    try {
      const examRes = await api.start(id);
      if (examRes.success) {
        const data = examRes.data;
        setAttemptId(data.attemptId);
        setQuestions(data.questions);
        setTotalQuestions(data.totalQuestions);
        setCurrentIndex(0);
        setRemainingSeconds(data.remainingSeconds);
        setSelectedOption(null);
        setAnswered(new Set());
        setAnswers({});
        setTimeUp(false);
        if (data.remainingSeconds != null && data.remainingSeconds > 0) {
          setTimeLeft(secondsToTimeStr(data.remainingSeconds));
        }
      }
    } catch (err) {
      setErrorMsg('Failed to reset exam');
    } finally {
      setLoadingExam(false);
    }
    setShowResetModal(false);
  };

  const handleConfirmSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await flushPendingAnswers();
      const remaining = hasTimeLimit ? getRemainingSecondsNow() : null;
      const res = await api.submit(attemptId, remaining, answers);
      if (res.success) {
        if (!fromSprint) {
          trackExamCompleted(routeId, reviewer?.title, {
            score: res.data?.result?.percentage,
            duration: res.data?.result?.duration,
            totalQuestions: totalQuestions,
          });
          setShowSubmitModal(false);
          navigate(
            `${resultsPath}/${attemptId}${!isTrial && fromLibrary ? '?from=library' : ''}`,
            { state: { showLoadingFlow: true } }
          );
        } else {
          setShowSubmitModal(false);
          navigate(`/dashboard/sprint/task/${routeId}/result`, {
            state: {
              task,
              result: res.data.result,
              sprintPlan: res.data.sprintPlan,
              review: res.data.review,
            },
          });
        }
      }
    } catch (err) {
      console.error('Submit failed:', err);
      setErrorMsg('Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewResults = () => {
    if (!attemptId) return;
    if (fromSprint) {
      navigate('/dashboard');
      return;
    }
    navigate(
      `${resultsPath}/${attemptId}${!isTrial && fromLibrary ? '?from=library' : ''}`,
      isTrial ? { state: { showLoadingFlow: true } } : undefined
    );
  };

  if (loadingExam) return <ExamSkeleton />;

  if (errorMsg || !reviewer || questions.length === 0) {
    const backTo = fromSprint ? '/dashboard' : (fromLibrary ? '/dashboard/library' : '/dashboard/all-reviewers');
    const backLabel = fromSprint ? 'Dashboard' : (fromLibrary ? 'My Library' : 'All Reviewers');
    return (
      <div className="min-h-screen bg-[#F5F4FF]">
        <DashNav />
        <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 py-8">
          <p className="font-inter text-[#45464E]">{errorMsg || 'Exam not found.'}</p>
          <Link
            to={backTo}
            className="font-inter text-[#6E43B9] hover:underline mt-4 inline-block"
          >
            Back to {backLabel}
          </Link>
        </main>
      </div>
    );
  }

  const questionNumber = currentIndex + 1;
  const displayTime = fromSprint ? secondsToTimeStr(elapsedSeconds) : timeLeft;

  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      {/* Reload / close tab warning – shown once when exam loads */}
      <Modal
        isOpen={showReloadWarningModal}
        onClose={() => setShowReloadWarningModal(false)}
        title="Don't reload or close this tab"
        titleId="reload-warning-modal-title"
        footer={
          <button
            type="button"
            onClick={() => setShowReloadWarningModal(false)}
            className="font-inter font-bold text-[14px] text-[#421A83] py-[11.5px] px-6 rounded-[8px] bg-[#FACC15] hover:opacity-90 transition-opacity"
          >
            Got it
          </button>
        }
      >
        <p className="font-inter font-normal text-[14px] text-[#45464E]">
          Your timer and answers are saved in this browser session. Please don&apos;t refresh or close this tab during the exam, or you may lose your place.
        </p>
      </Modal>

      {/* Save and Exit modal */}
      <Modal
        isOpen={showPauseModal}
        onClose={() => setShowPauseModal(false)}
        title="Save and exit assessment?"
        titleId="pause-modal-title"
        footer={
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full">
            <button
              type="button"
              onClick={() => setShowPauseModal(false)}
              className="w-full sm:w-auto min-w-[160px] font-inter font-normal text-[14px] text-[#431C86] py-[10px] px-[14px] sm:px-6 rounded-[8px] border border-[#431C86] bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Continue Assessment
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPauseModal(false);
                handlePauseAndExit();
              }}
              className="w-full sm:w-auto min-w-[160px] font-inter font-bold text-[14px] text-[#421A83] py-[10px] px-[14px] sm:px-6 rounded-[8px] bg-[#FACC15] hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Save &amp; Exit
            </button>
          </div>
        }
      >
        <p className="font-inter font-normal text-[14px] text-[#45464E]">
          Your progress will be saved, and you can continue anytime from the Dashboard.
        </p>
        <p className="font-inter font-normal text-[14px] text-[#45464E]">
          Your answers and remaining time will be kept.
        </p>
      </Modal>

      {/* Reset modal */}
      <Modal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        title="Reset"
        titleId="reset-modal-title"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowResetModal(false)}
              className="font-inter font-normal text-[14px] text-[#431C86] py-[11.5px] px-6 rounded-[8px] border border-[#431C86] bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleResetExam}
              className="font-inter font-bold text-[14px] text-[#421A83] py-[11.5px] px-6 rounded-[8px] bg-[#FACC15] hover:opacity-90 transition-opacity"
            >
              Reset
            </button>
          </>
        }
      >
        <p className="font-inter font-normal text-[14px] text-[#45464E]">
          This will start fresh — your answers will be cleared, the timer will reset, and the questions will be shuffled.
        </p>
        <p className="font-inter font-normal text-[14px] text-[#45464E]">
          ⚠️ Progress won&apos;t be saved.
        </p>
      </Modal>

      {/* Confirm Submission modal */}
      <Modal
        isOpen={showSubmitModal}
        onClose={() => setShowSubmitModal(false)}
        title={fromSprint ? 'Ready to see how you did?' : 'Submit your assessment?'}
        titleId="submit-modal-title"
        footer={
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full">
            <button
              type="button"
              onClick={() => setShowSubmitModal(false)}
              className="w-full sm:w-auto min-w-[160px] font-inter font-normal text-[14px] text-[#431C86] py-[10px] px-[14px] sm:px-6 rounded-[8px] border border-[#431C86] bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              Review Answers
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmit}
              disabled={submitting}
              className="w-full sm:w-auto min-w-[160px] font-inter font-bold text-[14px] text-[#421A83] py-[10px] px-[14px] sm:px-6 rounded-[8px] bg-[#FACC15] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {submitting && (
                <svg className="animate-spin h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              {fromSprint ? 'Submit Task' : 'Submit Assessment'}
            </button>
          </div>
        }
      >
        {fromSprint ? (
          <>
            <p className="font-inter font-normal text-[14px] text-[#45464E] mb-3">
              You answered {totalQuestions - unansweredCount} of {totalQuestions} questions.
            </p>
            <p className="font-inter font-normal text-[14px] text-[#45464E]">
              Review your answers first — or submit to see your results.
            </p>
          </>
        ) : unansweredCount > 0 ? (
          <p className="font-inter font-normal text-[14px] text-[#45464E]">
            You still have{' '}
            <span className="text-[#F59E0B] font-semibold">{unansweredCount} unanswered question{unansweredCount !== 1 ? 's' : ''}</span>
            {' '}and{' '}
            <span className="text-[#F59E0B] font-semibold">{formatTimeLeftForModal()}</span>
            {' '}left. You can submit now or go back and review them first.
          </p>
        ) : (
          <p className="font-inter font-normal text-[14px] text-[#45464E]">
            You still have{' '}
            <span className="text-[#F59E0B] font-semibold">{formatTimeLeftForModal()}</span>
            {' '}left. You can submit now or review your answers first.
          </p>
        )}
      </Modal>

      {/* Time's Up modal */}
      <Modal
        isOpen={timeUp}
        onClose={handleViewResults}
        title="Time's up"
        titleId="timeup-modal-title"
        footer={
          <button
            type="button"
            onClick={handleViewResults}
            className="font-inter font-bold text-[14px] text-[#421A83] py-[11.5px] px-6 rounded-[8px] bg-[#FACC15] hover:opacity-90 transition-opacity"
          >
            View Results
          </button>
        }
      >
        <p className="font-inter font-normal text-[14px] text-[#45464E]">
          Your assessment time has ended. Your answers have been submitted automatically.
        </p>
        <p className="font-inter font-normal text-[14px] text-[#45464E]">
          Unanswered questions will be counted as unanswered.
        </p>
      </Modal>

      <DashNav />
      {/* When exam is frozen (time's up or reload modal open), block all interaction with exam content */}
      {examFrozen && (
        <div
          className="fixed inset-0 z-40"
          aria-hidden="true"
          style={{ pointerEvents: 'auto' }}
        />
      )}
      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 pt-[24px] pb-[40px]">
        {/* Breadcrumbs */}
        <nav className="mb-[24px]" aria-label="Breadcrumb" data-aos="fade-up" data-aos-duration="400" data-aos-delay="0">
          {fromSprint ? (
            <>
              <Link to="/dashboard" className="text-[#45464E] font-inter font-normal text-[14px] hover:text-[#6E43B9] transition-colors">Dashboard</Link>
              <span className="mx-2">›</span>
              <Link to="/dashboard" className="text-[#45464E] font-inter font-normal text-[14px] hover:text-[#6E43B9] transition-colors">Sprint Task</Link>
              <span className="mx-2">›</span>
              <span className="text-[#6E43B9] font-inter font-normal text-[14px]">{sprintTaskLabel}</span>
            </>
          ) : (
            <>
              <Link
                to={fromLibrary ? '/dashboard/library' : '/dashboard/all-reviewers'}
                className="text-[#45464E] font-inter font-normal text-[14px] hover:text-[#6E43B9] transition-colors"
              >
                {fromLibrary ? 'My Library' : 'All Reviewers'}
              </Link>
              <span className="mx-2">›</span>
              <span className="text-[#6E43B9] font-inter font-normal text-[14px]">{reviewer.title}</span>
            </>
          )}
        </nav>

        <h1 className="font-inter font-medium text-[#45464E] text-[20px] mb-[24px]" data-aos="fade-up" data-aos-duration="400" data-aos-delay="25">{reviewer.title}</h1>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-[24px] items-start">
          {/* Left: Question card */}
          <div className="order-1 w-full lg:w-auto lg:flex-1 lg:min-w-0 bg-[#FFFFFF] p-[24px] rounded-[12px]" data-aos="fade-up" data-aos-duration="400" data-aos-delay="50">
            <div key={currentIndex} className="animate-question-change">
              {/* Question header with counter and tags */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-5 gap-2">
                <p className="font-inter font-medium text-[#0F172A] text-[16px]">
                  Question {questionNumber} of {totalQuestions}
                </p>
                <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                  {currentQuestion?.section && (() => {
                    const sectionLabel = (() => {
                      const s = (currentQuestion.section || '').toLowerCase().trim();
                      if (s === 'verbal') return 'Verbal';
                      if (s === 'analytical') return 'Analytical';
                      if (s === 'clerical') return 'Clerical';
                      if (s === 'numerical') return 'Numerical';
                      if (s === 'general information' || s === 'general_info') return 'Gen Info';
                      return currentQuestion.section.charAt(0).toUpperCase() + currentQuestion.section.slice(1);
                    })();
                    const { containerStyle, textStyle } = getTagStyleBySection(currentQuestion.section);
                    return (
                      <span className="font-inter text-[13px] font-normal capitalize" style={containerStyle}>
                        <span style={textStyle}>{sectionLabel}</span>
                      </span>
                    );
                  })()}
                  {currentQuestion?.topic && (() => {
                    // Topic tag always uses the same section color for consistency
                    const { containerStyle, textStyle } = getTagStyleBySection(currentQuestion.section);
                    return (
                      <span className="font-inter text-[13px] font-normal capitalize" style={containerStyle}>
                        <span style={textStyle}>{currentQuestion.topic}</span>
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Question text */}
              <p className="font-inter font-normal text-[#45464E] text-[16px] mb-6">
                {currentQuestion?.questionText}
              </p>

              {/* Option cards */}
              <div className="space-y-3 mb-8">
                {[currentQuestion?.choiceA, currentQuestion?.choiceB, currentQuestion?.choiceC, currentQuestion?.choiceD].map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleOptionChange(idx)}
                      disabled={examFrozen}
                      className={`w-full flex items-center gap-4 py-3.5 px-4 rounded-[12px] border-2 transition-all ${isSelected
                        ? 'border-[#6E43B9] bg-[#F5F0FF]'
                        : 'border-[#E5E7EB] bg-white hover:border-[#D1D5DB]'
                        } ${examFrozen ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-semibold shrink-0 transition-colors ${isSelected
                          ? 'bg-[#6E43B9] text-white'
                          : 'bg-[#F3F4F6] text-[#6B7280]'
                          }`}
                      >
                        {OPTION_LABELS[idx]}
                      </span>
                      <span className={`font-inter text-[15px] text-left ${isSelected ? 'text-[#0F172A] font-medium' : 'text-[#45464E]'
                        }`}>
                        {option}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom actions */}
            <div className="relative pt-4 mt-4 border-t border-[#F2F4F7]">
              <span className={`absolute -top-5 right-0 font-inter text-[13px] text-[#45464E] transition-opacity duration-200 ${saveStatus ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                {saveStatus === 'saving' ? 'Saving...' : 'Saved ✓'}
              </span>

              <div className="flex flex-col gap-3 sm:hidden">
                <button
                  type="button"
                  onClick={handleNextOrSubmit}
                  disabled={examFrozen || submitting}
                  className="w-full font-inter font-semibold text-[14px] text-[#421A83] py-2.5 px-6 rounded-[8px] bg-[#FFC92A] hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLastQuestion && submitting && (
                    <svg className="animate-spin h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {isLastQuestion ? 'Submit' : 'Next'}
                </button>
                <div className="grid grid-cols-2 gap-2 w-full">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentIndex === 0 || examFrozen}
                    className="w-full font-inter font-normal text-[14px] text-[#6C737F] py-2 px-4 rounded-[8px] border border-[#D1D5DB] bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={examFrozen}
                    onClick={() => {
                      if (examFrozen) return;
                      setShowPauseModal(true);
                    }}
                    className="w-full font-inter font-normal text-[14px] text-[#6C737F] py-2 px-4 rounded-[8px] border border-[#D1D5DB] bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    Save and Exit
                  </button>
                </div>
              </div>

              <div className="hidden sm:flex sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleNextOrSubmit}
                    disabled={examFrozen || submitting}
                    className="font-inter font-semibold text-[14px] text-[#421A83] py-2.5 px-6 rounded-[8px] bg-[#FFC92A] hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLastQuestion ? 'Submit' : 'Next'}
                  </button>
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentIndex === 0 || examFrozen}
                    className="font-inter font-normal text-[14px] text-[#6C737F] py-2 px-4 rounded-[8px] border border-[#D1D5DB] bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                </div>
                <button
                  type="button"
                  disabled={examFrozen}
                  onClick={() => {
                    if (examFrozen) return;
                    setShowPauseModal(true);
                  }}
                  className="font-inter font-normal text-[14px] text-[#6C737F] py-2 px-4 rounded-[8px] border border-[#D1D5DB] bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  Save and Exit
                </button>
              </div>
            </div>
            <p className="font-inter italic text-[14px] text-[#45464E80] mt-3">
              You can skip questions and return to them anytime.
            </p>
          </div>

          {/* Right: Time + question grid */}
          <div className="order-2 lg:flex-shrink-0 lg:max-w-[404px] lg:self-stretch w-full lg:w-auto" data-aos="fade-up" data-aos-duration="400" data-aos-delay="75">
            <div className="bg-[#FFFFFF] rounded-[12px] p-[24px] lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
              <div className="flex flex-row justify-between items-center mb-[15px]">
                <span className="font-inter font-semibold not-italic text-[20px] text-[#45464E]">Time Elapsed</span>
                <p className="font-inter font-bold not-italic text-[32px] text-[#431C86]">{displayTime}</p>
              </div>
              <div className="flex items-center gap-[16px] mb-[15px]">
                <div className="flex items-center gap-[8px]">
                  <span className="w-[20px] h-[20px] rounded-[4px] bg-[#E8E3F0]" aria-hidden />
                  <span className="font-inter font-normal not-italic text-[14px] text-[#53545C]">Unanswered</span>
                </div>
                <div className="flex items-center gap-[8px]">
                  <span className="w-[20px] h-[20px] rounded-[4px] bg-[#BDB0D4]" aria-hidden />
                  <span className="font-inter font-normal not-italic text-[14px] text-[#53545C]">Answered</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-[6px] lg:grid lg:grid-cols-10 lg:gap-x-[6px] lg:gap-y-[6px]">
                {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    disabled={examFrozen}
                    onClick={() => goToQuestion(num)}
                    className={`shrink-0 w-8 h-8 lg:min-w-0 lg:w-full lg:aspect-square lg:max-w-8 font-inter text-[13px] font-medium rounded-[6px] border transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${num === questionNumber
                      ? 'border-[#6E43B9] bg-[#6E43B91A] text-[#6E43B9]'
                      : answered.has(num)
                        ? 'border-transparent bg-[#BDB0D4] text-[#45464E]'
                        : 'border-transparent bg-[#E8E3F0] text-[#7B6FA0] hover:border-[#6E43B9]/40 hover:bg-[#DDD6EE]'
                      }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Exam;
