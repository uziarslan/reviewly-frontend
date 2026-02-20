import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import AOS from 'aos';
import DashNav from '../components/DashNav';
import { REVIEWER_LOGO_MAP } from '../data/reviewers';
import { LockIcon } from '../components/Icons';
import { examAPI, reviewerAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ExamResultsLoadingSkeleton from '../components/skeletons/ExamResultsLoadingSkeleton';
import { canAccessReviewer } from '../utils/subscription';

const ExamResultsLoading = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromLibrary = new URLSearchParams(location.search).get('from') === 'library';
  const { isAuthenticated, user } = useAuth();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [suggestedReviewers, setSuggestedReviewers] = useState([]);
  const [mockReviewer, setMockReviewer] = useState(null);

  useEffect(() => {
    AOS.refresh();
  }, [attempt]);

  // Fetch attempt result
  useEffect(() => {
    if (!attemptId) { setLoading(false); return; }
    let cancelled = false;
    async function fetchResult() {
      try {
        const res = await examAPI.getResult(attemptId);
        if (cancelled) return;
        if (res.success) {
          setAttempt(res.data);
          // Fetch suggested practice reviewers
          try {
            const revRes = await reviewerAPI.getAll();
            if (!cancelled && revRes.success) {
              // Suggest up to 3 practice-type reviewers (excluding current)
              const suggestions = revRes.data
                .filter((r) => r.type === 'practice' && r._id !== res.data.reviewer?._id)
                .slice(0, 3);
              setSuggestedReviewers(suggestions);
              // Store first mock reviewer for practice exam "Full Mock Exam" CTA
              const mock = revRes.data.find((r) => r.type === 'mock');
              if (mock) setMockReviewer(mock);
            }
          } catch (_) { }
        }
      } catch (err) {
        console.error('Failed to load results:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchResult();
    return () => { cancelled = true; };
  }, [attemptId]);

  const checkAccess = (reviewer) => canAccessReviewer(reviewer, { isAuthenticated, user });

  // Show loading animation for 5 seconds then display results
  useEffect(() => {
    if (loading) return;
    const t = setTimeout(() => setShowResults(true), 5000);
    return () => clearTimeout(t);
  }, [loading]);

  if (loading) return <ExamResultsLoadingSkeleton />;

  if (!attempt) {
    return (
      <div className="min-h-screen bg-[#F5F4FF]">
        <DashNav />
        <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 py-8">
          <p className="font-inter text-[#45464E]">Results not found.</p>
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

  const title = attempt.reviewer?.title || 'Exam';
  const reviewerType = attempt.reviewer?.type || 'mock'; // mock | practice | demo
  const result = attempt.result || {};
  const breakdown = result.sectionScores || [];
  const totalCorrect = result.correct || 0;
  const totalIncorrect = result.incorrect || 0;
  const totalUnanswered = result.unanswered || 0;
  const overallPercentage = result.percentage != null ? result.percentage.toFixed(2) : '0.00';
  const passingThreshold = attempt.reviewer?.examConfig?.passingThreshold || 80;
  const passingScore = result.passingScore || Math.ceil((passingThreshold / 100) * (result.totalItems || 0));
  const passed = result.passed;
  const quickSummary = result.quickSummary || null;
  const sectionAnalysis = result.sectionAnalysis || [];

  // ── Compute section ranking for AI Analysis ──
  const sortedSections = [...breakdown].sort((a, b) => b.score - a.score);
  const strongAreas = sortedSections.slice(0, 2);
  const refineAreas = sortedSections.slice(2);
  const lowestSection = sortedSections[sortedSections.length - 1];
  const gapToPass = passed ? 0 : Math.max(0, passingScore - totalCorrect);

  // Helper: get AI description for a section
  const getAILines = (sectionName) => {
    const match = sectionAnalysis.find(
      (sa) => sa.section?.toLowerCase() === sectionName?.toLowerCase()
    );
    return match?.lines || [];
  };

  // ── Recommended next step logic ──
  // Match suggested reviewers to weak sections
  const matchReviewerToSection = (sectionName) => {
    if (!sectionName) return null;
    const lower = sectionName.toLowerCase();
    return suggestedReviewers.find((r) => {
      const rTitle = (r.title || '').toLowerCase();
      return rTitle.includes(lower) || lower.includes(rTitle.split(' ')[0]);
    });
  };

  // Build recommended items from refine areas (score < 75%)
  const recommendations = refineAreas
    .filter((s) => s.score < 75)
    .map((s) => {
      const matched = matchReviewerToSection(s.section);
      const isHighest = lowestSection && s.section === lowestSection.section;
      return {
        section: s.section,
        score: s.score,
        isHighestImpact: isHighest,
        reviewer: matched,
        priority: s.score < 60 ? 'high' : s.score < 75 ? 'medium' : 'low',
        description: isHighest
          ? `Strengthen ${s.section.toLowerCase()} reasoning and problem-solving skills.`
          : `Improve ${s.section.toLowerCase()} skills and logical consistency.`,
      };
    });

  // Format date
  const takenAt = attempt.submittedAt
    ? new Date(attempt.submittedAt).toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    })
    : '—';

  // Calculate duration
  const durationMs = attempt.submittedAt && attempt.startedAt
    ? new Date(attempt.submittedAt) - new Date(attempt.startedAt)
    : 0;
  const durationMin = Math.floor(durationMs / 60000);
  const durationH = Math.floor(durationMin / 60);
  const durationM = durationMin % 60;
  const duration = durationH > 0
    ? `${durationH} hour${durationH !== 1 ? 's' : ''} ${durationM} minute${durationM !== 1 ? 's' : ''}`
    : `${durationM} minute${durationM !== 1 ? 's' : ''}`;

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
              to={fromLibrary ? '/dashboard/library' : '/dashboard/all-reviewers'}
              className="text-[#45464E] font-inter font-normal not-italic text-[14px] hover:text-[#6E43B9] transition-colors"
            >
              {fromLibrary ? 'My Library' : 'All Reviewers'}
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

  // ── Practice exam specific values ──
  const performanceLevel = result.performanceLevel
    || (parseFloat(overallPercentage) >= 85 ? 'Strong' : parseFloat(overallPercentage) >= 70 ? 'Developing' : 'Needs Improvement');
  const timeInsight = result.timeInsight || null;
  const durationSec = Math.round(durationMs / 1000);
  const avgTimePerQ = result.totalItems > 0 ? Math.round(durationSec / result.totalItems) : 0;
  // Pacing note fallback
  const pacingNote = timeInsight
    || (totalUnanswered === 0
      ? 'Good pacing — you answered all questions within the time limit.'
      : totalUnanswered <= 2
        ? `${totalUnanswered} unanswered item${totalUnanswered > 1 ? 's' : ''} suggest slight pacing adjustments may help.`
        : `${totalUnanswered} unanswered items suggest pacing adjustments may help.`);

  // Practice exam fallback summary (data-driven, used only when AI quickSummary is null)
  const sectionLabel = breakdown.length === 1 ? breakdown[0].section : title;
  const practiceFallbackSummary = performanceLevel === 'Strong'
    ? `You demonstrate a strong understanding of core ${sectionLabel.toLowerCase()} concepts. Accuracy is high across question types. Consider trying the full mock exam to test your overall readiness.`
    : performanceLevel === 'Developing'
      ? `You demonstrate a developing understanding of core ${sectionLabel.toLowerCase()} concepts. Accuracy decreases in multi-step and application-based questions. Improving structured problem-solving and pacing will increase consistency.`
      : `You demonstrate a developing understanding of core ${sectionLabel.toLowerCase()} concepts. Accuracy decreases in multi-step and application-based questions. Improving structured problem-solving and pacing will increase consistency.`;

  // ── PRACTICE EXAM RESULT PAGE ──
  if (reviewerType === 'practice') {
    return (
      <div className="min-h-screen bg-[#F5F4FF]">
        <DashNav />
        <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 pt-[24px] pb-[40px]">
          <nav className="mb-[24px]" aria-label="Breadcrumb">
            <Link
              to={fromLibrary ? '/dashboard/library' : '/dashboard/all-reviewers'}
              className="text-[#45464E] font-inter font-normal not-italic text-[14px] hover:text-[#6E43B9] transition-colors"
            >
              {fromLibrary ? 'My Library' : 'All Reviewers'}
            </Link>
            <span className="mx-2">›</span>
            <span className="text-[#6E43B9] font-inter font-normal not-italic text-[14px]">{title}</span>
          </nav>

          <h1 className="font-inter font-medium text-[#45464E] text-[20px] mb-[24px]">{title}</h1>

          <section className="bg-[#FFFFFF] rounded-[12px] px-[24px] py-[32px] sm:px-[32px] sm:py-[40px]">
            {/* Title */}
            <h2 className="font-inter font-medium text-[20px] text-[#45464E] text-center mb-[24px]">
              {title}
            </h2>
            <p className="font-inter font-normal text-[16px] text-[#45464E] text-center mb-[24px]">
              Exam Taken On: {takenAt}
            </p>

            {/* OVERALL PERFORMANCE */}
            <h3 className="font-inter font-semibold text-[16px] text-[#45464E] text-center uppercase tracking-wide mb-[22px]">
              Overall Performance
            </h3>
            <div className="overflow-x-auto flex justify-center mb-[32px]">
              <table className="w-full max-w-[720px] border-collapse border border-[#B0B0B0] font-inter text-[14px]">
                <thead>
                  <tr className="bg-[#431C86] text-white">
                    <th className="text-left py-3 px-3 font-semibold border border-[#B0B0B0]">Total Items</th>
                    <th className="text-left py-3 px-3 font-semibold border border-[#B0B0B0]">Correct</th>
                    <th className="text-left py-3 px-3 font-semibold border border-[#B0B0B0]">Incorrect</th>
                    <th className="text-left py-3 px-3 font-semibold border border-[#B0B0B0]">Unanswered</th>
                    <th className="text-left py-3 px-3 font-semibold border border-[#B0B0B0]">Percentage</th>
                    <th className="text-left py-3 px-3 font-semibold border border-[#B0B0B0]">Performance Level</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-[#FAF9FF]">
                    <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{result.totalItems}</td>
                    <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{totalCorrect}</td>
                    <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{totalIncorrect}</td>
                    <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{totalUnanswered}</td>
                    <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{overallPercentage}%</td>
                    <td className="py-3 px-3 border-t border-l border-[#B0B0B0] font-inter font-semibold text-[14px] text-[#45464E]">
                      {performanceLevel}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── TIME INSIGHT ── */}
            <div className="border-t border-[#E5E7EB] pt-[28px] mb-[28px] max-w-[800px] mx-auto">
              <h3 className="font-inter font-semibold text-[18px] text-[#45464E] mb-[12px] flex items-center gap-2">
                <span>⏱️</span> Time Insight
              </h3>
              <p className="font-inter font-normal text-[15px] text-[#45464E] leading-[24px] mb-[4px]">
                Time Spent: <span className="font-medium">{duration}</span>
              </p>
              <p className="font-inter font-normal text-[15px] text-[#45464E] leading-[24px] mb-[4px]">
                Average Time per Question: <span className="font-medium">{avgTimePerQ} seconds</span>
              </p>
              <p className="font-inter font-normal text-[15px] text-[#45464E] leading-[24px]">
                {pacingNote}
              </p>
            </div>

            {/* ── QUICK SUMMARY ── */}
            <div className="border-t border-[#E5E7EB] pt-[28px] mb-[32px] max-w-[800px] mx-auto">
              <h3 className="font-inter font-semibold text-[18px] text-[#45464E] mb-[12px] flex items-center gap-2">
                <span>📊</span> Quick Summary
              </h3>
              {(quickSummary || practiceFallbackSummary).split(/(?<=[.!?])\s+/).filter(Boolean).map((sentence, i) => (
                <p key={i} className="font-inter font-normal text-[15px] text-[#45464E] leading-[24px] mb-[4px]">
                  {sentence}
                </p>
              ))}
            </div>

            {/* ── RECOMMENDED NEXT STEP ── */}
            <div className="border-t border-[#E5E7EB] pt-[28px] max-w-[800px] mx-auto">
              <h3 className="font-inter font-semibold text-[18px] text-[#45464E] mb-[16px] flex items-center gap-2">
                <span>📌</span> Recommended Next Step
              </h3>
              <div className="flex flex-wrap gap-3">
                {/* Review My Answers — always primary */}
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/review/${attemptId}${fromLibrary ? '?from=library' : ''}`)}
                  className="font-inter font-bold text-[14px] text-[#421A83] py-[11.5px] px-5 rounded-[8px] bg-[#FFC92A] hover:opacity-95 transition-opacity"
                >
                  Review My Answers
                </button>

                {/* Retake Practice — primary for Developing/Needs Improvement */}
                <button
                  type="button"
                  onClick={() => navigate(`/dashboard/exam/${attempt.reviewer?._id}`)}
                  className={`font-inter font-bold text-[14px] py-[11.5px] px-5 rounded-[8px] transition-opacity ${
                    performanceLevel !== 'Strong'
                      ? 'text-[#421A83] bg-[#FFC92A] hover:opacity-95'
                      : 'text-[#6E43B9] border border-[#6E43B9] bg-white hover:bg-gray-50'
                  }`}
                >
                  Retake {breakdown.length === 1 ? breakdown[0].section : ''} Practice
                </button>

                {/* Full Mock Exam — primary for Strong, outlined for others */}
                {mockReviewer && (
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/exam/${mockReviewer._id}`)}
                    className={`font-inter font-normal text-[14px] py-[11.5px] px-5 rounded-[8px] transition-colors ${
                      performanceLevel === 'Strong'
                        ? 'text-[#421A83] font-bold bg-[#FFC92A] hover:opacity-95'
                        : 'text-[#6E43B9] border border-[#6E43B9] bg-white hover:bg-gray-50'
                    }`}
                  >
                    Full Mock Exam
                  </button>
                )}

                {/* Go Back to Dashboard */}
                <button
                  type="button"
                  onClick={() => navigate(fromLibrary ? '/dashboard/library' : '/dashboard/all-reviewers')}
                  className="font-inter font-normal text-[14px] text-[#6E43B9] py-[11.5px] px-5 rounded-[8px] border border-[#6E43B9] bg-white hover:bg-gray-50 transition-colors"
                >
                  Go Back to Dashboard
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // ── MOCK / DEMO EXAM RESULT PAGE ──
  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      <DashNav />
      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 pt-[24px] pb-[40px]">
        <nav className="mb-[24px]" aria-label="Breadcrumb">
          <Link
            to={fromLibrary ? '/dashboard/library' : '/dashboard/all-reviewers'}
            className="text-[#45464E] font-inter font-normal not-italic text-[14px] hover:text-[#6E43B9] transition-colors"
          >
            {fromLibrary ? 'My Library' : 'All Reviewers'}
          </Link>
          <span className="mx-2">›</span>
          <span className="text-[#6E43B9] font-inter font-normal not-italic text-[14px]">{title}</span>
        </nav>

        <h1 className="font-inter font-medium text-[#45464E] text-[20px] mb-[24px]">{title}</h1>

        {/* Result card */}
        <section className="bg-[#FFFFFF] rounded-[12px] px-[24px] py-[32px] sm:px-[32px] sm:py-[40px]">
          <h2 className="font-inter font-medium text-[20px] text-[#45464E] text-center mb-[24px]">
            {title}
          </h2>
          <p className="font-inter font-normal text-[16px] text-[#45464E] text-center mb-[4px]">
            Mock Exam Taken On: {takenAt}
          </p>
          <p className="font-inter font-normal text-[16px] text-[#45464E] text-center mb-[24px]">
            Exam Duration: <span className="font-bold">{duration}</span>
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
                    {result.totalItems}
                  </td>
                  <td className="py-3 px-2 text-[#45464E] border-t border-l border-[#B0B0B0]">
                    {totalCorrect}
                  </td>
                  <td className="py-3 px-2 text-[#45464E] border-t border-l border-[#B0B0B0]">
                    {overallPercentage}%
                  </td>
                  <td
                    className={`py-3 px-2 border-t border-l border-[#B0B0B0] ${passed ? 'text-[#06A561]' : 'text-[#F0142F]'
                      } font-inter font-bold text-[16px]`}
                  >
                    {passed ? 'PASSED' : 'FAILED'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="font-inter font-normal text-[12px] text-[#45464E] text-center mb-[24px]">
            {passed
              ? `You surpassed the ${passingThreshold}% passing rate with ${totalCorrect}/${result.totalItems} correct answers! Excellent work! 🎉`
              : `Remember: You need at least ${passingThreshold}% or ${passingScore}/${result.totalItems} correct answers to pass.`}
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
                {breakdown.map((row, i) => (
                  <tr key={i} className="bg-[#FAF9FF]">
                    <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{row.section}</td>
                    <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{row.totalItems}</td>
                    <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{row.correct}</td>
                    <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{row.incorrect}</td>
                    <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{row.unanswered}</td>
                    <td className="py-3 px-3 font-medium text-[#45464E] border-t border-l border-[#B0B0B0]">{row.score}%</td>
                  </tr>
                ))}
                <tr className="font-inter font-bold text-[14px] bg-[#FAF9FF]">
                  <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">TOTAL</td>
                  <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{result.totalItems}</td>
                  <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{totalCorrect}</td>
                  <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{totalIncorrect}</td>
                  <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{totalUnanswered}</td>
                  <td
                    className={`py-3 px-3 font-bold border-t border-l border-[#B0B0B0] ${passed ? 'text-[#22C55E]' : 'text-[#DC2626]'}`}
                  >
                    {overallPercentage}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* ── QUICK SUMMARY ── */}
          <div className="border-t border-[#E5E7EB] pt-[32px] mt-[8px] mb-[32px] max-w-[800px] mx-auto">
            <h3 className="font-inter font-semibold text-[18px] text-[#45464E] mb-[16px] flex items-center gap-2">
              <span>📊</span> Quick Summary
            </h3>
            {quickSummary ? (
              <p className="font-inter font-normal text-[15px] text-[#45464E] leading-[24px] mb-[12px]">
                {quickSummary}
              </p>
            ) : (
              <>
                {strongAreas.length >= 2 && (
                  <p className="font-inter font-normal text-[15px] text-[#45464E] leading-[24px] mb-[4px]">
                    You performed strongly in{' '}
                    <span className="font-bold">{strongAreas[0].section}</span>
                    {strongAreas.length > 1 && (
                      <>
                        {' '}and <span className="font-bold">{strongAreas[1].section}</span>
                      </>
                    )}
                    .
                  </p>
                )}
                {lowestSection && (
                  <p className="font-inter font-normal text-[15px] text-[#45464E] leading-[24px] mb-[4px]">
                    Your overall score was mainly affected by{' '}
                    <span className="font-bold">{lowestSection.section}</span>.
                  </p>
                )}
              </>
            )}
            {!passed && gapToPass > 0 && (
              <>
                <p className="font-inter font-normal text-[15px] text-[#45464E] leading-[24px] mb-[4px]">
                  You are <span className="font-bold">{gapToPass} correct answer{gapToPass !== 1 ? 's' : ''}</span> away from the passing mark.
                </p>
                <p className="font-inter font-normal text-[15px] text-[#45464E] leading-[24px]">
                  Focused improvement in one section can realistically close this gap.
                </p>
              </>
            )}
            {passed && (
              <p className="font-inter font-normal text-[15px] text-[#45464E] leading-[24px]">
                Outstanding work! You exceeded the {passingThreshold}% passing threshold. Keep refining your weaker areas to maintain consistency.
              </p>
            )}
          </div>

          {/* ── STRONG AREAS ── */}
          {strongAreas.length > 0 && (
            <div className="mb-[28px] max-w-[800px] mx-auto">
              <h3 className="font-inter font-semibold text-[18px] text-[#45464E] mb-[16px] flex items-center gap-2">
                <span>💪</span> Strong Areas
              </h3>
              <ul className="list-disc list-outside pl-6 space-y-[16px]">
                {strongAreas.map((s, i) => {
                  const aiLines = getAILines(s.section);
                  return (
                    <li key={i} className="font-inter text-[15px] text-[#45464E]">
                      <span className="font-bold">{s.section} ({s.score}%)</span>
                      {aiLines.length > 0 ? (
                        aiLines.map((line, li) => (
                          <p key={li} className="font-normal text-[15px] text-[#45464E] leading-[24px] mt-[2px]">
                            {line}
                          </p>
                        ))
                      ) : (
                        <p className="font-normal text-[15px] text-[#45464E] leading-[24px] mt-[2px]">
                          {s.score >= 85
                            ? "Excellent proficiency. You're exam-ready in this section."
                            : 'Good performance. Minor refinements can push this to mastery level.'}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* ── REFINE FURTHER ── */}
          {refineAreas.length > 0 && (
            <div className="mb-[32px] max-w-[800px] mx-auto">
              <h3 className="font-inter font-semibold text-[18px] text-[#45464E] mb-[16px] flex items-center gap-2">
                <span>🔧</span> Refine Further
              </h3>
              <ul className="list-disc list-outside pl-6 space-y-[16px]">
                {refineAreas.map((s, i) => {
                  const aiLines = getAILines(s.section);
                  const isLowest = lowestSection && s.section === lowestSection.section;
                  return (
                    <li key={i} className="font-inter text-[15px] text-[#45464E]">
                      <span className="font-bold">
                        {s.section} ({s.score}%)
                        {isLowest && (
                          <span className="text-[#45464E] font-bold"> — Highest Impact Area</span>
                        )}
                      </span>
                      {aiLines.length > 0 ? (
                        aiLines.map((line, li) => (
                          <p key={li} className="font-normal text-[15px] text-[#45464E] leading-[24px] mt-[2px]">
                            {line}
                          </p>
                        ))
                      ) : (
                        <p className="font-normal text-[15px] text-[#45464E] leading-[24px] mt-[2px]">
                          {isLowest
                            ? `This section had the biggest impact on your overall score. Improving this section alone could move you closer to the ${passingThreshold}% passing mark.`
                            : 'You understand basic patterns, but this area needs focused practice and refinement.'}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap justify-center gap-4 mb-[8px]">
            <button
              type="button"
              onClick={() => navigate(fromLibrary ? '/dashboard/library' : '/dashboard/all-reviewers')}
              className="font-inter font-normal text-[14px] text-[#6E43B9] py-[11.5px] px-4 rounded-[8px] border-[1px] border-[#6E43B9] bg-white hover:bg-gray-50 transition-colors"
            >
              Go back to Dashboard
            </button>
            <button
              type="button"
              onClick={() => navigate(`/dashboard/review/${attemptId}${fromLibrary ? '?from=library' : ''}`)}
              className="font-inter font-bold text-[14px] text-[#421A83] py-[11.5px] px-4 rounded-[8px] bg-[#FFC92A] hover:opacity-95 transition-opacity"
            >
              Review My Answers
            </button>
          </div>
        </section>

        {/* ── RECOMMENDED NEXT STEP ── */}
        {(recommendations.length > 0 || reviewerType === 'mock') && (
          <>
            <h3 className="font-inter font-semibold text-[18px] text-[#45464E] mt-[40px] mb-[24px] flex items-center gap-2">
              <span>📌</span> Recommended Next Step
            </h3>
            <div className="flex flex-col gap-[16px]">
              {recommendations.map((rec, index) => {
                const reviewer = rec.reviewer;
                const logoSrc = reviewer?.logo?.filename && REVIEWER_LOGO_MAP[reviewer.logo.filename]
                  ? REVIEWER_LOGO_MAP[reviewer.logo.filename]
                  : (reviewer?.logo?.path ?? null);
                const details = reviewer?.details || {};
                return (
                  <div
                    key={index}
                    className="bg-white rounded-[12px] p-[24px] shadow-[0px_2px_4px_0px_#00000026] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                    data-aos="fade-up"
                    data-aos-duration="500"
                    data-aos-delay={100 + index * 50}
                  >
                    <div className="flex items-start gap-[16px] flex-1">
                      {logoSrc ? (
                        <img src={logoSrc} alt="" className="w-[40px] h-[40px] shrink-0 object-cover mt-[2px]" />
                      ) : (
                        <div className="w-[40px] h-[40px] rounded bg-[#6E43B9] flex items-center justify-center text-white font-inter font-bold text-xs shrink-0 mt-[2px]">
                          CSE
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-inter font-semibold text-[15px] text-[#45464E] mb-[4px]">
                          {rec.section} Practice
                          {rec.isHighestImpact && (
                            <span className="text-[#45464E] font-normal"> – Highest Impact improvement</span>
                          )}
                        </h4>
                        <p className="font-inter font-normal text-[14px] text-[#64748B] leading-[20px] mb-[8px]">
                          {rec.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-[6px] text-[13px] text-[#45464E] font-inter">
                          <span>📝 {details.items || '50 items'}</span>
                          <span>•</span>
                          <span>⏱️ {details.duration || 'Approx. 45m'}</span>
                        </div>
                      </div>
                    </div>
                    {reviewer ? (
                      checkAccess(reviewer) ? (
                        <button
                          type="button"
                          onClick={() => navigate(`/dashboard/exam/${reviewer._id}`)}
                          className="shrink-0 font-inter font-semibold text-[14px] text-[#421A83] py-[10px] px-[20px] rounded-[8px] bg-[#FFC92A] hover:opacity-95 transition-opacity whitespace-nowrap"
                        >
                          Take Practice Exam
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => navigate('/dashboard/settings/update-subscription')}
                          className="shrink-0 font-inter font-semibold text-[14px] text-[#421A83] py-[10px] px-[20px] rounded-[8px] bg-[#FFC92A] hover:opacity-95 transition-opacity whitespace-nowrap flex items-center gap-2"
                        >
                          <LockIcon className="w-[16px] h-[16px] shrink-0" />
                          Upgrade to Premium
                        </button>
                      )
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate('/dashboard/all-reviewers')}
                        className="shrink-0 font-inter font-semibold text-[14px] text-[#421A83] py-[10px] px-[20px] rounded-[8px] bg-[#FFC92A] hover:opacity-95 transition-opacity whitespace-nowrap"
                      >
                        Take Practice Exam
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Retake Full Mock Exam card */}
              {reviewerType === 'mock' && (
                <div
                  className="bg-white rounded-[12px] p-[24px] shadow-[0px_2px_4px_0px_#00000026] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                  data-aos="fade-up"
                  data-aos-duration="500"
                  data-aos-delay={100 + recommendations.length * 50}
                >
                  <div className="flex items-start gap-[16px] flex-1">
                    {(() => {
                      const logoSrc = attempt.reviewer?.logo?.filename && REVIEWER_LOGO_MAP[attempt.reviewer.logo.filename]
                        ? REVIEWER_LOGO_MAP[attempt.reviewer.logo.filename]
                        : (attempt.reviewer?.logo?.path ?? null);
                      return logoSrc ? (
                        <img src={logoSrc} alt="" className="w-[40px] h-[40px] shrink-0 object-cover mt-[2px]" />
                      ) : (
                        <div className="w-[40px] h-[40px] rounded bg-[#6E43B9] flex items-center justify-center text-white font-inter font-bold text-xs shrink-0 mt-[2px]">
                          CSE
                        </div>
                      );
                    })()}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-inter font-semibold text-[15px] text-[#45464E] mb-[4px]">
                        Retake Full Mock Exam after focused review
                      </h4>
                      <p className="font-inter font-normal text-[14px] text-[#64748B] leading-[20px] mb-[8px]">
                        Reassess overall readiness under exam conditions.
                      </p>
                      <div className="flex flex-wrap items-center gap-[6px] text-[13px] text-[#45464E] font-inter">
                        <span>📝 {result.totalItems || 170} items</span>
                        <span>•</span>
                        <span>⏱️ {attempt.reviewer?.details?.duration || '3 hrs 10 mins'}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/exam/${attempt.reviewer?._id}`)}
                    className="shrink-0 font-inter font-semibold text-[14px] text-[#421A83] py-[10px] px-[20px] rounded-[8px] bg-[#FFC92A] hover:opacity-95 transition-opacity whitespace-nowrap"
                  >
                    Retake Full Exam
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ExamResultsLoading;
