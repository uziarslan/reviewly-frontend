import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import DashNav from '../components/DashNav';
import { examAPI } from '../services/api';
import ExamReviewSkeleton from '../components/skeletons/ExamReviewSkeleton';

const formatSection = (s) => {
  if (!s) return '';
  return s.split(/[\s_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

const SECTION_CONFIG = {
  verbal: { label: 'Verbal', color: '#14B8A6' },
  analytical: { label: 'Analytical', color: '#3B82F6' },
  clerical: { label: 'Clerical', color: '#3B82F6' },
  numerical: { label: 'Numerical', color: '#F59E0B' },
  general_info: { label: 'General Info', color: '#EC4899' },
  'general info': { label: 'General Info', color: '#EC4899' },
};
const FALLBACK_COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F43F5E', '#6366F1', '#EF4444'];

function getSectionConfig(sectionKey, index) {
  const key = (sectionKey || '').toLowerCase().trim();
  return SECTION_CONFIG[key] || {
    label: sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1),
    color: FALLBACK_COLORS[index % FALLBACK_COLORS.length],
  };
}

function getSectionKeyFromSubject(subject) {
  if (!subject) return null;
  const lower = subject.toLowerCase();
  if (lower.includes('verbal')) return 'verbal';
  if (lower.includes('analytical')) return 'analytical';
  if (lower.includes('clerical')) return 'clerical';
  if (lower.includes('numerical')) return 'numerical';
  if (lower.includes('general')) return 'general information';
  return null;
}

const formatDuration = (secs) => {
  if (secs == null) return '–';
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h} hr ${m} min`;
  return `${m} min`;
};

function ExamReview() {
  const { attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const fromLibrary = new URLSearchParams(location.search).get('from') === 'library';
  const [reviewData, setReviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!attemptId) { setLoading(false); return; }
    let cancelled = false;
    examAPI.getReview(attemptId)
      .then((res) => {
        if (!cancelled && res.success) setReviewData(res.data);
      })
      .catch((err) => console.error('Failed to load review:', err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [attemptId]);

  if (loading) return <ExamReviewSkeleton />;

  if (!reviewData || !reviewData.questions?.length) {
    return (
      <div className="min-h-screen bg-[#F5F4FF]">
        <DashNav />
        <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 py-8">
          <p className="font-inter text-[#45464E]">Review not found.</p>
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

  const questions = reviewData.questions;
  const result = reviewData.result || {};
  const reviewer = reviewData.reviewer || {};
  const totalQuestions = questions.length;
  const questionNumber = currentIndex + 1;
  const currentQ = questions[currentIndex];

  const optionLabels = ['A', 'B', 'C', 'D'];
  const correctLetter = (currentQ.correctAnswer || '').toString().toUpperCase().trim();
  const selectedLetter = (currentQ.selectedAnswer || '').toString().toUpperCase().trim();
  const isCorrectAnswer = currentQ.isCorrect;

  const explanationCorrect = currentQ.explanationCorrect || '';
  const explanationWrong = currentQ.explanationWrong || '';
  const tip = currentQ.reviewlyTip;
  const topicSource = currentQ.topic || currentQ.module || currentQ.section || '';
  const topicTag = topicSource ? formatSection(topicSource) : '';
  const sectionKey = getSectionKeyFromSubject(currentQ.section || currentQ.module || currentQ.topic);
  const sectionConfig = sectionKey ? getSectionConfig(sectionKey, 0) : null;

  const totalCorrect = result.correct || 0;
  const totalItems = result.totalItems || totalQuestions;
  const percentage = result.percentage != null ? result.percentage.toFixed(2) : '0.00';
  const pct = parseFloat(percentage);
  const duration = result.duration ?? null;

  const reviewerTypeLabel = reviewer.type === 'practice' ? 'Practice Exam Score' : 'Mock Exam Score';
  const statusLabel = pct >= 85 ? 'Exam Ready' : pct >= 70 ? 'Almost Ready' : 'Keep Practicing';
  const statusColor = pct >= 85 ? '#06A561' : pct >= 70 ? '#F5A623' : '#F0142F';

  const scoreMessage = result.passed
    ? 'Great job — you passed!'
    : pct >= 70
      ? 'A few improvements can push you to passing.'
      : "Keep studying – you're building strong foundations!";

  const sectionCoverage = result.sectionScores?.length
    ? result.sectionScores
      .map(s => `${formatSection(s.section)} ${Math.round((s.totalItems / totalItems) * 100)}%`)
      .join(', ')
    : '';

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) setCurrentIndex((i) => i + 1);
  };

  const goToQuestion = (num) => {
    setCurrentIndex(Math.max(0, Math.min(num - 1, totalQuestions - 1)));
  };

  const correctSet = new Set(
    questions.map((q, i) => (q.isCorrect ? i + 1 : null)).filter(Boolean)
  );

  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      <DashNav />
      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 pt-[24px] pb-[40px]">
        {/* Breadcrumbs */}
        <nav className="mb-[24px]" aria-label="Breadcrumb">
          <Link
            to={fromLibrary ? '/dashboard/library' : '/dashboard/all-reviewers'}
            className="text-[#45464E] font-inter font-normal text-[14px] hover:text-[#6E43B9] transition-colors"
          >
            {fromLibrary ? 'My Library' : 'All Reviewers'}
          </Link>
          <span className="mx-2 text-[#45464E]">›</span>
          <span className="text-[#6E43B9] font-inter font-normal text-[14px]">{reviewer.title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ── Left: Question card ── */}
          <div className="order-1 w-full lg:w-auto lg:flex-1 lg:min-w-0 bg-white p-[24px] rounded-[16px] shadow-sm">
            <div key={currentIndex} className="animate-question-change">

              {/* Question header: number + category tags */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-5">
                <span className="font-inter font-medium text-[#45464E] text-[15px] shrink-0">
                  Question {questionNumber} of {totalQuestions}
                </span>
                <div className="flex items-center gap-2 flex-wrap sm:ml-auto">
                  {sectionConfig && (
                    <span
                      className="font-inter text-[12px] font-medium inline-flex items-center rounded-full px-3 py-1"
                      style={{ backgroundColor: sectionConfig.color + '20', color: sectionConfig.color }}
                    >
                      {sectionConfig.label}
                    </span>
                  )}
                  {topicTag && (
                    <span
                      className="font-inter text-[12px] font-medium px-3 py-1 rounded-full"
                      style={sectionConfig ? { backgroundColor: sectionConfig.color + '20', color: sectionConfig.color } : { backgroundColor: '#EDE9FF', color: '#6E43B9' }}
                    >
                      {topicTag}
                    </span>
                  )}
                </div>
              </div>

              {/* Question text */}
              <p className="font-inter font-medium text-[#0F172A] text-[16px] leading-relaxed mb-6">
                {currentQ.questionText}
              </p>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {[currentQ.choiceA, currentQ.choiceB, currentQ.choiceC, currentQ.choiceD].map((option, idx) => {
                  const letter = optionLabels[idx];
                  const isCorrectOption = letter === correctLetter;
                  const isUserChoice = letter === selectedLetter;
                  const showCheck = isCorrectOption;
                  const showX = !isCorrectAnswer && isUserChoice && !isCorrectOption;

                  const rowClass = isCorrectOption
                    ? 'bg-[#F0FBF6] border border-[#06A56126]'
                    : showX
                      ? 'bg-[#FEF2F3] border border-[#F0142F26]'
                      : 'bg-white border border-[#E5E7EB]';

                  const badgeClass = isCorrectOption
                    ? 'bg-[#06A561] text-white'
                    : showX
                      ? 'bg-[#F0142F] text-white'
                      : 'bg-white text-[#9CA3AF] border border-[#D1D5DB]';

                  return (
                    <div key={idx} className={`flex items-center gap-3 px-4 py-3 rounded-[10px] ${rowClass}`}>
                      <span className={`w-7 h-7 flex items-center justify-center shrink-0 rounded-full font-inter font-semibold text-[13px] ${badgeClass}`}>
                        {letter}
                      </span>
                      <span className="font-inter text-[15px] text-[#45464E] flex-1 leading-snug">{option}</span>
                      {showCheck && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20 6L9 17L4 12" stroke="#14B8A6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      )}
                      {showX && (
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M18 6L6 18M6 6L18 18" stroke="#F3596D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Explanation box — always neutral violet, not colour-coded as right/wrong */}
              <div className="rounded-[10px] py-4 px-4 mb-4 bg-[#F5F4FF]">
                <p className="font-inter text-[14px] text-[#45464E] leading-relaxed whitespace-pre-line">
                  <span className="font-semibold">Correct Answer: {correctLetter}</span>
                  {explanationCorrect ? ` — ${explanationCorrect}` : ''}
                  {explanationWrong ? `\n\n${explanationWrong}` : ''}
                </p>
              </div>

              {/* Reviewly Tip */}
              {tip && (
                <div className="rounded-[10px] py-3.5 px-4 mb-2 bg-[#FFF8E6]">
                  <p className="font-inter text-[14px] text-[#53545C] leading-relaxed">
                    💡 <span className="font-semibold">Reviewly Tip:</span> {tip}
                  </p>
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="pt-5 mt-4 border-t border-[#F2F4F7]">
              <div className="flex flex-col gap-2 sm:hidden">
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIndex === totalQuestions - 1}
                  className="w-full font-inter font-semibold text-[14px] text-[#421A83] py-2.5 px-6 rounded-[8px] bg-[#FFC92A] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
                <div className="grid grid-cols-2 gap-2 w-full">
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="w-full font-inter font-normal text-[14px] sm:text-[15px] text-[#6C737F] py-2 px-4 rounded-[8px] border border-[#D1D5DB] bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/results/${attemptId}${fromLibrary ? '?from=library' : ''}`)}
                    className="w-full font-inter font-normal text-[14px] sm:text-[15px] text-[#6C737F] py-2 px-4 rounded-[8px] border border-[#D1D5DB] bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
                  >
                    Back to Results
                  </button>
                </div>
              </div>
              <div className="hidden sm:flex sm:items-center sm:justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={currentIndex === totalQuestions - 1}
                    className="font-inter font-semibold text-[14px] text-[#421A83] py-2.5 px-6 rounded-[8px] bg-[#FFC92A] hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="font-inter font-normal text-[14px] sm:text-[15px] text-[#6C737F] py-2 px-4 sm:py-2.5 sm:px-5 rounded-[8px] border border-[#D1D5DB] bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/results/${attemptId}${fromLibrary ? '?from=library' : ''}`)}
                  className="font-inter font-normal text-[14px] sm:text-[15px] text-[#6C737F] py-2 px-4 sm:py-2.5 sm:px-5 rounded-[8px] border border-[#D1D5DB] bg-white hover:bg-gray-50 transition-colors whitespace-nowrap"
                >
                  Back to Results
                </button>
              </div>
            </div>
          </div>

          {/* ── Right: Score summary + question grid ── */}
          <div className="order-2 lg:flex-shrink-0 lg:w-[404px] w-full">
            <div className="bg-white rounded-[12px] shadow-sm p-[24px] lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">

              {/* Stat rows */}
              <div className="mb-5">
                {[
                  { label: reviewerTypeLabel, value: `${percentage} %` },
                  { label: 'Correct Items', value: `${totalCorrect} / ${totalItems}` },
                  { label: 'Status', value: statusLabel, style: { color: statusColor } },
                  ...(duration != null ? [{ label: 'Total Time', value: formatDuration(duration) }] : []),
                ].map(({ label, value, style }, i, arr) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between py-3 ${i < arr.length - 1 ? 'border-b border-[#F3F4F6]' : ''}`}
                  >
                    <span className="font-inter text-[14px] text-[#45464E]">{label}</span>
                    <span className="font-inter text-[14px] font-medium text-right" style={style || { color: '#0F172A' }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              {/* Score message */}
              {scoreMessage && (
                <p className="font-inter text-[14px] font-medium text-[#45464E] mb-[8px]">{scoreMessage}</p>
              )}
              {sectionCoverage ? (
                <p className="font-inter text-[14px] text-[#45464E80] mb-[24px]">
                  Weighted by section coverage: {sectionCoverage}
                </p>
              ) : (
                <div className="mb-5" />
              )}

              {/* Legend */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-[4px] bg-[#DAF9EC]" aria-hidden />
                  <span className="font-inter text-[13px] text-[#53545C]">Correct Answer</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-[4px] bg-[#FDE7EA]" aria-hidden />
                  <span className="font-inter text-[13px] text-[#53545C]">Incorrect Answer</span>
                </div>
              </div>

              {/* Question number grid */}
              <div className="grid grid-cols-10 gap-[4px]">
                {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num) => {
                  const isCorrect = correctSet.has(num);
                  const isCurrent = num === questionNumber;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => goToQuestion(num)}
                      className={`w-full aspect-square font-inter text-[12px] font-medium rounded-[4px] transition-colors flex items-center justify-center
                        ${isCorrect ? 'bg-[#DAF9EC] text-[#53545C]' : 'bg-[#FDE7EA] text-[#53545C]'}
                        ${isCurrent ? 'ring-2 ring-[#6E43B9] ring-offset-1' : ''}`}
                    >
                      {num}
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

export default ExamReview;
