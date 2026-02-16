import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import AOS from 'aos';
import DashNav from '../components/DashNav';
import { reviewerAPI, examAPI } from '../services/api';
import { ExamNotesLightningIcon } from '../components/Icons';
import { TextWithNewlines } from '../utils/text';
import ExamDetailsSkeleton from '../components/skeletons/ExamDetailsSkeleton';

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
          examAPI.getUserHistory(),
        ]);
        if (cancelled) return;
        if (revRes.success) setReviewer(revRes.data);
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
          {/* Left column: banner, title, metrics, button, coverage — second when wrapped, first on lg */}
          <div className="order-2 lg:order-1 w-full lg:w-auto lg:flex-1 lg:min-w-0 bg-[#FFFFFF] p-[24px] rounded-[12px]">
            {/* Banner */}
            <div
              className="w-full h-[225px] rounded-tl-[8px] rounded-tr-[8px] bg-gradient-to-br from-[#6E43B9]/20 to-[#421983]/30 flex items-center justify-center"
              data-aos="fade-up"
              data-aos-duration="500"
            >
              {exam.bannerImage ? (
                <img src={exam.bannerImage} alt="" className="w-full h-full object-cover rounded-[12px]" />
              ) : (
                <span className="font-inter text-[#6E43B9]/60 text-sm">Banner image placeholder</span>
              )}
            </div>

            <h1
              className="font-inter font-medium not-italic text-[20px] text-[#45464E] mt-6 mb-[8px]"
              data-aos="fade-up"
              data-aos-duration="500"
              data-aos-delay="50"
            >
              {title}
            </h1>

            {/* Metrics + Start/Resume Exam button */}
            <div
              className="flex flex-wrap items-center justify-between gap-4 sm:gap-0 mb-[24px]"
              data-aos="fade-up"
              data-aos-duration="500"
              data-aos-delay="100"
            >
              <div className="flex flex-wrap items-center gap-4 sm:gap-[96px] font-inter text-sm">
                <span className="font-inter font-medium text-[14px] text-[#45464E]">
                  {inProgressData ? 'Remaining Time' : 'Time'}:<br />
                  <strong className="font-inter font-medium text-[18px] text-[#421A83]">
                    {inProgressData && inProgressData.remainingSeconds != null
                      ? formatRemainingTime(inProgressData.remainingSeconds)
                      : exam.timeFormatted}
                  </strong>
                </span>
                <span className="font-inter font-medium text-[14px] text-[#45464E]">
                  {completedData ? 'Previous Score' : 'No. of items'}:<br />
                  <strong className="font-inter font-medium text-[18px] text-[#421A83]">
                    {completedData
                      ? `${completedData.correct}/${completedData.totalItems}`
                      : inProgressData
                        ? `${inProgressData.answeredCount}/${inProgressData.totalQuestions}`
                        : exam.itemsCount}
                  </strong>
                </span>
                <div className="font-inter font-medium text-[14px] text-[#45464E]">
                  {completedData ? 'Status' : 'Progress'}:<br />
                  {completedData ? (
                    <strong className="font-inter font-medium text-[18px] text-[#421A83]">
                      {completedData.passed ? 'PASSED! 🎉' : 'FAILED'}
                    </strong>
                  ) : inProgressData ? (
                    <div className="mt-1 w-full min-w-[120px] max-w-[200px]">
                      <div className="flex justify-between font-inter font-normal text-[10px] text-[#45464E] mb-1">
                        <span>In Progress</span>
                        <span>{inProgressData.progressPercent}%</span>
                      </div>
                      <div className="h-2 w-full rounded-[20px] bg-[#D9D9D9] overflow-hidden">
                        <div
                          className="h-full rounded-[20px] bg-[#FFC92A] transition-all duration-300"
                          style={{ width: `${inProgressData.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <strong className="font-inter font-medium text-[18px] text-[#421A83]">{exam.progress}</strong>
                  )}
                </div>
              </div>
              <div className="w-full sm:w-auto shrink-0">
                {completedData ? (
                  <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/exam/${id}/start${fromLibrary ? '?from=library' : ''}`)}
                      className="font-inter font-bold text-[16px] text-[#421A83] py-[10.5px] px-8 rounded-[8px] bg-[#FFC92A] hover:opacity-95 transition-opacity flex-1 sm:flex-initial"
                    >
                      Retake Exam
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/review/${completedData.attemptId}${fromLibrary ? '?from=library' : ''}`)}
                      className="font-inter font-bold text-[16px] text-[#421A83] py-[10.5px] px-8 rounded-[8px] bg-[#FFC92A] hover:opacity-95 transition-opacity flex-1 sm:flex-initial"
                    >
                      Review Answers
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/exam/${id}/start${fromLibrary ? '?from=library' : ''}`)}
                    className={`font-inter font-bold text-[16px] text-[#421A83] py-[10.5px] px-8 rounded-[8px] w-full sm:w-auto bg-[#FFC92A] hover:opacity-95 transition-opacity ${!inProgressData ? 'sm:max-w-[150px]' : ''}`}
                  >
                    {inProgressData ? 'Resume Exam' : 'Start Exam'}
                  </button>
                )}
              </div>
            </div>

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

            {/* Intro (short + full) */}
            {(exam.introShort || exam.introFull) && (
              <section
                className="mb-6"
                data-aos="fade-up"
                data-aos-duration="500"
                data-aos-delay="100"
              >
                {exam.introShort && (
                  <TextWithNewlines as="p" className="font-inter font-semibold text-[16px] text-[#45464E] mb-2">{exam.introShort}</TextWithNewlines>
                )}
                {exam.introFull && (
                  <TextWithNewlines as="p" className="font-inter font-normal text-[16px] text-[#45464E] leading-[24px]">{exam.introFull}</TextWithNewlines>
                )}
              </section>
            )}

            {/* Coverage / Subjects */}
            <section
              data-aos="fade-up"
              data-aos-duration="500"
              data-aos-delay="150"
            >
              <h2 className="font-inter font-semibold text-[16px] text-[#45464E] mb-4">
                Coverage/Subjects:
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

              {/* Disclaimer */}
              {exam.disclaimer && (
                <TextWithNewlines as="p" className="font-inter font-normal italic text-[12px] text-[#6C737F] mt-6 leading-[22px]">
                  {exam.disclaimer}
                </TextWithNewlines>
              )}
            </section>
          </div>

          {/* Right column: Important Notes — first when wrapped, right on lg; no max-width when wrapped; stretch on lg so sticky has room */}
          <div className="order-1 lg:order-2 lg:flex-shrink-0 lg:max-w-[360px] lg:self-stretch">
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
                    <TextWithNewlines as="span" className="font-inter font-semibold text-[16px] text-[#45464E] leading-[20px]">{note.title}: </TextWithNewlines>
                    <TextWithNewlines as="span" className="font-inter font-normal text-[16px] text-[#45464E] leading-[20px]">{note.text}</TextWithNewlines>
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
