import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const EFFECTIVE_DATE = 'January 2026';

/**
 * Privacy policy sections. Each has id, title, and content.
 * Content blocks: string (paragraph) or { list: string[] } (bullet list).
 * Sections with support@reviewly.ph get the email rendered as a mailto link.
 */
const PRIVACY_SECTIONS = [
  {
    id: 1,
    title: 'Information We Collect',
    content: [
      { subheading: 'a. Personal Information' },
      'We collect:',
      { list: ['Name', 'Email address', 'Google account profile info (name + email only)'] },
      'We do not store your Google password. All logins are done via Google.',
      { subheading: 'b. Usage Data' },
      'To help improve your study experience, we may collect:',
      { list: ['Reviewers you access', 'Topics taken and scores', 'Device and browser information', 'IP address (for security)', 'App usage patterns'] },
      { subheading: 'c. Optional Information (Upgrade Form)' },
      'If you fill out our subscription Google Form, we may collect:',
      { list: ['Payment proof (receipt or screenshot)', 'Contact details you provide', 'Selected Premium plan'] },
      'These are used only to verify and activate your Premium access.',
    ],
  },
  {
    id: 2,
    title: 'How We Use Your Information',
    content: [
      'We use your data to:',
      { list: ['Provide and improve Reviewly', 'Personalize your study recommendations', 'Send helpful reminders and study insights', 'Monitor usage for troubleshooting', 'Detect spam or account abuse', 'Contact you regarding payments or verification', 'Give you early access to new exam modules'] },
    ],
  },
  {
    id: 3,
    title: 'Data Sharing & Third Parties',
    content: [
      'We do not sell your personal data.',
      'However, we may share limited data with trusted third-party providers who help us operate Reviewly, such as:',
      { list: ['Google Sign-In', 'Analytics services (e.g., Firebase, Mixpanel)', 'Cloud storage providers (e.g., AWS, Google Cloud)'] },
      'These partners are bound by privacy and security rules.',
      'Payment receipts submitted through the upgrade form are never shared with third parties and are used only for verification.',
    ],
  },
  {
    id: 4,
    title: 'Your Rights',
    content: [
      'You may:',
      { list: ['View or update your account information', 'Request deletion of your account', 'Request a copy of your stored data'] },
      'Just email us at support@reviewly.ph.',
    ],
    hasEmailLink: true,
  },
  {
    id: 5,
    title: 'Data Security',
    content: [
      'We use secure servers, encryption, and industry best practices to protect your information.',
      'While no system is 100% secure, we actively monitor and respond to threats.',
      'Payment receipts are stored temporarily and deleted after verification whenever possible.',
    ],
  },
  {
    id: 6,
    title: 'Changes to This Policy',
    content: [
      'We may update this Privacy Policy as Reviewly grows.',
      "If major updates are made, we'll notify you through the app or email.",
    ],
  },
  {
    id: 7,
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
    if (block && typeof block === 'object') {
      if (block.list) {
        const listClass = 'list-disc list-inside pl-4 space-y-1';
        return (
          <ul key={i} className={`${listClass} ${blockClass}`}>
            {block.list.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        );
      }
      if (block.subheading) {
        return (
          <h3 key={i} className={`font-inter font-bold text-base text-[#0F172A] mt-4 mb-2 ${i === 0 ? 'mt-0' : ''}`}>
            {block.subheading}
          </h3>
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
            className="font-inter font-normal text-4xl text-center text-[#0F172A] mb-4"
            data-aos="fade-up"
            data-aos-duration="500"
            data-aos-delay="0"
          >
            Privacy Policy
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
            At Reviewly, we care about your privacy. This Privacy Policy explains how we collect, use, and protect your information when you use our app and website.<br />By signing up and using Reviewly, you agree to this policy.
          </p>
          <div className="flex flex-col gap-10">
            {PRIVACY_SECTIONS.map((section) => (
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

export default Privacy;
