import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const EFFECTIVE_DATE = 'April 2026';

const INTRO_BLOCKS = [
  'At Reviewly, we want things to be fair and clear—especially since Premium access is activated manually and delivered digitally.',
  'This Refund Policy explains when refunds may be granted for Reviewly Premium purchases.',
  'If you have questions, email us at support@reviewly.ph.',
];

const REFUND_SECTIONS = [
  {
    id: 1,
    title: 'What this policy covers',
    content: [
      'This policy applies to Reviewly Premium – Improvement Pack (exam-cycle access) and any other paid access offered through Reviewly\'s payment/upgrade flow.',
      'Premium is digital access—once activated, features unlock immediately (e.g., sprint plans, topic breakdown, additional mock sets). Because of this, refund eligibility is limited (see below).',
    ],
  },
  {
    id: 2,
    title: 'Refund-eligible cases (we will help)',
    content: [
      'A refund may be granted in these situations:',
      { subheading: 'A) Duplicate payment' },
      'You paid more than once for the same Premium access (e.g., you accidentally sent two payments).',
      { checkmark: 'Refund: the extra/duplicate payment amount.' },
      { subheading: 'B) Wrong amount paid (case-by-case)' },
      'You paid an incorrect amount by mistake.',
      { checkmark: 'We may offer either:' },
      { list: ['a partial refund (difference), or', 'a full refund, depending on the case.'] },
      { subheading: 'C) Payment confirmed but Premium access was not activated' },
      'If your payment is valid but your Premium access is not activated within 24 hours after you submitted complete details, and we cannot resolve it within a reasonable time.',
      { checkmark: 'Refund: full amount paid (or another fair resolution if you prefer, like extending access).' },
      { subheading: 'D) Major service issue (rare)' },
      'If there is a sustained technical issue that prevents access to Premium features and we can\'t fix it within a reasonable time after you report it.',
      { checkmark: 'Refund: partial or full, depending on impact and timeframe.' },
    ],
  },
  {
    id: 3,
    title: 'Non-refundable cases (important)',
    content: [
      { underline: 'Refunds are generally not granted in these cases:' },
      {
        list: [
          'Change of mind after Premium has been activated',
          'You already accessed Premium features (e.g., sprint plan generation, topic-level breakdown, additional mock sets)',
          'You did not reach a desired score or outcome (Reviewly is a study tool; results vary by person)',
          'You submitted the wrong Reviewly email address and did not respond to our request to correct details',
          'Delays caused by incomplete or incorrect information (missing reference number, unclear receipt, mismatched email, etc.)',
          'Account issues not caused by Reviewly (e.g., Google account access problems)',
        ]
      },
    ],
  },
  {
    id: 4,
    title: 'How to request a refund',
    content: [
      { emailBold: 'Email support@reviewly.ph with the subject: Refund Request' },
      'Include the following:',
      {
        orderedList: [
          'Reviewly account email (the email you use to log in)',
          'GCash reference number',
          'Date and time of payment',
          'Screenshot of payment receipt',
          'Short explanation of the issue (e.g., duplicate payment / not activated)',
        ]
      },
      "If we need more info, we'll email you.",
    ],
    hasEmailLink: true,
  },
  {
    id: 5,
    title: 'Refund review and processing timeline',
    content: [
      'We aim to review refund requests within 1–3 business days.',
      'If approved, refunds are sent via the same payment channel when possible (e.g., GCash).',
      'Refund processing time may take 3–10 business days depending on payment channel constraints.',
    ],
  },
  {
    id: 6,
    title: 'Premium activation reminders',
    content: [
      'Premium activation is manual verification for now. To avoid delays:',
      {
        list: [
          'Make sure your Reviewly email matches your account login email.',
          'Keep your GCash reference number ready.',
          'Upload a clear receipt screenshot if available.',
        ]
      },
    ],
  },
  {
    id: 7,
    title: 'Temporary payment setup (transparency)',
    content: [
      'During our temporary setup period, payments may be received via our designated team account while we finalize our official merchant account.',
      'All payments are verified and securely applied to the correct Reviewly account.',
    ],
  },
  {
    id: 8,
    title: 'Policy updates',
    content: [
      'We may update this Refund Policy as Reviewly improves.',
      'The "Effective Date" will be updated when changes are made.',
    ],
  },
  {
    id: 9,
    title: 'Contact Us',
    content: [
      "If you have questions or concerns, email us at support@reviewly.ph — we're here to help.",
    ],
    hasEmailLink: true,
  },
];

