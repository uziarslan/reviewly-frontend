import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AOS from 'aos';
import DashNav from '../components/DashNav';
import { getReviewerById, REVIEWER_LOGO_MAP } from '../data/reviewers';
import { BookmarkOutlineIcon, LockIcon } from '../components/Icons';

/** Set to true for PASSED layout, false for FAILED layout. */
const MOCK_PASSED = false;

/** Mock result data – replace with API later. */
const MOCK_RESULT = {
  takenAt: 'July 18, 2025 | 7:35 PM PST',
  duration: '3 hours 10 minutes',
  totalItems: 170,
  passed: MOCK_PASSED,
  // FAILED: 121 score, 71.18%; PASSED: 148 score, 87.06%
  correct: MOCK_PASSED ? 148 : 121,
  percentage: MOCK_PASSED ? 87.06 : 71.18,
  passingThreshold: 80,
  passingScore: 136,
  breakdown: MOCK_PASSED
    ? [
      { subject: 'General Information', items: 20, correct: 19, incorrect: 1, unanswered: 0, score: 90 },
      { subject: 'Numerical Ability', items: 35, correct: 30, incorrect: 5, unanswered: 0, score: 85.71 },
      { subject: 'Analytical Ability / Logic', items: 35, correct: 31, incorrect: 4, unanswered: 0, score: 88.57 },
      { subject: 'Verbal Ability', items: 40, correct: 36, incorrect: 4, unanswered: 0, score: 90 },
      { subject: 'Clerical Ability', items: 40, correct: 32, incorrect: 8, unanswered: 0, score: 80 },
    ]
    : [
      { subject: 'General Information', items: 20, correct: 18, incorrect: 2, unanswered: 0, score: 90 },
      { subject: 'Numerical Ability', items: 35, correct: 22, incorrect: 13, unanswered: 0, score: 62.86 },
      { subject: 'Analytical Ability / Logic', items: 35, correct: 28, incorrect: 7, unanswered: 0, score: 80 },
      { subject: 'Verbal Ability', items: 40, correct: 32, incorrect: 8, unanswered: 0, score: 80 },
      { subject: 'Clerical Ability', items: 40, correct: 21, incorrect: 19, unanswered: 0, score: 52.5 },
    ],
  strengths: MOCK_PASSED
    ? [
      'Philippine Constitution (General Information)',
      'Verbal Ability (Grammar & Vocabulary)',
      'Logical Reasoning & Pattern Analysis (Analytical Ability)',
    ]
    : ['Philippine Constitution', 'Grammar and Correct Usage', 'Filing & Alphabetizing'],
  improvements: MOCK_PASSED
    ? ['Clerical Ability (Data Checking)', 'Numerical Ability (Time, Distance, Work Problems)']
    : ['Word Problems', 'Number Series', 'Syllogisms', 'Reading Comprehension'],
};

/** Suggested practice exams (Numerical, Analytical, Verbal). */
const SUGGESTED_EXAM_IDS = [6, 4, 3];

