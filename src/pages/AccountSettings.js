import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import DashNav from '../components/DashNav';
import FloatingField from '../components/FloatingField';

const AccountSettings = () => {
  const [firstName, setFirstName] = useState('Jahz');
  const [lastName, setLastName] = useState('Rojas');
  const [marketingEmails, setMarketingEmails] = useState(true);

  useEffect(() => {
    AOS.refresh();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      <DashNav />
      <main className="max-w-[960px] mx-auto p-[24px]">
        <h1
          className="font-inter font-medium text-[20px] text-[#45464E] leading-tight my-6"
          data-aos="fade-up"
          data-aos-duration="500"
          data-aos-delay="0"
        >
          Account Settings
        </h1>

        <div
          className="bg-white rounded-[12px]"
          data-aos="fade-up"
          data-aos-duration="500"
          data-aos-delay="100"
        >
          {/* General */}
          <section className="p-6 sm:p-8">
            <div className='flex flex-col gap-[24px] mb-6'>
              <h2 className="font-inter font-semibold text-[16px] text-[#45464E]">General</h2>
              <div className="w-[64px] h-[64px] rounded-full bg-[#ECE8F3] border-2 border-[#A18DC3] flex items-center justify-center shrink-0">
                <span className="font-inter font-semibold text-[32px] text-[#431C86]">JR</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="flex-1 min-w-0 space-y-[24px]">
                <div>
                  <p className="font-inter font-medium text-[14px] text-[#45464E] mb-1">Email address</p>
                  <p className="font-inter font-normal text-[14px] text-[#45464E]">
                    You're signed in using your Google account:{" "}<span className="font-inter font-semibold text-[14px] text-[#0F172A] mt-0.5">jahz@reviewly.ph</span>
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-10 max-w-[560px]">
                  <div className="min-w-0 max-w-[272px]">
                    <FloatingField
                      id="first-name"
                      label="First Name"
                      value={firstName}
                      onChange={setFirstName}
                    />
                  </div>
                  <div className="min-w-0 max-w-[272px]">
                    <FloatingField
                      id="last-name"
                      label="Last Name"
                      value={lastName}
                      onChange={setLastName}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
          <hr className="border-0 border-t border-[#E1E2E9] mx-6 sm:mx-8" />

          {/* Subscription */}
          <section className="p-6 sm:p-8">
            <h2 className="font-inter font-semibold text-[16px] text-[#45464E] mb-4">Subscription</h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-inter font-normal text-[14px] text-[#45464E]">
                  You currently have <span className="font-semibold text-[#0F172A]">Premium Monthly</span> access until{' '}
                  <span className="font-semibold text-[#0F172A]">February 29, 2026.</span>
                </p>
                <p className="font-inter font-normal text-[14px] text-[#45464E] mt-2">Thanks for supporting Reviewly! 💜</p>
              </div>
              <Link
                to="/dashboard/settings/update-subscription"
                className="font-inter font-medium text-[14px] text-[#6E43B9] underline hover:no-underline shrink-0"
              >
                Update Subscription
              </Link>
            </div>
          </section>
          <hr className="border-0 border-t border-[#E1E2E9] mx-6 sm:mx-8" />

          {/* Notifications */}
          <section className="p-6 sm:p-8">
            <h2 className="font-inter font-semibold text-[16px] text-[#45464E] mb-4">Notifications</h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-inter font-semibold text-[14px] text-[#45464E]">Marketing emails</p>
                <p className="font-inter font-normal text-[14px] text-[#64748B] mt-1">
                  Get updates on new reviewers, feature releases, and promos.
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  role="switch"
                  aria-checked={marketingEmails}
                  aria-label="Marketing emails"
                  onClick={() => setMarketingEmails((v) => !v)}
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#6E43B9]/30 focus:ring-offset-2 ${marketingEmails ? 'bg-[#6E43B9]' : 'bg-[#CFD3D4]'
                    }`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform mt-0.5 ${marketingEmails ? 'translate-x-6' : 'translate-x-0.5'
                      }`}
                  />
                </button>
                <span className="font-inter font-normal text-[14px] text-[#45464E]">
                  {marketingEmails ? 'On' : 'Off'}
                </span>
              </div>
            </div>
          </section>
          <hr className="border-0 border-t border-[#E1E2E9] mx-6 sm:mx-8" />


          {/* App Info */}
          <section className="p-6 sm:p-8">
            <h2 className="font-inter font-semibold text-[16px] text-[#45464E] mb-4">App Info</h2>
            <p className="font-inter font-normal text-[14px] text-[#45464E]">Reviewly PH - Version 1.0</p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AccountSettings;
