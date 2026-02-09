import React, { useState } from 'react';

export default function FloatingField({
  id,
  label,
  value,
  onChange,
  onFocus,
  onBlur,
  type = 'text',
  required,
  error,
  className = '',
}) {
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
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
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
