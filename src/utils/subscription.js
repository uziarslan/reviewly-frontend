const PAID_PLANS = new Set(['weekly', 'monthly', 'quarterly', 'premium']);

/**
 * Whether the user currently has an active premium plan (any paid tier with
 * an unexpired expiry). Mirrors the server-side helper so paywall logic stays
 * in sync.
 */
export function isPremiumActive(user) {
  if (!user) return false;
  const plan = user.subscription?.plan;
  if (!plan || !PAID_PLANS.has(plan)) return false;
  const expiresAt = user.subscription?.expiresAt
    ? new Date(user.subscription.expiresAt)
    : null;
  if (!expiresAt) return true;
  return expiresAt.getTime() > Date.now();
}

/**
 * Check if user can access a premium reviewer based on subscription.
 * Returns false (show Upgrade to Premium) when:
 * - Not authenticated
 * - Has free plan
 * - Subscription start date is in the future (not met yet)
 * - Subscription end date is in the past (expired)
 *
 * @param {Object} reviewer - The reviewer/card object (must have access: 'free' | 'premium')
 * @param {Object} opts - { isAuthenticated: boolean, user: object }
 * @returns {boolean}
 */
export function canAccessReviewer(reviewer, { isAuthenticated, user }) {
  if (reviewer.access === 'free') return true;
  if (!isAuthenticated) return false;

  const plan = user?.subscription?.plan || 'free';
  if (!PAID_PLANS.has(plan)) return false;

  const now = new Date();
  const startDate = user?.subscription?.startDate ? new Date(user.subscription.startDate) : null;
  const expiresAt = user?.subscription?.expiresAt ? new Date(user.subscription.expiresAt) : null;

  if (startDate && now < startDate) return false;  // subscription not started yet
  if (expiresAt && now > expiresAt) return false;  // subscription expired

  return true;
}
