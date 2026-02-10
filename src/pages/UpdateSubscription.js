import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import DashNav from '../components/DashNav';
import PlanCards from '../components/PlanCards';

const UpdateSubscription = () => {
  useEffect(() => {
    AOS.refresh();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      <DashNav />
      <main className="max-w-[1140px] mx-auto p-[24px]">
        {/* Breadcrumb */}
        <nav className="mb-[24px]" aria-label="Breadcrumb">
          <Link
            to="/dashboard/settings"
            className="text-[#45464E] font-inter font-normal text-[14px] hover:text-[#6E43B9] transition-colors"
          >
            Account Settings
          </Link>
          <span className="mx-2">›</span>
          <span className="text-[#6E43B9] font-inter font-normal text-[14px]">Update Subscription</span>
        </nav>
        <div className='max-w-[960px] mx-auto'>
          {/* Intro Section */}
          <h1
            className="font-inter font-medium text-[20px] text-[#45464E] mb-[32px]"
            data-aos="fade-up"
            data-aos-duration="500"
          >
            Update Subscription
          </h1>
          <p
            className="font-inter font-normal text-[16px] text-[#0F172A] mb-2"
            data-aos="fade-up"
            data-aos-duration="500"
            data-aos-delay="50"
          >
            Get full access to all reviewers, mock exams, detailed explanations, and performance insights — designed to help you pass with confidence.
          </p>
          <p
            className="font-inter font-normal text-[13px] text-[#0F172A] mb-[24px]"
            data-aos="fade-up"
            data-aos-duration="500"
            data-aos-delay="100"
          >
            *No credit card required. Payments are processed manually for now.
          </p>

          {/* Google Form Area - Empty placeholder for embed */}
          <div
            className="bg-white rounded-[12px] py-[40px] px-[29px] mb-[24px] min-h-[1360px]"
            data-aos="fade-up"
            data-aos-duration="500"
            data-aos-delay="200"
          >
            <h3 className="font-inter font-semibold text-[16px] text-[#45464E] mb-2">Reviewly Subscription Form</h3>
            <p className="font-inter text-[14px] text-[#6C737F] mb-4">
              Ready to unlock all Reviewly reviewers and mock exams?
            </p>
            <iframe
              title="Reviewly Subscription Form"
              src="https://docs.google.com/forms/d/e/1FAIpQLSdjAt_XKMwL5HwYMdYWmuSPg-ORsSA20ttJ0gdudtQYrvjMPw/viewform?embedded=true"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
              className="w-full h-[1200px] block"
            >
              Loading…
            </iframe>
          </div>
        </div>

        {/* Plan Cards */}
        <section>
          <h2
            className="font-inter font-bold text-[20px] text-[#45464E] mb-[16px]"
            data-aos="fade-up"
            data-aos-duration="500"
          >
            Choose the plan that works best for you
          </h2>
          <p
            className="font-inter font-normal text-[20px] text-[#45464E] mb-6"
            data-aos="fade-up"
            data-aos-duration="500"
            data-aos-delay="50"
          >
            Not sure yet? You can start with Weekly and upgrade anytime.
          </p>
          <PlanCards />
        </section>
      </main>
    </div>
  );
};

export default UpdateSubscription;
