import React, { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GoogleCallback = () => {
  const [searchParams] = useSearchParams();
  const { loginWithGoogleCode } = useAuth();
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      navigate('/', { replace: true });
      return;
    }

    if (!code) {
      navigate('/', { replace: true });
      return;
    }

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    loginWithGoogleCode(code, redirectUri)
      .then(() => {
        navigate('/dashboard/all-reviewers', { replace: true });
      })
      .catch((err) => {
        console.error('Google login failed:', err);
        navigate('/', { replace: true });
      });
  }, [searchParams, loginWithGoogleCode, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6137A8] mx-auto mb-4" />
        <p className="text-gray-600 text-lg">Signing you in...</p>
      </div>
    </div>
  );
};

export default GoogleCallback;
