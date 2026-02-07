import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  LevelUpUnderline,
  CubeIcon,
  CloudThunderIcon,
  CodeSampleIcon,
  WhyReviewlyPlaneIcon,
} from '../components/Icons';
import heroImage1 from '../Assets/heroImg1.png';
import heroImage2 from '../Assets/heroImg2.png';
import whyImg1 from '../Assets/why1.png';
import whyImg2 from '../Assets/why2.png';
import whyImg3 from '../Assets/why3.png';
import whyImg4 from '../Assets/why4.png';
import whyImg5 from '../Assets/why5.png';
import whyImg6 from '../Assets/why6.png';
import whyImg7 from '../Assets/why7.png';
import whyImg8 from '../Assets/why8.png';
import whyImg9 from '../Assets/why9.png';
import whyImg10 from '../Assets/why10.png';
import cseLogo from '../Assets/cselogo.png';

/**
 * Map logo filename (from API) to bundled asset. Replace with API base URL + path when using real backend.
 */
const REVIEWER_LOGO_MAP = {
  'cselogo.png': cseLogo,
};

/**
 * Current reviewer cards – structure mirrors backend/database response.
 * Replace with API call (e.g. GET /api/reviewers) and use response as-is.
 */
const CURRENT_REVIEWERS = [
  {
    id: 1,
    slug: 'cse-professional',
    type: 'mock',
    title: 'Civil Service Mock Exam (Professional Level)',
    description: {
      short: 'For aspiring government professionals.',
      full: "Take this exam if you're aiming for technical, admin, or supervisory positions in government. Questions on logic, math, grammar, general knowledge, and more.",
    },
    logo: {
      filename: 'cselogo.png',
      path: '/assets/cselogo.png',
    },
    details: {
      items: '170 items',
      duration: '3h 10m',
      passingRate: '80%',
      accessLevel: null,
    },
    status: 'published',
    createdAt: '2025-01-15T08:00:00.000Z',
    updatedAt: '2025-02-01T10:30:00.000Z',
  },
  {
    id: 2,
    slug: 'cse-subprofessional',
    type: 'mock',
    title: 'Civil Service Mock Exam (Sub-Professional)',
    description: {
      short: 'For entry-level clerical roles.',
      full: 'Designed for those seeking clerical or administrative support positions in government. Focuses on basic math, grammar, clerical ability, and general information',
    },
    logo: {
      filename: 'cselogo.png',
      path: '/assets/cselogo.png',
    },
    details: {
      items: '165 items',
      duration: '2h 40m',
      passingRate: '80%',
      accessLevel: null,
    },
    status: 'published',
    createdAt: '2025-01-15T08:00:00.000Z',
    updatedAt: '2025-02-01T10:30:00.000Z',
  },
  {
    id: 3,
    slug: 'cse-practice-verbal',
    type: 'practice',
    title: 'Civil Service Practice Exam (Verbal Ability)',
    description: {
      short: 'Sharpen your grammar and comprehension skills.',
      full: 'Covers English grammar, vocabulary, sentence structure, and reading comprehension—key areas to help you understand and answer questions accurately.',
    },
    logo: {
      filename: 'cselogo.png',
      path: '/assets/cselogo.png',
    },
    details: {
      items: '50 items',
      duration: 'Approx. 45m',
      passingRate: null,
      accessLevel: 'Prof & Sub-Prof',
    },
    status: 'published',
    createdAt: '2025-01-16T08:00:00.000Z',
    updatedAt: '2025-02-01T10:30:00.000Z',
  },
  {
    id: 4,
    slug: 'cse-practice-analytical',
    type: 'practice',
    title: 'Civil Service Practice Exam (Analytical Ability)',
    description: {
      short: 'Train your mind to solve patterns and puzzles.',
      full: 'Improve your skills in logical reasoning, pattern recognition, syllogisms, and problem solving—essential for tackling tough situational questions.',
    },
    logo: {
      filename: 'cselogo.png',
      path: '/assets/cselogo.png',
    },
    details: {
      items: '50 items',
      duration: 'Approx. 45m',
      passingRate: null,
      accessLevel: 'Prof only',
    },
    status: 'published',
    createdAt: '2025-01-16T08:00:00.000Z',
    updatedAt: '2025-02-01T10:30:00.000Z',
  },
  {
    id: 5,
    slug: 'cse-practice-clerical',
    type: 'practice',
    title: 'Civil Service Practice Exam (Clerical Ability)',
    description: {
      short: 'Perfect for clerical and administrative tasks.',
      full: 'Test your attention to detail, alphabetizing, record keeping, and ability to follow instructions—critical for clerical work in government.',
    },
    logo: {
      filename: 'cselogo.png',
      path: '/assets/cselogo.png',
    },
    details: {
      items: '50 items',
      duration: 'Approx. 40m',
      passingRate: null,
      accessLevel: 'Sub-Prof only',
    },
    status: 'published',
    createdAt: '2025-01-16T08:00:00.000Z',
    updatedAt: '2025-02-01T10:30:00.000Z',
  },
  {
    id: 6,
    slug: 'cse-practice-numerical',
    type: 'practice',
    title: 'Civil Service Practice Exam (Numerical Ability)',
    description: {
      short: 'Master numbers and word problems.',
      full: 'Practice basic math operations, fractions, percentages, ratios, time-speed-distance problems, and more to strengthen your quantitative reasoning.',
    },
    logo: {
      filename: 'cselogo.png',
      path: '/assets/cselogo.png',
    },
    details: {
      items: '50 items',
      duration: 'Approx. 45m',
      passingRate: null,
      accessLevel: 'Prof & Sub-Prof',
    },
    status: 'published',
    createdAt: '2025-01-16T08:00:00.000Z',
    updatedAt: '2025-02-01T10:30:00.000Z',
  },
  {
    id: 7,
    slug: 'cse-practice-general',
    type: 'practice',
    title: 'Civil Service Practice Exam (General Info)',
    description: {
      short: 'Review Philippine laws and civic concepts.',
      full: 'Focuses on the 1987 Constitution, RA 6713 (Code of Conduct), human rights, and environmental awareness—vital knowledge for all civil servants.',
    },
    logo: {
      filename: 'cselogo.png',
      path: '/assets/cselogo.png',
    },
    details: {
      items: '50 items',
      duration: 'Approx. 40m',
      passingRate: null,
      accessLevel: 'Prof & Sub-Prof',
    },
    status: 'published',
    createdAt: '2025-01-16T08:00:00.000Z',
    updatedAt: '2025-02-01T10:30:00.000Z',
  },
];

