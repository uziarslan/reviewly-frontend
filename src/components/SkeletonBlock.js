/**
 * Reusable skeleton block for shimmer loading states.
 */
const SkeletonBlock = ({ className = '' }) => (
  <div className={`skeleton-shimmer rounded ${className}`} aria-hidden="true" />
);

export default SkeletonBlock;
