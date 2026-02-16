import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AOS from 'aos';
import DashNav from '../components/DashNav';
import { REVIEWER_LOGO_MAP } from '../data/reviewers';
import { BookmarkFilledIcon, SearchIcon, LockIcon, PaperIcon } from '../components/Icons';
import ReviewerCardSkeleton from '../components/ReviewerCardSkeleton';
import { libraryAPI, examAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { canAccessReviewer } from '../utils/subscription';

const MyLibrary = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [search, setSearch] = useState('');
  const [libraryCards, setLibraryCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inProgressMap, setInProgressMap] = useState({}); // { reviewerId: { attemptId, answeredCount, totalQuestions, progressPercent } }
  const [completedReviewerIds, setCompletedReviewerIds] = useState(new Set()); // reviewer IDs with submitted attempts

  // Fetch library and in-progress attempts on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const [libRes, histRes] = await Promise.all([
          libraryAPI.get(),
          examAPI.getUserHistory(),
        ]);
        if (cancelled) return;
        if (libRes.success) setLibraryCards(libRes.data);
        if (histRes.success) {
          const ipMap = {};
          const completed = new Set();
          histRes.data.forEach((attempt) => {
            const revId = String(attempt.reviewer?._id || attempt.reviewer);
            if (attempt.status === 'in_progress') {
              ipMap[revId] = {
                attemptId: attempt._id,
                answeredCount: attempt.progress?.answeredCount || 0,
                totalQuestions: attempt.progress?.totalQuestions || 0,
                progressPercent: attempt.progress?.progressPercent || 0,
              };
            } else if (attempt.status === 'submitted' || attempt.status === 'timed_out') {
              completed.add(revId);
            }
          });
          setInProgressMap(ipMap);
          setCompletedReviewerIds(completed);
        }
      } catch (err) {
        console.error('Failed to load library:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    AOS.refresh();
  }, [libraryCards]);

  const filtered = useMemo(() => {
    if (!search.trim()) return libraryCards;
    const q = search.trim().toLowerCase();
    return libraryCards.filter(
      (card) =>
        card.title.toLowerCase().includes(q) ||
        (card.type && String(card.type).toLowerCase().includes(q))
    );
  }, [libraryCards, search]);

  const checkAccess = (reviewer) => canAccessReviewer(reviewer, { isAuthenticated, user });

  const removeFromLibrary = async (id) => {
    // Optimistic removal
    setLibraryCards((prev) => prev.filter((c) => c._id !== id));
    try {
      await libraryAPI.remove(id);
    } catch (err) {
      console.error('Remove failed:', err);
      // Re-fetch on error
      try {
        const res = await libraryAPI.get();
        if (res.success) setLibraryCards(res.data);
      } catch (_) { }
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      <DashNav />
      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 pt-0 pb-16">
        <div
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 my-6"
          data-aos="fade-up"
          data-aos-duration="500"
          data-aos-delay="0"
        >
          <h1 className="font-inter font-medium text-[20px] text-[#45464E] leading-tight">
            My Library
          </h1>
          <div className="relative w-full max-w-[320px]">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px]" />
            <input
              type="search"
              placeholder="Search subject or exam type"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-4 py-2 font-inter font-normal text-base text-[#0F172A] placeholder:font-normal placeholder:text-[16px] placeholder:text-[#ABAFB1] border border-[#CFD3D4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6E43B9]/30 focus:border-[#6E43B9]"
              aria-label="Search subject or exam type"
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-[24px] justify-items-center">
            {[...Array(6)].map((_, i) => (
              <ReviewerCardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-[140px] h-[140px] border-[1px] border-[#E1E2E9] rounded-full bg-[#F4F5FA] flex items-center justify-center mb-[40px]">
              <PaperIcon className="w-[60px] h-[60px] text-[#9CA3AF]" />
            </div>
            <h2 className="font-inter font-medium text-[20px] text-center mb-[12px]">
              No Bookmarked Reviewer Yet
            </h2>
            <p className="font-inter font-normal text-[14px] text-center text-[#8B8D97] mb-0">
              Get started by bookmarking or taking any exam to add them here!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-[24px] justify-items-center">
            {filtered.map((card, index) => {
              const logoSrc = card.logo?.filename && REVIEWER_LOGO_MAP[card.logo.filename]
                ? REVIEWER_LOGO_MAP[card.logo.filename]
                : (card.logo?.path ?? null);
              const details = card.details || {};
              const inProgressData = inProgressMap[String(card._id)];
              const inProgress = !!inProgressData;
              const hasCompleted = completedReviewerIds.has(String(card._id));
              return (
                <div
                  key={card._id}
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
                        onClick={() => removeFromLibrary(card._id)}
                        className="p-[7px] rounded-[4px] w-[40px] h-[40px] bg-[#7D52CC1A] transition-colors flex items-center justify-center"
                        aria-label="Remove from library"
                      >
                        <BookmarkFilledIcon className="w-[25px] h-[25px]" />
                      </button>
                      <span
                        role="tooltip"
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 py-1 px-2 font-inter font-medium text-[10px] text-white bg-[#616161E5] rounded-[4px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 align-middle"
                      >
                        Remove from library
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
                  {!checkAccess(card) ? (
                    <div className="flex flex-col items-start gap-2">
                      <button
                        type="button"
                        className="w-[205px] font-inter font-semibold text-[#421A83] text-[14px] sm:text-[16px] py-3 rounded-[8px] bg-[#FFC92A] hover:opacity-95 transition-opacity flex items-center justify-center gap-2"
                      >
                        <LockIcon className="w-[18px] h-[21px] shrink-0" />
                        Upgrade to Premium
                      </button>
                      {!isAuthenticated && (
                        <p className="font-inter font-normal text-[12px] text-[#6C737F]">
                          <Link to="/" className="text-[#6E43B9] font-semibold hover:underline">
                            Sign in
                          </Link>
                          {' '}to access
                        </p>
                      )}
                    </div>
                  ) : inProgress ? (
                    <div className="flex items-start justify-start gap-6 w-full">
                      <button
                        type="button"
                        onClick={() => navigate(`/dashboard/exam/${card._id}?from=library`)}
                        className="font-inter font-semibold text-[#421A83] text-[14px] sm:text-[16px] py-3 px-4 rounded-[8px] bg-[#FFC92A] hover:opacity-95 transition-opacity shrink-0"
                      >
                        Resume Exam
                      </button>
                      <div className="flex-1 min-w-0">
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
                    </div>
                  ) : hasCompleted ? (
                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/exam/${card._id}?from=library`)}
                      className="max-w-[106px] font-inter font-semibold text-[#421A83] text-[14px] sm:text-[16px] py-3 rounded-[8px] bg-[#FFC92A] hover:opacity-95 transition-opacity"
                    >
                      View Exam
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/exam/${card._id}?from=library`)}
                      className="max-w-[106px] font-inter font-semibold text-[#421A83] text-[14px] sm:text-[16px] py-3 rounded-[8px] bg-[#FFC92A] hover:opacity-95 transition-opacity"
                    >
                      Take Exam
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyLibrary;
