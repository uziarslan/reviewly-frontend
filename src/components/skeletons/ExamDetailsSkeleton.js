import React from 'react';
import DashNav from '../DashNav';
import SkeletonBlock from '../SkeletonBlock';

/**
 * Skeleton that matches the ExamDetails page layout.
 */
export default function ExamDetailsSkeleton() {
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

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-[24px] items-start">
          {/* Left column */}
          <div className="order-2 lg:order-1 w-full lg:flex-1 lg:min-w-0 bg-white p-[24px] rounded-[12px]">
            {/* Banner */}
            <SkeletonBlock className="w-full h-[225px] rounded-[8px] mb-6" />

            {/* Title */}
            <SkeletonBlock className="h-6 w-3/4 mb-6" />

            {/* Metrics row */}
            <div className="flex flex-wrap gap-6 sm:gap-16 mb-6">
              <div>
                <SkeletonBlock className="h-4 w-12 mb-1" />
                <SkeletonBlock className="h-5 w-16" />
              </div>
              <div>
                <SkeletonBlock className="h-4 w-20 mb-1" />
                <SkeletonBlock className="h-5 w-12" />
              </div>
              <div>
                <SkeletonBlock className="h-4 w-16 mb-1" />
                <SkeletonBlock className="h-5 w-20" />
              </div>
            </div>
            <SkeletonBlock className="h-11 w-[150px] rounded-[8px] mb-8" />

            {/* Coverage */}
            <SkeletonBlock className="h-5 w-36 mb-4" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}>
                  <SkeletonBlock className="h-4 w-full mb-2" />
                  <div className="pl-4 space-y-1">
                    <SkeletonBlock className="h-4 w-4/5" />
                    <SkeletonBlock className="h-4 w-3/5" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column - Important Notes */}
          <div className="order-1 lg:order-2 w-full lg:w-[360px] lg:flex-shrink-0">
            <div className="bg-white rounded-[12px] p-[24px]">
              <div className="flex items-center gap-4 mb-4">
                <SkeletonBlock className="w-9 h-9 rounded-[4px] shrink-0" />
                <SkeletonBlock className="h-5 w-32" />
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-2">
                    <SkeletonBlock className="h-4 w-24 shrink-0" />
                    <SkeletonBlock className="h-4 flex-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
