import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem("reviewly_token");
    if (!token) {
      setLoading(false);
      return;
    }

    authAPI
      .getMe()
      .then((res) => {
        if (res.success) setUser(res.user);
      })
      .catch(() => {
        localStorage.removeItem("reviewly_token");
      })
      .finally(() => setLoading(false));
  }, []);

  const loginWithGoogle = useCallback(async (credential) => {
    const res = await authAPI.googleLogin(credential);
    if (res.success) {
      localStorage.setItem("reviewly_token", res.token);
      setUser(res.user);
    }
    return res;
  }, []);

  const loginWithGoogleCode = useCallback(async (code, redirectUri) => {
    const res = await authAPI.googleLoginWithCode(code, redirectUri);
    if (res.success) {
      localStorage.setItem("reviewly_token", res.token);
      setUser(res.user);
    }
    return res;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authAPI.logout();
    } catch (_) {}
    localStorage.removeItem("reviewly_token");
    setUser(null);
  }, []);

  const updateUser = useCallback(async (data) => {
    const res = await authAPI.updateMe(data);
    if (res.success) setUser(res.user);
    return res;
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    loginWithGoogle,
    loginWithGoogleCode,
    logout,
    updateUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
