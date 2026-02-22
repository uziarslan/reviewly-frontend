import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import DashNav from '../components/DashNav';
import { ExamTimeInfoIcon } from '../components/Icons';
import ExamSkeleton from '../components/skeletons/ExamSkeleton';
import Modal from '../components/Modal';
import { examAPI, reviewerAPI } from '../services/api';
import timeUpImage from '../Assets/timeup.png';
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

function Exam() {
  const { id } = useParams(); // reviewer id
  const navigate = useNavigate();
  const location = useLocation();
  const fromLibrary = new URLSearchParams(location.search).get('from') === 'library';

  // Exam data from API
  const [attemptId, setAttemptId] = useState(null);
  const [reviewer, setReviewer] = useState(null);
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
  const [showReloadWarningModal, setShowReloadWarningModal] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const endTimeRef = useRef(null);
  const timerRef = useRef(null);

  // Exam is frozen when time's up or when the initial reload modal is open
  const examFrozen = timeUp || showReloadWarningModal || loadingExam;

  // Start or resume exam on mount
  useEffect(() => {
    let cancelled = false;
    async function loadExam() {
      try {
        // Fetch reviewer info for display
        const [examRes, revRes] = await Promise.all([
          examAPI.start(id),
          reviewerAPI.getById(id),
        ]);
        if (cancelled) return;

        if (revRes.success) setReviewer(revRes.data);

        if (examRes.success) {
          const data = examRes.data;
          setAttemptId(data.attemptId);
          setQuestions(data.questions);
          setTotalQuestions(data.totalQuestions);
          setCurrentIndex(data.currentIndex || 0);
          setRemainingSeconds(data.remainingSeconds);

          // Track exam started
          if (revRes.success) {
            trackExamStarted(id, revRes.data.title);
          }

          // Restore answered state
          const answeredSet = new Set();
          const answersMap = {};
          if (data.answeredIndices) {
            data.answeredIndices.forEach((i) => answeredSet.add(i + 1));
          }
          // Restore previously selected answers if resuming
          if (data.userAnswers) {
            Object.entries(data.userAnswers).forEach(([idx, answer]) => {
              answersMap[parseInt(idx)] = answer;
            });
          }
          setAnswered(answeredSet);
          setAnswers(answersMap);
          // Pre-select the option for current question if resuming
          if (data.userAnswers && data.userAnswers[data.currentIndex || 0]) {
            const currentAnswer = data.userAnswers[data.currentIndex || 0];
            setSelectedOption(['A', 'B', 'C', 'D'].indexOf(currentAnswer));
          }

          // Set time display
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
  }, [id]);

  // Timer logic – starts after reload warning is dismissed
  useEffect(() => {
    if (loadingExam || showReloadWarningModal || timeUp) return;
    if (remainingSeconds == null || remainingSeconds <= 0) return;

    // Set end time from remaining seconds
    if (!endTimeRef.current) {
      endTimeRef.current = Date.now() + remainingSeconds * 1000;
    }

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - Date.now()) / 1000));
      setTimeLeft(secondsToTimeStr(remaining));
      if (remaining <= 0) {
        setTimeUp(true);
        // Auto-submit on time up
        if (attemptId) {
          examAPI.submit(attemptId).catch(() => {});
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
  }, [loadingExam, showReloadWarningModal, timeUp, remainingSeconds, attemptId]);

  // When time's up, close any other modals
  useEffect(() => {
    if (timeUp) {
      setShowPauseModal(false);
      setShowResetModal(false);
      setShowSubmitModal(false);
    }
  }, [timeUp]);

  const currentQuestion = questions[currentIndex];

  const handleOptionChange = useCallback((optionIndex) => {
    if (examFrozen) return;
    const letter = OPTION_LABELS[optionIndex];
    setSelectedOption(optionIndex);
    setAnswered((prev) => new Set(prev).add(currentIndex + 1));
    setAnswers((prev) => ({ ...prev, [currentIndex]: letter }));

    // Save answer to backend (fire and forget)
    if (attemptId) {
      examAPI.saveAnswer(attemptId, currentIndex, letter).catch((err) =>
        console.error('Failed to save answer:', err)
      );
    }
  }, [examFrozen, currentIndex, attemptId]);

  const handleNext = () => {
    if (examFrozen) return;
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((i) => i + 1);
      // Restore previously selected answer for next question
      const nextIdx = currentIndex + 1;
      const prevAnswer = answers[nextIdx];
      setSelectedOption(prevAnswer ? OPTION_LABELS.indexOf(prevAnswer) : null);
    }
  };

  const handlePrev = () => {
    if (examFrozen) return;
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      // Restore previously selected answer
      const prevIdx = currentIndex - 1;
      const prevAnswer = answers[prevIdx];
      setSelectedOption(prevAnswer ? OPTION_LABELS.indexOf(prevAnswer) : null);
    }
  };

  const goToQuestion = (num) => {
    if (examFrozen) return;
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
      if (hasTimeLimit) setShowSubmitModal(true);
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
      await examAPI.pause(attemptId, getRemainingSecondsNow(), currentIndex);
    } catch (err) {
      console.error('Pause failed:', err);
    }
    setShowPauseModal(false);
    navigate(`/dashboard/exam/${id}${fromLibrary ? '?from=library' : ''}`);
  };

  const handleResetExam = async () => {
    if (examFrozen || !attemptId) return;
    // Submit current attempt and start fresh
    try {
      await examAPI.submit(attemptId);
    } catch (_) {}
    // Start a new attempt
    setLoadingExam(true);
    endTimeRef.current = null;
    try {
      const examRes = await examAPI.start(id);
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
      const res = await examAPI.submit(attemptId);
      if (res.success) {
        // Track exam completed
        trackExamCompleted(id, reviewer?.title, {
          score: res.data?.result?.percentage,
          duration: res.data?.result?.duration,
          totalQuestions: totalQuestions,
        });
        setShowSubmitModal(false);
        navigate(`/dashboard/results/${attemptId}${fromLibrary ? '?from=library' : ''}`);
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
    navigate(`/dashboard/results/${attemptId}${fromLibrary ? '?from=library' : ''}`);
  };

  if (loadingExam) return <ExamSkeleton />;

  if (errorMsg || !reviewer || questions.length === 0) {
    return (
      <div className="min-h-screen bg-[#F5F4FF]">
        <DashNav />
        <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 py-8">
          <p className="font-inter text-[#45464E]">{errorMsg || 'Exam not found.'}</p>
          <Link
            to={fromLibrary ? '/dashboard/library' : '/dashboard/all-reviewers'}
            className="font-inter text-[#6E43B9] hover:underline mt-4 inline-block"
          >
            Back to {fromLibrary ? 'My Library' : 'All Reviewers'}
          </Link>
        </main>
      </div>
    );
  }

  const questionNumber = currentIndex + 1;

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

      {/* Pause and Exit modal */}
      <Modal
        isOpen={showPauseModal}
        onClose={() => setShowPauseModal(false)}
        title="Pause and Exit"
        titleId="pause-modal-title"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowPauseModal(false)}
              className="font-inter font-normal text-[14px] text-[#431C86] py-[11.5px] px-6 rounded-[8px] border border-[#431C86] bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                setShowPauseModal(false);
                handlePauseAndExit();
              }}
              className="font-inter font-bold text-[14px] text-[#421A83] py-[11.5px] px-6 rounded-[8px] bg-[#FACC15] hover:opacity-90 transition-opacity"
            >
              Leave for now
            </button>
          </>
        }
      >
        <p className="font-inter font-normal text-[14px] text-[#45464E]">
          Your progress will be saved, and you can resume anytime where you left off.
        </p>
        <p className="font-inter font-normal text-[14px] text-[#45464E]">
          ✅ Don&apos;t worry — your answers and time left are safe!
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
        title="Confirm Submission?"
        titleId="submit-modal-title"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowSubmitModal(false)}
              className="font-inter font-normal text-[14px] text-[#431C86] py-[11.5px] px-6 rounded-[8px] border border-[#431C86] bg-white hover:bg-gray-50 transition-colors"
            >
              Review My Answers
            </button>
            <button
              type="button"
              onClick={handleConfirmSubmit}
              disabled={submitting}
              className="font-inter font-bold text-[14px] text-[#421A83] py-[11.5px] px-6 rounded-[8px] bg-[#FACC15] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting && (
                <svg className="animate-spin h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              Submit Exam
            </button>
          </>
        }
      >
        <p className="font-inter font-normal text-[14px] text-[#45464E]">
          You still have{' '}
          <span className="text-[#F59E0B] font-medium">{formatTimeLeftForModal()}</span>
          {' '}left on the clock.
        </p>
        <p className="font-inter font-normal text-[14px] text-[#45464E]">
          It&apos;s recommended to use all your allotted time to review your answers. Would you like to take another look?
        </p>
      </Modal>

      {/* Time's Up modal – non-dismissible */}
      {timeUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true" aria-labelledby="timeup-modal-title">
          <div className="bg-white rounded-[16px] shadow-lg w-full max-w-[480px] pt-6 pr-6 pb-8 pl-6 flex flex-col gap-4">
            <img src={timeUpImage} alt="" className="w-full max-w-[280px] mx-auto h-auto" />
            <h2 id="timeup-modal-title" className="font-inter font-medium text-[18px] text-[#45464E] text-center">
              ⏰ Time&apos;s Up!
            </h2>
            <div className="flex flex-col gap-4">
              <p className="font-inter font-normal text-[14px] text-[#45464E] text-center">
                You&apos;ve run out of time! Don&apos;t worry, your answers have been automatically submitted for evaluation. Our AI is now busy analyzing your performance to give you insights into your strengths and areas for improvement.
              </p>
              <p className="font-inter font-normal text-[14px] text-[#45464E] text-center">
                Click below to view your results.
              </p>
            </div>
            <button
              type="button"
              onClick={handleViewResults}
              className="font-inter font-bold text-[14px] text-[#421A83] py-[11.5px] px-[24px] rounded-[8px] bg-[#FFC92A] hover:opacity-90 transition-opacity w-full max-w-[162px] mx-auto"
            >
              View My Results
            </button>
          </div>
        </div>
      )}

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
          <Link
            to={fromLibrary ? '/dashboard/library' : '/dashboard/all-reviewers'}
            className="text-[#45464E] font-inter font-normal text-[14px] hover:text-[#6E43B9] transition-colors"
          >
            {fromLibrary ? 'My Library' : 'All Reviewers'}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-[#6E43B9] font-inter font-normal text-[14px]">{reviewer.title}</span>
        </nav>

        <h1 className="font-inter font-medium text-[#45464E] text-[20px] mb-[24px]" data-aos="fade-up" data-aos-duration="400" data-aos-delay="25">{reviewer.title}</h1>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-[24px] items-start">
          {/* Left: Question card */}
          <div className="order-1 w-full lg:w-auto lg:flex-1 lg:min-w-0 bg-[#FFFFFF] p-[24px] rounded-[12px]" data-aos="fade-up" data-aos-duration="400" data-aos-delay="50">
            <div key={currentIndex} className="animate-question-change">
              <p className="font-inter font-medium text-[#0F172A] text-base mb-6">
                {questionNumber}. {currentQuestion?.questionText}
              </p>
              <div className="space-y-4 mb-8">
                {[currentQuestion?.choiceA, currentQuestion?.choiceB, currentQuestion?.choiceC, currentQuestion?.choiceD].map((option, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-3 font-inter text-[16px] text-[#45464E] ${examFrozen ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
                  >
                    <input
                      type="radio"
                      name="answer"
                      checked={selectedOption === idx}
                      onChange={() => handleOptionChange(idx)}
                      disabled={examFrozen}
                      className="mt-1 w-4 h-4 border-[#6E43B9] text-[#6E43B9] focus:ring-[#6E43B9] disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-[#F2F4F7]">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={examFrozen}
                  onClick={() => {
                    if (examFrozen) return;
                    setShowPauseModal(true);
                  }}
                  className="font-inter font-semibold text-[14px] text-[#45464E] py-2.5 px-4 rounded-[8px] border border-[#CFD3D4] bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Pause and Exit
                </button>
                <button
                  type="button"
                  disabled={examFrozen}
                  onClick={() => {
                    if (examFrozen) return;
                    setShowResetModal(true);
                  }}
                  className="font-inter font-semibold text-[14px] text-[#45464E] py-2.5 px-4 rounded-[8px] border border-[#CFD3D4] bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reset
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0 || examFrozen}
                  className="font-inter font-semibold text-[14px] text-[#45464E] py-2.5 px-4 rounded-[8px] border border-[#CFD3D4] bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={handleNextOrSubmit}
                  disabled={examFrozen || submitting}
                  className="font-inter font-semibold text-[14px] text-[#421A83] py-2.5 px-6 rounded-[8px] bg-[#FFC92A] hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLastQuestion && submitting && (
                    <svg className="animate-spin h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {isLastQuestion ? 'Submit' : 'Next'}
                </button>
              </div>
            </div>
          </div>

          {/* Right: Time + question grid */}
          <div className="order-2 lg:flex-shrink-0 lg:max-w-[404px] lg:self-stretch w-full lg:w-auto" data-aos="fade-up" data-aos-duration="400" data-aos-delay="75">
            <div className="bg-[#FFFFFF] rounded-[12px] p-[24px] lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
              <div className="flex flex-row justify-between items-center mb-[15px]">
                <div className="flex items-center gap-[10px]">
                  <span className="font-inter font-normal not-italic text-[20px] text-[#45464E]">Time Left</span>
                  <div className="relative flex items-center group">
                    <button
                      type="button"
                      aria-label="Time information"
                      className="w-[20px] h-[20px] rounded-[4px] flex items-center justify-center opacity-40 text-[#130F26] bg-[linear-gradient(0deg,_#FFC92A,_#FFC92A),_linear-gradient(0deg,_rgba(255,255,255,0.5),_rgba(255,255,255,0.5))]"
                    >
                      <ExamTimeInfoIcon className="w-[1.76px] h-[9.34px]" />
                    </button>
                    <div className="pointer-events-none absolute left-1/2 top-[28px] w-[220px] -translate-x-1/2 rounded-[8px] bg-[#1F2937] px-3 py-2 text-[12px] text-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100">
                      Your answers will be automatically submitted once the timer reaches zero. Make sure to manage your time wisely.
                    </div>
                  </div>
                </div>
                <p className="font-inter font-medium not-italic text-[32px] text-[#431C86]">{timeLeft}</p>
              </div>
              <div className="flex items-center mb-[15px] w-100">
                <div className="flex items-center gap-[8px] w-[50%]">
                  <span className="w-[32px] h-[32px] rounded-[4px] bg-[#F1F1F1]" aria-hidden />
                  <span className="font-inter font-normal not-italic text-[14px] text-[#53545C]">Unanswered</span>
                </div>
                <div className="flex items-center gap-[8px] w-[50%]">
                  <span className="w-[32px] h-[32px] rounded-[4px] bg-[#CDC3DD]" aria-hidden />
                  <span className="font-inter font-normal not-italic text-[14px] text-[#53545C]">Answered</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-[4px] lg:grid lg:grid-cols-10 lg:gap-x-[4px] lg:gap-y-[4px]">
                {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    disabled={examFrozen}
                    onClick={() => goToQuestion(num)}
                    className={`shrink-0 w-8 h-8 lg:min-w-0 lg:w-full lg:aspect-square lg:max-w-8 font-inter text-[14px] font-medium rounded-[4px] border transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${num === questionNumber
                      ? 'border-[#6E43B9] bg-[#6E43B91A] text-[#6E43B9]'
                      : answered.has(num)
                        ? 'border-[#CDC3DD] bg-[#CDC3DD] text-[#45464E]'
                        : 'border-transparent bg-[#F1F1F1] text-[#AEAEAE] hover:border-[#6E43B9]/50 hover:bg-[#F1F1F1]'
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
