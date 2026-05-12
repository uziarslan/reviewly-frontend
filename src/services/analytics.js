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

// ── Dashboard events ───────────────────────────

export function trackDashboardGeneratePlanClicked({ isRegeneration = false, planType = "free" } = {}) {
  captureEvent("dashboard_generate_plan_clicked", { is_regeneration: isRegeneration, plan_type: planType });
}

export function trackDashboardStartTaskClicked({ taskId, taskType, taskTitle, triggeredPaywall = false, planType = "free" } = {}) {
  captureEvent("dashboard_start_task_clicked", {
    task_id: taskId,
    task_type: taskType,
    task_title: taskTitle,
    triggered_paywall: triggeredPaywall,
    plan_type: planType,
  });
}

export function trackDashboardTakeMockClicked({ planType = "free" } = {}) {
  captureEvent("dashboard_take_mock_clicked", { plan_type: planType });
}

export function trackDashboardTakeAssessmentClicked({ planType = "free" } = {}) {
  captureEvent("dashboard_take_assessment_clicked", { plan_type: planType });
}

// ── Trial assessment events ─────────────────────

export function trackTrialExamTypeSelected({ examType } = {}) {
  captureEvent("trial_exam_type_selected", { exam_type: examType });
}

export function trackTrialExamStarted({ examType } = {}) {
  captureEvent("trial_exam_started", { exam_type: examType });
}

export function trackTrialExamSkipped({ examType } = {}) {
  captureEvent("trial_exam_skipped", { exam_type: examType });
}

export function trackTrialResultViewed({ score, readinessLabel, durationMin } = {}) {
  captureEvent("trial_result_viewed", {
    score,
    readiness_label: readinessLabel,
    duration_min: durationMin,
  });
}

export function trackTrialGoToDashboardClicked() {
  captureEvent("trial_go_to_dashboard_clicked");
}

export function trackTrialReviewAnswersClicked() {
  captureEvent("trial_review_answers_clicked");
}

// ── Exam results events ─────────────────────────

export function trackResultsViewed({ examName, score, passed, examType } = {}) {
  captureEvent("results_viewed", {
    exam_name: examName,
    score,
    passed,
    exam_type: examType,
  });
}

export function trackResultsShareClicked({ examName } = {}) {
  captureEvent("results_share_clicked", { exam_name: examName });
}

export function trackResultsRetakeClicked({ examName } = {}) {
  captureEvent("results_retake_clicked", { exam_name: examName });
}

export function trackResultsReviewAnswersClicked() {
  captureEvent("results_review_answers_clicked");
}

export function trackResultsGoToDashboardClicked() {
  captureEvent("results_go_to_dashboard_clicked");
}
