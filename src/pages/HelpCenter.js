import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import DashNav from '../components/DashNav';
import { supportAPI } from '../services/api';

/**
 * FAQ items from the Help Center design (5 questions only).
 */
const FAQ_ITEMS = [
  { id: 1, question: 'How do I upgrade my plan?', answer: "You start on Free by default. To upgrade, go to the Account Settings page, choose 'Update Subscription' and complete the Google Form with your payment details. We'll activate your account after verification." },
  { id: 2, question: 'I already paid — when will my Premium be activated?', answer: "Most upgrades are activated within 24–48 hours after we verify your payment. You'll be notified once your account is updated." },
  { id: 3, question: 'Why are my questions different each time?', answer: "Reviewly uses AI to generate varied question sets. This helps you practice across different topics and formats, so you're better prepared for the real exam." },
  { id: 4, question: 'Can I switch plans later (Weekly → Monthly / Quarterly)?', answer: 'Yes. You can switch to Weekly, Monthly, or Quarterly anytime by submitting a new upgrade form with your payment receipt. Your new plan will take effect once your current plan expires or immediately if requested.' },
  { id: 5, question: "Something looks wrong or isn't working. What should I do?", answer: ['Reach out to us using the form below or email support@reviewly.ph. Tell us what happened and we\'ll help you fix it.', { br: true }, "We're always happy to help. 💜"] },
];

