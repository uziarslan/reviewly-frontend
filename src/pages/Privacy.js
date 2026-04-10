import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const EFFECTIVE_DATE = 'April 2026';

const PRIVACY_SECTIONS = [
  {
    id: 1,
    title: 'Information We Collect',
    content: [
      { subheading: 'a. Personal Information' },
      'We collect:',
      { list: ['Name', 'Email address', 'Google profile information (e.g., name, email, and profile photo if available)'] },
      'We do not store your Google password. All logins are done via Google.',
      { subheading: 'b. Usage & Study Data (Inside the App)' },
      'To provide your results and improve your study experience, we may collect:',
      { list: [
        'Exams you access and attempt (e.g., mock exams, practice exams, assessment)',
        'Exam activity (started/completed, timestamps)',
        'Scores and performance breakdowns (overall score, section-level performance, and topic-level performance if available)',
        'Answer selections (to enable answer review, explanations, and mistake review)',
        'Time and duration data (total time, average time, pacing)',
        'Pages or features used (e.g., dashboard views, review mode usage)',
      ]},
      { subheading: 'c. Device & Technical Data' },
      'For security and performance monitoring, we may collect:',
      { list: [
        'Device and browser information',
        'IP address (primarily for security, abuse prevention, and troubleshooting)',
        'Basic app usage patterns (e.g., crash/error logs)',
      ]},
      { subheading: 'd. Optional Information (Upgrade / Premium Verification Form)' },
      'If you submit an upgrade request (e.g., via Payment Form), we may collect:',
      { list: [
        'Payment proof (receipt or screenshot)',
        'Payment reference details (if provided)',
        'Contact details you provide',
      ]},
      { bold: 'This information is used only to verify and activate Premium access.' },
      { subheading: 'e. Share Feature (Readiness Card)' },
      'If you use a "Share" feature, Reviewly may generate a shareable results card based on your exam results. This share card is designed to avoid including sensitive personal data (e.g., your email). You control whether you share it.',
    ],
  },
  {
    id: 2,
    title: 'How We Use Your Information',
    content: [
      'We use your data to:',
      { list: [
        'Provide the Reviewly service (login, access, exam flow, results, explanations)',
        'Calculate and display readiness scores, breakdowns, and recommendations',
        'Personalize your experience (e.g., showing weak areas and next steps)',
        'Enable answer review and progress tracking',
        'Verify Premium access and manage upgrade requests',
        'Improve reliability and performance (bug fixing, error monitoring)',
        'Detect and prevent spam, abuse, or suspicious activity',
        'Communicate important service updates (e.g., account support, verification, major policy changes)',
      ]},
    ],
  },
  {
    id: 3,
    title: 'Analytics & Tracking',
    content: [
      'We use analytics tools to understand how Reviewly is used and to improve the product. These may include:',
      { list: [
        'Google Analytics (website performance and traffic)',
        'PostHog (product analytics such as feature usage, funnels, and engagement)',
      ]},
      'Analytics data may include pages visited, actions taken, and basic device information. We do not sell your personal information.',
    ],
  },
  {
    id: 4,
    title: 'Data Sharing & Third Parties',
    content: [
      'We do not sell your personal data.',
      'We may share limited information with trusted service providers that help us operate Reviewly, such as:',
      { list: [
        'Google Sign-In (authentication)',
        'Analytics providers (e.g., Google Analytics, PostHog)',
        'Hosting / cloud infrastructure providers (used to run and secure the app)',
      ]},
      'These providers are bound by privacy and security obligations appropriate to their services.',
      'Payment proofs submitted through upgrade verification are used only for verification and are not shared for marketing purposes.',
    ],
  },
  {
    id: 5,
    title: 'Data Retention',
    content: [
      'We keep data only as long as necessary to run Reviewly and provide your experience:',
      { list: [
        'Account & exam history: kept so you can view results, track progress, and continue your review',
        'Analytics data: kept in aggregated or limited form to improve the product',
        'Payment proof / verification data: stored only as long as needed for verification and record-keeping, then deleted or archived securely when possible',
      ]},
      'You may request account deletion at any time (see "Your Rights" below).',
    ],
  },
  {
    id: 6,
    title: 'Your Rights',
    content: [
      'You may:',
      { list: [
        'View or update your account information (when available in the product)',
        'Request deletion of your account and associated data',
        'Request a copy of your stored data (subject to reasonable verification)',
      ]},
      'To request any of the above, email: support@reviewly.ph',
    ],
    hasEmailLink: true,
  },
  {
    id: 7,
    title: 'Data Security',
    content: [
      'We use reasonable security measures (access controls, encryption where applicable, and monitoring) to protect your information.',
      'However, no system is 100% secure, so we cannot guarantee absolute security.',
    ],
  },
  {
    id: 8,
    title: 'Changes to This Policy',
    content: [
      'We may update this Privacy Policy as Reviewly grows. If we make material changes, we will notify you through the app or email when appropriate. Continued use of Reviewly means you accept the updated policy.',
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
      if (block.subheading) {
        return (
          <h3 key={i} className={`font-inter font-bold text-[13px] sm:text-[14px] lg:text-base text-[#0F172A] mb-2 ${i === 0 ? 'mt-0' : 'mt-4'}`}>
            {block.subheading}
          </h3>
        );
      }
      if (block.bold) {
        return (
          <p key={i} className={`font-bold text-[13px] sm:text-[14px] lg:text-base ${blockClass}`}>{block.bold}</p>
        );
      }
    }
    return null;
  });
}

function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="flex justify-center pt-12 pb-20">
        <section className="w-full max-w-[800px] mx-auto px-4 sm:px-6">
          <h1
            className="font-inter font-normal text-[26px] sm:text-[32px] lg:text-4xl text-center text-[#0F172A] mb-4"
            data-aos="fade-up" data-aos-duration="500" data-aos-delay="0"
          >
            Privacy Policy
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
            At Reviewly, we care about your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our website and app.<br />
            By signing up for, logging in to, or using Reviewly, you agree to this Privacy Policy.
          </p>
          <div className="flex flex-col gap-10">
            {PRIVACY_SECTIONS.map((section) => (
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

export default Privacy;
