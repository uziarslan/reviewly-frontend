import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';

/**
 * FAQ data: each item has question and answer.
 * Answer can be a string (single paragraph) or an array of blocks:
 * - string = paragraph
 * - { list: string[], ordered?: boolean } = bullet or numbered list
 */
const FAQ_ITEMS = [
  {
    id: 1,
    question: 'What do I get with the Free Plan?',
    answer: 'Our Free Plan gives you sample 20-item reviewers for both CSE Professional and Sub-Professional levels. You can use them anytime, no time limit. The Free Plan is designed to help you explore the Reviewly platform before upgrading.',
  },
  {
    id: 2,
    question: 'What do I get with Premium?',
    answer: [
      'Premium unlocks the full Reviewly experience:',
      {
        list: [
          'Full mock exam and reviewers',
          'Unlimited AI-generated question sets',
          'Full mock exams',
          'AI explanations & insights',
          'Performance tracking',
          'Early access to future exams (LET, NLE, CHRA, etc.)',
        ],
        ordered: false,
      },
      "All Premium plans include the same features — the only difference is how long the access lasts.",
    ],
  },
  {
    id: 3,
    question: 'Do all Premium plans have the same features?',
    answer: 'Yes. Premium Weekly, Monthly, and Quarterly all unlock the same full-access tools. The only difference is the duration and savings.',
  },
  {
    id: 4,
    question: 'How do I upgrade to Premium?',
    answer: [
      {
        list: [
          'Sign in using your Google account',
          'Go to the Pricing page',
          'Pick a plan',
          'Fill out the Google Form and upload your payment receipt',
          "Our team will verify and activate your account ASAP",
        ],
        ordered: true,
      },
      "You'll receive a confirmation email once your Premium access is activated.",
    ],
  },
  {
    id: 5,
    question: 'How long does Premium activation take?',
    answer: "Most upgrades are activated within 1-6 hours, depending on volume. You'll be notified once your account is updated.",
  },
  {
    id: 6,
    question: 'Why is the Free Plan limited?',
    answer: 'The Free Plan is meant for testing Reviewly and exploring how the platform works. To access full reviewers, mock exams, and unlimited AI-generated questions, you\'ll need Premium.',
  },
  {
    id: 7,
    question: 'What payment methods do you accept?',
    answer: [
      'We currently accept:',
      {
        list: [
          'GCash',
          'Maya',
          'Bank transfers (selected banks)',
        ],
        ordered: false,
      },
      'Full instructions are inside the Upgrade Google Form.',
    ],
  },
  {
    id: 8,
    question: 'Can I switch between Premium plans?',
    answer: 'Yes. You can switch to Weekly, Monthly, or Quarterly anytime by submitting a new upgrade form with your payment receipt. Your new plan will take effect once your current plan expires or immediately if requested.',
  },
  {
    id: 9,
    question: 'Can I renew Premium later even if it expires?',
    answer: 'Yes — you can renew anytime by simply filling out the form again.',
  },
  {
    id: 10,
    question: 'Will automated payments be available in the future?',
    answer: 'Yes. We plan to roll out automated online payments (GCash, credit/debit cards, etc.) in future versions.',
  },
  {
    id: 11,
    question: 'Will Reviewly support more exams soon?',
    answer: [
      'Yes! We are expanding to more Philippine exams and certifications, including:',
      {
        list: [
          'LET (Teachers)',
          'NLE (Nursing)',
          'Psychometrician',
          'Criminology',
          'UPCAT / ACET / USTET',
          'CHRA - Certified Human Resource Associate',
          'and more',
        ],
        ordered: false,
      },
      'Premium users may receive early access depending on the release schedule.',
    ],
  },
  {
    id: 12,
    question: 'Do I need a Reviewly account to upgrade?',
    answer: 'Yes. Premium upgrades are tied to your Google login email, so you must sign in first before accessing the Upgrade Page.',
  },
  {
    id: 13,
    question: 'Is Reviewly safe to use?',
    answer: 'Yes. We use encrypted login via Google and secure systems to protect your data. We never store your password.',
  },
  {
    id: 14,
    question: 'How do I contact support?',
    answer: [
      'You can reach our team any time at: support@reviewly.ph.',
      { br: true },
      "We're always happy to help. 💜",
    ],
  },
];

function renderAnswer(answer, hasEmailLink, itemId) {
  const blocks = Array.isArray(answer) ? answer : [answer];
  return blocks.map((block, i) => {
    const noMargin = itemId === 14 && i === 2;
    const marginClass = noMargin || i === 0 ? 'mt-0' : 'mt-3';
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
      const ListTag = block.ordered ? 'ol' : 'ul';
      const listClass = block.ordered ? 'list-decimal list-inside' : 'list-disc list-inside';
      return (
        <ListTag key={i} className={`${listClass} pl-4 space-y-1 ${blockClass}`}>
          {block.list.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ListTag>
      );
    }
    if (block && typeof block === 'object' && block.br) {
      return <br key={i} />;
    }
    return null;
  });
}

function FAQ() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="flex justify-center pt-12 pb-20">
        <section className="w-full max-w-[800px] mx-auto px-4 sm:px-6">
          <h1
            className="font-inter font-normal text-4xl text-center text-[#0F172A] mb-10"
            data-aos="fade-up"
            data-aos-duration="500"
            data-aos-delay="0"
          >
            Frequently Asked Questions (FAQ)
          </h1>
          <div className="flex flex-col gap-10">
            {FAQ_ITEMS.map((item) => (
              <article key={item.id} data-aos="fade-up" data-aos-duration="500" data-aos-delay={Math.min(item.id * 40, 200)}>
                <h2 className="font-inter font-bold text-base text-[#0F172A] mb-4">
                  {item.id}. {item.question}
                </h2>
                <div className="font-inter font-normal text-base text-[#0F172A] m-0 leading-[160%]">
                  {renderAnswer(item.answer, item.id === 14, item.id)}
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

export default FAQ;