/**
 * Coming soon exams – static list (not from backend). Used in the "Coming Soon" section.
 */
const COMING_SOON_EXAMS = [
  { name: '👩🏻‍🏫 LET – Licensure Exam for Teachers' },
  { name: '⚕️ NLE – Nursing Licensure Exam' },
  { name: '🧠 Psychometrician Licensure Exam' },
  { name: '👮🏻‍♀️ Criminology Licensure Exam (CLE)' },
  { name: '👩🏻‍🎓 UPCAT and big entrance tests like ACET/USTET' },
  { name: '🧑🏻‍💼 CHRA – Certified Human Resource Associate Exam' },
];

const Home = () => {
  useEffect(() => {
    AOS.refresh();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* Hero Section - gradient bg, min-height 704.53px, stars/plus pattern, two-column layout */}
        <section
          className="relative min-h-0 lg:min-h-[704.5323486328125px] overflow-hidden"
          style={{ background: 'linear-gradient(98.48deg, #8156D1 2.51%, #421983 47.46%, #4945B3 107.59%)' }}
        >

          <div className="relative max-w-[1440px] mx-auto p-6 sm:p-8 lg:p-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-[80px] items-center">
              {/* Left: Headline, paragraphs, CTA, disclaimer */}
              <div className="text-left">
                <h1 className="font-inter text-white font-extrabold text-[28px] sm:text-[32px] md:text-[36px] lg:text-[40px] leading-tight sm:leading-[0.6] mb-6 sm:mb-8 lg:mb-10 max-w-[586.88px]" data-aos="fade-up" data-aos-duration="600" data-aos-delay="0">
                  Ready to{" "}
                  <span className="inline-block">
                    <span>level up</span>
                    <LevelUpUnderline className="block w-100 h-auto mt-[10px]" />
                  </span> your exam review?
                </h1>
                <p className="font-inter text-white text-[14px] sm:text-[16px] lg:text-[18px] font-normal leading-[1.6] mb-6 sm:mb-8 lg:mb-10 max-w-[520px]" data-aos="fade-up" data-aos-duration="600" data-aos-delay="100">
                  Start smarter reviewing with AI-powered tools designed for the Civil Service Exam — and soon, other Philippine exams, board tests, and professional certifications like CHRA.
                </p>
                <p className="font-inter text-white text-[14px] sm:text-[16px] lg:text-[18px] font-normal leading-[1.6] mb-6 sm:mb-8 lg:mb-10 max-w-[520px]" data-aos="fade-up" data-aos-duration="600" data-aos-delay="150">
                  Try sample reviewers for free. Upgrade anytime for full access to dynamic questions, mock exams, and insights.
                </p>
                <Link
                  to="/pricing"
                  className="inline-flex items-center justify-center bg-[#FFC92A] text-[#421A83] font-bold text-[16px] sm:text-[20px] lg:text-[24px] tracking-[0.5px] rounded-lg py-3 px-6 sm:py-4 sm:px-8 lg:py-[20px] lg:px-[48px] hover:opacity-95 transition-opacity"
                  style={{ fontFamily: 'Roboto, sans-serif' }}
                  data-aos="fade-up"
                  data-aos-duration="600"
                  data-aos-delay="200"
                >
                  Start for Free
                </Link>
                <p className="font-sans text-white text-[14px] sm:text-[16px] lg:text-[18px] font-normal mt-6 sm:mt-8 text-white/90" data-aos="fade-up" data-aos-duration="600" data-aos-delay="250">
                  No credit card. No stress. Just smarter studying.
                </p>
              </div>

              {/* Right: Circular images, speech bubbles, decorative icons - each with its own AOS */}
              <div className="relative hidden lg:block min-h-[544.53px]">
                {/* Top circular image - man with phone */}
                <div className="absolute top-[3px] right-0" data-aos="fade-down" data-aos-duration="400" data-aos-delay="0">
                  <img src={heroImage1} alt="" className="w-full h-full max-w-[270.86px] max-h-[344.68px] object-cover" />
                </div>
                {/* Bottom circular image - woman with tablet - offset so it triggers on load with hero (not after scroll) */}
                <div className="absolute bottom-0 left-0" data-aos="fade-up" data-aos-duration="400" data-aos-delay="0" data-aos-offset="200">
                  <img src={heroImage2} alt="" className="w-full h-full max-w-[349.6px] max-h-[345.53px] object-cover" />
                </div>

                {/* Speech bubbles - man (white), tails point down-left toward circle */}
                <div className="absolute top-0 left-[42.6px] max-w-[393px] bg-white py-[8px] px-[16px] rounded-tl-[15px] rounded-tr-[15px] rounded-br-[3px] rounded-bl-[15px]" data-aos="fade-up" data-aos-duration="400" data-aos-delay="0">
                  <p className="font-roboto text-[17px] font-regular text-[#0F172A] m-0">May mura nang alternative sa review centers!</p>
                </div>
                <div className="absolute top-[58px] left-[134.6px] max-w-[301px] bg-white py-[8px] px-[16px] rounded-tl-[15px] rounded-tr-[15px] rounded-br-[3px] rounded-bl-[15px]" data-aos="fade-up" data-aos-duration="400" data-aos-delay="0">
                  <p className="font-roboto text-[17px] font-regular text-[#0F172A] m-0">May exam result AI evaluation pa!</p>
                </div>
                {/* Speech bubbles - woman (yellow), tails point down-right toward circle */}
                <div className="absolute top-[119px] left-[42.6px] max-w-[232px] bg-[#FFC92A] px-[16px] py-[8px] rounded-tl-[15px] rounded-tr-[15px] rounded-bl-[3px] rounded-br-[15px]" data-aos="fade-up" data-aos-duration="400" data-aos-delay="0">
                  <p className="font-roboto text-[17px] font-regular text-[#0F172A] m-0">Oo nga! Ang galing!</p>
                </div>
                <div className="absolute top-[180px] left-[42.6px] max-w-[232px] bg-[#FFC92A] px-[16px] py-[8px] rounded-tl-[15px] rounded-tr-[15px] rounded-bl-[3px] rounded-br-[15px]" data-aos="fade-up" data-aos-duration="400" data-aos-delay="0">
                  <p className="font-roboto text-[17px] font-regular text-[#0F172A] m-0">Mapapadali review natin!</p>
                </div>
                {/* Decorative icons - placed separately, each with own AOS */}
                <div className="absolute bottom-[64.89px] right-[201px] w-[64px] h-[66px]" data-aos="fade-down" data-aos-duration="400" data-aos-delay="0">
                  <CubeIcon className="w-full h-full" />
                </div>
                <div className="absolute bottom-[99.53px] right-[127.33px] w-[53.33px] h-[56px]" data-aos="fade-down" data-aos-duration="400" data-aos-delay="0">
                  <CloudThunderIcon className="w-full h-full" />
                </div>
                <div className="absolute bottom-[42.88px] right-[147.98px] w-[37px] h-[27px]" data-aos="fade-down" data-aos-duration="400" data-aos-delay="0">
                  <CodeSampleIcon className="w-full h-full" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Reviewly? Section - two columns: image collage left, text right */}
        <section>
          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 py-12 lg:py-16">
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-[58.85px] items-center">
              {/* Left: 10-image collage. Tailwind w/h; responsive below lg, desktop exact at lg. Shadow via class. */}
              <div className="flex flex-row gap-2 sm:gap-3 md:gap-[10px] lg:gap-[15.5px] w-max max-w-full overflow-hidden" aria-hidden>
                <div className="flex flex-col gap-2 sm:gap-3 md:gap-[10px] lg:gap-[15.5px] justify-center items-end">
                  <div data-aos="fade-up" data-aos-duration="400" data-aos-delay="0">
                    <img src={whyImg1} alt="" className="object-cover rounded-lg w-[75px] h-[112px] sm:w-[93px] sm:h-[140px] md:w-[109px] md:h-[164px] lg:w-[124.23529815673828px] lg:h-[186.1818084716797px] shadow-why-collage" />
                  </div>
                  <div data-aos="fade-down" data-aos-duration="400" data-aos-delay="0">
                    <img src={whyImg2} alt="" className="object-cover rounded-lg w-[100px] h-[150px] sm:w-[125px] sm:h-[188px] md:w-[147px] md:h-[220px] lg:w-[166.94117736816406px] lg:h-[250.18182373046875px] shadow-why-collage" />
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:gap-3 md:gap-[10px] lg:gap-[15.5px] justify-center">
                  <div data-aos="fade-up" data-aos-duration="400" data-aos-delay="0">
                    <img src={whyImg3} alt="" className="object-cover rounded-lg w-[75px] h-[123px] sm:w-[93px] sm:h-[148px] md:w-[109px] md:h-[164px] lg:w-[124.23529815673828px] lg:h-[205.5757598876953px] shadow-why-collage" />
                  </div>
                  <div data-aos="fade-down" data-aos-duration="400" data-aos-delay="0">
                    <img src={whyImg4} alt="" className="object-cover rounded-lg w-[75px] h-[100px] sm:w-[93px] sm:h-[125px] md:w-[109px] md:h-[150px] lg:w-[124.23529815673828px] lg:h-[166.78787231445312px] shadow-why-collage" />
                  </div>
                  <div data-aos="fade-down" data-aos-duration="400" data-aos-delay="0">
                    <img src={whyImg5} alt="" className="object-cover rounded-lg w-[75px] h-[125px] sm:w-[93px] sm:h-[156px] md:w-[109px] md:h-[187px] lg:w-[124.23529815673828px] lg:h-[208.48484802246094px] shadow-why-collage" />
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:gap-3 md:gap-[10px] lg:gap-[15.5px] justify-center">
                  <div data-aos="fade-up" data-aos-duration="400" data-aos-delay="0">
                    <img src={whyImg6} alt="" className="object-cover rounded-lg w-[75px] h-[93px] sm:w-[93px] sm:h-[116px] md:w-[109px] md:h-[136px] lg:w-[124.23529815673828px] lg:h-[155.15151977539062px] shadow-why-collage" />
                  </div>
                  <div data-aos="fade-up" data-aos-duration="400" data-aos-delay="0">
                    <img src={whyImg7} alt="" className="object-cover rounded-lg w-[75px] h-[100px] sm:w-[93px] sm:h-[124px] md:w-[109px] md:h-[149px] lg:w-[124.23529815673828px] lg:h-[165.8181915283203px] shadow-why-collage" />
                  </div>
                  <div data-aos="fade-down" data-aos-duration="400" data-aos-delay="0">
                    <img src={whyImg8} alt="" className="object-cover rounded-lg w-[75px] h-[112px] sm:w-[93px] sm:h-[140px] md:w-[109px] md:h-[164px] lg:w-[124.23529815673828px] lg:h-[186.1818084716797px] shadow-why-collage" />
                  </div>
                </div>
                <div className="flex flex-col gap-2 sm:gap-3 md:gap-[10px] lg:gap-[15.5px] justify-center">
                  <div data-aos="fade-down" data-aos-duration="400" data-aos-delay="0">
                    <img src={whyImg9} alt="" className="object-cover rounded-lg w-[93px] h-[148px] sm:w-[116px] sm:h-[185px] md:w-[136px] md:h-[217px] lg:w-[155.29412841796875px] lg:h-[247.27273559570312px] shadow-why-collage" />
                  </div>
                  <div data-aos="fade-up" data-aos-duration="400" data-aos-delay="0">
                    <img src={whyImg10} alt="" className="object-cover rounded-lg w-[75px] h-[96px] sm:w-[93px] sm:h-[120px] md:w-[109px] md:h-[144px] lg:w-[124.23529815673828px] lg:h-[160px] shadow-why-collage" />
                  </div>
                </div>
              </div>

              {/* Right: Heading + plane icon, 3 paragraphs */}
              <div className="text-left max-w-[589px]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="100">
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                  <h2 className="font-sans text-[#0F172A] font-normal text-[24px] sm:text-[30px] md:text-[36px] lg:text-[40px] leading-tight">
                    Why Reviewly?
                  </h2>
                  <WhyReviewlyPlaneIcon className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 " />
                </div>
                <p className="font-sans text-[#0F172A] text-[14px] sm:text-[16px] font-normal leading-[1.6] mb-6 sm:mb-8">
                  Studying for exams in the Philippines — big or small — is never easy.
                </p>
                <p className="font-sans text-[#0F172A] text-[14px] sm:text-[16px] font-normal leading-[1.6] mb-6 sm:mb-8">
                  That's why Reviewly is designed for everyday Pinoy reviewers: practical, flexible, and built to scale from CSE to LET, NLE, Psychometrician, Criminology, UPCAT, and even professional certifications like CHRA.
                </p>
                <p className="font-sans text-[#0F172A] text-[14px] sm:text-[16px] font-normal leading-[1.6]">
                  Whether you're preparing for government service, a board license, a job qualification, or a skills exam, Reviewly grows with you.<br />
                  We're laser-focused on the Civil Service Exam today — but we're building the ultimate study buddy for all types of Philippine exams and certifications. 💜
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Current Reviewers & Coming Soon - light purple bg, centered content */}
        <section className="bg-[#F5F4FF]">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 py-10 sm:py-12 lg:py-[56px]">
            {/* Current Reviewers */}
            <div className="mb-4 sm:mb-6 lg:mb-[32px]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="0">
              <h2 className="font-inter text-[#0F172A] font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight mb-4 sm:mb-6 lg:mb-[32px]">
                📚 Current Reviewers
              </h2>
              <p className="font-inter text-[#0F172A] text-sm sm:text-base leading-[1.6]">
                All full reviewers below are available with Premium. Free users get sample 20-item versions to try out.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[24px] justify-items-center mb-4 sm:mb-6 lg:mb-[32px]">
              {CURRENT_REVIEWERS.filter((card) => card.status === 'published').map((card, index) => {
                const logoSrc = REVIEWER_LOGO_MAP[card.logo.filename] ?? card.logo.path;
                const { details } = card;
                return (
                  <div
                    key={card.slug}
                    className="w-full max-w-[410.67px] min-w-0 bg-white rounded-[12px] p-[24px] text-left shadow-[0px_2px_4px_0px_#00000026]"
                    data-aos="fade-up"
                    data-aos-duration="500"
                    data-aos-delay={100 + index * 50}
                  >
                    <img src={logoSrc} alt="" className="w-[48px] h-[48px] mb-[16px]" />
                    <h3 className="font-inter text-[#45464E] font-medium text-[16px] mb-[16px]">
                      {card.title}
                    </h3>
                    <p className="font-inter text-[#64748B] text-[15px] leading-[20px] mb-[16px] font-regular">
                      <span className="font-semibold">{card.description.short}</span>
                      <br />
                      {card.description.full}
                    </p>
                    <div className="flex flex-wrap items-center gap-[5px] text-sm text-[#0F172A]">
                      <span className="inline-flex items-center gap-1.5 font-inter font-normal not-italic text-[14px] text-[#45464E] mb-0">
                        📝 {details.items}
                      </span>
                      <span className="text-[#45464E] font-inter font-normal not-italic text-[14px]">•</span>
                      <span className="inline-flex items-center gap-1.5 font-inter font-normal not-italic text-[14px] text-[#45464E] mb-0">
                        ⏱️ {details.duration}
                      </span>
                      {details.passingRate != null && (
                        <>
                          <span className="text-[#45464E] font-inter font-normal not-italic text-[14px]">•</span>
                          <span className="inline-flex items-center gap-1.5 font-inter font-normal not-italic text-[14px] text-[#45464E] mb-0">
                            🎯 Passing rate: {details.passingRate}
                          </span>
                        </>
                      )}
                      {details.accessLevel != null && (
                        <>
                          <span className="text-[#45464E] font-inter font-normal not-italic text-[14px]">•</span>
                          <span className="inline-flex items-center gap-1.5 font-inter font-normal not-italic text-[14px] text-[#45464E] mb-0">
                            📘 {details.accessLevel}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coming Soon */}
            <div className="mb-4 sm:mb-6 lg:mb-[32px]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="0">
              <h2 className="font-inter text-[#0F172A] font-bold text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-tight mb-4 sm:mb-6 lg:mb-[32px]">
                ⭐️ Coming Soon...
              </h2>
              <p className="font-inter text-[#0F172A] text-sm sm:text-base leading-[1.6]">
                We’re expanding Reviewly to cover more Philippine exams — academic, licensure, and professional certifications.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[24px] justify-items-center mb-4 sm:mb-6 lg:mb-[32px]">
              {COMING_SOON_EXAMS.map(({ name }, index) => (
                <div
                  key={name}
                  className="w-full max-w-[410.67px] min-w-0 bg-white rounded-[12px] p-[24px] flex items-center gap-3 shadow-[0px_2px_4px_0px_#00000026]"
                  data-aos="fade-up"
                  data-aos-duration="500"
                  data-aos-delay={100 + index * 50}
                >
                  <span className="font-inter text-[#0F172A] text-[14px] font-regular">
                    {name}
                  </span>
                </div>
              ))}
            </div>

            <p className="font-inter text-[#0F172A] text-[16px] font-normal not-italic mt-4 sm:mt-6 lg:mt-[32px]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="100">
              and many more!!!
            </p>
          </div>
        </section>

        {/* Why We Keep It Simple? */}
        <section className="bg-white py-12 sm:py-16 lg:py-[40px]">
          <div className="max-w-[880px] mx-auto px-6 sm:px-8">
            <h2 className="font-inter text-[#0F172A] font-normal text-[28px] text-center mb-[24px]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="0">
              Why We Keep It Simple?
            </h2>
            <p className="font-inter text-[#0F172A] font-normal text-[16px] text-center mb-[40px] leading-[180%]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="50">
              At Reviewly, we believe that quality review tools should be accessible to every Filipino learner. That's why you can start with free sample reviewers to explore how Reviewly works — no pressure, no commitment.
            </p>
            <p className="font-inter text-[#0F172A] font-normal text-[16px] text-center mb-[40px] leading-[180%]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="100">
              When you're ready to unlock the full experience, Premium gives you complete access to all reviewers, dynamic AI-generated questions, mock exams, and explanations across all current and future exam modules.
            </p>
            <p className="font-inter text-[#0F172A] font-normal text-[16px] text-center mb-0 leading-[180%]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="150">
              No confusing tiers. No complicated upgrades.<br /> Just one full-access Premium experience — you simply choose how long you want it. Clear, flexible, and designed to grow with you.💜
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div >
  );
};

export default Home;
