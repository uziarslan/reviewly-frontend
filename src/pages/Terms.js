import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const EFFECTIVE_DATE = 'January 2026';

const INTRO_TEXT =
  'Welcome to Reviewly! These Terms & Conditions explain how you can use our app and services. By creating an account or using Reviewly, you agree to follow these guidelines.';

/**
 * Terms & Conditions sections. Same structure as Privacy: id, title, content, optional hasEmailLink.
 */
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
      { list: ['Provide accurate information during sign-up', 'Use only your own Google account to log in', 'Avoid any harmful, abusive, or illegal activities inside the app', 'Respect other users and the Reviewly team'] },
    ],
  },
  {
    id: 3,
    title: 'Intellectual Property',
    content: [
      'All content on Reviewly — including AI-generated questions, explanations, practice reviewers, and summaries — is owned by Reviewly.',
      'You may use the content for personal study only.',
      'Please do not copy, resell, distribute, or upload our content elsewhere without permission.',
    ],
  },
  {
    id: 4,
    title: 'User Content',
    content: [
      'If you upload or submit any notes, messages, or materials (optional features in the future), you agree that:',
      { list: ['You own the content or have the right to use it', 'You will not upload anything harmful, offensive, or illegal'] },
      'We may remove content or restrict access if it violates these rules.',
    ],
  },
  {
    id: 5,
    title: 'Subscriptions & Payments',
    content: [
      'Some Reviewly features require a paid subscription.',
      { list: ['Premium activation is done manually after you submit our Google Form', 'Access may take a short time to process', 'You must upload valid proof of payment', 'Subscription plans are non-auto-renewing', 'Premium duration depends on the plan you choose (Weekly/Monthly/Quarterly)', 'We may pause or deny subscriptions if payment proof is invalid or fraudulent'] },
      'Premium access begins only after we confirm your payment.',
    ],
  },
  {
    id: 6,
    title: 'Account Termination',
    content: [
      'We may suspend or remove accounts that:',
      { list: ['Violate these Terms', 'Attempt to misuse or attack the system', 'Engage in spam or disruptive behavior'] },
      'You may also request deletion of your account anytime.',
    ],
  },
  {
    id: 7,
    title: 'Service Availability',
    content: [
      'We aim to keep Reviewly available at all times, but downtime or updates may occasionally occur. Features may also change as we continue improving the app.',
    ],
  },
  {
    id: 8,
    title: 'Accuracy & Limitations',
    content: [
      'Reviewly uses AI to generate some study materials. While we strive for accuracy, we cannot guarantee all information is 100% perfect. Use Reviewly as a study aid, not a replacement for professional review centers or official references.',
    ],
  },
  {
    id: 9,
    title: 'Future Exam Modules',
    content: [
      'Reviewly may add, modify, or remove exam modules (such as LET, NLE, CHRA, etc.) at any time. Availability of future modules is not guaranteed.',
    ],
  },
  {
    id: 10,
    title: 'Changes to These Terms',
    content: [
      'We may update these Terms from time to time. If we make significant changes, we will notify you through the app or email. Continued use of Reviewly means you accept the updated Terms.',
    ],
  },
  {
    id: 11,
    title: 'Contact Us',
    content: [
      'If you have questions or concerns, reach us at support@reviewly.ph.',
      "Thank you for studying with Reviewly. Smarter studying starts here. 💜",
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
        const [before, after] = block.split('support@reviewly.ph');
        return (
          <p key={i} className={blockClass}>
            {before}
            <a href="mailto:support@reviewly.ph" className="text-[#6E43B9] underline hover:no-underline">support@reviewly.ph</a>
            {after}
          </p>
        );
      }
      return <p key={i} className={blockClass}>{block}</p>;
    }
    if (block && typeof block === 'object' && block.list) {
      const listClass = 'list-disc list-inside pl-4 space-y-1';
      return (
        <ul key={i} className={`${listClass} ${blockClass}`}>
          {block.list.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      );
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
            className="font-inter font-normal text-4xl text-center text-[#0F172A] mb-4"
            data-aos="fade-up"
            data-aos-duration="500"
            data-aos-delay="0"
          >
            Terms & Conditions
          </h1>
          <p
            className="font-inter font-normal text-base text-center text-[#0F172A] mb-2.5"
            data-aos="fade-up"
            data-aos-duration="500"
            data-aos-delay="50"
          >
            Effective Date: {EFFECTIVE_DATE}
          </p>
          <p
            className="font-inter font-normal text-base text-[#0F172A] mb-10"
            data-aos="fade-up"
            data-aos-duration="500"
            data-aos-delay="100"
          >
            {INTRO_TEXT}
          </p>
          <div className="flex flex-col gap-10">
            {TERMS_SECTIONS.map((section) => (
              <article
                key={section.id}
                data-aos="fade-up"
                data-aos-duration="500"
                data-aos-delay={Math.min(section.id * 40, 200)}
              >
                <h2 className="font-inter font-bold text-base text-[#0F172A] mb-4">
                  {section.id}. {section.title}
                </h2>
                <div className="font-inter font-normal text-base text-[#0F172A] m-0 leading-[160%]">
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

export default Terms;
