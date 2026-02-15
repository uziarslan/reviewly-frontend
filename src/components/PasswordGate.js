import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'reviewly_access_unlocked';
const PASSWORD = 'bra@inyb3sh!';

/**
 * Password gate for the frontend. Once the correct code is entered,
 * access is stored in localStorage and won't be asked again.
 * To re-enable the gate: localStorage.removeItem('reviewly_access_unlocked')
 */
function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(false);
  const [checking, setChecking] = useState(true);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setUnlocked(stored === '1');
    setChecking(false);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (input.trim() === PASSWORD) {
      localStorage.setItem(STORAGE_KEY, '1');
      setUnlocked(true);
    } else {
      setError('Incorrect code');
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#F5F4FF] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-[#6E43B9] border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#F5F4FF] flex items-center justify-center p-4">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm border border-[#E5E7EB]"
        >
          <h1 className="font-inter font-semibold text-xl text-[#45464E] mb-2">
            Enter access code
          </h1>
          <p className="font-inter text-sm text-[#6C737F] mb-6">
            This site is password protected.
          </p>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Code"
            className="w-full px-4 py-3 rounded-lg border border-[#CFD3D4] font-inter text-[#45464E] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6E43B9]/30 focus:border-[#6E43B9] mb-2"
            autoFocus
            autoComplete="current-password"
          />
          {error && (
            <p className="font-inter text-sm text-red-600 mb-2">{error}</p>
          )}
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#6E43B9] text-white font-inter font-semibold hover:opacity-95 transition-opacity"
          >
            Unlock
          </button>
          <p className="font-inter text-xs text-[#9CA3AF] mt-4">
            To reset the gate, run in DevTools:{' '}
            <code className="bg-gray-100 px-1 rounded">localStorage.removeItem('{STORAGE_KEY}')</code>
          </p>
        </form>
      </div>
    );
  }

  return children;
}

export default PasswordGate;
