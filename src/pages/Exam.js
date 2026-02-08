import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import DashNav from '../components/DashNav';
import { ExamTimeInfoIcon } from '../components/Icons';
import Modal from '../components/Modal';
import { getReviewerById } from '../data/reviewers';
import timeUpImage from '../Assets/timeup.png';

// Mock first question – replace with API/data later
const MOCK_QUESTION = {
  id: 1,
  text: 'Which sentence is grammatically correct?',
  options: [
    'Each of the employees are required to attend the meeting.',
    'Each of the employees is required to attend the meeting.',
    'Each employees is required to attend the meeting.',
    'Each employee are required to attend the meeting.',
  ],
};

const STORAGE_KEY_PREFIX = 'examEndTime_';

/** Parse "HH:MM:SS" or "HH:MM" to total milliseconds; returns 0 for "No time limit" or invalid. */
function parseTimeToMs(timeStr) {
  if (!timeStr || typeof timeStr !== 'string' || timeStr.toLowerCase().includes('no time')) return 0;
  const parts = timeStr.trim().split(':').map(Number);
  if (parts.some(Number.isNaN)) return 0;
  const [h = 0, m = 0, s = 0] = parts;
  return (h * 3600 + m * 60 + s) * 1000;
}

/** Format milliseconds as "HH:MM:SS" (non-negative). */
function msToTimeStr(ms) {
  if (ms <= 0) return '00:00:00';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
}

