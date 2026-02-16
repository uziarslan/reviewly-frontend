import React from 'react';
import DashNav from '../DashNav';
import SkeletonBlock from '../SkeletonBlock';

/**
 * Base skeleton for dashboard pages with header (title + search) and content area.
 * Used for ProtectedRoute auth loading and as base for list pages.
 */
export default function DashboardPageSkeleton() {
  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      <DashNav />
      <main className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 pt-0 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 my-6">
          <SkeletonBlock className="h-6 w-40" />
          <SkeletonBlock className="h-10 w-full max-w-[320px] rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-[24px] justify-items-center">
          {[...Array(6)].map((_, i) => (
            <SkeletonBlock key={i} className="w-full max-w-[410px] h-[320px] rounded-[12px]" />
          ))}
        </div>
      </main>
    </div>
  );
}
