import React from 'react';
import {
  TriangleFreePlanIcon,
  CirclePremiumWeeklyIcon,
  RectanglePremiumMonthlyIcon,
  HexagonPremiumQuarterlyIcon,
  CheckmarkIcon,
} from './Icons';

const PlanCards = () => (
  <div className="flex flex-wrap justify-center gap-4">
    {/* Free Plan */}
    <div className="font-sans bg-white h-auto rounded-[12px] px-[20px] py-[24px] shadow-sm text-left relative max-w-[240px] border border-[#EFF0F6]" data-aos="fade-up" data-aos-delay="0">
      <div className="w-[56px] h-[56px] bg-[#EDE8F3] rounded-[16px] flex items-center justify-center mb-4">
        <TriangleFreePlanIcon className="w-7 h-6" />
      </div>
      <div className="mb-1">
        <span className="text-[28px] font-extrabold text-[#45464E]">₱0</span>
        <span className="text-[16px] font-medium text-[#45464E] ml-1">/ always free</span>
      </div>
      <h3 className="text-[16px] font-bold text-[#45464E] mb-4">Free Plan</h3>
      <p className="text-[14px] font-normal text-[#45464E] mb-4">
        For learners trying out Reviewly with limited access.
      </p>
      <ul className="space-y-4 mb-8">
        <li className="flex items-start">
          <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
            <CheckmarkIcon className="w-3 h-3" />
          </span>
          <span className="text-[14px] font-normal text-[#45464E]">20-item Reviewers</span>
        </li>
        <li className="flex items-start">
          <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
            <CheckmarkIcon className="w-3 h-3" />
          </span>
          <span className="text-[14px] font-normal text-[#45464E]">Basic Scoring</span>
        </li>
        <li className="flex items-start">
          <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
            <CheckmarkIcon className="w-3 h-3" />
          </span>
          <span className="text-[14px] font-normal text-[#45464E]">No time limit</span>
        </li>
      </ul>
      <p className="text-[14px] font-normal text-[#431C86]">
        **Great for trying Reviewly before upgrading
      </p>
    </div>

    {/* Premium Weekly */}
    <div className="font-sans bg-white h-auto rounded-[12px] px-[20px] py-[24px] shadow-sm text-left relative max-w-[240px] border border-[#EFF0F6]" data-aos="fade-up" data-aos-delay="100">
      <div className="w-[56px] h-[56px] bg-[#EDE8F3] rounded-[16px] flex items-center justify-center mb-4">
        <CirclePremiumWeeklyIcon className="w-8 h-8" />
      </div>
      <div className="mb-1">
        <span className="text-[28px] font-extrabold text-[#45464E]">₱99</span>
        <span className="text-[16px] font-medium text-[#45464E] ml-1">/ 7 days</span>
      </div>
      <h3 className="text-[16px] font-bold text-[#45464E] mb-4">Premium Weekly</h3>
      <p className="text-[14px] font-normal text-[#45464E] mb-4">
        Full access for a full week — perfect for fast-paced reviewers.
      </p>
      <ul className="space-y-4 mb-8">
        <li className="flex items-start">
          <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
            <CheckmarkIcon className="w-3 h-3" />
          </span>
          <span className="text-[14px] font-normal text-[#45464E]">Full mock exams</span>
        </li>
        <li className="flex items-start">
          <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
            <CheckmarkIcon className="w-3 h-3" />
          </span>
          <span className="text-[14px] font-normal text-[#45464E]">AI evaluations & insights</span>
        </li>
        <li className="flex items-start">
          <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
            <CheckmarkIcon className="w-3 h-3" />
          </span>
          <span className="text-[14px] font-normal text-[#45464E]">Unlimited AI-generated questions</span>
        </li>
      </ul>
      <p className="text-[14px] font-normal text-[#431C86]">
        **Affordable, flexible, and great for quick coverage.
      </p>
    </div>

    {/* Premium Monthly - Popular */}
    <div className="font-sans bg-white h-auto rounded-[12px] px-[20px] py-[24px] shadow-sm text-left relative max-w-[240px] border border-[#EFF0F6]" data-aos="fade-up" data-aos-delay="200">
      <div className="absolute top-4 right-4 bg-[#FFF5CC] text-[#45464E] text-xs font-semibold px-3 py-1.5 rounded-full">
        Popular
      </div>
      <div className="w-[56px] h-[56px] bg-[#EDE8F3] rounded-[16px] flex items-center justify-center mb-4">
        <RectanglePremiumMonthlyIcon className="w-8 h-8" />
      </div>
      <div className="mb-1">
        <span className="text-[28px] font-extrabold text-[#45464E]">₱199</span>
        <span className="text-[16px] font-medium text-[#45464E] ml-1">/ 30 days</span>
      </div>
      <h3 className="text-[16px] font-bold text-[#45464E] mb-4">Premium Monthly</h3>
      <p className="text-[14px] font-normal text-[#45464E] mb-4">
        A full month of all-access — ideal for the typical CSE review timeline.
      </p>
      <ul className="space-y-4 mb-8">
        <li className="flex items-start">
          <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
            <CheckmarkIcon className="w-3 h-3" />
          </span>
          <span className="text-[14px] font-normal text-[#45464E]">Everything in Premium Weekly</span>
        </li>
        <li className="flex items-start">
          <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
            <CheckmarkIcon className="w-3 h-3" />
          </span>
          <span className="text-[14px] font-normal text-[#45464E]">Better long-term value</span>
        </li>
        <li className="flex items-start">
          <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
            <CheckmarkIcon className="w-3 h-3" />
          </span>
          <span className="text-[14px] font-normal text-[#45464E]">Perfect for structured study plans</span>
        </li>
        <li className="flex items-start">
          <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
            <CheckmarkIcon className="w-3 h-3" />
          </span>
          <span className="text-[14px] font-normal text-[#45464E]">Save about 50% compared to Weekly</span>
        </li>
      </ul>
      <p className="text-[14px] font-normal text-[#431C86]">
        **Great for consistent daily review
      </p>
    </div>

    {/* Premium Quarterly */}
    <div className="font-sans bg-white h-auto rounded-[12px] px-[20px] py-[24px] shadow-sm text-left relative max-w-[240px] border border-[#EFF0F6]" data-aos="fade-up" data-aos-delay="300">
      <div className="w-[56px] h-[56px] bg-[#EDE8F3] rounded-[16px] flex items-center justify-center mb-4">
        <HexagonPremiumQuarterlyIcon className="w-8 h-9" />
      </div>
      <div className="mb-1">
        <span className="text-[28px] font-extrabold text-[#45464E]">₱499</span>
        <span className="text-[16px] font-medium text-[#45464E] ml-1">/ 90 days</span>
      </div>
      <h3 className="text-[16px] font-bold text-[#45464E] mb-4">Premium Quarterly</h3>
      <p className="text-[14px] font-normal text-[#45464E] mb-4">
        Three months of full-access review tools for the best long-term value.
      </p>
      <ul className="space-y-4 mb-8">
        <li className="flex items-start">
          <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
            <CheckmarkIcon className="w-3 h-3" />
          </span>
          <span className="text-[14px] font-normal text-[#45464E]">All Premium Monthly features</span>
        </li>
        <li className="flex items-start">
          <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
            <CheckmarkIcon className="w-3 h-3" />
          </span>
          <span className="text-[14px] font-normal text-[#45464E]">Save over 60% compared to Weekly plans</span>
        </li>
        <li className="flex items-start">
          <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
            <CheckmarkIcon className="w-3 h-3" />
          </span>
          <span className="text-[14px] font-normal text-[#45464E]">Save over 16% compared to Monthly plans</span>
        </li>
        <li className="flex items-start">
          <span className="w-5 h-5 rounded-full bg-[#6E43B9] flex items-center justify-center mr-2 flex-shrink-0">
            <CheckmarkIcon className="w-3 h-3" />
          </span>
          <span className="text-[14px] font-normal text-[#45464E]">More time = deeper mastery</span>
        </li>
      </ul>
      <p className="text-[14px] font-normal text-[#431C86]">
        **Perfect for long-term or multi-exam preparation
      </p>
    </div>
  </div>
);

export default PlanCards;
