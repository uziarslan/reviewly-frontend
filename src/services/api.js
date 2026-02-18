const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

/**
 * Wrapper around fetch that includes credentials and handles JSON.
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("reviewly_token");

  const config = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };

  if (options.body && typeof options.body === "object") {
    config.body = JSON.stringify(options.body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) {
    const err = new Error(data.message || "API request failed");
    err.status = res.status;
    err.apiResponse = data;
    throw err;
  }

  return data;
}

// ── Auth ──
export const authAPI = {
  googleLogin: (token) =>
    apiFetch("/auth/google-login", { method: "POST", body: { token } }),
  googleCodeLogin: (code) =>
    apiFetch("/auth/google-code-login", { method: "POST", body: { code } }),
  getMe: () => apiFetch("/auth/me"),
  updateMe: (data) =>
    apiFetch("/auth/me", { method: "PUT", body: data }),
  logout: () => apiFetch("/auth/logout", { method: "POST" }),
};

// ── Reviewers ──
export const reviewerAPI = {
  getAll: () => apiFetch("/reviewers"),
  getById: (id) => apiFetch(`/reviewers/${id}`),
  getBySlug: (slug) => apiFetch(`/reviewers/slug/${slug}`),
};

// ── Library (bookmarks) ──
export const libraryAPI = {
  get: () => apiFetch("/library"),
  add: (reviewerId) =>
    apiFetch(`/library/${reviewerId}`, { method: "POST" }),
  remove: (reviewerId) =>
    apiFetch(`/library/${reviewerId}`, { method: "DELETE" }),
};

// ── Exams ──
export const examAPI = {
  start: (reviewerId) =>
    apiFetch(`/exams/${reviewerId}/start`, { method: "POST" }),
  saveAnswer: (attemptId, questionIndex, selectedAnswer) =>
    apiFetch(`/exams/attempts/${attemptId}/answer`, {
      method: "PUT",
      body: { questionIndex, selectedAnswer },
    }),
  pause: (attemptId, remainingSeconds, currentIndex) =>
    apiFetch(`/exams/attempts/${attemptId}/pause`, {
      method: "PUT",
      body: { remainingSeconds, currentIndex },
    }),
  submit: (attemptId) =>
    apiFetch(`/exams/attempts/${attemptId}/submit`, { method: "POST" }),
  getResult: (attemptId) =>
    apiFetch(`/exams/attempts/${attemptId}`),
  getReview: (attemptId) =>
    apiFetch(`/exams/attempts/${attemptId}/review`),
  getUserHistory: () =>
    apiFetch(`/exams/attempts/user/history`),
  getReviewerProgress: (reviewerId) =>
    apiFetch(`/exams/attempts/user/progress/${reviewerId}`),
};

// ── Support ──
export const supportAPI = {
  submitContact: (data) =>
    apiFetch("/support/contact", { method: "POST", body: data }),
  submitHelp: (data) =>
    apiFetch("/support/help", { method: "POST", body: data }),
};
