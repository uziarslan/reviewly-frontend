import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import AOS from 'aos';
import DashNav from '../components/DashNav';
import { REVIEWER_LOGO_MAP } from '../data/reviewers';
import { LockIcon } from '../components/Icons';
import { examAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ExamResultsLoadingSkeleton from '../components/skeletons/ExamResultsLoadingSkeleton';
import { canAccessReviewer } from '../utils/subscription';

const PAGE_CLASSES = 'min-h-screen bg-[#F5F4FF]';
const MAIN_CLASSES = 'max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20';
const SECTION_CLASSES = 'bg-[#FFFFFF] rounded-[12px] px-[24px] py-[32px] sm:px-[32px] sm:py-[40px]';
const BREADCRUMB_LINK = 'text-[#45464E] font-inter font-normal not-italic text-[14px] hover:text-[#6E43B9] transition-colors';
const BREADCRUMB_ACTIVE = 'text-[#6E43B9] font-inter font-normal not-italic text-[14px]';

const ExamResultsLoading = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromLibrary = new URLSearchParams(location.search).get('from') === 'library';
  const { isAuthenticated, user } = useAuth();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);

  const backUrl = fromLibrary ? '/dashboard/library' : '/dashboard/all-reviewers';
  const checkAccess = (r) => canAccessReviewer(r, { isAuthenticated, user });
  const isProcessing = attempt && attempt.status !== 'submitted' && attempt.status !== 'timed_out';

  useEffect(() => {
    const t = requestAnimationFrame(() => AOS.refresh());
    return () => cancelAnimationFrame(t);
  }, [attempt]);

  useEffect(() => {
    if (!attemptId) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const res = await examAPI.getResult(attemptId);
        if (cancelled) return;
        if (res.success) setAttempt(res.data);
      } catch (e) { console.error('Failed to load results:', e); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [attemptId]);

  useEffect(() => {
    if (!attemptId || !isProcessing) return;
    const iv = setInterval(async () => {
      try {
        const res = await examAPI.getResult(attemptId);
        if (res.success && (res.data?.status === 'submitted' || res.data?.status === 'timed_out')) {
          setAttempt(res.data);
        }
      } catch { /* ignore */ }
    }, 2000);
    return () => clearInterval(iv);
  }, [attemptId, isProcessing]);

  if (loading) return <ExamResultsLoadingSkeleton />;

  if (!attempt) {
    return (
      <div className={PAGE_CLASSES}>
        <DashNav />
        <main className={`${MAIN_CLASSES} py-8`}>
          <p className="font-inter text-[#45464E]">Results not found.</p>
          <Link to={backUrl} className="font-inter text-[#6E43B9] hover:underline mt-4 inline-block">
            Back to {fromLibrary ? 'My Library' : 'All Reviewers'}
          </Link>
        </main>
      </div>
    );
  }

  const title = attempt.reviewer?.title || 'Exam';
  const reviewerType = attempt.reviewer?.type || 'mock';
  const result = attempt.result || {};
  const breakdown = result.sectionScores || [];
  const recommendations = result.recommendedNextStep?.ctas ?? [];
  const totalCorrect = result.correct || 0;
  const totalIncorrect = result.incorrect || 0;
  const totalUnanswered = result.unanswered || 0;
  const overallPercentage = (result.percentage != null ? result.percentage : 0).toFixed(2);
  const passingThreshold = attempt.reviewer?.examConfig?.passingThreshold || 80;
  const passingScore = result.passingScore ?? Math.ceil((passingThreshold / 100) * (result.totalItems || 0));
  const passed = result.passed;
  const quickSummary = result.quickSummary || null;
  const sectionAnalysis = result.sectionAnalysis || [];

  const sortedSections = [...breakdown].sort((a, b) => b.score - a.score);
  const strongAreas = sortedSections.slice(0, 2);
  const refineAreas = sortedSections.slice(2);
  const lowestSection = sortedSections[sortedSections.length - 1] || null;
  const gapToPass = passed ? 0 : Math.max(0, passingScore - totalCorrect);

  const takenAt = attempt.submittedAt
    ? new Date(attempt.submittedAt).toLocaleString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: 'numeric', minute: '2-digit', timeZoneName: 'short',
    })
    : '—';

  const durationMs = attempt.submittedAt && attempt.startedAt
    ? new Date(attempt.submittedAt) - new Date(attempt.startedAt) : 0;
  const durationMin = Math.floor(durationMs / 60000);
  const durationH = Math.floor(durationMin / 60);
  const durationM = durationMin % 60;
  const duration = durationH > 0
    ? `${durationH} hour${durationH !== 1 ? 's' : ''} ${durationM} min${durationM !== 1 ? 's' : ''}`
    : `${durationM} minute${durationM !== 1 ? 's' : ''}`;

  const performanceLevel = result.performanceLevel
    || (parseFloat(overallPercentage) >= 85 ? 'Strong' : parseFloat(overallPercentage) >= 70 ? 'Developing' : 'Needs Improvement');
  const timeInsight = result.timeInsight || null;
  const durationSec = Math.round(durationMs / 1000);
  const avgTimePerQ = result.totalItems > 0 ? Math.round(durationSec / result.totalItems) : 0;
  const pacingNote = timeInsight
    || (totalUnanswered === 0
      ? 'Good pacing — you answered all questions within the time limit.'
      : totalUnanswered <= 2
        ? `${totalUnanswered} unanswered item${totalUnanswered > 1 ? 's' : ''} suggest slight pacing adjustments may help.`
        : `${totalUnanswered} unanswered items suggest pacing adjustments may help.`);

  const sectionLabel = breakdown.length === 1 ? breakdown[0].section : title;
  const practiceFallbackSummary = performanceLevel === 'Strong'
    ? `You demonstrate a strong understanding of core ${sectionLabel.toLowerCase()} concepts. Accuracy is high across question types. Consider trying the full mock exam to test your overall readiness.`
    : performanceLevel === 'Developing'
      ? `You demonstrate a developing understanding of core ${sectionLabel.toLowerCase()} concepts. Accuracy decreases in multi-step and application-based questions. Improving structured problem-solving and pacing will increase consistency.`
      : `You demonstrate a developing understanding of core ${sectionLabel.toLowerCase()} concepts. Focus on multi-step and application-based questions to improve.`;

  const getAILines = (sectionName) =>
    (sectionAnalysis.find((sa) => sa.section?.toLowerCase() === sectionName?.toLowerCase())?.lines) || [];

  const getRecAction = (rec) => {
    const reviewerId = rec.reviewer?._id || rec.reviewerId;
    const route = rec.type === 'review_answers'
      ? `/dashboard/review/${attemptId}`
      : rec.type === 'go_to_dashboard' ? backUrl
        : reviewerId ? `/dashboard/exam/${reviewerId}${fromLibrary ? '?from=library' : ''}` : null;
    const showUpgrade = rec.reviewer != null && !checkAccess(rec.reviewer);
    const handleClick = () => {
      if (showUpgrade) navigate('/dashboard/settings/update-subscription');
      else if (rec.type === 'go_to_dashboard') navigate(backUrl);
      else if (route) navigate(route);
    };
    return { route, showUpgrade, handleClick };
  };

  const breadcrumb = (
    <nav className="mb-[24px]" aria-label="Breadcrumb" data-aos="fade-up" data-aos-duration="400" data-aos-delay="0">
      <Link to={backUrl} className={BREADCRUMB_LINK}>{fromLibrary ? 'My Library' : 'All Reviewers'}</Link>
      <span className="mx-2">›</span>
      <span className={BREADCRUMB_ACTIVE}>{title}</span>
    </nav>
  );

  const ctaButton = (rec, { showUpgrade, handleClick }, isPrimary) => (
    <button
      key={rec.type}
      type="button"
      onClick={handleClick}
      className={`font-inter text-[14px] py-[11.5px] px-5 rounded-[8px] transition-colors flex items-center gap-2 ${isPrimary || showUpgrade
        ? 'font-bold text-[#421A83] bg-[#FFC92A] hover:opacity-95'
        : 'font-normal text-[#6E43B9] border border-[#6E43B9] bg-white hover:bg-gray-50'
        }`}
    >
      {showUpgrade && <LockIcon className="w-[16px] h-[16px] shrink-0" />}
      {rec.label}
    </button>
  );

  const recommendedButtons = (
    <div className="pt-[28px] max-w-[850px] mx-auto">
      <h3 className="font-inter font-semibold text-[18px] text-[#45464E] mb-[16px] flex items-center gap-2">
        <span>📌</span> Recommended Next Step
      </h3>
      <div className="flex flex-wrap gap-3">
        {recommendations.map((rec) => {
          const action = getRecAction(rec);
          return ctaButton(rec, action, rec.priority === 'primary');
        })}
      </div>
    </div>
  );

  if (isProcessing) {
    return (
      <div className={PAGE_CLASSES}>
        <DashNav />
        <main className={`${MAIN_CLASSES} pt-[24px] pb-[40px]`}>
          {breadcrumb}
          <h1 className="font-inter font-medium text-[#45464E] text-[20px] mb-[24px]" data-aos="fade-up" data-aos-duration="400" data-aos-delay="25">{title}</h1>
          <section className={`${SECTION_CLASSES} py-[40px] sm:py-[56px] flex flex-col items-center justify-center`} data-aos="fade-up" data-aos-duration="400" data-aos-delay="50">
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

  const blockTitle = (emoji, text) => (
    <h3 className="font-inter font-semibold text-[18px] text-[#45464E] mb-[12px] flex items-center gap-2">
      <span>{emoji}</span> {text}
    </h3>
  );

  if (reviewerType === 'practice') {
    return (
      <div className={PAGE_CLASSES}>
        <DashNav />
        <main className={`${MAIN_CLASSES} pt-[24px] pb-[40px]`}>
          {breadcrumb}
          <h1 className="font-inter font-medium text-[#45464E] text-[20px] mb-[24px]" data-aos="fade-up" data-aos-duration="400" data-aos-delay="25">{title}</h1>
          <section className={SECTION_CLASSES} data-aos="fade-up" data-aos-duration="400" data-aos-delay="50">
            <h2 className="font-inter font-medium text-[20px] text-[#45464E] text-center mb-[24px]">{title}</h2>
            <p className="font-inter font-normal text-[16px] text-[#45464E] text-center mb-[24px]">Exam Taken On: {takenAt}</p>
            <h3 className="font-inter font-semibold text-[16px] text-[#45464E] text-center uppercase tracking-wide mb-[22px]">Overall Performance</h3>
            <div className="overflow-x-auto flex justify-center mb-[32px]">
              <table className="w-full max-w-[800px] border-collapse border border-[#B0B0B0] font-inter text-[14px]">
                <thead>
                  <tr className="bg-[#431C86] text-white">
                    {['Total Items', 'Correct', 'Incorrect', 'Unanswered', 'Percentage', 'Performance Level'].map((h) => (
                      <th key={h} className="text-left py-3 px-3 font-semibold border border-[#B0B0B0]">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-[#FAF9FF]">
                    <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{result.totalItems}</td>
                    <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{totalCorrect}</td>
                    <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{totalIncorrect}</td>
                    <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{totalUnanswered}</td>
                    <td className="py-3 px-3 text-[#45464E] border-t border-l border-[#B0B0B0]">{overallPercentage}%</td>
                    <td className="py-3 px-3 border-t border-l border-[#B0B0B0] font-inter font-semibold text-[14px] text-[#45464E]">{performanceLevel}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="pt-[28px] mb-[28px] max-w-[800px] mx-auto">
              {blockTitle('⏱️', 'Time Insight')}
              <p className="font-inter font-normal text-[15px] text-[#45464E] leading-[24px] mb-[4px]">Time Spent: <span className="font-medium">{duration}</span></p>
              <p className="font-inter font-normal text-[15px] text-[#45464E] leading-[24px] mb-[4px]">Average Time per Question: <span className="font-medium">{avgTimePerQ} seconds</span></p>
              <p className="font-inter font-normal text-[15px] text-[#45464E] leading-[24px]">{pacingNote}</p>
            </div>
            <div className="pt-[28px] mb-[32px] max-w-[800px] mx-auto">
              {blockTitle('📊', 'Quick Summary')}
              {(quickSummary || practiceFallbackSummary).split(/(?<=[.!?])\s+/).filter(Boolean).map((s, i) => (
                <p key={i} className="font-inter font-normal text-[15px] text-[#45464E] leading-[24px] mb-[4px]">{s}</p>
              ))}
            </div>
            {recommendedButtons}
          </section>
        </main>
      </div>
    );
  }

  const cardCtas = recommendations.filter((r) => r.type === 'take_section_practice' || r.type === 'retake_full_mock');

  return (
    <div className={PAGE_CLASSES}>
      <DashNav />
      <main className={`${MAIN_CLASSES} pt-[24px] pb-[40px]`}>
        {breadcrumb}
        <h1 className="font-inter font-medium text-[#45464E] text-[20px] mb-[24px]" data-aos="fade-up" data-aos-duration="400" data-aos-delay="25">{title}</h1>
        <section className={SECTION_CLASSES} data-aos="fade-up" data-aos-duration="400" data-aos-delay="50">
          <h2 className="font-inter font-medium text-[20px] text-[#45464E] text-center mb-[24px]">{title}</h2>
          <p className="font-inter font-normal text-[16px] text-[#45464E] text-center mb-[4px]">Mock Exam Taken On: {takenAt}</p>
          <p className="font-inter font-normal text-[16px] text-[#45464E] text-center mb-[24px]">Exam Duration: <span className="font-bold">{duration}</span></p>

          <h3 className="font-inter font-semibold text-[16px] text-[#45464E] text-center uppercase tracking-wide mb-[22px]">Overall Performance</h3>
          <div className="overflow-x-auto flex justify-center mb-2">
            <table className="w-full max-w-[800px] border-collapse border border-[#B0B0B0] font-inter text-[14px]">
              <thead>
                <tr className="bg-[#431C86] text-white">
                  {['Total Items', 'Your Score', 'Percentage', 'Status'].map((h) => (
                    <th key={h} className="text-left py-3 px-2 font-semibold border border-[#B0B0B0] w-[120px]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="bg-[#FAF9FF]">
                  <td className="py-3 px-2 text-[#45464E] border-t border-l border-[#B0B0B0]">{result.totalItems}</td>
                  <td className="py-3 px-2 text-[#45464E] border-t border-l border-[#B0B0B0]">{totalCorrect}</td>
                  <td className="py-3 px-2 text-[#45464E] border-t border-l border-[#B0B0B0]">{overallPercentage}%</td>
                  <td className={`py-3 px-2 border-t border-l border-[#B0B0B0] ${passed ? 'text-[#06A561]' : 'text-[#F0142F]'} font-inter font-bold text-[16px]`}>
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

          <h3 className="font-inter font-semibold text-[16px] text-[#45464E] text-center uppercase tracking-wide mb-[16px]">Detailed Performance Breakdown</h3>
          <div className="overflow-x-auto mb-8">
            <table className="w-full border-collapse border border-[#B0B0B0] font-inter text-[14px]">
              <thead>
                <tr className="bg-[#431C86] text-white">
                  {['Subject Area', 'Items', 'Correct', 'Incorrect', 'Unanswered', 'Your Score (%)'].map((h) => (
                    <th key={h} className="text-left py-3 px-3 font-semibold border border-[#B0B0B0]">{h}</th>
                  ))}
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
                  <td className={`py-3 px-3 font-bold border-t border-l border-[#B0B0B0] ${passed ? 'text-[#22C55E]' : 'text-[#DC2626]'}`}>{overallPercentage}%</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="pt-[32px] mt-[8px] mb-[32px] max-w-[800px] mx-auto">
            <h3 className="font-poppins font-bold text-[20px] text-[#45464E] mb-[16px] flex items-center gap-2"><span>📊</span> Quick Summary</h3>
            {quickSummary ? (
              <p className="font-inter font-normal text-[15px] text-[#45464E] leading-[24px] mb-[12px]">{quickSummary}</p>
            ) : (
              <>
                {strongAreas.length >= 2 && (
                  <p className="font-inter font-normal text-[15px] text-[#45464E] leading-[24px] mb-[4px]">
                    You performed strongly in <span className="font-bold">{strongAreas[0].section}</span>
                    {strongAreas.length > 1 && <> and <span className="font-bold">{strongAreas[1].section}</span></>}.
                  </p>
                )}
                {lowestSection && (
                  <p className="font-inter font-normal text-[15px] text-[#45464E] leading-[24px] mb-[4px]">
                    Your overall score was mainly affected by <span className="font-bold">{lowestSection.section}</span>.
                  </p>
                )}
              </>
            )}
            {!passed && gapToPass > 0 && (
              <>
                <p className="font-inter font-normal text-[15px] text-[#45464E] leading-[24px] mb-[4px]">
                  You are <span className="font-bold">{gapToPass} correct answer{gapToPass !== 1 ? 's' : ''}</span> away from the passing mark.
                </p>
                <p className="font-inter font-normal text-[15px] text-[#45464E] leading-[24px]">Focused improvement in one section can realistically close this gap.</p>
              </>
            )}
            {passed && (
              <p className="font-inter font-normal text-[15px] text-[#45464E] leading-[24px]">
                Outstanding work! You exceeded the {passingThreshold}% passing threshold. Keep refining your weaker areas to maintain consistency.
              </p>
            )}
          </div>

          {strongAreas.length > 0 && (
            <div className="mb-[28px] max-w-[800px] mx-auto">
              <h3 className="font-poppins font-bold text-[20px] text-[#45464E] mb-[16px] flex items-center gap-2"><span>💪</span> Strong Areas</h3>
              <ul className="list-disc list-outside pl-6 space-y-[16px]">
                {strongAreas.map((s, i) => {
                  const aiLines = getAILines(s.section);
                  return (
                    <li key={i} className="font-inter text-[15px] text-[#45464E]">
                      <span className="font-bold">{s.section} ({s.score}%)</span>
                      {(aiLines.length ? aiLines : [s.score >= 85 ? "Excellent proficiency. You're exam-ready in this section." : 'Good performance. Minor refinements can push this to mastery level.']).map((line, li) => (
                        <p key={li} className="font-normal text-[15px] text-[#45464E] leading-[24px] mt-[2px]">{line}</p>
                      ))}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {refineAreas.length > 0 && (
            <div className="mb-[32px] max-w-[800px] mx-auto">
              <h3 className="font-poppins font-bold text-[20px] text-[#45464E] mb-[16px] flex items-center gap-2"><span>🎯</span> Refine Further</h3>
              <ul className="list-disc list-outside pl-6 space-y-[16px]">
                {refineAreas.map((s, i) => {
                  const aiLines = getAILines(s.section);
                  const isLowest = lowestSection && s.section === lowestSection.section;
                  const fallback = isLowest
                    ? `This section had the biggest impact on your overall score. Improving this section alone could move you closer to the ${passingThreshold}% passing mark.`
                    : 'You understand basic patterns, but this area needs focused practice and refinement.';
                  return (
                    <li key={i} className="font-inter text-[15px] text-[#45464E]">
                      <span className="font-bold">{s.section} ({s.score}%){isLowest && <span className="text-[#45464E] font-bold"> — Highest Impact Area</span>}</span>
                      {(aiLines.length ? aiLines : [fallback]).map((line, li) => (
                        <p key={li} className={`font-inter leading-[24px] mt-[2px] ${aiLines.length ? 'font-bold text-[16px]' : 'font-normal text-[15px]'} text-[#45464E]`}>{line}</p>
                      ))}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-4 mb-[8px]">
            <button type="button" onClick={() => navigate(backUrl)} className="font-inter font-normal text-[14px] text-[#6E43B9] py-[11.5px] px-4 rounded-[8px] border border-[#6E43B9] bg-white hover:bg-gray-50 transition-colors">
              Go back to Dashboard
            </button>
            <button type="button" onClick={() => navigate(`/dashboard/review/${attemptId}${fromLibrary ? '?from=library' : ''}`)} className="font-inter font-bold text-[14px] text-[#421A83] py-[11.5px] px-4 rounded-[8px] bg-[#FFC92A] hover:opacity-95 transition-opacity">
              Review My Answers
            </button>
          </div>

          {reviewerType === 'mock' && cardCtas.length > 0 && (
            <div className="max-w-[800px] mx-auto">
              <h3 className="font-inter font-semibold text-[20px] text-[#45464E] mt-[40px] mb-[24px] flex items-center gap-2"><span>📌</span> Recommended Next Step</h3>
              <div className="flex flex-col gap-[16px]">
                {cardCtas.map((rec, idx) => {
                  const reviewer = rec.reviewer;
                  const logoSrc = reviewer?.logo?.filename && REVIEWER_LOGO_MAP[reviewer.logo.filename] ? REVIEWER_LOGO_MAP[reviewer.logo.filename] : reviewer?.logo?.path ?? null;
                  const details = reviewer?.details || {};
                  const sectionDisplayName = reviewer?.sectionDisplayName || reviewer?.title?.match(/\(([^)]+)\)/)?.[1] || null;
                  const cardTitle = rec.type === 'take_section_practice' && sectionDisplayName
                    ? `${sectionDisplayName} Practice${rec.isHighestImpact ? ' – Highest Impact improvement' : ''}`
                    : rec.type === 'retake_full_mock' ? 'Retake Full Mock Exam after focused review' : reviewer?.title || rec.label;
                  const cardDescription = rec.type === 'take_section_practice' && sectionDisplayName
                    ? (rec.isHighestImpact ? `Strengthen ${sectionDisplayName.toLowerCase()} reasoning and problem-solving skills.` : `Improve ${sectionDisplayName.toLowerCase()} skills and logical consistency.`)
                    : rec.type === 'retake_full_mock' ? 'Reassess overall readiness under exam conditions.' : null;
                  const { showUpgrade, handleClick } = getRecAction(rec);
                  const showMeta = reviewer && (details.items || details.duration);
                  return (
                    <div key={`${rec.type}-${idx}`} className="bg-white rounded-[12px] p-[24px] border border-[#0000001A] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" data-aos="fade-up" data-aos-duration="500" data-aos-delay={100 + idx * 50}>
                      <div className="flex items-start gap-[16px] flex-1">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-[16px] mb-[16px]">
                            {logoSrc && <img src={logoSrc} alt="" className="w-[40px] h-[40px] shrink-0 object-cover mt-[2px]" />}
                            <h4 className="font-inter font-medium text-[14px] text-[#45464E] m-0">{cardTitle}</h4>
                          </div>
                          {cardDescription && <p className="font-inter font-normal text-[14px] text-[#45464E] mb-[16px] leading-[20px]">{cardDescription}</p>}
                          {showMeta && (
                            <div className="flex flex-wrap items-center gap-[6px] text-[13px] text-[#45464E] font-inter">
                              <span>📝 {details.items || (result.totalItems ? `${result.totalItems} items` : '50 items')}</span>
                              <span>•</span>
                              <span>⏱️ {details.duration || 'Approx. 45m'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {ctaButton(rec, { showUpgrade, handleClick }, true)}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {reviewerType === 'demo' && recommendations.length > 0 && recommendedButtons}
        </section>
      </main>
    </div>
  );
};

export default ExamResultsLoading;
