import React from 'react';
import SkeletonBlock from './SkeletonBlock';

/**
 * Skeleton loader that matches the "No Bookmarked Reviewer Yet" empty state layout.
 * Used when loading state is ambiguous (e.g. empty library).
 */

const EmptyStateSkeleton = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <SkeletonBlock className="w-[140px] h-[140px] rounded-full mb-[40px]" />
    <SkeletonBlock className="h-6 w-64 mb-3 mx-auto" />
    <SkeletonBlock className="h-4 w-80 mb-0 mx-auto" />
  </div>
);

export default EmptyStateSkeleton;
