import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AOS from 'aos';
import DashNav from '../components/DashNav';
import { REVIEWER_LOGO_MAP } from '../data/reviewers';
import { BookmarkFilledIcon, BookmarkOutlineIcon, SearchIcon, LockIcon } from '../components/Icons';
import ReviewerCardSkeleton from '../components/ReviewerCardSkeleton';
import { reviewerAPI, libraryAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { canAccessReviewer } from '../utils/subscription';

const AllReviewers = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [search, setSearch] = useState('');
  const [reviewers, setReviewers] = useState([]);
  const [libraryIds, setLibraryIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [togglingIds, setTogglingIds] = useState(new Set());

  // Fetch reviewers and library on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      try {
        const [revRes, libRes] = await Promise.all([
          reviewerAPI.getAll(),
          isAuthenticated ? libraryAPI.get() : Promise.resolve({ success: true, data: [] }),
        ]);
        if (cancelled) return;
        if (revRes.success) setReviewers(revRes.data);
        if (libRes.success) {
          setLibraryIds(new Set(libRes.data.map((r) => r._id)));
        }
      } catch (err) {
        console.error('Failed to load reviewers:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  useEffect(() => {
    AOS.refresh();
  }, [reviewers]);

  const filtered = useMemo(() => {
    if (!search.trim()) return reviewers;
    const q = search.trim().toLowerCase();
    return reviewers.filter(
      (card) =>
        card.title.toLowerCase().includes(q) ||
        (card.type && String(card.type).toLowerCase().includes(q))
    );
  }, [search, reviewers]);

  const toggleLibrary = useCallback(async (id) => {
    if (togglingIds.has(id)) return;
    setTogglingIds((prev) => new Set(prev).add(id));
    const inLibrary = libraryIds.has(id);
    // Optimistic update
    setLibraryIds((prev) => {
      const next = new Set(prev);
      if (inLibrary) next.delete(id);
      else next.add(id);
      return next;
    });
    try {
      if (inLibrary) {
        await libraryAPI.remove(id);
      } else {
        await libraryAPI.add(id);
      }
    } catch (err) {
      // Revert on error
      console.error('Library toggle failed:', err);
      setLibraryIds((prev) => {
        const next = new Set(prev);
        if (inLibrary) next.add(id);
        else next.delete(id);
        return next;
      });
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [libraryIds, togglingIds]);

  const checkAccess = (reviewer) => canAccessReviewer(reviewer, { isAuthenticated, user });

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
            All Reviewers
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
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-[24px] justify-items-center">
            {filtered.map((card, index) => {
              const logoSrc = card.logo?.filename && REVIEWER_LOGO_MAP[card.logo.filename]
                ? REVIEWER_LOGO_MAP[card.logo.filename]
                : (card.logo?.path ?? null);
              const details = card.details || {};
              const inLibrary = libraryIds.has(card._id);
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
                        onClick={() => toggleLibrary(card._id)}
                        className={`p-[7px] rounded-[4px] w-[40px] h-[40px] ${inLibrary ? 'bg-[#7D52CC1A]' : 'bg-[#F4F4F4]'
                          } transition-colors flex items-center justify-center`}
                        aria-label={inLibrary ? 'Remove from library' : 'Add to library'}
                      >
                        {inLibrary ? (
                          <BookmarkFilledIcon className="w-[25px] h-[25px]" />
                        ) : (
                          <BookmarkOutlineIcon className="w-[25px] h-[25px]" />
                        )}
                      </button>
                      <span
                        role="tooltip"
                        className="absolute left-1/2 -translate-x-1/2 top-full mt-2 py-1 px-2 font-inter font-medium text-[10px] text-white bg-[#616161E5] rounded-[4px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 align-middle"
                      >
                        {inLibrary ? 'Remove from library' : 'Add to library'}
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
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate(`/dashboard/exam/${card._id}`)}
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

export default AllReviewers;
