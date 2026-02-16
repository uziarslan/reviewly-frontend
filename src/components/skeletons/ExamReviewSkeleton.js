import React from 'react';
import DashNav from '../DashNav';
import SkeletonBlock from '../SkeletonBlock';

/**
 * Skeleton that matches the ExamReview page layout.
 */
export default function ExamReviewSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      <DashNav />
      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 pt-[24px] pb-[40px]">
        {/* Breadcrumbs */}
        <nav className="mb-[24px] flex items-center gap-2">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-4 w-4 shrink-0" />
          <SkeletonBlock className="h-4 w-48" />
        </nav>

        <SkeletonBlock className="h-6 w-64 mb-6" />

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-[24px] items-start">
          {/* Left: Question card */}
          <div className="order-1 w-full lg:flex-1 lg:min-w-0 bg-white p-[24px] rounded-[12px]">
            <SkeletonBlock className="h-4 w-full mb-4" />
            <SkeletonBlock className="h-4 w-5/6 mb-6" />
            <div className="space-y-4 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <SkeletonBlock className="w-5 h-5 shrink-0 rounded-full" />
                  <SkeletonBlock className="h-4 flex-1" />
                </div>
              ))}
            </div>
            <SkeletonBlock className="h-16 w-full rounded-[8px] mb-4" />
            <SkeletonBlock className="h-12 w-3/4 rounded-[8px] mb-8" />
            <div className="flex justify-end gap-2 pt-4 border-t border-[#F2F4F7]">
              <SkeletonBlock className="h-10 w-24 rounded-[8px]" />
              <SkeletonBlock className="h-10 w-20 rounded-[8px]" />
            </div>
          </div>

          {/* Right: Overall Performance */}
          <div className="order-2 w-full lg:w-[404px] lg:flex-shrink-0">
            <div className="bg-white rounded-[12px] p-[24px]">
              <SkeletonBlock className="h-4 w-40 mb-4" />
              <SkeletonBlock className="h-5 w-32 mb-2" />
              <SkeletonBlock className="h-5 w-24 mb-4" />
              <SkeletonBlock className="h-5 w-28 mb-6" />
              <div className="flex gap-4 mb-4">
                <SkeletonBlock className="w-8 h-8 rounded-[4px]" />
                <SkeletonBlock className="w-8 h-8 rounded-[4px]" />
              </div>
              <div className="grid grid-cols-10 gap-1">
                {Array.from({ length: 30 }, (_, i) => (
                  <SkeletonBlock key={i} className="w-8 h-8 rounded-[4px]" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
