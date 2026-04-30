import React from 'react';
import DashNav from '../DashNav';
import SkeletonBlock from '../SkeletonBlock';

/**
 * Skeleton loader for the actual dashboard page layout.
 */
export default function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-[#F5F4FF]">
            <DashNav />
            <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 pt-6 pb-16">
                <div className="flex flex-col lg:flex-row gap-5">
                    <div className="flex-1 flex flex-col gap-5">
                        <SkeletonBlock className="h-[220px] rounded-[16px]" />
                        <SkeletonBlock className="h-[260px] rounded-[16px]" />
                        <SkeletonBlock className="h-[380px] rounded-[16px]" />
                    </div>
                    <div className="w-full lg:w-[300px] xl:w-[360px] flex flex-col gap-5">
                        <SkeletonBlock className="h-[260px] rounded-[16px]" />
                        <SkeletonBlock className="h-[180px] rounded-[16px]" />
                    </div>
                </div>
            </main>
        </div>
    );
}
