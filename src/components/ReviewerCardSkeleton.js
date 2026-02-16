import React from 'react';
import SkeletonBlock from './SkeletonBlock';

/**
 * Skeleton loader that exactly matches the layout of a reviewer card.
 * Used in AllReviewers and MyLibrary while data is loading.
 */

const ReviewerCardSkeleton = () => (
  <div className="w-full max-w-[410.67px] min-w-0 bg-white rounded-[12px] p-[24px] text-left shadow-[0px_2px_4px_0px_#00000026] flex flex-col">
    {/* Header: logo + bookmark button */}
    <div className="flex items-start justify-between gap-2 mb-4">
      <SkeletonBlock className="w-[40px] h-[40px] shrink-0" />
      <SkeletonBlock className="w-[40px] h-[40px] shrink-0 rounded-[4px]" />
    </div>

    {/* Title */}
    <SkeletonBlock className="h-5 w-3/4 mb-3" />

    {/* Description: short (bold) line + full lines */}
    <div className="space-y-2 mb-4 flex-1">
      <SkeletonBlock className="h-4 w-1/2" />
      <SkeletonBlock className="h-4 w-full" />
      <SkeletonBlock className="h-4 w-4/5" />
    </div>

    {/* Meta row: items • duration • passing rate • access */}
    <div className="flex flex-wrap items-center gap-[5px] mb-4">
      <SkeletonBlock className="h-4 w-20" />
      <SkeletonBlock className="h-4 w-1" />
      <SkeletonBlock className="h-4 w-16" />
      <SkeletonBlock className="h-4 w-1" />
      <SkeletonBlock className="h-4 w-24" />
    </div>

    {/* CTA button */}
    <SkeletonBlock className="h-[42px] w-[106px] rounded-[8px]" />
  </div>
);

export default ReviewerCardSkeleton;
