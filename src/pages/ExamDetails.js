import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import AOS from 'aos';
import DashNav from '../components/DashNav';
import { reviewerAPI, examAPI } from '../services/api';
import { ExamNotesLightningIcon, MetricTimeIcon, MetricItemsIcon, MetricPassingScoreIcon, MetricStatusIcon } from '../components/Icons';
import { TextWithNewlines } from '../utils/text';
import ExamDetailsSkeleton from '../components/skeletons/ExamDetailsSkeleton';
import { BANNER_IMAGE_MAP } from '../data/reviewers';
import { trackExamSelected } from '../services/analytics';

/* ── Exam Breakdown helpers ──────────────────────────────── */

const SECTION_CONFIG = {
  verbal: { label: 'Verbal', color: '#14B8A6' },
  analytical: { label: 'Analytical', color: '#3B82F6' },
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

/** Pure-SVG donut chart with centered total-items label. */
function DonutChart({ segments, total }) {
  const R = 70;
  const CX = 100;
  const CY = 100;
  const STROKE = 28;
  const C = 2 * Math.PI * R; // circumference ≈ 439.82

  let cumulative = 0;
  const arcs = segments.map((seg, i) => {
    const fraction = total > 0 ? seg.count / total : 0;
    const dashLen = fraction * C;
    // SVG circles start at 3 o'clock; rotate -90deg to start at 12 o'clock
    const offset = -(cumulative / (total || 1)) * C;
    cumulative += seg.count;
    return { ...seg, dashLen, offset };
  });

  return (
    <svg viewBox="0 0 200 200" width={182} height={182} style={{ width: '182px', height: '182px', display: 'block', margin: '0 auto' }}>
      {/* background ring */}
      <circle
        cx={CX} cy={CY} r={R}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth={STROKE}
      />
      {/* colored arcs */}
      {arcs.map((arc, i) => (
        <circle
          key={i}
          cx={CX} cy={CY} r={R}
          fill="none"
          stroke={arc.color}
          strokeWidth={STROKE}
          strokeDasharray={`${arc.dashLen} ${C}`}
          strokeDashoffset={arc.offset}
          transform={`rotate(-90 ${CX} ${CY})`}
          style={{ transition: 'stroke-dasharray 0.4s ease' }}
        />
      ))}
      {/* center label */}
      <text x={CX} y={CY - 8} textAnchor="middle" className="font-inter" fontSize="11" fill="#6C737F">Total Items</text>
      <text x={CX} y={CY + 14} textAnchor="middle" className="font-inter" fontSize="26" fontWeight="700" fill="#421A83">{total}</text>
    </svg>
  );
}

/** Exam Breakdown section: donut chart + table. */
function ExamBreakdown({ sectionDistribution, totalItems, disclaimer }) {
  const total = totalItems || sectionDistribution.reduce((s, x) => s + x.count, 0);
  const segments = sectionDistribution.map((s, i) => ({
    ...getSectionConfig(s.section, i),
    count: s.count,
    percent: total > 0 ? Math.round((s.count / total) * 100) : 0,
  }));

  return (
    <section
      className="mb-8 max-w-[808px]"
      data-aos="fade-up"
      data-aos-duration="500"
      data-aos-delay="120"
    >
      <h2 className="font-inter font-bold text-[24px] text-[#45464E] mb-5">
        Exam Breakdown
      </h2>
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
        {/* Donut chart */}
        <div style={{ width: 262, height: 214, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <DonutChart segments={segments} total={total} />
        </div>
        {/* Table */}
        <div className="flex-1 min-w-0 max-w-[448px] w-full self-center">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#E5E7EB]">
                <th className="font-inter font-normal text-[13px] text-[#6C737F] pb-2 pr-4 w-1/2">Section</th>
                <th className="font-inter font-normal text-[13px] text-[#6C737F] pb-2 pr-4 text-right">No. of Items</th>
                <th className="font-inter font-normal text-[13px] text-[#6C737F] pb-2 text-right">%</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((seg, i) => (
                <tr key={i} className="border-b border-[#F3F4F6]">
                  <td className="py-[10px] pr-4">
                    <span className="flex items-center gap-2 font-inter font-normal text-[14px] text-[#45464E]">
                      <span className="w-[10px] h-[10px] rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                      {seg.label}
                    </span>
                  </td>
                  <td className="py-[10px] pr-4 font-inter font-bold text-[14px] text-[#45464E] text-right">{seg.count}</td>
                  <td className="py-[10px] font-inter font-bold text-[14px] text-[#45464E] text-right">{seg.percent}%</td>
                </tr>
              ))}
              <tr>
                <td className="pt-[10px] pr-4 font-inter font-bold text-[14px] text-[#45464E]">Total</td>
                <td className="pt-[10px] pr-4 font-inter font-bold text-[14px] text-[#45464E] text-right">{total}</td>
                <td className="pt-[10px] font-inter font-bold text-[14px] text-[#45464E] text-right">100%</td>
              </tr>
            </tbody>
          </table>
          {disclaimer && (
            <p className="font-inter font-normal italic text-[11px] text-[#6C737F] mt-3 leading-[18px]">
              {disclaimer}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────── */

const ExamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromLibrary = new URLSearchParams(location.search).get('from') === 'library';
  const [reviewer, setReviewer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [inProgressData, setInProgressData] = useState(null); // { attemptId, answeredCount, totalQuestions, progressPercent }
  const [completedData, setCompletedData] = useState(null); // { attemptId, correct, totalItems, passed }

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    let cancelled = false;
    async function fetchData() {
      try {
        const [revRes, histRes] = await Promise.all([
          reviewerAPI.getById(id),
          examAPI.getUserHistory(1, 5),
        ]);
        if (cancelled) return;
        if (revRes.success) {
          setReviewer(revRes.data);
          trackExamSelected(id, revRes.data.title);
        }
        if (histRes.success) {
          // Build map by reviewer id for both in_progress and completed attempts
          const ipMap = {};
          const completedMap = {};
          histRes.data.forEach((attempt) => {
            const revId = String(attempt.reviewer?._id || attempt.reviewer);
            if (attempt.status === 'in_progress') {
              ipMap[revId] = {
                attemptId: attempt._id,
                answeredCount: attempt.progress?.answeredCount || 0,
                totalQuestions: attempt.progress?.totalQuestions || 0,
                progressPercent: attempt.progress?.progressPercent || 0,
                remainingSeconds: attempt.remainingSeconds ?? null,
              };
            } else if (attempt.status === 'submitted' || attempt.status === 'timed_out') {
              completedMap[revId] = {
                attemptId: attempt._id,
                correct: attempt.result?.correct || 0,
                totalItems: attempt.result?.totalItems || 0,
                passed: attempt.result?.passed || false,
              };
            }
          });
          const ipData = ipMap[String(id)];
          const completedDataResult = completedMap[String(id)];
          if (ipData) setInProgressData(ipData);
          if (completedDataResult) setCompletedData(completedDataResult);
        }
      } catch (err) {
        // ignore
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [id]);

  const exam = reviewer?.examDetails;

  /** Format seconds into digital time format (HH:MM:SS). */
  const formatRemainingTime = (seconds) => {
    if (!seconds || seconds <= 0) return '00:00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s].map((n) => String(n).padStart(2, '0')).join(':');
  };

  useEffect(() => {
    AOS.refresh();
  }, [reviewer]);

  if (loading) return <ExamDetailsSkeleton />;

  if (!reviewer || !exam) {
    return (
      <div className="min-h-screen bg-white">
        <DashNav />
        <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 py-8">
          <p className="font-inter text-[#45464E]">Exam not found.</p>
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

  const { title } = reviewer;

  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      <DashNav />
      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 pt-[24px] pb-[40px]">
        {/* Breadcrumbs */}
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

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-[24px] items-start">
          {/* Left column: banner, title, metrics, button, coverage — first on mobile (top), left on lg */}
          <div className="order-1 lg:order-1 w-full lg:w-auto lg:flex-1 lg:min-w-0 bg-[#FFFFFF] p-[24px] rounded-[12px]">
            {/* Banner */}
            <div
              className="w-full h-[225px] rounded-tl-[8px] rounded-tr-[8px] bg-gradient-to-br from-[#6E43B9]/20 to-[#421983]/30 flex items-center justify-center"
              data-aos="fade-up"
              data-aos-duration="500"
            >
              {console.log(exam.bannerImage)}
              {exam.bannerImage ? (
                <img src={BANNER_IMAGE_MAP[exam.bannerImage]} alt="" className="w-full h-full object-cover object-center rounded-[12px]" />
              ) : (
                <span className="font-inter text-[#6E43B9]/60 text-sm">Banner image placeholder</span>
              )}
            </div>

            <h1
              className="font-inter font-semibold not-italic text-[22px] text-[#45464E] mt-6 mb-[10px]"
              data-aos="fade-up"
              data-aos-duration="500"
              data-aos-delay="50"
            >
              {title}
            </h1>

            {/* Description (introShort + introFull) — shown right after title per Figma */}
            {(exam.introShort || exam.introFull) && (
              <section
                className="mb-6"
                data-aos="fade-up"
                data-aos-duration="500"
                data-aos-delay="70"
              >
                {exam.introShort && (
                  <TextWithNewlines as="p" className="font-inter font-bold text-[15px] text-[#45464E] mb-2">{exam.introShort}</TextWithNewlines>
                )}
                {exam.introFull && (
                  <TextWithNewlines as="p" className="font-inter font-normal text-[15px] text-[#45464E] leading-[26px]">{exam.introFull}</TextWithNewlines>
                )}
              </section>
            )}

            {/* Metrics + Buttons */}
            <div
              className="mb-[32px]"
              data-aos="fade-up"
              data-aos-duration="500"
              data-aos-delay="100"
            >
              {/* 4 inline metrics */}
              <div className="flex flex-wrap gap-x-28 gap-y-3 mb-4">
                {/* Time */}
                <div className="flex items-center gap-2">
                  <MetricTimeIcon className="w-[22px] h-[22px] shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-inter font-medium text-[12px] text-[#45464E] leading-tight">
                      {inProgressData ? 'Remaining Time' : 'Time'}
                    </span>
                    <strong className="font-inter font-medium text-[16px] text-[#421A83] leading-tight">
                      {inProgressData && inProgressData.remainingSeconds != null
                        ? formatRemainingTime(inProgressData.remainingSeconds)
                        : exam.timeFormatted}
                    </strong>
                  </div>
                </div>
                {/* Total Items */}
                <div className="flex items-center gap-2">
                  <MetricItemsIcon className="w-[22px] h-[22px] shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-inter font-medium text-[12px] text-[#45464E] leading-tight">Total Items</span>
                    <strong className="font-inter font-medium text-[16px] text-[#421A83] leading-tight">
                      {completedData
                        ? `${completedData.correct}/${completedData.totalItems}`
                        : inProgressData
                          ? `${inProgressData.answeredCount}/${inProgressData.totalQuestions}`
                          : exam.itemsCount}
                    </strong>
                  </div>
                </div>
                {/* Passing Score */}
                <div className="flex items-center gap-2">
                  <MetricPassingScoreIcon className="w-[22px] h-[22px] shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-inter font-medium text-[12px] text-[#45464E] leading-tight">Passing Score</span>
                    <strong className="font-inter font-medium text-[16px] text-[#421A83] leading-tight">
                      {reviewer?.examConfig?.passingThreshold != null
                        ? `${reviewer.examConfig.passingThreshold}%`
                        : 'N/A'}
                    </strong>
                  </div>
                </div>
                {/* Status */}
                <div className="flex items-center gap-2">
                  <MetricStatusIcon className="w-[22px] h-[22px] shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-inter font-medium text-[12px] text-[#45464E] leading-tight">Status</span>
                    {completedData ? (
                      <strong className="font-inter font-medium text-[16px] text-[#421A83] leading-tight">
                        {completedData.passed ? 'PASSED! 🎉' : 'FAILED'}
                      </strong>
                    ) : inProgressData ? (
                      <strong className="font-inter font-medium text-[16px] text-[#421A83] leading-tight">In Progress</strong>
                    ) : (
                      <strong className="font-inter font-medium text-[16px] text-[#421A83] leading-tight">{exam.progress}</strong>
                    )}
                  </div>
                </div>
              </div>

              {/* Buttons — vary by state */}
              <div className="flex flex-wrap gap-3">
                {completedData ? (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/exam/${id}/start${fromLibrary ? '?from=library' : ''}`)}
                      className="h-[48px] font-inter font-regular text-[16px] text-[#421A83] py-[11px] px-10 rounded-[4px] bg-[#FFC92A] hover:opacity-95 transition-opacity"
                    >
                      Retake Exam
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/results/${completedData.attemptId}${fromLibrary ? '?from=library' : ''}`)}
                      className="h-[48px] font-inter font-regular text-[16px] text-[#737373] py-[11px] px-10 rounded-[4px] border border-[#737373] bg-white hover:bg-gray-50 transition-colors"
                    >
                      View Previous Result
                    </button>
                  </>
                ) : inProgressData ? (
                  <>
                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/exam/${id}/start${fromLibrary ? '?from=library' : ''}`)}
                      className="h-[48px] font-inter font-regular text-[16px] text-[#421A83] py-[11px] px-10 rounded-[4px] bg-[#FFC92A] hover:opacity-95 transition-opacity"
                    >
                      Resume Exam
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/exam/${id}/start?restart=true${fromLibrary ? '&from=library' : ''}`)}
                      className="h-[48px] font-inter font-regular text-[16px] text-[#737373] py-[11px] px-10 rounded-[4px] border border-[#737373] bg-white hover:bg-gray-50 transition-colors"
                    >
                      Restart
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/exam/${id}/start${fromLibrary ? '?from=library' : ''}`)}
                    className="h-[48px] font-inter font-regular text-[16px] text-[#421A83] py-[11px] px-10 rounded-[4px] bg-[#FFC92A] hover:opacity-95 transition-opacity"
                  >
                    Start Exam
                  </button>
                )}
              </div>
            </div>

            {/* Exam Breakdown */}
            {reviewer?.examConfig?.sectionDistribution?.length > 0 && (
              <ExamBreakdown
                sectionDistribution={reviewer.examConfig.sectionDistribution}
                totalItems={reviewer.examConfig.totalItems || exam.itemsCount}
                disclaimer={exam.disclaimer}
              />
            )}

            {/* Applicable for */}
            {exam.applicableFor && (
              <p
                className="font-inter text-[14px] text-[#45464E] mb-2"
                data-aos="fade-up"
                data-aos-duration="500"
                data-aos-delay="100"
              >
                Applicable for: <TextWithNewlines as="strong" className="font-inter font-semibold text-[#45464E]">{exam.applicableFor}</TextWithNewlines>
              </p>
            )}

            {/* Access for */}
            {exam.accessFor && (
              <p
                className="font-inter text-[14px] text-[#45464E] mb-4"
                data-aos="fade-up"
                data-aos-duration="500"
                data-aos-delay="100"
              >
                Access: <TextWithNewlines as="strong" className="font-inter font-semibold text-[#45464E]">{exam.accessFor}</TextWithNewlines>
              </p>
            )}

            {/* Section and Topics */}
            <section
              className="pt-2"
              data-aos="fade-up"
              data-aos-duration="500"
              data-aos-delay="150"
            >
              <h2 className="font-inter font-bold text-[18px] text-[#45464E] mb-4">
                Section and Topics
              </h2>
              <ol className="list-decimal list-inside space-y-4 font-inter font-normal text-[16px] text-[#45464E]">
                {(exam.coverage || []).map((item, idx) => (
                  <li key={idx}>
                    <span>
                      <TextWithNewlines>{item.subject}</TextWithNewlines>
                      {item.itemCount ? ` (${item.itemCount})` : ''}
                    </span>
                    <ul className="list-disc list-inside font-normal text-[16px] pl-4">
                      {(item.topics || []).map((topic, i) => (
                        <li key={i}><TextWithNewlines>{topic}</TextWithNewlines></li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>

              {/* Coverage end text */}
              {exam.coverageEndText && (
                <TextWithNewlines as="p" className="font-inter font-normal text-[16px] text-[#45464E] mt-4 leading-[24px]">
                  {exam.coverageEndText}
                </TextWithNewlines>
              )}

              {/* Difficulty text (after coverage) */}
              {exam.difficultyText && (
                <TextWithNewlines as="p" className="font-inter font-normal text-[16px] text-[#45464E] mt-4 leading-[24px]">
                  {exam.difficultyText}
                </TextWithNewlines>
              )}
            </section>
          </div>

          {/* Right column: Important Notes — bottom when wrapped on mobile, right on lg; stretch on lg so sticky has room */}
          <div className="order-2 lg:order-2 lg:flex-shrink-0 lg:max-w-[360px] lg:self-stretch">
            <section
              className="bg-[#ffffff] rounded-[12px] p-[24px] lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto"
              data-aos="fade-up"
              data-aos-duration="500"
              data-aos-delay="200"
            >
              <h2
                className="font-inter font-medium text-[16px] leading-[100%] tracking-[0] text-[#45464E] mb-4 flex items-center gap-[16px]"
              >
                <div className="bg-[#6E43B91A] w-[36px] h-[36px] rounded-[4px] flex items-center justify-center">
                  <ExamNotesLightningIcon className="w-[20px] h-[20px] text-[#6E43B9]" />
                </div>
                Important Notes:
              </h2>
              <ul className="list-disc list-inside space-y-4 pl-1 font-inter text-sm">
                {(exam.importantNotes || []).map((note, idx) => (
                  <li key={idx}>
                    <span className="font-inter font-semibold text-[16px] text-[#45464E] leading-[20px]">{note.title}:{" "}</span>
                    <span className="font-inter font-normal text-[16px] text-[#45464E] leading-[20px]">{note.text}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExamDetails;