const ExamResultsLoading = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const reviewer = id ? getReviewerById(id) : null;
  const exam = reviewer?.examDetails;
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    AOS.refresh();
  }, [id]);

  useEffect(() => {
    const t = setTimeout(() => setShowResults(true), 5000);
    return () => clearTimeout(t);
  }, []);

  if (!reviewer || !exam) {
    return (
      <div className="min-h-screen bg-[#F5F4FF]">
        <DashNav />
        <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 py-8">
          <p className="font-inter text-[#45464E]">Exam not found.</p>
          <Link
            to="/dashboard/all-reviewers"
            className="font-inter text-[#6E43B9] hover:underline mt-4 inline-block"
          >
            Back to All Reviewers
          </Link>
        </main>
      </div>
    );
  }

  const { title } = reviewer;
  const totalCorrect = MOCK_RESULT.breakdown.reduce((s, r) => s + r.correct, 0);
  const totalIncorrect = MOCK_RESULT.breakdown.reduce((s, r) => s + r.incorrect, 0);
  const totalUnanswered = MOCK_RESULT.breakdown.reduce((s, r) => s + r.unanswered, 0);
  const overallPercentage = MOCK_RESULT.totalItems
    ? ((totalCorrect / MOCK_RESULT.totalItems) * 100).toFixed(2)
    : '0.00';
  const suggestedReviewers = SUGGESTED_EXAM_IDS.map((rid) => getReviewerById(rid)).filter(Boolean);

  if (!showResults) {
    return (
      <div className="min-h-screen bg-[#F5F4FF]">
        <DashNav />
        <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 pt-[24px] pb-[40px]">
          <nav
            className="mb-[24px]"
            aria-label="Breadcrumb"
            data-aos="fade-up"
            data-aos-duration="400"
            data-aos-delay="0"
          >
            <Link
              to="/dashboard/all-reviewers"
              className="text-[#45464E] font-inter font-normal not-italic text-[14px] hover:text-[#6E43B9] transition-colors"
            >
              All Reviewers
            </Link>
            <span className="mx-2">›</span>
            <span className="text-[#6E43B9] font-inter font-normal not-italic text-[14px]">{title}</span>
          </nav>
          <h1
            className="font-inter font-medium text-[#45464E] text-[20px] mb-[24px]"
            data-aos="fade-up"
            data-aos-duration="400"
            data-aos-delay="25"
          >
            {title}
          </h1>
          <section
            className="bg-[#FFFFFF] rounded-[12px] px-[24px] py-[40px] sm:py-[56px] flex flex-col items-center justify-center"
            data-aos="fade-up"
            data-aos-duration="400"
            data-aos-delay="50"
          >
            <div className="mb-10 sm:mb-12">
              <div className="w-[80px] h-[80px] rounded-full border-[6px] border-[#FFE79A] border-t-transparent animate-spin" />
            </div>
            <div className="w-full max-w-[640px] text-left">
              <h2 className="font-inter font-medium text-[20px] sm:text-[22px] text-[#45464E] mb-[15px] text-center">
                Your AI Bestie is Now Analyzing Your Performance!
              </h2>
              <p className="font-inter font-normal text-[16px] text-[#45464E] max-w-[550px] mb-[15px]">
                Great job! Your answers are now with our smart AI. We&apos;re busy crunching the numbers to:
              </p>
              <ul className="font-inter font-normal text-[16px] text-[#45464E] space-y-3 max-w-[640px] mb-[15px]">
                <li>🕵🏼‍️ Accurately check your scores</li>
                <li>💪🏼 Pinpoint your strong subjects</li>
                <li>⚡️ Identify areas where you can still grow</li>
                <li>🏆 Prepare personalized recommendations for your next review steps!</li>
              </ul>
              <p className="font-inter font-normal text-[16px] text-[#45464E] max-w-[640px]">
                This might take just a few moments. Hang tight, future passer!
              </p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      <DashNav />
      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 pt-[24px] pb-[40px]">
        <nav className="mb-[24px]" aria-label="Breadcrumb">
          <Link
            to="/dashboard/all-reviewers"
            className="text-[#45464E] font-inter font-normal not-italic text-[14px] hover:text-[#6E43B9] transition-colors"
          >
            All Reviewers
          </Link>
          <span className="mx-2">›</span>
          <span className="text-[#6E43B9] font-inter font-normal not-italic text-[14px]">{title}</span>
        </nav>

        <h1 className="font-inter font-medium text-[#45464E] text-[20px] mb-[24px]">{title}</h1>

        {/* Result card */}
        <section className="bg-[#FFFFFF] rounded-[12px] px-[24px] py-[32px] sm:px-[32px] sm:py-[40px]">
          <h2 className="font-inter font-medium text-[20px] text-[#45464E] text-center mb-[24px]">
            Result: Civil Service Exam - Professional Level
          </h2>
          <p className="font-inter font-normal text-[16px] text-[#45464E] text-center mb-[4px]">
            Mock Exam Taken On: {MOCK_RESULT.takenAt}
          </p>
          <p className="font-inter font-normal text-[16px] text-[#45464E] text-center mb-[24px]">
            Exam Duration: {MOCK_RESULT.duration} (or [Your Actual Time Taken] if submitted early)
          </p>

          {/* OVERALL PERFORMANCE */}
          <h3 className="font-inter font-semibold text-[16px] text-[#45464E] text-center uppercase tracking-wide mb-[22px]">
            Overall Performance
          </h3>
          <div className="overflow-x-auto flex justify-center mb-2">
            <table className="w-full max-w-[560px] border-collapse border border-[#B0B0B0] font-inter text-[14px]">
              <thead>
                <tr className="bg-[#431C86] text-white">
                  <th className="text-left py-3 px-2 font-semibold border border-[#B0B0B0] w-[120px]">
                    Total Items
                  </th>
                  <th className="text-left py-3 px-2 font-semibold border border-[#B0B0B0] w-[120px]">
                    Your Score
                  </th>
                  <th className="text-left py-3 px-2 font-semibold border border-[#B0B0B0] w-[120px]">
                    Percentage
                  </th>
                  <th className="text-left py-3 px-2 font-semibold border border-[#B0B0B0] w-[120px]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-[#FAF9FF]">
                  <td className="py-3 px-2 text-[#45464E] border-t border-l border-[#B0B0B0]">
                    {MOCK_RESULT.totalItems}
                  </td>
                  <td className="py-3 px-2 text-[#45464E] border-t border-l border-[#B0B0B0]">
                    {MOCK_RESULT.correct}
                  </td>
                  <td className="py-3 px-2 text-[#45464E] border-t border-l border-[#B0B0B0]">
                    {MOCK_RESULT.percentage}%
                  </td>
                  <td
                    className={`py-3 px-2 border-t border-l border-[#B0B0B0] ${MOCK_RESULT.passed ? 'text-[#06A561]' : 'text-[#F0142F]'
                      } font-inter font-bold text-[16px]`}
                  >
                    {MOCK_RESULT.passed ? 'PASSED' : 'FAILED'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="font-inter font-normal text-[12px] text-[#45464E] text-center mb-[24px]">
            {MOCK_RESULT.passed
              ? `You surpassed the ${MOCK_RESULT.passingThreshold}% passing rate with ${MOCK_RESULT.correct}/${MOCK_RESULT.totalItems} correct answers! Excellent work! 🎉`
              : `Remember: You need at least ${MOCK_RESULT.passingThreshold}% or ${MOCK_RESULT.passingScore}/${MOCK_RESULT.totalItems} correct answers to pass the CSE Professional Level.`}
          </p>

          {/* DETAILED PERFORMANCE BREAKDOWN */}
          <h3 className="font-inter font-semibold text-[16px] text-[#45464E] text-center uppercase tracking-wide mb-[16px]">
            Detailed Performance Breakdown
          </h3>
          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse border border-[#B0B0B0] font-inter text-[14px]">
              <thead>
                <tr className="bg-[#431C86] text-white">
                  <th className="text-left py-3 px-3 font-semibold border border-[#B0B0B0]">Subject Area</th>
                  <th className="text-left py-3 px-3 font-semibold border border-[#B0B0B0]">Items</th>
                  <th className="text-left py-3 px-3 font-semibold border border-[#B0B0B0]">Correct</th>
                  <th className="text-left py-3 px-3 font-semibold border border-[#B0B0B0]">Incorrect</th>
                  <th className="text-left py-3 px-3 font-semibold border border-[#B0B0B0]">Unanswered</th>
                  <th className="text-left py-3 px-3 font-semibold border border-[#B0B0B0]">Your Score (%)</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_RESULT.breakdown.map((row, i) => (
                  <tr key={i} className="bg-[#FAF9FF]">
                    <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{row.subject}</td>
                    <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{row.items}</td>
                    <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{row.correct}</td>
                    <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{row.incorrect}</td>
                    <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{row.unanswered}</td>
                    <td className="py-3 px-3 font-medium text-[#45464E] border-t border-l border-[#B0B0B0]">{row.score}%</td>
                  </tr>
                ))}
                <tr className="font-inter font-bold text-[14px] bg-[#FAF9FF]">
                  <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">TOTAL</td>
                  <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{MOCK_RESULT.totalItems}</td>
                  <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{totalCorrect}</td>
                  <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{totalIncorrect}</td>
                  <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{totalUnanswered}</td>
                  <td
                    className={`py-3 px-3 font-bold border-t border-l border-[#B0B0B0] ${MOCK_RESULT.passed ? 'text-[#22C55E]' : 'text-[#DC2626]'}`}
                  >
                    {overallPercentage}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* AI ANALYSIS */}
          <h3 className="font-inter font-semibold text-[16px] text-[#45464E] text-center uppercase tracking-wide mb-0">
            AI Analysis: Your Strengths & Weaknesses
          </h3>
          <p className="font-inter font-regular text-[16px] text-[#45464E] text-center mb-6">
            (Based on your performance and our AI&apos;s insights)
          </p>
          <div className="flex flex-col gap-[24px] mb-[32px] max-w-[800px] mx-auto">
            <div>
              <h4 className="font-inter font-normal text-[16px] text-[#45464E] mb-3">
                {MOCK_RESULT.passed ? '🚀 Your Superpowers (Areas You Excelled In!)' : '💪 Your Strengths (Mastered Areas):'}
              </h4>
              <ul className="list-disc list-inside font-inter font-normal text-[16px] text-[#45464E] space-y-2 pl-4">
                {MOCK_RESULT.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-inter font-normal text-[16px] text-[#45464E] mb-3">
                {MOCK_RESULT.passed
                  ? '💪 Areas for Further Mastery (Keep Sharpening Your Edge!)'
                  : '⚠️ Areas for Improvement (Focus Next!):'}
              </h4>
              <ul className="list-disc list-inside font-inter font-normal text-[16px] text-[#45464E] space-y-2 pl-4">
                {MOCK_RESULT.improvements.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard/all-reviewers')}
              className="font-inter font-normal text-[14px] text-[#6E43B9] py-[11.5px] px-4 rounded-[8px] border-[1px] border-[#6E43B9] bg-white hover:bg-gray-50 transition-colors"
            >
              Go back to Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate(`/dashboard/exam/${id}/review`)}
              className="font-inter font-bold text-[14px] text-[#421A83] py-[11.5px] px-4 rounded-[8px] bg-[#FFC92A] hover:opacity-95 transition-opacity"
            >
              Review My Answers
            </button>
          </div>
        </section>

        {/* Suggested Practice Exams */}
        <h3 className="font-inter font-bold text-[14px] text-[#45464E] uppercase tracking-wide mt-10 mb-6 text-left">
          Suggested Practice Exams
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-[24px] justify-items-center">
          {suggestedReviewers.map((card, index) => {
            const logoSrc = card.logo && REVIEWER_LOGO_MAP[card.logo.filename] != null
              ? REVIEWER_LOGO_MAP[card.logo.filename]
              : (card.logo?.path ?? null);
            const details = card.details || {};
            return (
              <div
                key={card.id}
                className="w-full max-w-[410.67px] min-w-0 bg-white rounded-[12px] p-[24px] text-left shadow-[0px_2px_4px_0px_#00000026] flex flex-col"
                data-aos="fade-up"
                data-aos-duration="500"
                data-aos-delay={100 + index * 50}
              >
                <div className="flex items-start justify-between gap-2 mb-4">
                  {logoSrc ? (
                    <img src={logoSrc} alt="" className="w-[40px] h-[40px] shrink-0 object-cover" />
                  ) : (
                    <div className="w-[40px] h-[40px] rounded bg-[#6E43B9] flex items-center justify-center text-white font-inter font-bold text-xs shrink-0">
                      CSE
                    </div>
                  )}
                  <div className="relative group">
                    <button
                      type="button"
                      aria-label="Add to library"
                      className="p-[7px] rounded-[4px] w-[40px] h-[40px] bg-[#F4F4F4] transition-colors flex items-center justify-center hover:bg-[#E5E7EB]"
                    >
                      <BookmarkOutlineIcon className="w-[25px] h-[25px]" />
                    </button>
                    <span
                      role="tooltip"
                      className="absolute left-1/2 -translate-x-1/2 top-full mt-2 py-1 px-2 font-inter font-medium text-[10px] text-white bg-[#616161E5] rounded-[4px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10"
                    >
                      Add to library
                    </span>
                  </div>
                </div>
                <h2 className="font-inter text-[#45464E] font-semibold text-[16px] mb-3">
                  {card.title}
                </h2>
                <p className="font-inter text-[#64748B] text-[15px] leading-[20px] mb-4 font-normal flex-1">
                  <span className="font-semibold">{card.description?.short ?? ''}</span>
                  <br />
                  {card.description?.full ?? ''}
                </p>
                <div className="flex flex-wrap items-center gap-[5px] text-sm text-[#0F172A] mb-4">
                  <span className="inline-flex items-center gap-1.5 font-inter font-normal not-italic text-[14px] text-[#45464E]">
                    📝 {details.items ?? (card.examDetails?.itemsCount ? `${card.examDetails.itemsCount} items` : '—')}
                  </span>
                  <span className="text-[#45464E] font-inter font-normal not-italic text-[14px]">•</span>
                  <span className="inline-flex items-center gap-1.5 font-inter font-normal not-italic text-[14px] text-[#45464E]">
                    ⏱️ {details.duration ?? '—'}
                  </span>
                  {details.passingRate != null && (
                    <>
                      <span className="text-[#45464E] font-inter font-normal not-italic text-[14px]">•</span>
                      <span className="inline-flex items-center gap-1.5 font-inter font-normal not-italic text-[14px] text-[#45464E]">
                        🎯 Passing rate: {details.passingRate}
                      </span>
                    </>
                  )}
                  {details.accessLevel != null && (
                    <>
                      <span className="text-[#45464E] font-inter font-normal not-italic text-[14px]">•</span>
                      <span className="inline-flex items-center gap-1.5 font-inter font-normal not-italic text-[14px] text-[#45464E]">
                        📘 {details.accessLevel}
                      </span>
                    </>
                  )}
                </div>
                {card.access === 'premium' ? (
                  <button
                    type="button"
                    className="w-[205px] font-inter font-semibold text-[#421A83] text-[14px] sm:text-[16px] py-3 rounded-[8px] bg-[#FFC92A] hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
                  >
                    <LockIcon className="w-[18px] h-[21px] shrink-0" />
                    Upgrade to Premium
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/exam/${card.id}`)}
                    className="max-w-[106px] font-inter font-semibold text-[#421A83] text-[14px] sm:text-[16px] py-3 rounded-[8px] bg-[#FFC92A] hover:opacity-95 transition-opacity"
                  >
                    Take Exam
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ExamResultsLoading;
