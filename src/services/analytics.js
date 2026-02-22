import posthog from "posthog-js";

// ── PostHog initialization ──────────────────────
const POSTHOG_KEY = process.env.REACT_APP_POSTHOG_KEY;
const POSTHOG_HOST = process.env.REACT_APP_POSTHOG_HOST || "https://us.i.posthog.com";

let initialized = false;

export function initAnalytics() {
  if (initialized || !POSTHOG_KEY) return;
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: true, // auto page-view tracking
    capture_pageleave: true, // track when user leaves page
    autocapture: false, // we handle custom events ourselves
    persistence: "localStorage+cookie",
  });
  initialized = true;
}

// ── Identify user after login ───────────────────
export function identifyUser(user) {
  if (!initialized || !user) return;
  posthog.identify(user._id, {
    email: user.email,
    first_name: user.firstName,
    last_name: user.lastName,
    plan_type: user.subscription?.plan || "free",
    signup_date: user.createdAt,
  });
}

// ── Reset on logout ─────────────────────────────
export function resetAnalytics() {
  if (!initialized) return;
  posthog.reset();
}

// ── Capture custom event ────────────────────────
export function captureEvent(eventName, properties = {}) {
  if (!initialized) return;
  posthog.capture(eventName, properties);
}

// ── GA4 helpers ────────────────────────────────
export function gtagEvent(eventName, params = {}) {
  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

// ── Pre-built event helpers ─────────────────────

export function trackExamSelected(examId, examName) {
  captureEvent("exam_selected", { exam_id: examId, exam_name: examName });
}

export function trackExamStarted(examId, examName) {
  captureEvent("exam_started", { exam_id: examId, exam_name: examName });
}

export function trackExamCompleted(examId, examName, { score, duration, totalQuestions } = {}) {
  captureEvent("exam_completed", {
    exam_id: examId,
    exam_name: examName,
    score,
    duration,
    total_questions: totalQuestions,
  });
}

export function trackLoginSuccess(user) {
  captureEvent("login_success", {
    user_id: user._id,
    email: user.email,
    plan_type: user.subscription?.plan || "free",
  });
}

export function trackLogout() {
  captureEvent("logout");
}

export function trackPricingClick(location) {
  captureEvent("pricing_click", { location });
  gtagEvent("pricing_click", { location });
}