function Exam() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reviewer = id ? getReviewerById(id) : null;
  const exam = reviewer?.examDetails;
  const totalQuestions = exam?.itemsCount ?? 170;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [answered, setAnswered] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState('03:00:00');
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [timerResetKey, setTimerResetKey] = useState(0);
  const [showReloadWarningModal, setShowReloadWarningModal] = useState(true);

  // Exam is frozen when time's up or when the initial reload modal is open (clock not ticking)
  const examFrozen = timeUp || showReloadWarningModal;

  // Persist end time in sessionStorage so refresh does not reset the timer.
  // Timer does not start until the user dismisses the reload warning modal (first load only).
  // On refresh, stored end time exists so the clock runs immediately and does not wait.
  useEffect(() => {
    if (!exam || !id) return;
    const key = `${STORAGE_KEY_PREFIX}${id}`;
    const durationMs = parseTimeToMs(exam.timeFormatted);
    let endTime = null;
    const stored = sessionStorage.getItem(key);
    if (stored) {
      const parsed = Number(stored);
      if (!Number.isNaN(parsed)) endTime = parsed;
    }
    // First load with no stored time: wait for user to click "Got it" before starting the timer
    if (endTime == null && showReloadWarningModal && durationMs > 0) {
      setTimeLeft(exam.timeFormatted || '00:00:00');
      return;
    }
    if (endTime == null && durationMs > 0) {
      endTime = Date.now() + durationMs;
      sessionStorage.setItem(key, String(endTime));
    }
    if (endTime == null || durationMs === 0) {
      setTimeLeft(exam.timeFormatted || '00:00:00');
      return;
    }
    const tick = () => {
      const remaining = endTime - Date.now();
      setTimeLeft(msToTimeStr(remaining));
      if (remaining <= 0) {
        setTimeUp(true);
        return true;
      }
      return false;
    };
    if (tick()) return;
    const interval = setInterval(() => {
      if (tick()) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [id, exam, timerResetKey, showReloadWarningModal]);

  // Explicitly do not show the browser's "Leave site?" dialog. We use our custom modal on load instead.
  // A beforeunload handler only shows the native dialog if it calls preventDefault() or sets returnValue.
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Do nothing: do not call preventDefault(), do not set returnValue.
      // This ensures the native reload/close prompt is never shown.
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // When time's up, close any other modals so only the Time's Up modal is shown
  useEffect(() => {
    if (timeUp) {
      setShowPauseModal(false);
      setShowResetModal(false);
      setShowSubmitModal(false);
    }
  }, [timeUp]);

  const handleOptionChange = (optionIndex) => {
    if (examFrozen) return;
    setSelectedOption(optionIndex);
    setAnswered((prev) => new Set(prev).add(currentIndex + 1));
  };

  const handleResetExam = () => {
    if (examFrozen) return;
    setCurrentIndex(0);
    setSelectedOption(null);
    setAnswered(new Set());
    if (id) sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
    setTimerResetKey((k) => k + 1);
    setShowResetModal(false);
  };

  const handleNext = () => {
    if (examFrozen) return;
    if (currentIndex < totalQuestions - 1) setCurrentIndex((i) => i + 1);
    setSelectedOption(null);
  };

  const isLastQuestion = currentIndex === totalQuestions - 1;
  const handleNextOrSubmit = () => {
    if (examFrozen) return;
    if (isLastQuestion) setShowSubmitModal(true);
    else handleNext();
  };

  /** Format "HH:MM:SS" as human-readable time left for the submit modal. */
  const formatTimeLeftForModal = () => {
    const parts = timeLeft.trim().split(':').map(Number);
    if (parts.length < 2 || parts.some(Number.isNaN)) return timeLeft;
    const [h = 0, m = 0, s = 0] = parts;
    if (h > 0) return `${h} hour${h !== 1 ? 's' : ''} and ${m} minute${m !== 1 ? 's' : ''}`;
    if (m > 0) return `${m} minute${m !== 1 ? 's' : ''} and ${s} second${s !== 1 ? 's' : ''}`;
    return `${s} second${s !== 1 ? 's' : ''}`;
  };

  const handleConfirmSubmit = () => {
    if (examFrozen) return;
    if (id) sessionStorage.removeItem(`${STORAGE_KEY_PREFIX}${id}`);
    setShowSubmitModal(false);
    navigate(`/dashboard/exam/${id}`);
  };

  const handleViewResults = () => {
    // TODO: navigate to results when implemented
  };

  const handlePrev = () => {
    if (examFrozen) return;
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
    setSelectedOption(null);
  };

  const goToQuestion = (num) => {
    if (examFrozen) return;
    setCurrentIndex(num - 1);
  };

  if (!reviewer || !exam) {
    return (
      <div className="min-h-screen bg-[#F5F4FF]">
        <DashNav />
        <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 py-8">
          <p className="font-inter text-[#45464E]">Exam not found.</p>
          <Link to="/dashboard/all-reviewers" className="font-inter text-[#6E43B9] hover:underline mt-4 inline-block">
            Back to All Reviewers
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
                navigate(`/dashboard/exam/${id}`);
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
              className="font-inter font-bold text-[14px] text-[#421A83] py-[11.5px] px-6 rounded-[8px] bg-[#FACC15] hover:opacity-90 transition-opacity"
            >
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
            to="/dashboard/all-reviewers"
            className="text-[#45464E] font-inter font-normal text-[14px] hover:text-[#6E43B9] transition-colors"
          >
            All Reviewers
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
                {questionNumber}. {MOCK_QUESTION.text}
              </p>
              <div className="space-y-4 mb-8">
                {MOCK_QUESTION.options.map((option, idx) => (
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
                  disabled={examFrozen}
                  className="font-inter font-semibold text-[14px] text-[#421A83] py-2.5 px-6 rounded-[8px] bg-[#FFC92A] hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
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
                  <button
                    type="button"
                    aria-label="Time information"
                    className="w-[20px] h-[20px] rounded-[4px] flex items-center justify-center opacity-40 text-[#130F26] bg-[linear-gradient(0deg,_#FFC92A,_#FFC92A),_linear-gradient(0deg,_rgba(255,255,255,0.5),_rgba(255,255,255,0.5))]"
                  >
                    <ExamTimeInfoIcon className="w-[1.76px] h-[9.34px]" />
                  </button>
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
