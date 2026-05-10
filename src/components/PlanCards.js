import React from 'react'; // eslint-disable-line no-unused-vars
import {
  CirclePremiumWeeklyIcon,
  RectanglePremiumMonthlyIcon,
  CheckmarkIcon,
} from './Icons';
import GoogleAuthButton from './GoogleAuthButton';

const PLANS = [
  {
    id: 'free',
    Icon: CirclePremiumWeeklyIcon,
    iconClass: 'w-8 h-8',
    price: '₱0',
    period: '/ forever',
    name: 'Free - Readiness Checker',
    features: [
      '1 full realistic CSE mock',
      'Readiness Score + gap to pass',
      'Section breakdown (Verbal, Numerical, etc.)',
      'Topic-level breakdown',
      'Answer review + explanations',
      'Retake same mock anytime'
    ],
    note: null,
    badge: null,
    buttonLabel: 'Start Free',
    buttonUrl: '/dashboard/all-reviewers',
    useGoogleAuth: true,
    delay: 0,
  },
  {
    id: 'premium',
    Icon: RectanglePremiumMonthlyIcon,
    iconClass: 'w-8 h-8',
    price: '₱349',
    period: '/ until August 9 CSE',
    name: 'Premium - Improvement Pack',
    features: [
      'Everything included in Free',
      'Multiple full realistic CSE mock',
      'Personalized 7-day improvement plan',
      'Regenerate your plan anytime as you improve',
      'Guided daily tasks that focus on your weakest areas',
      'Focused drills for weak topics',
      'Progress tracking across attempts',
      'Retake different mock sets',
      'Priority improvement system',
      'Access until August CSE (one-time exam-cycle access)',
    ],
    note: 'Designed for serious CSE review before the exam',
    badge: 'Best for serious review',
    buttonLabel: 'Upgrade to Premium',
    buttonUrl: '/pricing/upgrade',
    useGoogleAuth: false,
    delay: 100,
  },
];

const PlanCards = () => (
  <div className="flex flex-wrap justify-center gap-4">
    {PLANS.map(({ id, Icon, iconClass, price, period, name, features, note, badge, buttonLabel, buttonUrl, useGoogleAuth, delay }) => (
      <div
        key={id}
        className="font-sans bg-white h-auto rounded-[12px] px-[32px] py-[24px] shadow-sm text-left relative max-w-[400px] w-full border border-[#EFF0F6] flex flex-col"
        data-aos="fade-up"
        data-aos-delay={delay}
      >
        <div className='mb-[16px]'>
          <div className="flex flex-row justify-between items-start">
            <div className="w-[56px] h-[56px] bg-[#EDE8F3] rounded-[16px] flex items-center justify-center mb-[16px]">
              <Icon className={iconClass} />
            </div>
            {badge && (
              <div className="bg-[#FFF5CC] text-[#45464E] text-[14px] font-bold px-[16px] py-[9px] rounded-[8px]">
                {badge}
              </div>
            )}
          </div>

          <div className="mb-[4px]">
            <span className="text-[22px] sm:text-[28px] font-extrabold text-[#45464E]">{price}</span>
            <span className="text-[13px] sm:text-[16px] font-medium text-[#45464E] ml-1">{period}</span>
          </div>

          <h3 className="text-[14px] sm:text-[16px] font-bold text-[#45464E] mb-[16px]">{name}</h3>
        </div>

        <ul className="space-y-4 mb-[16px] flex-1">
          {features.map((feature) => (
            <li key={feature} className="flex items-start">
              <span className="w-[20px] h-[20px] rounded-full bg-[#6E43B9] flex items-center justify-center mr-[8px] flex-shrink-0">
                <CheckmarkIcon className="w-3 h-3" />
              </span>
              <span className="text-[12px] sm:text-[14px] font-normal text-[#45464E]">{feature}</span>
            </li>
          ))}
        </ul>

        {note && (
          <p className="text-[12px] sm:text-[14px] font-normal text-[#45464E] mb-[16px]">{note}</p>
        )}

        {useGoogleAuth ? (
          <GoogleAuthButton
            label={buttonLabel}
            redirectTo={buttonUrl}
            className="w-full py-[10px] sm:py-[14px] lg:h-[56px] lg:py-0 rounded-[8px] bg-[#FFC92A] hover:bg-[#f0bb1f] text-[#3B1A71] font-inter font-semibold text-[16px] sm:text-[18px] lg:text-[20px] transition-colors flex items-center justify-center"
          />
        ) : (
          <a
            href={buttonUrl}
            className="w-full py-[10px] sm:py-[14px] lg:h-[56px] lg:py-0 rounded-[8px] bg-[#FFC92A] hover:bg-[#f0bb1f] text-[#3B1A71] font-inter font-semibold text-[16px] sm:text-[18px] lg:text-[20px] transition-colors flex items-center justify-center"
          >
            {buttonLabel}
          </a>
        )}
      </div>
    ))}
  </div>
);

export default PlanCards;