import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import DashNav from '../components/DashNav';
import { CURRENT_REVIEWERS, REVIEWER_LOGO_MAP } from '../data/reviewers';
import { BookmarkFilledIcon, BookmarkOutlineIcon, SearchIcon, LockIcon } from '../components/Icons';

const LIBRARY_STORAGE_KEY = 'reviewly_library_ids';

function getStoredLibraryIds() {
  try {
    const s = localStorage.getItem(LIBRARY_STORAGE_KEY);
    if (s) {
      const a = JSON.parse(s);
      if (Array.isArray(a)) return new Set(a.map(Number).filter(Boolean));
    }
  } catch (_) {}
  return new Set([1]);
}

function setStoredLibraryIds(ids) {
  try {
    localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify([...ids]));
  } catch (_) {}
}

const AllReviewers = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [libraryIds, setLibraryIds] = useState(getStoredLibraryIds);

  useEffect(() => {
    AOS.refresh();
  }, []);

  const filtered = useMemo(() => {
    const list = CURRENT_REVIEWERS.filter((card) => card.status === 'published');
    if (!search.trim()) return list;
    const q = search.trim().toLowerCase();
    return list.filter(
      (card) =>
        card.title.toLowerCase().includes(q) ||
        (card.type && String(card.type).toLowerCase().includes(q))
    );
  }, [search]);

  useEffect(() => {
    setStoredLibraryIds(libraryIds);
  }, [libraryIds]);

  const toggleLibrary = (id) => {
    setLibraryIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-[24px] justify-items-center">
          {filtered.map((card, index) => {
            const logoSrc = REVIEWER_LOGO_MAP[card.logo.filename] ?? card.logo.path;
            const { details } = card;
            const inLibrary = libraryIds.has(card.id);
            return (
              <div
                key={card.slug}
                className="w-full max-w-[410.67px] min-w-0 bg-white rounded-[12px] p-[24px] text-left shadow-[0px_2px_4px_0px_#00000026] flex flex-col"
                data-aos="fade-up"
                data-aos-duration="500"
                data-aos-delay={100 + index * 50}
              >
                <div className="flex items-start justify-between gap-2 mb-4">
                  <img src={logoSrc} alt="" className="w-[40px] h-[40px] shrink-0 object-cover" />
                  <div className="relative group">
                    <button
                      type="button"
                      onClick={() => toggleLibrary(card.id)}
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
                  <span className="font-semibold">{card.description.short}</span>
                  <br />
                  {card.description.full}
                </p>
                <div className="flex flex-wrap items-center gap-[5px] text-sm text-[#0F172A] mb-4">
                  <span className="inline-flex items-center gap-1.5 font-inter font-normal not-italic text-[14px] text-[#45464E]">
                    📝 {details.items}
                  </span>
                  <span className="text-[#45464E] font-inter font-normal not-italic text-[14px]">•</span>
                  <span className="inline-flex items-center gap-1.5 font-inter font-normal not-italic text-[14px] text-[#45464E]">
                    ⏱️ {details.duration}
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

export default AllReviewers;
