import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const EFFECTIVE_DATE = 'April 2026';

const INTRO_TEXT =
  'Welcome to Reviewly! These Terms & Conditions explain how you can use our app and website. By creating an account or using Reviewly, you agree to follow these Terms.';

const TERMS_SECTIONS = [
  {
    id: 1,
    title: 'Eligibility',
    content: ['You must be at least 13 years old to use Reviewly.'],
  },
  {
    id: 2,
    title: 'User Responsibilities',
    content: [
      'To keep your account safe and your experience smooth, you agree to:',
      {
        list: [
          'Provide accurate information during sign-up',
          'Use only your own Google account to log in',
          'Keep your login access secure',
          'Avoid any harmful, abusive, or illegal activities inside the app',
          'Respect other users and the Reviewly team',
        ]
      },
    ],
  },
  {
    id: 3,
    title: 'Intellectual Property',
    content: [
      'All content on Reviewly — including question banks, AI-generated questions, explanations, practice reviewers, UI, branding, and summaries — is owned by Reviewly or its licensors.',
      'You may use Reviewly content for personal study only. You may not copy, reproduce, resell, distribute, upload, or publish our content elsewhere without written permission.',
    ],
  },
  {
    id: 4,
    title: 'User Content',
    content: [
      'If you submit any notes, messages, feedback, forms, uploads, or materials (including payment receipts), you agree that:',
      {
        list: [
          'You own the content or have the right to submit it',
          'You will not upload anything harmful, offensive, illegal, or infringing',
          'You give Reviewly permission to use submitted content only as needed to operate the service (e.g., verifying payments, support, product improvements)',
        ]
      },
      'We may remove content or restrict access if it violates these Terms.',
    ],
  },
  {
    id: 5,
    title: 'Plans, Access, and Payments',
    content: [
      'Reviewly may offer free and paid access.',
      { subheading: 'A) Free access (Readiness Checker)' },
      'Free access may include a readiness check experience (e.g., mock exam results, breakdowns, and review tools). Free features may change over time as we improve the platform.',
      { subheading: 'B) Paid access (Premium / Improvement Pack)' },
      'Some features require payment (e.g., sprint plans, topic-level breakdown, additional mock sets, focused practice packs, and progress tracking).',
      'Premium access may be offered as exam-cycle access (example: access valid until a stated exam date). Duration and inclusions will be shown on the pricing/payment pages.',
      { subheading: 'C) Payment verification (manual activation)' },
      'Premium activation may be processed manually after you submit the required payment details (reference number and/or receipt).',
      {
        list: [
          'Activation time is typically within the timeframe shown on the payment page, but may vary',
          'We may request additional proof if details are incomplete or unclear',
          'We may pause or deny activation if payment proof appears invalid or fraudulent',
        ]
      },
      'Premium access begins only after we confirm payment.',
      { subheading: 'D) No auto-renewal (unless stated)' },
      'Unless we explicitly state otherwise, Premium is not auto-renewing.',
    ],
  },
  {
    id: 6,
    title: 'Refunds',
    content: [
      'Refund requests are handled under our Refund Policy.',
      'Please review the Refund Policy page for refund eligibility, timelines, and required details.',
    ],
    hasRefundLink: true,
  },
  {
    id: 7,
    title: 'Account Termination',
    content: [
      'We may suspend or remove accounts that:',
      {
        list: [
          'Violate these Terms',
          'Attempt to misuse, disrupt, or attack the system',
          'Engage in spam or abusive behavior',
          'Use Reviewly in a way that compromises other users or our service integrity',
        ]
      },
      'You may request account deletion anytime by emailing support@reviewly.ph.',
    ],
    hasEmailLink: true,
  },
  {
    id: 8,
    title: 'Service Availability',
    content: [
      'We aim to keep Reviewly available at all times, but downtime or updates may occur. Features may change as we improve the product.',
    ],
  },
  {
    id: 9,
    title: 'Accuracy & Limitations',
    content: [
      'Reviewly is a study aid. While we work hard to keep content accurate and helpful:',
      {
        list: [
          'We do not guarantee any exam result or passing outcome',
          'Some content may contain errors; if you spot one, please report it',
          'Reviewly should not be treated as an official reference or a replacement for official materials',
        ]
      },
    ],
  },
  {
    id: 10,
    title: 'Future Exam Modules',
    content: [
      'Reviewly may add, modify, or remove exam modules (such as LET, NLE/PNLE, BLEPP, etc.) at any time. Availability of future modules is not guaranteed.',
    ],
  },
  {
    id: 11,
    title: 'Changes to These Terms',
    content: [
      'We may update these Terms from time to time. If we make significant changes, we may notify you through the app or email. Continued use of Reviewly means you accept the updated Terms.',
    ],
  },
  {
    id: 12,
    title: 'Contact Us',
    content: [
      'If you have questions or concerns, reach us at support@reviewly.ph.',
      'Thank you for studying with Reviewly. Smarter studying starts here. 💜',
    ],
    hasEmailLink: true,
  },
];

function renderContent(blocks, hasEmailLink, hasRefundLink) {
  return blocks.map((block, i) => {
    const marginClass = i === 0 ? 'mt-0' : 'mt-3';
    const blockClass = `${marginClass} mb-0`;

    if (typeof block === 'string') {
      // Refund Policy link
      if (hasRefundLink && block.includes('Refund Policy')) {
        const parts = block.split('Refund Policy');
        return (
          <p key={i} className={blockClass}>
            {parts[0]}
            <Link to="/refund" className="text-[#6E43B9] underline hover:no-underline">Refund Policy</Link>
            {parts[1]}
          </p>
        );
      }
      // Email link
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
      if (block.subheading) {
        return (
          <h3 key={i} className={`font-inter font-bold text-[13px] sm:text-[14px] lg:text-base text-[#0F172A] mb-2 ${i === 0 ? 'mt-0' : 'mt-4'}`}>
            {block.subheading}
          </h3>
        );
      }
    }
    return null;
  });
}

function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="flex justify-center pt-12 pb-20">
        <section className="w-full max-w-[800px] mx-auto px-4 sm:px-6">
          <h1
            className="font-inter font-normal text-[26px] sm:text-[32px] lg:text-4xl text-center text-[#0F172A] mb-4"
            data-aos="fade-up" data-aos-duration="500" data-aos-delay="0"
          >
            Terms & Conditions
          </h1>
          <p
            className="font-inter font-normal text-[13px] sm:text-[14px] lg:text-base text-center text-[#0F172A] mb-2.5"
            data-aos="fade-up" data-aos-duration="500" data-aos-delay="50"
          >
            Effective Date: {EFFECTIVE_DATE}
          </p>
          <p
            className="font-inter font-normal text-[13px] sm:text-[14px] lg:text-base text-[#0F172A] mb-10"
            data-aos="fade-up" data-aos-duration="500" data-aos-delay="100"
          >
            {INTRO_TEXT}
          </p>
          <div className="flex flex-col gap-10">
            {TERMS_SECTIONS.map((section) => (
              <article
                key={section.id}
                data-aos="fade-up" data-aos-duration="500"
                data-aos-delay={Math.min(section.id * 40, 200)}
              >
                <h2 className="font-inter font-bold text-[13px] sm:text-[14px] lg:text-base text-[#0F172A] mb-4">
                  {section.id}. {section.title}
                </h2>
                <div className="font-inter font-normal text-[13px] sm:text-[14px] lg:text-base text-[#0F172A] m-0 leading-[160%]">
                  {renderContent(section.content, section.hasEmailLink, section.hasRefundLink)}
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

export default Terms;