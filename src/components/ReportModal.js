import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import { supportAPI } from '../services/api';

const EXAM_CATEGORIES = ['Typo/grammar', 'Question is unclear', 'Other'];
const REVIEW_CATEGORIES = [
  'Wrong answer key',
  'Explanation is incorrect',
  'Typo/grammar',
  'Explanation is unclear',
  'Two choices seem correct',
];

/**
 * Reusable issue-report modal for the Exam and Exam Review pages.
 *
 * Props:
 *  - isOpen, onClose
 *  - source: 'exam' | 'review'
 *  - context: { reviewerId, reviewerTitle, attemptId, questionIndex,
 *               questionId, questionText, selectedAnswer, correctAnswer }
 */
function ReportModal({ isOpen, onClose, source, context = {} }) {
  const categories = source === 'review' ? REVIEW_CATEGORIES : EXAM_CATEGORIES;

  const [category, setCategory] = useState(null);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCategory(null);
      setDetails('');
      setErrorMsg(null);
      setSubmitting(false);
      setSubmitted(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!category || submitting) {
      if (!category) setErrorMsg('Please select an issue type.');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await supportAPI.submitReport({
        source,
        category,
        additionalDetails: details,
        ...context,
      });
      setSubmitted(true);
      setTimeout(() => onClose?.(), 900);
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Report an Issue"
      titleId="report-modal-title"
      footer={
        <div className="flex gap-3 justify-end w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="font-inter font-normal text-[14px] text-[#431C86] py-[10px] px-6 rounded-[8px] border border-[#D1D5DB] bg-white hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || submitted || !category}
            className="font-inter font-bold text-[14px] text-[#421A83] py-[10px] px-6 rounded-[8px] bg-[#FACC15] hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
          >
            {submitting && (
              <svg className="animate-spin h-4 w-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {submitted ? 'Submitted' : 'Submit Report'}
          </button>
        </div>
      }
    >
      <div>
        <p className="font-inter font-medium text-[14px] text-[#0F172A] mb-2">
          What&apos;s the issue?
        </p>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => {
            const selected = category === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`font-inter text-[13px] px-3 py-1.5 rounded-full border transition-colors ${
                  selected
                    ? 'border-[#6E43B9] text-[#6E43B9] bg-white'
                    : 'border-transparent text-[#45464E] bg-[#F3F4F6] hover:bg-[#E5E7EB]'
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor="report-details"
          className="block font-inter font-medium text-[14px] text-[#0F172A] mb-2"
        >
          Additional details (optional)
        </label>
        <textarea
          id="report-details"
          rows={4}
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Describe the issue in more detail..."
          className="w-full font-inter text-[14px] text-[#45464E] placeholder-[#9CA3AF] rounded-[8px] border border-[#E5E7EB] px-3 py-2 focus:outline-none focus:border-[#6E43B9] focus:ring-1 focus:ring-[#6E43B9] resize-none"
          maxLength={1000}
        />
      </div>

      {errorMsg && (
        <p className="font-inter text-[13px] text-[#F0142F]">{errorMsg}</p>
      )}
    </Modal>
  );
}

export default ReportModal;
