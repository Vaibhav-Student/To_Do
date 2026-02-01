import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { CHART_COLORS } from '../constants/colors';

/**
 * Custom hook for analytics computations
 * Provides filtered task data and chart data for analytics dashboard
 */
export const useAnalytics = (analyticsFilter, categories) => {
    // Get all tasks for analytics (from all lists)
    const allTasksForAnalytics = useLiveQuery(() => db.tasks.toArray(), []) || [];

    // Filter tasks based on analytics filters
    const getFilteredTasksForAnalytics = useMemo(() => {
        let filtered = [...allTasksForAnalytics];

        // Filter by category
        if (analyticsFilter.category !== 'all') {
            filtered = filtered.filter(t => t.categoryId === parseInt(analyticsFilter.category));
        }

        // Filter by priority
        if (analyticsFilter.priority !== 'all') {
            filtered = filtered.filter(t => t.priority === analyticsFilter.priority);
        }

        // Filter by status
        if (analyticsFilter.status !== 'all') {
            filtered = filtered.filter(t =>
                analyticsFilter.status === 'completed' ? t.completed : !t.completed
            );
        }

        // Filter by date range
        if (analyticsFilter.dateRange !== 'all') {
            const now = new Date();
            let startDate = new Date();

            switch (analyticsFilter.dateRange) {
                case 'week':
                    startDate.setDate(now.getDate() - 7);
                    break;
                case 'month':
                    startDate.setMonth(now.getMonth() - 1);
                    break;
                case 'quarter':
                    startDate.setMonth(now.getMonth() - 3);
                    break;
                default:
                    startDate = new Date(0);
            }

            filtered = filtered.filter(t => {
                const taskDate = new Date(t.createdAt);
                return taskDate >= startDate;
            });
        }

        return filtered;
    }, [allTasksForAnalytics, analyticsFilter]);

    // Compute status data for pie chart
    const statusChartData = useMemo(() => {
        const completed = getFilteredTasksForAnalytics.filter(t => t.completed).length;
        const pending = getFilteredTasksForAnalytics.filter(t => !t.completed).length;
        return [
            { name: 'Completed', value: completed, color: CHART_COLORS.completed },
            { name: 'Pending', value: pending, color: CHART_COLORS.pending }
        ];
    }, [getFilteredTasksForAnalytics]);

    // Compute category data for bar chart
    const categoryChartData = useMemo(() => {
        const categoryCount = {};
        getFilteredTasksForAnalytics.forEach(task => {
            const catId = task.categoryId || 'uncategorized';
            categoryCount[catId] = (categoryCount[catId] || 0) + 1;
        });

        return Object.entries(categoryCount).map(([catId, count], index) => {
            const category = categories.find(c => c.id === parseInt(catId));
            return {
                name: category?.name || 'Uncategorized',
                tasks: count,
                color: category?.color || CHART_COLORS.categories[index % CHART_COLORS.categories.length]
            };
        }).sort((a, b) => b.tasks - a.tasks);
    }, [getFilteredTasksForAnalytics, categories]);

    // Compute priority data for bar chart
    const priorityChartData = useMemo(() => {
        const priorities = { high: 0, medium: 0, low: 0 };
        const completedByPriority = { high: 0, medium: 0, low: 0 };

        getFilteredTasksForAnalytics.forEach(task => {
            const priority = task.priority || 'medium';
            priorities[priority] = (priorities[priority] || 0) + 1;
            if (task.completed) {
                completedByPriority[priority] = (completedByPriority[priority] || 0) + 1;
            }
        });

        return [
            {
                name: 'High',
                tasks: priorities.high,
                completed: completedByPriority.high,
                color: CHART_COLORS.high
            },
            {
                name: 'Medium',
                tasks: priorities.medium,
                completed: completedByPriority.medium,
                color: CHART_COLORS.medium
            },
            {
                name: 'Low',
                tasks: priorities.low,
                completed: completedByPriority.low,
                color: CHART_COLORS.low
            }
        ];
    }, [getFilteredTasksForAnalytics]);

    // Compute time-based data for line chart (last 7 days)
    const timeChartData = useMemo(() => {
        const days = [];
        const now = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];

            const created = getFilteredTasksForAnalytics.filter(t => {
                const taskDate = new Date(t.createdAt).toISOString().split('T')[0];
                return taskDate === dateStr;
            }).length;

            const completed = getFilteredTasksForAnalytics.filter(t => {
                if (!t.completedAt) return false;
                const taskDate = new Date(t.completedAt).toISOString().split('T')[0];
                return taskDate === dateStr;
            }).length;

            days.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                created,
                completed
            });
        }

        return days;
    }, [getFilteredTasksForAnalytics]);

    // Summary statistics
    const analyticsSummary = useMemo(() => {
        const total = getFilteredTasksForAnalytics.length;
        const completed = getFilteredTasksForAnalytics.filter(t => t.completed).length;
        const pending = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        return {
            total,
            completed,
            pending,
            completionRate
        };
    }, [getFilteredTasksForAnalytics]);

    return {
        allTasksForAnalytics,
        getFilteredTasksForAnalytics,
        statusChartData,
        categoryChartData,
        priorityChartData,
        timeChartData,
        analyticsSummary,
        CHART_COLORS
    };
};

export default useAnalytics;
