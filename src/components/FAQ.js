import { useState, useRef, useEffect } from 'react';

const FAQ_ITEMS = [
  {
    id: 1,
    question: 'Is Reviewly free to use?',
    answer: 'Yes. You can start with the free Readiness Check anytime — no credit card needed.',
  },
  {
    id: 2,
    question: 'What do I get after I take a mock exam?',
    answer: "You'll see your Readiness Score, gap-to-pass, and a breakdown of the areas pulling your score down — plus answer review and explanations.",
  },
  {
    id: 3,
    question: 'Is Reviewly for Professional or Sub-Professional?',
    answer: "Both. You can choose which CSE level you're taking, and Reviewly will match the right mock and coverage.",
  },
  {
    id: 4,
    question: 'Do I need to study every day to use Reviewly?',
    answer: "No. Reviewly works even if you're busy — you can review at your own pace and focus on your weakest areas first.",
  },
  {
    id: 5,
    question: 'Do I need a review center to use this?',
    answer: "Not required. Reviewly works for self-reviewers and also as a supplement if you're enrolled in a review center.",
  },
  {
    id: 6,
    question: 'Can I retake the mock exam?',
    answer: "Yes. You can retake the free mock to re-check your readiness. Premium adds extra mock versions and a more guided plan.",
  },
];

const Chevron = ({ isOpen }) => (
  <svg
    width="20" height="20" viewBox="0 0 20 20" fill="none"
    xmlns="http://www.w3.org/2000/svg" aria-hidden="true"
    style={{ transition: 'transform 0.3s ease', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
  >
    <path d="M5 7.5L10 12.5L15 7.5" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AccordionItem = ({ item, isOpen, onToggle, delay }) => {
  const contentRef = useRef(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  return (
    <div
      className="bg-white rounded-[12px] border border-[#E2E8F0] overflow-hidden"
      data-aos="fade-up" data-aos-duration="500" data-aos-delay={delay}
    >
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="font-inter font-semibold text-[#0F172A] text-[14px] sm:text-[16px]">
          {item.id}. {item.question}
        </span>
        <Chevron isOpen={isOpen} />
      </button>
      <div
        ref={contentRef}
        style={{ height, overflow: 'hidden', transition: 'height 0.3s ease' }}
      >
        <div className="px-5 pb-4">
          <p className="font-inter text-[#45464E] text-[13px] sm:text-[15px] leading-[1.7]">
            {item.answer}
          </p>
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [openId, setOpenId] = useState(1);

  return (
    <section className="py-12 sm:py-16 lg:py-[80px]" style={{ background: '#F5F4FF' }}>
      <div className="max-w-[800px] mx-auto px-6 sm:px-8">
        <div className="text-center mb-[24px] lg:mb-[56px]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="0">
          <h2 className="font-inter text-[#0F172A] font-normal text-[24px] sm:text-[28px] lg:text-[32px] mb-[24px]">
            FAQ
          </h2>
          <p className="font-inter text-[#0F172A80] text-[17px] sm:text-[20px]">
            Short, practical answers — so you can start with confidence.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem
              key={item.id}
              item={item}
              isOpen={openId === item.id}
              onToggle={() => setOpenId(openId === item.id ? null : item.id)}
              delay={i * 40}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
