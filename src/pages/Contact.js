import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { MultiArrowDropdownIcon } from '../components/Icons';

const CATEGORY_OPTIONS = [
  { value: '', label: 'Category' },
  { value: 'general', label: 'General Inquiry' },
  { value: 'support', label: 'Support' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'other', label: 'Other' },
];

const INITIAL_FORM_DATA = {
  firstName: '',
  lastName: '',
  email: '',
  category: '',
  message: '',
};

const INITIAL_ERRORS = {
  firstName: '',
  lastName: '',
  email: '',
  category: '',
  message: '',
};

function FloatingField({ id, label, value, onChange, onFocus, onBlur, type = 'text', required, error, className = '' }) {
  const [focused, setFocused] = useState(false);
  const hasError = Boolean(error);
  const active = focused || (value !== undefined && value !== '') || hasError;
  return (
    <div className={`relative ${className}`}>
      <label
        htmlFor={id}
        className={`absolute left-3 pointer-events-none transition-all duration-200 origin-left text-[#6C737F] font-inter font-medium ${active ? 'top-[6px] text-[11px] tracking-[0.15px]' : 'top-1/2 -translate-y-1/2 text-sm'}`}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => { setFocused(true); onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); onBlur?.(e); }}
        required={required}
        aria-required={required}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
        className={`w-full h-12 rounded-lg border bg-white outline-none transition-colors focus:border-[#6E43B9] font-inter font-medium text-sm tracking-[0.15px] text-[#111927] ${active ? 'pt-5 pb-1 px-3' : 'py-3 px-3'} ${hasError ? 'border-red-500' : 'border-[#D2D6DB]'}`}
      />
      {hasError && (
        <p id={`${id}-error`} className="mt-1 font-inter text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function Contact() {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [errors, setErrors] = useState(INITIAL_ERRORS);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (submitted) {
      const t = requestAnimationFrame(() => {
        AOS.refresh();
      });
      return () => cancelAnimationFrame(t);
    }
  }, [submitted]);

  const setField = (field) => (value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const next = { ...INITIAL_ERRORS };
    let valid = true;
    if (!formData.firstName?.trim()) {
      next.firstName = 'First name is required.';
      valid = false;
    }
    if (!formData.lastName?.trim()) {
      next.lastName = 'Last name is required.';
      valid = false;
    }
    if (!formData.email?.trim()) {
      next.email = 'Email is required.';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      next.email = 'Please enter a valid email address.';
      valid = false;
    }
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    // Submit payload – wire to your backend or email service
    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      category: formData.category.trim(),
      message: formData.message.trim(),
    };
    // TODO: e.g. await submitContactForm(payload);
    console.log('Contact form submitted:', payload);
    setFormData(INITIAL_FORM_DATA);
    setErrors(INITIAL_ERRORS);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="flex justify-center px-4 sm:px-6 bg-[#F5F4FF] pb-[148px]">
          <section className="w-full max-w-[800px] mx-auto pt-[160px]">
            <h1 className="font-inter font-normal text-4xl text-center text-[#0F172A]" data-aos="fade-up" data-aos-duration="500" data-aos-delay="0">
              Thanks for reaching out!
            </h1>
            <p className="font-inter font-normal text-base text-center text-[#0F172A] mt-4" data-aos="fade-up" data-aos-duration="500" data-aos-delay="50">
              We've received your message and usually reply within 24-48 hours.
            </p>
            <p className="font-inter font-normal text-base text-center text-[#0F172A] mt-4" data-aos="fade-up" data-aos-duration="500" data-aos-delay="100">
              You may also browse our{' '}
              <Link to="/faq" className="underline decoration-solid text-[#0F172A]">
                FAQ
              </Link>{' '}
              while you wait.
            </p>
            <div className="flex justify-center mt-10" data-aos="fade-up" data-aos-duration="500" data-aos-delay="150">
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="rounded-lg py-3 px-7 bg-[#FFC92A] text-[#421A83] font-roboto font-medium text-base tracking-[0.5px] transition-opacity hover:opacity-95"
              >
                Send New Message
              </button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="flex justify-center px-4 sm:px-6 bg-[#F5F4FF] pt-12 pb-[148px]">
        <section className="w-full max-w-[800px] mx-auto">
          <h1 className="font-inter font-normal text-4xl text-center text-[#0F172A] mb-2.5" data-aos="fade-up" data-aos-duration="500" data-aos-delay="0">
            We'd love to hear from you!
          </h1>
          <p className="font-inter font-normal text-base text-center text-[#6C737F] mb-10" data-aos="fade-up" data-aos-duration="500" data-aos-delay="50">
            Questions, feedback, or just curious? We're here.
          </p>

          <form onSubmit={handleSubmit} noValidate className="max-w-[800px] rounded-xl bg-white p-10" data-aos="fade-up" data-aos-duration="500" data-aos-delay="100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-10">
              <div>
                <FloatingField
                  id="first-name"
                  label="First Name"
                  value={formData.firstName}
                  onChange={setField('firstName')}
                  required
                  error={errors.firstName}
                />
              </div>
              <div>
                <FloatingField
                  id="last-name"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={setField('lastName')}
                  required
                  error={errors.lastName}
                />
              </div>
              <div>
                <FloatingField
                  id="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={setField('email')}
                  required
                  error={errors.email}
                />
              </div>
              <div>
                <div className="relative h-12">
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setField('category')(e.target.value)}
                    required
                    aria-required
                    aria-invalid={Boolean(errors.category)}
                    aria-describedby={errors.category ? 'category-error' : undefined}
                    className={`w-full h-full rounded-lg border bg-white pl-3 pr-10 py-3 outline-none transition-colors focus:border-[#6E43B9] appearance-none cursor-pointer font-inter font-medium text-sm text-[#111927] ${!formData.category ? 'text-[#6C737F]' : ''} ${errors.category ? 'border-red-500' : 'border-[#D2D6DB]'}`}
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value} disabled={!opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                    <MultiArrowDropdownIcon className="w-6 h-6 shrink-0" />
                  </span>
                </div>
                {errors.category ? (
                  <p id="category-error" className="mt-2 font-inter text-xs text-red-500" role="alert">
                    {errors.category}
                  </p>
                ) : (
                  <p className="mt-2 font-inter font-normal text-xs text-[#6C737F]">
                    Choose the option that best fits your message.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-10">
              <label htmlFor="message" className="font-inter font-medium text-sm text-[#111927]">
                Message
              </label>
              <textarea
                id="message"
                placeholder="Message"
                value={formData.message}
                onChange={(e) => setField('message')(e.target.value)}
                rows={5}
                required
                aria-required
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? 'message-error' : undefined}
                className={`w-full mt-1 rounded-lg border bg-white p-3 outline-none transition-colors focus:border-[#6E43B9] resize-y placeholder:text-[#6C737F] font-inter font-medium text-sm tracking-[0.15px] text-[#111927] ${errors.message ? 'border-red-500' : 'border-[#D2D6DB]'}`}
              />
              {errors.message && (
                <p id="message-error" className="mt-1 font-inter text-xs text-red-500" role="alert">
                  {errors.message}
                </p>
              )}
            </div>

            <div className="mt-10">
              <button
                type="submit"
                className="rounded-lg py-3 px-7 bg-[#FFC92A] text-[#421A83] font-roboto font-medium text-base tracking-[0.5px] mb-4 transition-opacity hover:opacity-95"
              >
                Send Message
              </button>
              <p className="font-inter font-normal text-xs tracking-[0.4px] text-[#6C737F]">
                We usually reply within 24-48 hours.
              </p>
            </div>
          </form>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default Contact;
