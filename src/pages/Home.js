import React, { useEffect } from 'react';
import AOS from 'aos';
import Header from '../components/Header';
import Footer from '../components/Footer';
import GoogleAuthButton from '../components/GoogleAuthButton';
import FAQ from '../components/FAQ';
import {
  RulerIcon,
  ChartPieIcon,
  BookOpenIcon,
  TimerIcon,
  FileChartIcon,
  RocketIcon,
  YellowUnderline
} from '../components/Icons';
import heroImg from '../Assets/heroImg.png';
import heroSprintCard from '../Assets/heroSprintCard.png';
import featureReadiness from '../Assets/featureReadiness.png';
import featureAnswerReview from '../Assets/featureAnswerReview.png';
import featureDashboard from '../Assets/featureDashboard.png';
import featureNextSteps from '../Assets/featureNextSteps.png';
import heroReadinessCard from '../Assets/heroReadinessCard.png';
import whyImg from '../Assets/whyImg.png';

const Home = () => {

  useEffect(() => {
    AOS.refresh();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* Hero Section */}
        <section
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(98.48deg, #8156D1 2.51%, #421983 47.46%, #4945B3 107.59%)' }}
        >
          <div className="relative max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 py-16 lg:py-[80px]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-[80px] items-center">

              {/* Left: Headline, subtext, CTAs, stats */}
              <div className="text-left">
                <h1 className="font-inter text-white font-semi-bold text-[36px] sm:text-[44px] lg:text-[52px] leading-[1.15] mb-[40px]" data-aos="fade-up" data-aos-duration="600" data-aos-delay="0">
                  <span className="relative inline-block pb-[15px]">
                    Stop guessing
                    <YellowUnderline className="absolute left-0 bottom-0 w-full h-[15px]" />
                  </span>{' '}what<br />
                  to study for the CSE.
                </h1>

                <p className="font-inter text-white text-[16px] sm:text-[18px] lg:text-[22px] leading-[1.7] mb-[40px] max-w-[500px]" data-aos="fade-up" data-aos-duration="600" data-aos-delay="100">
                  Take a free mock exam, see your weak topics, and get clearer next steps — at your own pace.
                </p>

                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-[24px] mb-[40px]" data-aos="fade-up" data-aos-duration="600" data-aos-delay="150">
                  <GoogleAuthButton
                    label="Take a Free CSE Mock"
                    redirectTo="/dashboard/all-reviewers"
                    className="inline-flex items-center justify-center bg-[#FFC92A] text-[#3B1A71] font-semibold text-[16px] sm:text-[18px] lg:text-[20px] rounded-[8px] py-[12px] sm:py-[14px] lg:h-[56px] lg:py-0 px-[20px] sm:px-[22px] lg:px-[24px] hover:opacity-90 transition-opacity whitespace-nowrap w-full sm:w-auto"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    className="inline-flex items-center justify-center border-[1px] border-white text-white font-semibold text-[16px] sm:text-[18px] lg:text-[20px] rounded-[8px] py-[12px] sm:py-[14px] lg:h-[56px] lg:py-0 px-[24px] sm:px-[28px] lg:px-[32px] hover:bg-white/10 transition-colors whitespace-nowrap w-full sm:w-auto"
                  >
                    See How It Works
                  </button>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap gap-8 sm:gap-[52px]" data-aos="fade-up" data-aos-duration="600" data-aos-delay="200">
                  <div>
                    <div className="font-inter font-regular text-[20px] sm:text-[24px] text-[#FFC92A] leading-none mb-[4px]">5,900+</div>
                    <div className="font-inter text-white text-[14px] sm:text-[18px]">CSE Aspirants</div>
                  </div>
                  <div>
                    <div className="font-inter font-regular text-[20px] sm:text-[24px] text-[#FFC92A] leading-none mb-[4px]">7,300+</div>
                    <div className="font-inter text-white text-[14px] sm:text-[18px]">Mock Exams Taken</div>
                  </div>
                  <div>
                    <div className="font-inter font-regular text-[20px] sm:text-[24px] text-[#FFC92A] leading-none mb-[4px]">4,350+</div>
                    <div className="font-inter text-white text-[14px] sm:text-[18px]">Full Mocks Completed</div>
                  </div>
                </div>
              </div>

              {/* Right: Circle + person image + floating card images + icon badges */}
              <div className="relative hidden lg:flex items-center justify-center w-[520px] h-[520px] rounded-full" style={{ background: '#7064A4' }}>

                {/* Person image */}
                <img src={heroImg} alt="CSE Aspirant" className="relative z-10 h-[520px] w-auto object-contain bottom-[-23px]" />

                {/* 7-Day Sprint Progress card image */}
                <img
                  src={heroSprintCard}
                  alt="7-Day Sprint Progress"
                  className="absolute top-[-12.41px] right-[5.7px] z-9 w-[257px] h-auto"
                  style={{ transform: 'rotate(1.68deg)', boxShadow: '0px 6px 8px 0px rgba(0, 0, 0, 0.15)' }}
                  data-aos="fade-left" data-aos-duration="500" data-aos-delay="200"
                />

                {/* Readiness Checker card image */}
                <img
                  src={heroReadinessCard}
                  alt="Readiness Checker"
                  className="absolute bottom-[185.3px] left-[-10px] z-20 w-[163px] h-auto"
                  data-aos="fade-right" data-aos-duration="500" data-aos-delay="200"
                />

                {/* RulerIcon badge — left middle */}
                <div
                  className="absolute left-[45px] bottom-[50.57px] z-20 bg-white rounded-[8px] w-[48px] h-[48px] flex items-center justify-center"
                  style={{ transform: 'rotate(-7.8deg)' }}
                  data-aos="fade-up" data-aos-duration="500" data-aos-delay="300"
                >
                  <RulerIcon className="w-7 h-7" />
                </div>

                {/* ChartPieIcon badge — right upper */}
                <div
                  className="absolute left-[65.15px] top-[67.03px] z-20 bg-white rounded-[8px] w-[48px] h-[48px] flex items-center justify-center"
                  data-aos="fade-down" data-aos-duration="500" data-aos-delay="300"
                >
                  <ChartPieIcon className="w-6 h-6" />
                </div>

                {/* BookOpenIcon badge — right lower */}
                <div
                  className="absolute right-[17.77px] bottom-[215.74px] z-20 bg-white rounded-[8px] w-[48px] h-[48px] flex items-center justify-center"
                  style={{ transform: 'rotate(5.3deg)' }}
                  data-aos="fade-down" data-aos-duration="500" data-aos-delay="300"
                >
                  <BookOpenIcon className="w-7 h-7" />
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="bg-white pt-16 lg:pt-[64px] lg:pb-[24px] pb-[20px]">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20">
            <div className="text-center mb-10 lg:mb-[56px]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="0">
              <h2 className="font-inter text-[#0F172A] font-regular text-[22px] sm:text-[26px] lg:text-[32px] leading-tight mb-[24px]">How it works</h2>
              <p className="font-inter text-[#0F172A80] text-[14px] sm:text-[17px] lg:text-[20px]">How Reviewly helps you review smarter</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-[24px]">
              {/* Card 1 */}
              <div className="border border-[#EFF0F6] rounded-[12px] p-[24px]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="0">
                <div className="w-[56px] h-[56px] rounded-[16px] bg-[#F6F4F9] flex items-center justify-center mb-[16px]">
                  <TimerIcon className="w-7 h-7" />
                </div>
                <h3 className="font-inter font-bold text-[#45464E] text-[15px] sm:text-[16px] lg:text-[18px] mb-[16px]">Take a mock → see where you stand</h3>
                <p className="font-inter text-[#0F172A] text-[13px] sm:text-[14px] lg:text-[16px] leading-[1.6]">Start with a free CSE mock exam to check where you currently stand.</p>
              </div>

              {/* Card 2 */}
              <div className="border border-[#EFF0F6] rounded-[12px] p-[24px]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="100">
                <div className="w-[56px] h-[56px] rounded-[16px] bg-[#F6F4F9] flex items-center justify-center mb-[16px]">
                  <FileChartIcon className="w-7 h-7" />
                </div>
                <h3 className="font-inter font-bold text-[#45464E] text-[15px] sm:text-[16px] lg:text-[18px] mb-[16px]">Spot weak subjects & topics</h3>
                <p className="font-inter text-[#0F172A] text-[13px] sm:text-[14px] lg:text-[16px] leading-[1.6]">Get your Readiness Score, gap-to-pass, and the subjects/topics pulling your score down.</p>
              </div>

              {/* Card 3 */}
              <div className="border border-[#EFF0F6] rounded-[12px] p-[24px]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="200">
                <div className="w-[56px] h-[56px] rounded-[16px] bg-[#F6F4F9] flex items-center justify-center mb-[16px]">
                  <RocketIcon className="w-7 h-7" />
                </div>
                <h3 className="font-inter font-bold text-[#45464E] text-[15px] sm:text-[16px] lg:text-[18px] mb-[16px]">Study with clearer next steps</h3>
                <p className="font-inter text-[#0F172A] text-[13px] sm:text-[14px] lg:text-[16px] leading-[1.6]">Review explanations, focus on weak areas, and follow a guided review path at your own pace.</p>
              </div>
            </div>
          </div>
        </section>

        {/* See How Reviewly Guides Your Review */}
        <section className="bg-white py-16 lg:py-[80px]">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20">
            <h2 className="font-inter text-[#0F172A] font-normal text-[20px] sm:text-[26px] lg:text-[32px] text-center mb-8 sm:mb-10 lg:mb-[56px]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="0">
              See how Reviewly guides your review
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[24px]">
              {/* Card 1 — Results / Readiness */}
              <div className="rounded-[16px] px-[24px] pt-[24px] sm:px-[40px] sm:pt-[40px] bg-[#F5F4FF] max-h-[480px] overflow-hidden" data-aos="fade-up" data-aos-duration="500" data-aos-delay="0">
                <p className="font-inter font-semibold text-[11px] sm:text-[14px] text-[#6E43B9] uppercase tracking-wider mb-[8px] sm:mb-[12px]">Results / Readiness</p>
                <h3 className="font-inter font-bold text-[#45464E] text-[16px] sm:text-[19px] lg:text-[22px] mb-[8px] sm:mb-[12px]">See your Readiness Score after every mock.</h3>
                <p className="font-inter text-[#0F172A] text-[13px] sm:text-[15px] lg:text-[16px] leading-[1.6] mb-[20px] sm:mb-[32px]">Know how close you are to passing see where you stand.</p>
                <img src={featureReadiness} alt="Readiness Score" className="w-full sm:max-w-[430px] mx-auto h-auto rounded-[8px]" />
              </div>

              {/* Card 2 — Answer Review / Explanations */}
              <div className="rounded-[16px] px-[24px] pt-[24px] sm:px-[40px] sm:pt-[40px] bg-[#F5F4FF] max-h-[480px] overflow-hidden" data-aos="fade-up" data-aos-duration="500" data-aos-delay="100">
                <p className="font-inter font-semibold text-[11px] sm:text-[14px] text-[#6E43B9] uppercase tracking-wider mb-[8px] sm:mb-[12px]">Answer Review / Explanations</p>
                <h3 className="font-inter font-bold text-[#45464E] text-[16px] sm:text-[19px] lg:text-[22px] mb-[8px] sm:mb-[12px]">Understand your mistakes better.</h3>
                <p className="font-inter text-[#0F172A] text-[13px] sm:text-[15px] lg:text-[16px] leading-[1.6] mb-[20px] sm:mb-[32px]">Learn why an answer is correct and where your thinking went wrong.</p>
                <img src={featureAnswerReview} alt="Answer Review" className="w-full sm:max-w-[548px] mx-auto h-auto rounded-[8px]" />
              </div>

              {/* Card 3 — Dashboard / Weak Topics */}
              <div className="rounded-[16px] px-[24px] pt-[24px] sm:px-[40px] sm:pt-[40px] bg-[#F5F4FF] max-h-[480px] overflow-hidden" data-aos="fade-up" data-aos-duration="500" data-aos-delay="0">
                <p className="font-inter font-semibold text-[11px] sm:text-[14px] text-[#6E43B9] uppercase tracking-wider mb-[8px] sm:mb-[12px]">Dashboard / Weak Topics</p>
                <h3 className="font-inter font-bold text-[#45464E] text-[16px] sm:text-[19px] lg:text-[22px] mb-[8px] sm:mb-[12px]">Spot your weak topics faster.</h3>
                <p className="font-inter text-[#0F172A] text-[13px] sm:text-[15px] lg:text-[16px] leading-[1.6] mb-[20px] sm:mb-[32px]">See which sections and topics need the most attention.</p>
                <img src={featureDashboard} alt="Dashboard Weak Topics" className="w-full sm:max-w-[430px] mx-auto h-auto rounded-[8px]" />
              </div>

              {/* Card 4 — Next Steps / Review Plan */}
              <div className="rounded-[16px] px-[24px] pt-[24px] sm:px-[40px] sm:pt-[40px] bg-[#F5F4FF] max-h-[480px] overflow-hidden" data-aos="fade-up" data-aos-duration="500" data-aos-delay="100">
                <p className="font-inter font-semibold text-[11px] sm:text-[14px] text-[#6E43B9] uppercase tracking-wider mb-[8px] sm:mb-[12px]">Next Steps / Review Plan</p>
                <h3 className="font-inter font-bold text-[#45464E] text-[16px] sm:text-[19px] lg:text-[22px] mb-[8px] sm:mb-[12px]">Get clearer next steps for your next review.</h3>
                <p className="font-inter text-[#0F172A] text-[13px] sm:text-[15px] lg:text-[16px] leading-[1.6] mb-[20px] sm:mb-[32px]">Turn weak areas into a simple, guided review path.</p>
                <img src={featureNextSteps} alt="Next Steps Review Plan" className="w-full sm:max-w-[430px] mx-auto h-auto rounded-[8px]" />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-white py-8 px-6 sm:px-0">
          <div className="max-w-[840px] mx-auto">
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-[80px] rounded-[16px] px-6 py-8 sm:px-0 sm:py-[24px]"
              style={{ background: 'linear-gradient(98.48deg, #8156D1 2.51%, #421983 47.46%, #4945B3 107.59%), linear-gradient(0deg, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2))' }}
              data-aos="fade-up" data-aos-duration="500" data-aos-delay="0"
            >
              <p className="font-inter text-white font-normal text-[18px] sm:text-[24px] lg:text-[32px] text-center sm:text-left">
                Ready to try it?
              </p>
              <GoogleAuthButton
                label="Take a Free CSE Mock"
                redirectTo="/dashboard/all-reviewers"
                className="inline-flex items-center justify-center bg-[#FFC92A] text-[#3B1A71] font-semibold text-[14px] sm:text-[16px] lg:text-[20px] rounded-[8px] py-[13px] sm:py-[16px] lg:h-[56px] lg:py-0 px-[20px] sm:px-[24px] hover:opacity-90 transition-opacity whitespace-nowrap w-full sm:w-auto"
              />
            </div>
          </div>
        </section>

        {/* Why Reviewly? Section - two columns: image collage left, text right */}
        <section>
          <div className="max-w-[1440px] mx-auto px-6 sm:px-8 lg:px-20 py-12 lg:py-16">
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-[58.85px] items-center">
              {/* Left: single image */}
              <div data-aos="fade-up" data-aos-duration="500" data-aos-delay="0">
                <img src={whyImg} alt="" className="w-full max-w-[540px] h-auto rounded-[12px]" />
              </div>

              {/* Right: Heading + plane icon, 3 paragraphs */}
              <div className="text-left max-w-[589px]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="100">
                <div className="flex items-center">
                  <h2 className="font-inter text-[#0F172A] font-normal text-[28px] leading-tight max-w-[450px] mb-[24px]">
                    Built for the way Filipino learners actually review
                  </h2>
                </div>
                <p className="font-inter text-[#0F172A] text-[14px] sm:text-[16px] font-normal leading-[1.6] mb-6 sm:mb-8">
                  Reviewly is made for CSE takers who want a simpler, more guided way to prepare.
                </p>
                <p className='font-inter text-[#0F172A] text-[14px] sm:text-[16px] font-normal leading-[1.6]'>Whether you’re:</p>
                <ul className="font-inter text-[#0F172A] text-[14px] sm:text-[16px] font-normal leading-[1.6] mb-6 sm:mb-8 list-disc list-inside ps-3">
                  <li>reviewing on your own,</li>
                  <li>fitting review around work or school,</li>
                  <li>or using it alongside a review center,</li>
                </ul>
                <p className="font-sans text-[#0F172A] text-[14px] sm:text-[16px] font-normal leading-[1.6]">
                  Reviewly helps you focus on what matters most.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQ />
      </main>

      <Footer />
    </div >
  );
};

export default Home;