function renderAnswer(answer, hasEmailLink, itemId) {
  const blocks = Array.isArray(answer) ? answer : [answer];
  return blocks.map((block, i) => {
    const noMargin = itemId === 5 && i === 2;
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

const IN_APP_CATEGORY_OPTIONS = [
  { value: '', label: 'Category' },
  { value: 'General Inquiry', label: 'General Inquiry' },
  { value: 'Pricing & Plans', label: 'Pricing & Plans' },
  { value: 'Payments & Subscription', label: 'Payments & Subscription' },
  { value: 'Feedback or Feature Request', label: 'Feedback or Feature Request' },
  { value: 'Bug or Technical Issue', label: 'Bug or Technical Issue' },
  { value: 'Other', label: 'Other' },
];

const INITIAL_FORM_DATA = { category: '', message: '', company_name: '' };
const INITIAL_ERRORS = { category: '', message: '' };

function HelpCenter() {
  const [openFaq, setOpenFaq] = useState(-1);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    AOS.refresh();
  }, []);

  useEffect(() => {
    if (submitted) {
      const t = requestAnimationFrame(() => AOS.refresh());
      return () => cancelAnimationFrame(t);
    }
  }, [submitted]);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? -1 : index);
  };

  const setField = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const next = { ...INITIAL_ERRORS };
    let valid = true;
    if (!formData.category?.trim()) {
      next.category = 'Please select a category.';
      valid = false;
    }
    if (!formData.message?.trim()) {
      next.message = 'Message is required.';
      valid = false;
    }
    setErrors(next);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      setSubmitError('');
      await supportAPI.submitHelp({
        category: formData.category.trim(),
        message: formData.message.trim(),
        company_name: formData.company_name.trim(),
      });
      setFormData(INITIAL_FORM_DATA);
      setErrors(INITIAL_ERRORS);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err?.message || 'Something went wrong. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F4FF]">
        <DashNav />
        <main className="flex justify-center px-4 sm:px-6 pb-[148px]">
          <section className="w-full max-w-[550px] mx-auto pt-[160px]" data-aos="fade-up" data-aos-duration="500">
            <h1 className="font-inter font-normal text-[40px] text-center text-[#0F172A] mb-[24px]">
              Message sent! 🎉
            </h1>
            <p className="font-inter font-normal text-[16px] text-center mb-6">
              Thanks for reaching out. Our team has received your message and will get back to you within 24-48 hours.
            </p>
            <p className="font-inter font-normal text-[16px] text-center text-[#0F172A] mb-10">
              You can continue reviewing while we take a look.
            </p>
            <div className="flex justify-center mt-10">
              <Link
                to="/dashboard/all-reviewers"
                className="rounded-lg py-3 px-7 bg-[#FFC92A] text-[#421A83] font-roboto font-medium text-[16px] leading-6 tracking-[0.5px] inline-block transition-opacity hover:opacity-95"
              >
                Back to Reviewers
              </Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      <DashNav />
      <main className="max-w-[720px] mx-auto px-[24px] py-[40px]">
        <h1
          className="font-inter font-normal text-[40px] text-[#0F172A] mb-2.5 text-center"
          data-aos="fade-up"
          data-aos-duration="500"
        >
          Help Center
        </h1>
        <p
          className="font-inter font-normal text-[16px] text-[#45464E] text-center mb-10"
          data-aos="fade-up"
          data-aos-duration="500"
          data-aos-delay="50"
        >
          Need help, have feedback, or something not working right? We've got you. 💜
        </p>

        {/* Quick answers - accordions from FAQ.js */}
        <section className="mb-[88px]">
          <h2
            className="font-inter font-bold text-[16px] text-[#45464E] mb-[16px]"
            data-aos="fade-up"
            data-aos-duration="500"
          >
            Quick answers before you message us
          </h2>
          <div className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow-md overflow-hidden border border-[#EFF0F6]"
                data-aos="fade-up"
                data-aos-duration="500"
                data-aos-delay={Math.min(index * 30, 200)}
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50/50 transition-colors"
                >
                  <span className="font-inter font-semibold text-base text-[#0F172A]">
                    {item.question}
                  </span>
                  <svg
                    className={`w-5 h-5 text-[#6C737F] transform transition-transform shrink-0 ml-2 ${openFaq === index ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="font-inter font-normal text-sm text-[#45464E] px-6 pb-4 leading-[160%]">
                    {renderAnswer(item.answer, item.id === 5, item.id)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Still need help - form from Contact.js */}
        <section>
          <h2
            className="font-inter font-normal not-italic text-[40px] text-center text-[#0F172A] mb-2"
            data-aos="fade-up"
            data-aos-duration="500"
          >
            Still need help?
          </h2>
          <p
            className="font-inter font-normal text-[16px] text-center text-[#45464E] mb-6"
            data-aos="fade-up"
            data-aos-duration="500"
            data-aos-delay="50"
          >
            Tell us what's up and we'll get back to you as soon as we can.
          </p>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-white rounded-xl p-6 sm:p-10 shadow-sm border border-[#EFF0F6] relative"
            data-aos="fade-up"
            data-aos-duration="500"
            data-aos-delay="100"
          >
            <div className="mb-4">
              <label htmlFor="help-category" className="font-inter font-medium text-sm text-[#111927]">
                Category
              </label>
              <select
                id="help-category"
                value={formData.category}
                onChange={(e) => setField('category')(e.target.value)}
                required
                aria-required
                aria-invalid={Boolean(errors.category)}
                className={`w-full mt-1 h-12 rounded-lg border bg-white pl-3 pr-10 py-3 outline-none transition-colors focus:border-[#6E43B9] appearance-none cursor-pointer font-inter font-medium text-sm text-[#111927] ${!formData.category ? 'text-[#6C737F]' : ''} ${errors.category ? 'border-red-500' : 'border-[#D2D6DB]'}`}
              >
                {IN_APP_CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value || 'empty'} value={opt.value} disabled={!opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="mt-1 font-inter text-xs text-red-500" role="alert">
                  {errors.category}
                </p>
              )}
            </div>

            <div className="mt-4">
              {submitError && (
                <p className="mb-3 font-inter text-sm text-red-500" role="alert">
                  {submitError}
                </p>
              )}
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setField('message')(e.target.value)}
                rows={5}
                required
                aria-required
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? 'message-error' : undefined}
                className={`w-full mt-1 rounded-lg border bg-white p-3 outline-none transition-colors focus:border-[#6E43B9] resize-y placeholder:text-[#6C737F] font-inter font-medium text-sm tracking-[0.15px] text-[#111927] ${errors.message ? 'border-red-500' : 'border-[#D2D6DB]'}`}
                placeholder="Tell us what happened or what you need help with. The more details, the better 😉"
              />
              {errors.message && (
                <p id="message-error" className="mt-1 font-inter text-xs text-red-500" role="alert">
                  {errors.message}
                </p>
              )}
            </div>

            {/* Honeypot – hidden from users */}
            <div className="absolute -left-[9999px] top-0 opacity-0" aria-hidden="true">
              <label htmlFor="help_company_name">Company name</label>
              <input
                type="text"
                id="help_company_name"
                name="company_name"
                tabIndex={-1}
                autoComplete="off"
                value={formData.company_name}
                onChange={(e) => setField('company_name')(e.target.value)}
              />
            </div>

            <div className="mt-10">
              <button
                type="submit"
                className="rounded-lg py-3 px-7 bg-[#FFC92A] text-[#421A83] font-roboto font-medium text-base tracking-[0.5px] transition-opacity hover:opacity-95"
              >
                Send Message
              </button>
              <p className="font-inter font-normal text-xs tracking-[0.4px] text-[#6C737F] mt-4">
                We usually reply within 24-48 hours.
              </p>
            </div>
          </form>

          <p
            className="font-inter font-normal text-sm text-center text-[#45464E] mt-6"
            data-aos="fade-up"
            data-aos-duration="500"
          >
            We read every message — promise. 💜
          </p>
        </section>
      </main>
    </div>
  );
}

export default HelpCenter;
