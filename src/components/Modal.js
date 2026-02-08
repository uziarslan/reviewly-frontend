import React from 'react';
import { CloseIcon } from './Icons';

/**
 * Reusable modal with shared styling.
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {function} onClose - Called when overlay or close button is clicked
 * @param {string} title - Modal title
 * @param {string} titleId - Optional id for the title (for aria-labelledby)
 * @param {React.ReactNode} children - Modal body content
 * @param {React.ReactNode} footer - Optional action buttons; rendered aligned to the right (flex-end)
 */
function Modal({ isOpen, onClose, title, titleId, children, footer }) {
  if (!isOpen) return null;

  const id = titleId || 'modal-title';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby={id}
    >
      <div className="bg-white rounded-[16px] shadow-lg w-full max-w-[480px] p-[24px] flex flex-col gap-[16px]">
        <div className="flex items-start justify-between gap-4">
          <h2 id={id} className="font-inter font-medium text-[18px] text-[#45464E]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 p-1 -m-1 rounded hover:bg-gray-100 transition-colors"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="flex flex-col gap-[16px]">
          {children}
        </div>
        {footer != null && (
          <div className="flex gap-[16px] justify-end mt-auto">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;
