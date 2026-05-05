import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import DashNav from '../components/DashNav';
import FloatingField from '../components/FloatingField';
import { useAuth } from '../context/AuthContext';

const AccountSettings = () => {
  const { user, updateUser } = useAuth();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [marketingEmails, setMarketingEmails] = useState(user?.marketingEmails ?? true);
  const [examType, setExamType] = useState(user?.examType || null);
  const [examTypeSaving, setExamTypeSaving] = useState(false);
  const [examTypeStatus, setExamTypeStatus] = useState('');

  useEffect(() => {
    AOS.refresh();
  }, []);

  // Sync if user loads late
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setMarketingEmails(user.marketingEmails ?? true);
      setExamType(user.examType || null);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateUser({ firstName, lastName, marketingEmails });
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  const handleSaveExamType = async (next) => {
    if (!next || next === user?.examType || examTypeSaving) return;
    setExamTypeSaving(true);
    setExamTypeStatus('');
    const previous = user?.examType || null;
    setExamType(next);
    try {
      await updateUser({ examType: next });
      setExamTypeStatus('Saved');
    } catch (err) {
      console.error('Failed to update exam type:', err);
      setExamType(previous);
      setExamTypeStatus('Could not save. Please try again.');
    } finally {
      setExamTypeSaving(false);
    }
  };

  const initials = `${(firstName || '')[0] || ''}${(lastName || '')[0] || ''}`.toUpperCase();

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
              <div className="w-[64px] h-[64px] rounded-full bg-[#ECE8F3] border-2 border-[#A18DC3] flex items-center justify-center shrink-0 overflow-hidden">
                {user?.profilePic ? (
                  <img src={user.profilePic} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span className="font-inter font-semibold text-[32px] text-[#431C86]">{initials}</span>
                )}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="flex-1 min-w-0 space-y-[24px]">
                <div>
                  <p className="font-inter font-medium text-[14px] text-[#45464E] mb-1">Email address</p>
                  <p className="font-inter font-normal text-[14px] text-[#45464E]">
                    You're signed in using your Google account:{" "}<span className="font-inter font-semibold text-[14px] text-[#0F172A] mt-0.5">{user?.email || ''}</span>
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
                <button
                  type="button"
                  onClick={handleSave}
                  className="mt-4 font-inter font-semibold text-[14px] text-[#421A83] py-2.5 px-6 rounded-[8px] bg-[#FFC92A] hover:opacity-95 transition-opacity"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </section>
          <hr className="border-0 border-t border-[#E1E2E9] mx-6 sm:mx-8" />

          {/* Exam Type */}
          <section className="p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4 mb-1">
              <h2 className="font-inter font-semibold text-[16px] text-[#45464E]">Exam Type</h2>
              {examTypeStatus && (
                <span className={`font-inter text-[12px] font-medium ${examTypeStatus === 'Saved' ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                  {examTypeStatus}
                </span>
              )}
            </div>
            <p className="font-inter font-normal text-[13px] text-[#64748B] mb-5">
              Choose the Civil Service Exam track you're preparing for. This drives your dashboard breakdown, mock exams, and sprint plan.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-[560px]">
              {[
                {
                  key: 'professional',
                  label: 'Professional',
                  sub: 'Higher coverage & difficulty',
                  badge: 'CS Prof',
                },
                {
                  key: 'subprofessional',
                  label: 'Sub-Professional',
                  sub: 'Clerical & non-professional roles',
                  badge: 'CS Sub-Prof',
                },
              ].map(({ key, label, sub, badge }) => {
                const selected = examType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleSaveExamType(key)}
                    disabled={examTypeSaving}
                    aria-pressed={selected}
                    className={`relative flex-1 text-left px-4 py-4 rounded-[12px] border-2 transition-all duration-200 disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6E43B9]/40 ${
                      selected
                        ? 'border-[#6E43B9] bg-[#F3EFFB]'
                        : 'border-[#E1E2E9] bg-white hover:border-[#C4B5FD] hover:bg-[#FAF8FF]'
                    }`}
                  >
                    {/* Checkmark */}
                    <span
                      className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 ${
                        selected ? 'bg-[#6E43B9]' : 'border border-[#D1D5DB] bg-white'
                      }`}
                    >
                      {selected && (
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>

                    {/* Badge */}
                    <span className={`inline-block font-inter font-semibold text-[10px] px-2 py-[2px] rounded-full mb-2 ${
                      selected ? 'bg-[#6E43B9] text-white' : 'bg-[#F1F0F5] text-[#6E43B9]'
                    }`}>
                      {badge}
                    </span>

                    <p className={`font-inter font-bold text-[14px] ${selected ? 'text-[#421A83]' : 'text-[#45464E]'}`}>{label}</p>
                    <p className="font-inter text-[12px] text-[#64748B] mt-0.5">{sub}</p>
                  </button>
                );
              })}
            </div>
            {!examType && (
              <p className="font-inter text-[12px] text-[#9CA3AF] mt-3">
                You haven't picked a track yet — choose one to personalize your experience.
              </p>
            )}
          </section>
          <hr className="border-0 border-t border-[#E1E2E9] mx-6 sm:mx-8" />

          {/* Subscription */}
          <section className="p-6 sm:p-8">
            <h2 className="font-inter font-semibold text-[16px] text-[#45464E] mb-4">Subscription</h2>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                {(() => {
                  const plan = user?.subscription?.plan || 'free';
                  const expiresAt = user?.subscription?.expiresAt;
                  const planLabels = { free: 'Free', weekly: 'Weekly', monthly: 'Monthly', quarterly: 'Quarterly' };
                  const label = planLabels[plan] || plan;
                  const isActive = plan !== 'free' && expiresAt && new Date(expiresAt) > new Date();
                  const formattedDate = expiresAt
                    ? new Date(expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                    : null;

                  if (plan === 'free') {
                    return (
                      <>
                        <p className="font-inter font-normal text-[14px] text-[#45464E]">
                          You're currently on the <span className="font-semibold text-[#0F172A]">Free</span> plan.
                        </p>
                        <p className="font-inter font-normal text-[14px] text-[#45464E] mt-2">Upgrade to unlock premium reviewers! 🚀</p>
                      </>
                    );
                  }

                  if (isActive) {
                    return (
                      <>
                        <p className="font-inter font-normal text-[14px] text-[#45464E]">
                          You currently have <span className="font-semibold text-[#0F172A]">{label}</span> access until{' '}
                          <span className="font-semibold text-[#0F172A]">{formattedDate}.</span>
                        </p>
                        <p className="font-inter font-normal text-[14px] text-[#45464E] mt-2">Thanks for supporting Reviewly! 💜</p>
                      </>
                    );
                  }

                  return (
                    <>
                      <p className="font-inter font-normal text-[14px] text-[#45464E]">
                        Your <span className="font-semibold text-[#0F172A]">{label}</span> subscription expired on{' '}
                        <span className="font-semibold text-[#0F172A]">{formattedDate}.</span>
                      </p>
                      <p className="font-inter font-normal text-[14px] text-[#45464E] mt-2">Renew to keep your access! 🔄</p>
                    </>
                  );
                })()}
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
          {/* <section className="p-6 sm:p-8">
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
          <hr className="border-0 border-t border-[#E1E2E9] mx-6 sm:mx-8" /> */}


          {/* App Info */}
          <section className="p-6 sm:p-8">
            <h2 className="font-inter font-semibold text-[16px] text-[#45464E] mb-4">App Info</h2>
            <p className="font-inter font-normal text-[14px] text-[#45464E]">Reviewly PH - Version 2.0</p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default AccountSettings;
