import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashNav from '../components/DashNav';
import SkeletonBlock from '../components/SkeletonBlock';
import { dashboardAPI } from '../services/api';

const ICON_PATHS = {
    book: 'M4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2H19C19.2652 2 19.5196 2.10536 19.7071 2.29289C19.8946 2.48043 20 2.73478 20 3V21C20 21.2652 19.8946 21.5196 19.7071 21.7071C19.5196 21.8946 19.2652 22 19 22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5ZM4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20M8 13L12 6L16 13M9.09998 11H14.8',
    gear: 'M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z',
    timer: 'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 5v5l3 3',
};

const SprintTaskOverview = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const loadTask = async () => {
            try {
                const res = await dashboardAPI.get();
                if (!res.success) {
                    throw new Error(res.message || 'Unable to load task overview');
                }

                const plan = res.data?.sprintPlan;
                const found = plan?.tasks?.find((t) => t.taskId === taskId);
                if (!found) {
                    throw new Error('Task not found');
                }

                if (!cancelled) {
                    setTask(found);
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.message || 'Unable to load task overview');
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        loadTask();
        return () => {
            cancelled = true;
        };
    }, [taskId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5F4FF]">
                <DashNav />
                <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 pt-6 pb-16">
                    <div className="max-w-[560px] mx-auto">
                        <div className="flex items-center gap-1.5 mb-6">
                            <SkeletonBlock className="h-4 w-24" />
                            <SkeletonBlock className="h-4 w-4" />
                            <SkeletonBlock className="h-4 w-32" />
                        </div>
                        <div className="bg-white rounded-[12px] px-[32px] py-[40px] border">
                            <div className="flex items-center gap-[12px] mb-[24px]">
                                <SkeletonBlock className="w-[48px] h-[48px] rounded-[8px]" />
                                <SkeletonBlock className="h-8 w-[280px] rounded-[8px]" />
                            </div>
                            <div className="space-y-4">
                                <SkeletonBlock className="h-5 w-[190px] rounded-[6px]" />
                                <SkeletonBlock className="h-5 w-[300px] rounded-[6px]" />
                                <SkeletonBlock className="h-5 w-full rounded-[6px]" />
                                <SkeletonBlock className="h-5 w-full rounded-[6px]" />
                            </div>
                            <div className="mt-[40px] flex flex-wrap gap-[16px]">
                                <SkeletonBlock className="h-[48px] w-[180px] rounded-[4px]" />
                                <SkeletonBlock className="h-[48px] w-[180px] rounded-[4px]" />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#F5F4FF]">
                <DashNav />
                <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-16">
                    <div className="bg-white rounded-[16px] px-6 py-10 text-center">
                        <p className="font-inter font-semibold text-[15px] text-[#1A1A2E] mb-2">Unable to load the task preview.</p>
                        <p className="font-inter text-[13px] text-[#6C737F] mb-4">{error}</p>
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

    const iconKey = task.type && ['book', 'gear', 'timer'].includes(task.type) ? task.type : 'book';
    const iconPath = ICON_PATHS[iconKey] || ICON_PATHS.book;

    return (
        <div className="min-h-screen bg-[#F5F4FF]">
            <DashNav />
            <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-20 pt-6 pb-16">
                <div className="max-w-[560px] mx-auto">
                    <nav className="flex items-center gap-1.5 mb-6 font-inter text-[13px]">
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="text-[#6C737F] hover:text-[#1A1A2E] transition-colors"
                        >
                            Dashboard
                        </button>
                        <span className="text-[#9CA3AF]">›</span>
                        <span className="text-[#6E43B9] font-medium">Sprint Task</span>
                    </nav>

                    <div className="w-full bg-white rounded-[12px] px-[32px] py-[40px] border">
                        <div className="flex items-center gap-[12px] mb-[24px]">
                            <div className="w-[48px] h-[48px] rounded-[8px] bg-white border border-[#FFC92A] flex items-center justify-center shrink-0">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d={iconPath} stroke="#4B5563" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <h1 className="font-inter font-bold text-[28px] text-[#45464E] leading-snug tracking-[-0.02em]">
                                {task.title}
                            </h1>
                        </div>

                        <p className="font-inter text-[16px] text-[#45464E] mb-[16px]">
                            {task.questionCount} questions • ~{task.estimatedMinutes} minutes
                        </p>
                        <p className="font-inter text-[16px] text-[#45464E] mb-[16px] leading-[1.45]">
                            This task focuses on {task.topics?.length > 0 ? task.topics.join(', ') : `${task.sectionLabel} as a whole`}.
                        </p>
                        <p className="font-inter text-[16px] text-[#45464E] mb-[40px] leading-[1.45]">
                            Answer all questions first, then review your results and explanations after submitting.
                        </p>

                        <div className="flex flex-wrap gap-[24px]">
                            <button
                                type="button"
                                onClick={() => navigate(`/dashboard/sprint/task/${taskId}?from=sprint&taskLabel=${encodeURIComponent(task.title)}`)}
                                className="h-[48px] font-inter font-regular text-[16px] text-[#421A83] bg-[#FFC92A] hover:bg-[#FFB800] active:bg-[#E6A800] px-[32px] rounded-[4px] transition-colors"
                            >
                                Start Task
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="h-[48px] font-inter font-medium text-[16px] text-[#737373] bg-white border border-[#737373] hover:bg-[#F8F8FB] px-[32px] rounded-[4px] transition-colors"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SprintTaskOverview;
