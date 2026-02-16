import React from 'react';
import { Link } from 'react-router-dom';
import DashNav from '../DashNav';
import SkeletonBlock from '../SkeletonBlock';

/**
 * Skeleton that matches the ExamResultsLoading page (AI analyzing state).
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

        <section className="bg-white rounded-[12px] px-[24px] py-[40px] sm:py-[56px]">
          <div className="flex flex-col items-center">
            <SkeletonBlock className="w-[80px] h-[80px] rounded-full mb-10" />
            <SkeletonBlock className="h-6 w-80 max-w-full mb-4" />
            <SkeletonBlock className="h-4 w-full max-w-[550px] mb-3" />
            <SkeletonBlock className="h-4 w-4/5 max-w-[550px] mb-3" />
            <div className="w-full max-w-[640px] space-y-3 mb-4">
              <SkeletonBlock className="h-4 w-full" />
              <SkeletonBlock className="h-4 w-[95%]" />
              <SkeletonBlock className="h-4 w-[90%]" />
              <SkeletonBlock className="h-4 w-full" />
            </div>
            <SkeletonBlock className="h-4 w-3/4 max-w-[550px]" />
          </div>
        </section>
      </main>
    </div>
  );
}
