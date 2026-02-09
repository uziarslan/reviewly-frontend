import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashNav from '../components/DashNav';
import { getReviewerById } from '../data/reviewers';

/** Mock: same question/options/explanation for all – replace with API per-question data later. */
const MOCK_QUESTION = {
  text: 'Which sentence is grammatically correct?',
  options: [
    'Each of the employees are required to attend the meeting.',
    'Each of the employees is required to attend the meeting.',
    'Each employees is required to attend the meeting.',
    'Each employee are required to attend the meeting.',
  ],
  correctIndex: 1,
  explanation:
    "Correct Answer: B — 'Each' is singular, so it takes the singular verb 'is.'\n\nWhy A is incorrect: Uses plural verb 'are' with singular subject 'each.'\nWhy C is incorrect: 'Each' must be followed by a singular noun, not 'employees.'\nWhy D is incorrect: 'Employee' is singular but verb 'are' is plural.",
  tip: "Words like 'each,' 'everyone,' and 'anyone' ALWAYS take singular verbs. Instant grammar win!",
};

/** Mock result: 121 correct, 49 incorrect (match ExamResultsLoading failed scenario). */
const MOCK_CORRECT_COUNT = 121;
const MOCK_TOTAL = 170;
const MOCK_PASSED = MOCK_CORRECT_COUNT >= 136;
const MOCK_PERCENTAGE = ((MOCK_CORRECT_COUNT / MOCK_TOTAL) * 100).toFixed(2);
const MOCK_PASSING_SCORE = 136;

/** Build per-question review data: first MOCK_CORRECT_COUNT correct, rest incorrect. */
function buildReviewAnswers() {
  const list = [];
  for (let i = 0; i < MOCK_TOTAL; i++) {
    const correctIndex = MOCK_QUESTION.correctIndex;
    const isCorrect = i < MOCK_CORRECT_COUNT;
    const userAnswerIndex = isCorrect ? correctIndex : (correctIndex + 1) % 4;
    list.push({ correctIndex, userAnswerIndex, isCorrect });
  }
  return list;
}

const REVIEW_ANSWERS = buildReviewAnswers();

