import React from 'react';
import { Link } from 'react-router-dom';
import DashNav from '../DashNav';
import SkeletonBlock from '../SkeletonBlock';

/**
 * Skeleton that matches the ExamResultsLoading page layout.
 */
export default function ExamResultsLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      <DashNav />
      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 pt-[24px] pb-[40px]">
        <nav className="mb-[24px] flex items-center gap-2">
          <Link to="/dashboard/all-reviewers" className="text-[#45464E] text-sm hover:text-[#6E43B9]">
            All Reviewers
          </Link>
          <span className="text-[#45464E]">›</span>
          <SkeletonBlock className="h-4 w-48 inline-block" />
        </nav>

        <SkeletonBlock className="h-6 w-64 mb-6" />

        <section className="bg-white rounded-[16px] p-[24px] sm:p-[40px] max-w-[620px] mx-auto shadow-sm">
          <SkeletonBlock className="h-7 w-[260px] mb-4" />
          <SkeletonBlock className="h-4 w-[420px] max-w-full mb-6" />

          <div className="space-y-3 mb-[24px]">
            {[0, 1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex items-center gap-[16px] p-[16px] rounded-[12px] border ${step === 0 ? 'border-[#E5E7EB] bg-white shadow-sm' : 'border-[#F3F4F6] bg-[#FAFAFA]'} animate-pulse`}
              >
                <SkeletonBlock className="w-[24px] h-[24px] rounded-full" />
                <div className="flex-1 min-w-0 space-y-2">
                  <SkeletonBlock className="h-4 w-2/5" />
                  <SkeletonBlock className="h-3 w-4/5" />
                </div>
              </div>
            ))}
          </div>

          <SkeletonBlock className="h-4 w-3/4 max-w-[550px]" />
        </section>
      </main>
    </div>
  );
}
