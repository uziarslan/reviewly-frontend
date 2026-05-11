import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Variant copy for the premium paywall modal. Mirrors the spec's context
 * variants — keep the wording in sync with the upgrade page.
 */
const VARIANTS = {
  default: {
    title: 'Unlock your path to passing',
    subtitle: "You've seen your score. Now fix your weak areas and improve until the exam.",
    support: "You're close — don't waste this momentum.",
    cta: 'Unlock Premium',
  },
  after_plan_generation: {
    title: 'Your 7-day path is ready',
    subtitle: 'You can see the plan. Unlock Premium to start the tasks and begin improving.',
    support: 'Follow guided daily tasks focused on your weakest areas until the exam.',
    cta: 'Unlock Premium',
  },
  start_sprint_task: {
    title: 'Unlock this sprint task',
    subtitle: 'This task is part of your personalized plan to fix weak areas and improve your score.',
    support: 'Premium lets you complete guided tasks, focused drills, and track progress until the exam.',
    cta: 'Unlock Premium',
  },
  additional_mock: {
    title: 'Unlock more mock exams',
    subtitle: 'Your free mock helps you check your starting point. Premium gives you more mock sets to measure progress and build exam confidence.',
    support: '',
    cta: 'Unlock More Mocks',
  },
  regenerate_sprint: {
    title: 'Generate a fresh 7-day plan',
    subtitle: "You've completed a sprint. Premium lets you generate a brand-new plan based on your latest performance.",
    support: 'Keep the momentum going — your next plan is one click away.',
    cta: 'Unlock Premium',
  },
};

const BENEFITS = [
  '7-day plan you can regenerate anytime',
  'Guided daily tasks focused on your weakest areas',
  'Focused drills to fix weak topics faster',
  'Multiple full mock exams (different sets)',
  'Track your progress as your score improves over time',
  'Review answers with clear explanations',
];

const HEADER_GRADIENT =
  'linear-gradient(98.48deg, #8156D1 2.51%, #421983 47.46%, #4945B3 107.59%)';

/**
 * Premium paywall modal. Closes on backdrop click / ESC / explicit close.
 * Primary CTA navigates to /pricing/upgrade.
 */
export default function PaywallModal({
  open,
  variant = 'default',
  onClose,
  onCtaClick,
}) {
  const navigate = useNavigate();
  const v = VARIANTS[variant] || VARIANTS.default;

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handlePrimary = () => {
    if (onCtaClick) onCtaClick();
    navigate('/dashboard/settings/update-subscription');
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center px-4 py-6 bg-black/50"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="w-full max-w-[440px] max-h-[92vh] overflow-y-auto hide-scrollbar bg-white rounded-[20px] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
      >
        {/* Purple gradient header */}
        <div
          className="relative px-6 pt-5 pb-6 rounded-t-[20px]"
          style={{ background: HEADER_GRADIENT }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 backdrop-blur-sm">
              <svg
                className="w-4 h-4 text-white"
                viewBox="0 0 20 20"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 7l3-4h8l3 4-7 10L3 7z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M3 7h14"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path
                  d="M7 7l3 10 3-10"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-inter font-semibold text-[12px] text-white">
                Best for passing the CSE
              </span>
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-white/85 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>

          <h2
            id="paywall-title"
            className="font-inter font-bold text-white text-[22px] sm:text-[24px] leading-tight mb-2"
          >
            {v.title}
          </h2>
          <p className="font-inter text-[14px] text-white/90 leading-[1.55]">
            {v.subtitle}
          </p>
          {v.support && (
            <p className="font-inter text-[13px] text-white/80 leading-[1.55] mt-2">
              {v.support}
            </p>
          )}
        </div>

        {/* White body */}
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="font-inter font-extrabold text-[#0F172A] text-[26px]">
              ₱349
            </span>
            <span className="font-inter text-[#6C737F] text-[13px]">
              / until August 9 CSE
            </span>
          </div>
          <p className="font-inter font-semibold text-[14px] text-[#1A1A2E] mb-4">
            Premium - Improvement Pack
          </p>

          <ul className="space-y-2.5 mb-4">
            {BENEFITS.map((benefit) => (
              <li
                key={benefit}
                className="flex items-start gap-2.5 font-inter text-[13px] text-[#45464E] leading-[1.5]"
              >
                <span className="mt-0.5 inline-flex w-[18px] h-[18px] shrink-0 rounded-full bg-[#6E43B9] items-center justify-center">
                  <svg
                    className="w-2.5 h-2.5 text-white"
                    viewBox="0 0 12 12"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M2.5 6.5L4.75 8.5L9.5 3.5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          <p className="font-inter text-[12px] text-[#6C737F] italic mb-5">
            One payment. Use it until the August CSE.
          </p>

          <button
            type="button"
            onClick={handlePrimary}
            className="w-full font-inter font-semibold text-[15px] text-[#421A83] bg-[#FFC92A] hover:bg-[#f0bb1f] active:bg-[#E6A800] py-[14px] rounded-[10px] transition-colors shadow-sm"
          >
            {v.cta}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full font-inter font-medium text-[14px] text-[#6E43B9] hover:text-[#5C36A0] py-3 transition-colors"
          >
            Continue with Free
          </button>

          <p className="font-inter text-[11px] text-[#9CA3AF] text-center pb-4">
            No subscription. No recurring charges.
          </p>
        </div>
      </div>
    </div>
  );
}
