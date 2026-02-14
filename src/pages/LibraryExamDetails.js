import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AOS from 'aos';
import DashNav from '../components/DashNav';
import { reviewerAPI, examAPI } from '../services/api';
import { ExamNotesLightningIcon } from '../components/Icons';

const LibraryExamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reviewer, setReviewer] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { setLoading(false); return; }
    let cancelled = false;

    Promise.all([
      reviewerAPI.getById(id),
      examAPI.getReviewerProgress(id),
    ])
      .then(([revRes, progRes]) => {
        if (cancelled) return;
        if (revRes.success) setReviewer(revRes.data);
        if (progRes.success) setProgress(progRes.data);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [id]);

  const exam = reviewer?.examDetails;

  useEffect(() => {
    AOS.refresh();
  }, [reviewer, progress]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <DashNav />
        <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 py-8 flex items-center justify-center">
          <div className="w-[48px] h-[48px] rounded-full border-[4px] border-[#6E43B9] border-t-transparent animate-spin" />
        </main>
      </div>
    );
  }

  if (!reviewer || !exam) {
    return (
      <div className="min-h-screen bg-white">
        <DashNav />
        <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 py-8">
          <p className="font-inter text-[#45464E]">Reviewer not found.</p>
          <Link to="/dashboard/library" className="font-inter text-[#6E43B9] hover:underline mt-4 inline-block">
            Back to My Library
          </Link>
        </main>
      </div>
    );
  }

  const { title } = reviewer;
  const ip = progress?.inProgress;
  const hasInProgress = !!ip;
  const progressPercent = ip?.progressPercent || 0;

  const handleStartOrResume = () => {
    navigate(`/dashboard/exam/${id}/start`);
  };

  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      <DashNav />
      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 pt-[24px] pb-[40px]">
        {/* Breadcrumbs */}
        <nav className="mb-[24px]" aria-label="Breadcrumb">
          <Link
            to="/dashboard/library"
            className="text-[#45464E] font-inter font-normal not-italic text-[14px] hover:text-[#6E43B9] transition-colors"
          >
            My Library
          </Link>
          <span className="mx-2">›</span>
          <span className="text-[#6E43B9] font-inter font-normal not-italic text-[14px]">{title}</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-[24px] items-start">
          {/* Left column */}
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

            {/* Metrics + Start/Resume button */}
            <div
              className="flex flex-wrap items-center justify-between gap-4 sm:gap-0 mb-[24px]"
              data-aos="fade-up"
              data-aos-duration="500"
              data-aos-delay="100"
            >
              <div className="flex flex-wrap items-center gap-4 sm:gap-[96px] font-inter text-sm">
                <span className="font-inter font-medium text-[14px] text-[#45464E]">
                  Total Attempts:<br />
                  <strong className="font-inter font-medium text-[18px] text-[#421A83]">{progress?.totalAttempts ?? 0}</strong>
                </span>
                <span className="font-inter font-medium text-[14px] text-[#45464E]">
                  Best Score:<br />
                  <strong className="font-inter font-medium text-[18px] text-[#421A83]">
                    {progress?.bestScore != null ? `${progress.bestScore}%` : '—'}
                  </strong>
                </span>
                <span className="font-inter font-medium text-[14px] text-[#45464E]">
                  Avg Score:<br />
                  <strong className="font-inter font-medium text-[18px] text-[#421A83]">
                    {progress?.avgScore != null ? `${progress.avgScore}%` : '—'}
                  </strong>
                </span>
                <span className="font-inter font-medium text-[14px] text-[#45464E]">
                  Pass Rate:<br />
                  <strong className="font-inter font-medium text-[18px] text-[#421A83]">
                    {progress?.totalAttempts > 0
                      ? `${progress.passCount}/${progress.totalAttempts}`
                      : '—'}
                  </strong>
                </span>
              </div>
              <button
                type="button"
                onClick={handleStartOrResume}
                className="font-inter font-bold text-[16px] text-[#421A83] py-[10.5px] px-8 rounded-[8px] w-full sm:w-auto sm:max-w-[180px] bg-[#FFC92A] hover:opacity-95 transition-opacity shrink-0"
              >
                {hasInProgress ? 'Resume Exam' : 'Start Exam'}
              </button>
            </div>

            {/* In-Progress Bar */}
            {hasInProgress && (
              <div
                className="mb-[24px]"
                data-aos="fade-up"
                data-aos-duration="500"
                data-aos-delay="120"
              >
                <div className="bg-[#F5F4FF] rounded-[12px] p-[20px]">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-inter font-semibold text-[14px] text-[#45464E]">Current Attempt Progress</h3>
                    <span className="font-inter font-semibold text-[14px] text-[#421A83]">{progressPercent}%</span>
                  </div>
                  <div className="h-3 w-full rounded-[20px] bg-[#D9D9D9] overflow-hidden mb-2">
                    <div
                      className="h-full rounded-[20px] bg-[#FFC92A] transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between font-inter font-normal text-[12px] text-[#64748B] mb-3">
                    <span>{ip.answeredCount} of {ip.totalQuestions} questions answered</span>
                    <span>Question {ip.currentIndex + 1} of {ip.totalQuestions}</span>
                  </div>
                  {ip.remainingSeconds != null && (
                    <div className="flex justify-between items-center pt-3 border-t border-[#E1E2E9]">
                      <span className="font-inter font-normal text-[12px] text-[#64748B]">Time remaining:</span>
                      <span className="font-inter font-semibold text-[14px] text-[#421A83]">
                        {(() => {
                          const secs = ip.remainingSeconds;
                          const h = Math.floor(secs / 3600);
                          const m = Math.floor((secs % 3600) / 60);
                          const s = secs % 60;
                          return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Past Attempts History */}
            {progress?.history?.length > 0 && (
              <section
                data-aos="fade-up"
                data-aos-duration="500"
                data-aos-delay="150"
              >
                <h2 className="font-inter font-semibold text-[16px] text-[#45464E] mb-4">
                  Past Attempts
                </h2>
                <div className="space-y-3">
                  {progress.history.map((attempt, idx) => (
                    <div
                      key={attempt.attemptId}
                      className="flex items-center justify-between p-4 rounded-[8px] border border-[#E1E2E9] bg-white"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-[40px] h-[40px] rounded-full flex items-center justify-center text-white font-inter font-bold text-[14px] ${
                          attempt.passed ? 'bg-[#22C55E]' : 'bg-[#EF4444]'
                        }`}>
                          {attempt.passed ? '✓' : '✗'}
                        </div>
                        <div>
                          <p className="font-inter font-medium text-[14px] text-[#45464E]">
                            Attempt #{progress.history.length - idx}
                          </p>
                          <p className="font-inter font-normal text-[12px] text-[#64748B]">
                            {attempt.submittedAt
                              ? new Date(attempt.submittedAt).toLocaleDateString('en-US', {
                                  year: 'numeric', month: 'short', day: 'numeric',
                                  hour: '2-digit', minute: '2-digit',
                                })
                              : '—'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-4">
                        <div>
                          <p className={`font-inter font-bold text-[18px] ${attempt.passed ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                            {attempt.percentage}%
                          </p>
                          <p className="font-inter font-normal text-[12px] text-[#64748B]">
                            {attempt.correct}/{attempt.totalItems} correct
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/dashboard/results/${attempt.attemptId}`)}
                          className="font-inter font-medium text-[13px] text-[#6E43B9] hover:underline"
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Coverage / Subjects */}
            <section
              className="mt-6"
              data-aos="fade-up"
              data-aos-duration="500"
              data-aos-delay="200"
            >
              <h2 className="font-inter font-semibold text-[16px] text-[#45464E] mb-4">
                Coverage/Subjects:
              </h2>
              <ol className="list-decimal list-inside space-y-4 font-inter font-normal text-[16px] text-[#45464E]">
                {exam.coverage.map((item, idx) => (
                  <li key={idx}>
                    <span>
                      {item.subject} ({item.itemCount}):
                    </span>
                    <ul className="list-disc list-inside font-normal text-[16px] pl-4">
                      {item.topics.map((topic, i) => (
                        <li key={i}>{topic}</li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </section>
          </div>

          {/* Right column: Important Notes + Exam Info */}
          <div className="order-1 lg:order-2 lg:flex-shrink-0 lg:max-w-[360px] lg:self-stretch space-y-4">
            {/* Exam Info Card */}
            <div
              className="bg-[#ffffff] rounded-[12px] p-[24px]"
              data-aos="fade-up"
              data-aos-duration="500"
              data-aos-delay="150"
            >
              <h2 className="font-inter font-medium text-[16px] text-[#45464E] mb-4">Exam Info</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-inter font-normal text-[14px] text-[#64748B]">Time</span>
                  <span className="font-inter font-semibold text-[14px] text-[#421A83]">{exam.timeFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-inter font-normal text-[14px] text-[#64748B]">No. of Items</span>
                  <span className="font-inter font-semibold text-[14px] text-[#421A83]">{exam.itemsCount}</span>
                </div>
                {exam.passingScore != null && (
                  <div className="flex justify-between">
                    <span className="font-inter font-normal text-[14px] text-[#64748B]">Passing Score</span>
                    <span className="font-inter font-semibold text-[14px] text-[#421A83]">{exam.passingScore}%</span>
                  </div>
                )}
              </div>
            </div>

            {/* Important Notes */}
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
                {exam.importantNotes.map((note, idx) => (
                  <li key={idx}>
                    <span className="font-inter font-semibold text-[16px] text-[#45464E] leading-[20px]">{note.title}: </span>
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

export default LibraryExamDetails;