function renderContent(blocks, hasEmailLink) {
  return blocks.map((block, i) => {
    const marginClass = i === 0 ? 'mt-0' : 'mt-3';
    const blockClass = `${marginClass} mb-0`;

    if (typeof block === 'string') {
      if (hasEmailLink && block.includes('support@reviewly.ph')) {
        const parts = block.split('support@reviewly.ph');
        return (
          <p key={i} className={blockClass}>
            {parts[0]}
            <a href="mailto:support@reviewly.ph" className="text-[#6E43B9] underline hover:no-underline">support@reviewly.ph</a>
            {parts[1]}
          </p>
        );
      }
      return <p key={i} className={`text-[13px] sm:text-[14px] lg:text-base ${blockClass}`}>{block}</p>;
    }

    if (block && typeof block === 'object') {
      if (block.list) {
        return (
          <ul key={i} className={`list-disc list-inside pl-4 space-y-1 text-[13px] sm:text-[14px] lg:text-base ${blockClass}`}>
            {block.list.map((item, j) => <li key={j}>{item}</li>)}
          </ul>
        );
      }
      if (block.orderedList) {
        return (
          <ol key={i} className={`list-decimal list-inside pl-4 space-y-1 text-[13px] sm:text-[14px] lg:text-base ${blockClass}`}>
            {block.orderedList.map((item, j) => <li key={j}>{item}</li>)}
          </ol>
        );
      }
      if (block.subheading) {
        return (
          <h3 key={i} className={`font-inter font-bold text-[13px] sm:text-[14px] lg:text-base text-[#0F172A] mb-1 ${i === 0 ? 'mt-0' : 'mt-4'}`}>
            {block.subheading}
          </h3>
        );
      }
      if (block.checkmark) {
        return (
          <p key={i} className={`text-[13px] sm:text-[14px] lg:text-base ${blockClass} flex items-start gap-1`}>
            <span>✅</span>
            <span>{block.checkmark}</span>
          </p>
        );
      }
      if (block.underline) {
        return (
          <p key={i} className={`text-[13px] sm:text-[14px] lg:text-base ${blockClass}`}>
            <span className="underline">{block.underline}</span>
          </p>
        );
      }
      if (block.emailBold) {
        const parts = block.emailBold.split('support@reviewly.ph');
        return (
          <p key={i} className={`text-[13px] sm:text-[14px] lg:text-base ${blockClass}`}>
            <a href="mailto:support@reviewly.ph" className="text-[#6E43B9] underline hover:no-underline">support@reviewly.ph</a>
            {parts[1] && <strong>{parts[1]}</strong>}
          </p>
        );
      }
    }
    return null;
  });
}

function Refund() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="flex justify-center pt-12 pb-20">
        <section className="w-full max-w-[800px] mx-auto px-4 sm:px-6">
          <h1
            className="font-inter font-normal text-[26px] sm:text-[32px] lg:text-4xl text-center text-[#0F172A] mb-4"
            data-aos="fade-up" data-aos-duration="500" data-aos-delay="0"
          >
            Refund Policy
          </h1>
          <p
            className="font-inter font-normal text-[13px] sm:text-[14px] lg:text-base text-center text-[#0F172A] mb-4"
            data-aos="fade-up" data-aos-duration="500" data-aos-delay="50"
          >
            Effective Date: {EFFECTIVE_DATE}
          </p>

          {/* Intro */}
          <div
            className="font-inter font-normal text-[13px] sm:text-[14px] lg:text-base text-[#0F172A] mb-10 flex flex-col gap-2"
            data-aos="fade-up" data-aos-duration="500" data-aos-delay="100"
          >
            {INTRO_BLOCKS.map((line, i) => {
              if (line.includes('support@reviewly.ph')) {
                const parts = line.split('support@reviewly.ph');
                return (
                  <p key={i}>
                    {parts[0]}
                    <a href="mailto:support@reviewly.ph" className="text-[#6E43B9] underline hover:no-underline">support@reviewly.ph</a>
                    {parts[1]}
                  </p>
                );
              }
              return <p key={i}>{line}</p>;
            })}
          </div>

          <div className="flex flex-col gap-10">
            {REFUND_SECTIONS.map((section) => (
              <article
                key={section.id}
                data-aos="fade-up" data-aos-duration="500"
                data-aos-delay={Math.min(section.id * 40, 200)}
              >
                <h2 className="font-inter font-bold text-[13px] sm:text-[14px] lg:text-base text-[#0F172A] mb-4">
                  {section.id}. {section.title}
                </h2>
                <div className="font-inter font-normal text-[13px] sm:text-[14px] lg:text-base text-[#0F172A] m-0 leading-[160%]">
                  {renderContent(section.content, section.hasEmailLink)}
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Refund;