function ExamReview() {
  const { id } = useParams();
  const reviewer = id ? getReviewerById(id) : null;
  const exam = reviewer?.examDetails;
  const totalQuestions = exam?.itemsCount ?? MOCK_TOTAL;

  const [currentIndex, setCurrentIndex] = useState(0);
  const questionNumber = currentIndex + 1;
  const currentAnswer = REVIEW_ANSWERS[currentIndex] ?? {
    correctIndex: 0,
    userAnswerIndex: 0,
    isCorrect: true,
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((i) => i - 1);
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) setCurrentIndex((i) => i + 1);
  };

  const goToQuestion = (num) => {
    setCurrentIndex(Math.max(0, Math.min(num - 1, totalQuestions - 1)));
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

  const correctSet = new Set(
    REVIEW_ANSWERS.map((a, i) => (a.isCorrect ? i + 1 : null)).filter(Boolean)
  );

  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      <DashNav />
      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 pt-[24px] pb-[40px]">
        {/* Breadcrumbs */}
        <nav className="mb-[24px]" aria-label="Breadcrumb">
          <Link
            to="/dashboard/all-reviewers"
            className="text-[#45464E] font-inter font-normal text-[14px] hover:text-[#6E43B9] transition-colors"
          >
            All Reviewers
          </Link>
          <span className="mx-2">›</span>
          <span className="text-[#6E43B9] font-inter font-normal text-[14px]">{reviewer.title}</span>
        </nav>

        <h1 className="font-inter font-medium text-[#45464E] text-[20px] mb-[24px]">{reviewer.title}</h1>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-[24px] items-start">
          {/* Left: Question card (same structure as Exam.js) */}
          <div className="order-1 w-full lg:w-auto lg:flex-1 lg:min-w-0 bg-[#FFFFFF] p-[24px] rounded-[12px]">
            <div key={currentIndex} className="animate-question-change">
              <p className="font-inter font-medium text-[#0F172A] text-base mb-6">
                {questionNumber}. {MOCK_QUESTION.text}
              </p>
              <div className="space-y-4 mb-6">
                {MOCK_QUESTION.options.map((option, idx) => {
                  const isCorrectOption = idx === currentAnswer.correctIndex;
                  const isUserChoice = idx === currentAnswer.userAnswerIndex;
                  const showCheck = isCorrectOption;
                  const showX = !currentAnswer.isCorrect && isUserChoice && !isCorrectOption;
                  return (
                    <div
                      key={idx}
                      className="flex items-start gap-3 font-inter text-[16px] text-[#45464E]"
                    >
                      <span
                        className={`mt-1 w-5 h-5 flex items-center justify-center shrink-0 rounded-full border bg-white border-[#B0B0B0]${
                          showCheck
                            ? ' border-[6px] border-[#06A561]'
                            : showX
                              ? ' border-[6px] border-[#F0142F]'
                              : ''
                        }`}
                        aria-hidden="true"
                      />
                      <span>{option}</span>
                    </div>
                  );
                })}
              </div>

              {/* Correct Answer / Feedback box – green if correct, pink if incorrect */}
              <div
                className={`rounded-[8px] py-3 px-[15px] mb-4 ${currentAnswer.isCorrect ? 'bg-[#DAF9EC80]' : 'bg-[#FDE7EA]'
                  }`}
              >
                <p className="font-inter text-[14px] text-[#45464E] whitespace-pre-line">
                  {MOCK_QUESTION.explanation.includes(' — ') ? (
                    <>
                      <span className="font-bold text-[#53545C]">
                        {MOCK_QUESTION.explanation.split(' — ', 1)[0]}
                      </span>
                      <span className="font-normal">
                        {' — ' + MOCK_QUESTION.explanation.split(' — ').slice(1).join(' — ')}
                      </span>
                    </>
                  ) : (
                    MOCK_QUESTION.explanation
                  )}
                </p>
              </div>

              {/* Reviewly Tip */}
              <div className="rounded-[8px] py-3 px-[15px] mb-8 bg-[#FFC92A1A]">
                <p className="font-inter text-[14px] text-[#53545C]">
                  💡 <span className="font-bold">Reviewly Tip:</span> {MOCK_QUESTION.tip}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-4 border-t border-[#F2F4F7]">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="font-inter font-semibold text-[14px] text-[#45464E] py-2.5 px-4 rounded-[8px] border border-[#CFD3D4] bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ‹ Previous
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

          {/* Right: Overall Performance + answer grid (same layout as Exam.js right sidebar) */}
          <div className="order-2 lg:flex-shrink-0 lg:max-w-[404px] lg:self-stretch w-full lg:w-auto">
            <div className="bg-[#FFFFFF] rounded-[12px] p-[24px] lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
              <h2 className="font-inter font-bold text-[14px] text-[#45464E] uppercase tracking-wide mb-[15px]">
                Overall Performance
              </h2>
              <p className="font-inter font-normal text-[16px] text-[#45464E] mb-0">
                Your Score: {MOCK_CORRECT_COUNT} / {MOCK_TOTAL}
              </p>
              <p className="font-inter font-normal text-[16px] text-[#45464E] mb-[15px]">
                Percentage: {MOCK_PERCENTAGE}%
              </p>
              <p className="font-inter text-[16px] text-[#45464E] mb-0">
                <span className="font-semibold">Status: </span>
                <span className={`font-bold ${MOCK_PASSED ? 'text-[#06A561]' : 'text-[#F0142F]'}`}>
                  {MOCK_PASSED ? 'PASSED! 🎉' : 'FAILED'}
                </span>
              </p>
              <p className="font-inter font-normal text-[12px] text-[#45464E] mb-[15px]">
                Remember: You need at least 80% or {MOCK_PASSING_SCORE}/{MOCK_TOTAL} correct answers to pass the CSE Professional Level.
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
                      className={`shrink-0 w-8 h-8 lg:min-w-0 lg:w-full lg:aspect-square lg:max-w-8 font-inter text-[14px] font-medium rounded-[4px] transition-colors flex items-center justify-center ${
                        isCorrect ? 'bg-[#DAF9EC]' : 'bg-[#FDE7EA]'
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
