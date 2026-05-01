import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashNav from '../components/DashNav';

function titleCase(str) {
  return (str || '').replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusTierFromScore(percentage) {
  const pct = Math.round(percentage || 0);
  if (pct >= 85) return { label: 'Exam Ready', message: 'You are above the passing threshold.' };
  if (pct >= 75) return { label: 'Almost Ready', message: 'A few improvements can push you to passing.' };
  if (pct >= 60) return { label: 'Needs Improvement', message: "You're within reach but need more practice." };
  return { label: 'Early Stage', message: 'Focus on building fundamentals first.' };
}

function statusMessageFromScore(percentage) {
  const tier = statusTierFromScore(percentage);
  return `${tier.label} — ${tier.message}`;
}

function topicLabelForTask(task) {
  if (!task) return '–';
  if (task.topics && task.topics.length === 1) return task.topics[0];
  if (task.topics && task.topics.length > 1) return task.topics.join(' + ');
  if (task.sectionLabel) return task.sectionLabel;
  return titleCase(task.section || '–');
}

const SprintTaskResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const task = state.task || null;
  const result = state.result || null;
  const sprintPlan = state.sprintPlan || null;
  const review = state.review || [];

  if (!result) {
    return (
      <div className="min-h-screen bg-[#F5F4FF]">
        <DashNav />
        <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-16">
          <div className="bg-white rounded-[16px] px-6 py-10 text-center">
            <p className="font-inter font-semibold text-[15px] text-[#1A1A2E] mb-2">Sprint task result not available.</p>
            <p className="font-inter text-[13px] text-[#6C737F] mb-4">
              This page is meant to show sprint task completion details after submission.
            </p>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="font-inter font-semibold text-[13px] text-[#1A1A2E] bg-[#FFC92A] hover:bg-[#FFB800] px-5 py-2.5 rounded-[10px]"
            >
              Back to Dashboard
            </button>
          </div>
        </main>
      </div>
    );
  }

  const pct = result.percentage || 0;
  const completedTasks = sprintPlan?.completedTasks ?? 0;
  const totalTasks = sprintPlan?.totalTasks ?? 7;
  const nextTask = sprintPlan?.nextTask || null;
  const planDone = completedTasks >= totalTasks;

  return (
    <div className="min-h-screen bg-[#F5F4FF]">
      <DashNav />
      <main className="max-w-[620px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-16">
        <nav className="flex flex-wrap gap-1.5 mb-6 font-inter text-[13px]">
          <button type="button" onClick={() => navigate('/dashboard')} className="text-[#6C737F] hover:text-[#1A1A2E]">
            Dashboard
          </button>
          <span className="text-[#9CA3AF]">›</span>
          <span className="text-[#6C737F] whitespace-nowrap">Sprint Task</span>
          <span className="text-[#9CA3AF]">›</span>
          <span className="text-[#6E43B9] font-medium truncate">{task?.title || 'Task Complete'}</span>
        </nav>

        <div className="max-w-[552px] mx-auto bg-white rounded-[12px] px-[20px] sm:px-[24px] py-[24px] sm:py-[40px] border border-[#EFF0F6]">
          <h1 className="font-inter font-bold text-[16px] text-[#45464E] mb-[4px]">Task Complete</h1>
          <p className="font-inter text-[14px] text-[#0F172ABF] mb-[16px]">Nice work — one step closer.</p>

          <div className="divide-y divide-[#F2F4F7] border-b border-[#181D1F1A]">
            <div className="flex items-center justify-between py-[11.5px]">
              <span className="font-inter text-[14px] text-[#181D1F]">Correct Answers</span>
              <span className="font-inter font-bold text-[24px] text-[#6E43B9]">{result.correct} / {result.totalItems}</span>
            </div>
            <div className="flex items-center justify-between py-[11.5px]">
              <span className="font-inter text-[14px] text-[#181D1F]">Status</span>
              <span className="font-inter text-[14px] text-[#181D1F] text-right max-w-[60%]">{statusMessageFromScore(pct)}</span>
            </div>
            <div className="flex items-center justify-between py-[11.5px]">
              <span className="font-inter text-[14px] text-[#181D1F]">Topic</span>
              <span className="font-inter text-[14px] text-[#181D1F] text-right">{topicLabelForTask(task)}</span>
            </div>
            <div className="flex items-center justify-between py-[11.5px]">
              <span className="font-inter text-[14px] text-[#181D1F]">Sprint Progress</span>
              <span className="font-inter text-[14px] text-[#181D1F]">{completedTasks} of {totalTasks} tasks completed</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-[16px] mt-[24px] mb-[12px]">
            <button
              type="button"
              onClick={() => navigate(`/dashboard/sprint/task/${task?.taskId}/review`)}
              disabled={!review.length || !task?.taskId}
              className="w-full sm:w-auto font-inter text-[14px] text-[#421A83] bg-[#FFC92A] hover:bg-[#FFB800] active:bg-[#E6A800] px-[32px] py-[11.5px] rounded-[8px] shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Review Answers
            </button>
            <button
              type="button"
              onClick={() => nextTask && navigate(`/dashboard/sprint/task/${nextTask.taskId}/overview`)}
              disabled={!nextTask || planDone}
              className="w-full sm:w-auto font-inter text-[14px] text-[#6C737F] border-[0.5px] border-[#6C737F] hover:bg-[#F8F8FB] px-[16px] py-[11.5px] rounded-[8px] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Start Next Task
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="w-full sm:w-auto font-inter text-[14px] text-[#6C737F] border-[0.5px] border-[#6C737F] hover:bg-[#F8F8FB] px-[16px] py-[11.5px] rounded-[8px]"
            >
              Back to Dashboard
            </button>
          </div>

          {nextTask && !planDone && (
            <p className="font-inter text-[14px] text-[#0F172ABF]">
              Next: {nextTask.title}
            </p>
          )}
          {planDone && (
            <p className="font-inter text-[14px] text-[#0F172ABF]">
              You've completed your 7-day plan! Take a full mock to validate your progress.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default SprintTaskResult;
