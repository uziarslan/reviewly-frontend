import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import DashNav from '../components/DashNav';
import { examAPI } from '../services/api';
import ExamReviewSkeleton from '../components/skeletons/ExamReviewSkeleton';

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

  // Same content for both correct/wrong – only background differs
  const explanationCorrect = currentQ.explanationCorrect || '';
  const explanationWrong = currentQ.explanationWrong || '';
  const tip = currentQ.reviewlyTip;

  const totalCorrect = result.correct || 0;
  const totalItems = result.totalItems || totalQuestions;
  const percentage = result.percentage != null ? result.percentage.toFixed(2) : '0.00';
  const passed = result.passed;
  const passingScore = result.passingScore || 0;

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
          <span className="mx-2">›</span>
          <span className="text-[#6E43B9] font-inter font-normal text-[14px]">{reviewer.title}</span>
        </nav>

        <h1 className="font-inter font-medium text-[#45464E] text-[20px] mb-[24px]">{reviewer.title}</h1>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-[24px] items-start">
          {/* Left: Question card */}
          <div className="order-1 w-full lg:w-auto lg:flex-1 lg:min-w-0 bg-[#FFFFFF] p-[24px] rounded-[12px]">
            <div key={currentIndex} className="animate-question-change">
              <p className="font-inter font-medium text-[#0F172A] text-base mb-6">
                {questionNumber}. {currentQ.questionText}
              </p>
              <div className="space-y-4 mb-6">
                {[currentQ.choiceA, currentQ.choiceB, currentQ.choiceC, currentQ.choiceD].map((option, idx) => {
                  const letter = optionLabels[idx];
                  const isCorrectOption = letter === correctLetter;
                  const isUserChoice = letter === selectedLetter;
                  const showCheck = isCorrectOption;
                  const showX = !isCorrectAnswer && isUserChoice && !isCorrectOption;
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 font-inter text-[16px] text-[#45464E]"
                    >
                      <span
                        className={`mt-1 w-5 h-5 flex items-center justify-center shrink-0 rounded-full bg-white ${showCheck
                          ? 'border-[6px] border-[#06A561]'
                          : showX
                            ? 'border-[6px] border-[#F0142F]'
                            : 'border border-[#B0B0B0]'
                          }`}
                        aria-hidden="true"
                      />
                      <span>{option}</span>
                    </div>
                  );
                })}
              </div>

              {/* Correct Answer / Feedback box – same content for correct/wrong, only background differs */}
              <div
                className={`rounded-[8px] py-3 px-[15px] mb-4 ${isCorrectAnswer ? 'bg-[#DAF9EC80]' : 'bg-[#FDE7EA]'}`}
              >
                <p className="font-inter text-[14px] text-[#45464E] whitespace-pre-line">
                  <strong>Correct answer:{" "}{correctLetter}</strong>
                  {explanationCorrect ? ` – ${explanationCorrect}` : ''}
                  {explanationWrong ? `\n\n${explanationWrong}` : ''}
                </p>
              </div>

              {/* Reviewly Tip */}
              {tip && (
                <div className="rounded-[8px] py-3 px-[15px] mb-8 bg-[#FFC92A1A]">
                  <p className="font-inter text-[14px] text-[#53545C]">
                    💡 <span className="font-bold">Reviewly Tip:</span> {tip}
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-between pt-4 border-t border-[#F2F4F7]">
              <button
                type="button"
                onClick={() => navigate(`/dashboard/exam/${reviewer._id}${fromLibrary ? '?from=library' : ''}`)}
                className="font-inter font-normal not-italic text-[16px] text-[#6C737F] py-2.5 px-6 rounded-[8px] border border-[#6C737F] bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Close
              </button>

              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="font-inter font-semibold text-[16px] text-[#6C737F] py-2.5 px-4 rounded-[8px] border border-[#6C737F] bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={currentIndex === totalQuestions - 1}
                  className="font-inter font-semibold text-[14px] text-[#421A83] py-2.5 px-6 rounded-[8px] bg-[#FFC92A] hover:opacity-95 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* Right: Overall Performance + answer grid (same layout as Exam.js right sidebar) */}
          <div className="order-2 lg:flex-shrink-0 lg:max-w-[404px] lg:self-stretch w-full lg:w-auto">
            <div className="bg-[#FFFFFF] rounded-[12px] p-[24px] lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
              <h2 className="font-inter font-bold text-[14px] text-[#45464E] uppercase tracking-wide mb-[15px]">
                Overall Performance
              </h2>
              <p className="font-inter font-normal text-[16px] text-[#45464E] mb-0">
                Your Score: {totalCorrect} / {totalItems}
              </p>
              <p className="font-inter font-normal text-[16px] text-[#45464E] mb-[15px]">
                Percentage: {percentage}%
              </p>
              <p className="font-inter text-[16px] text-[#45464E] mb-0">
                <span className="font-semibold">Status: </span>
                <span className={`font-bold ${passed ? 'text-[#06A561]' : 'text-[#F0142F]'}`}>
                  {passed ? 'PASSED! 🎉' : 'FAILED'}
                </span>
              </p>
              <p className="font-inter font-normal text-[12px] text-[#45464E] mb-[15px]">
                {passingScore > 0
                  ? `You need at least ${passingScore}/${totalItems} correct answers to pass.`
                  : ''}
              </p>
              <div className="flex items-center gap-4 mb-[15px]">
                <div className="flex items-center gap-2">
                  <span className="w-[32px] h-[32px] rounded-[4px] bg-[#DAF9EC]" aria-hidden />
                  <span className="font-inter font-normal text-[14px] text-[#53545C]">Correct Answer</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[32px] h-[32px] rounded-[4px] bg-[#FDE7EA]" aria-hidden />
                  <span className="font-inter font-normal text-[14px] text-[#53545C]">Incorrect Answer</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-[4px] lg:grid lg:grid-cols-10 lg:gap-x-[4px] lg:gap-y-[4px]">
                {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((num) => {
                  const isCorrect = correctSet.has(num);
                  const isCurrent = num === questionNumber;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => goToQuestion(num)}
                      className={`shrink-0 w-8 h-8 lg:min-w-0 lg:w-full lg:aspect-square lg:max-w-8 font-inter text-[14px] font-medium rounded-[4px] transition-colors flex items-center justify-center ${isCorrect ? 'bg-[#DAF9EC]' : 'bg-[#FDE7EA]'
                        } ${isCurrent ? 'text-[#53545C]' : 'text-[#AEAEAE]'}`}
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
