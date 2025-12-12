/**
 * Summary Utilities
 * Helper functions for building detailed weekly reports and insights
 */

const DAILY_GOAL_MINUTES = 180;

/**
 * Build comprehensive weekly report with per-day breakdowns
 * @param {Array} sessions - Study sessions for the week
 * @returns {Object} { dailyBreakdown, subjectTotals, weekTotal }
 */
export function buildWeeklyReport(sessions) {
    if (!sessions || sessions.length === 0) {
        return { dailyBreakdown: {}, subjectTotals: {}, weekTotal: 0 };
    }

    const dailyBreakdown = {};
    const subjectTotals = {};
    let weekTotal = 0;

    // Group sessions by date
    sessions.forEach(session => {
        const date = session.date;
        const duration = parseInt(session.duration_min) || 0;
        const subject = session.subject || 'Unknown';

        // Daily breakdown
        if (!dailyBreakdown[date]) {
            dailyBreakdown[date] = {
                sessions: [],
                totalMinutes: 0,
                subjects: new Set()
            };
        }
        dailyBreakdown[date].sessions.push(session);
        dailyBreakdown[date].totalMinutes += duration;
        dailyBreakdown[date].subjects.add(subject);

        // Subject totals
        if (!subjectTotals[subject]) {
            subjectTotals[subject] = {
                totalMinutes: 0,
                sessionCount: 0,
                bestDay: { date: null, minutes: 0 }
            };
        }
        subjectTotals[subject].totalMinutes += duration;
        subjectTotals[subject].sessionCount++;

        // Track best day for this subject
        const subjectDailyTotal = sessions
            .filter(s => s.date === date && s.subject === subject)
            .reduce((acc, s) => acc + (parseInt(s.duration_min) || 0), 0);

        if (subjectDailyTotal > subjectTotals[subject].bestDay.minutes) {
            subjectTotals[subject].bestDay = { date, minutes: subjectDailyTotal };
        }

        weekTotal += duration;
    });

    // Calculate percentages and averages for subjects
    Object.keys(subjectTotals).forEach(subject => {
        const data = subjectTotals[subject];
        data.percentage = weekTotal > 0 ? Math.round((data.totalMinutes / weekTotal) * 100) : 0;
        data.avgPerSession = data.sessionCount > 0 ? Math.round(data.totalMinutes / data.sessionCount) : 0;
    });

    return { dailyBreakdown, subjectTotals, weekTotal };
}

/**
 * Calculate session statistics (avg, median, longest)
 * @param {Array} sessions - Study sessions
 * @returns {Object} { total, avgLength, medianLength, longestSession }
 */
export function calculateSessionStats(sessions) {
    if (!sessions || sessions.length === 0) {
        return { total: 0, avgLength: 0, medianLength: 0, longestSession: null };
    }

    const durations = sessions.map(s => parseInt(s.duration_min) || 0).sort((a, b) => a - b);
    const total = sessions.length;
    const totalMinutes = durations.reduce((acc, d) => acc + d, 0);
    const avgLength = Math.round(totalMinutes / total);

    // Calculate median
    const mid = Math.floor(durations.length / 2);
    const medianLength = durations.length % 2 === 0
        ? Math.round((durations[mid - 1] + durations[mid]) / 2)
        : durations[mid];

    // Find longest session
    const longestSession = sessions.reduce((longest, session) => {
        const duration = parseInt(session.duration_min) || 0;
        const longestDuration = parseInt(longest?.duration_min) || 0;
        return duration > longestDuration ? session : longest;
    }, sessions[0]);

    return { total, avgLength, medianLength, longestSession };
}

/**
 * Generate actionable insights for weekly summary
 * @param {Object} dailyBreakdown - Daily breakdown from buildWeeklyReport
 * @param {Object} subjectTotals - Subject totals from buildWeeklyReport
 * @param {number} dailyGoal - Daily goal in minutes (default 180)
 * @returns {Array} Array of insight strings
 */
export function generateWeeklyInsights(dailyBreakdown, subjectTotals, dailyGoal = DAILY_GOAL_MINUTES) {
    const insights = [];

    // Days above/below goal
    const dates = Object.keys(dailyBreakdown).sort();
    const daysAboveGoal = dates.filter(date => dailyBreakdown[date].totalMinutes >= dailyGoal);
    const daysBelowGoal = dates.filter(date => dailyBreakdown[date].totalMinutes < dailyGoal && dailyBreakdown[date].totalMinutes > 0);

    if (daysAboveGoal.length > 0) {
        insights.push(`✅ Met daily goal on ${daysAboveGoal.length} day${daysAboveGoal.length > 1 ? 's' : ''}`);
    }
    if (daysBelowGoal.length > 0) {
        insights.push(`⚠️ Below goal on ${daysBelowGoal.length} day${daysBelowGoal.length > 1 ? 's' : ''}`);
    }

    // Top 3 chapters
    const chapterMap = {};
    dates.forEach(date => {
        dailyBreakdown[date].sessions.forEach(session => {
            const chapter = session.chapter || 'General';
            const subject = session.subject || 'Unknown';
            const key = `${subject} - ${chapter}`;
            chapterMap[key] = (chapterMap[key] || 0) + (parseInt(session.duration_min) || 0);
        });
    });

    const topChapters = Object.entries(chapterMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([chapter, minutes]) => `${chapter} (${minutes} min)`);

    if (topChapters.length > 0) {
        insights.push(`📚 Top chapters: ${topChapters.join(', ')}`);
    }

    // Subject balance suggestion
    const subjects = Object.entries(subjectTotals).sort(([, a], [, b]) => b.totalMinutes - a.totalMinutes);
    if (subjects.length >= 2) {
        const strongest = subjects[0];
        const weakest = subjects[subjects.length - 1];

        if (strongest[1].bestDay.date && strongest[1].totalMinutes > weakest[1].totalMinutes * 2) {
            const bestDayFormatted = new Date(strongest[1].bestDay.date).toLocaleDateString('en-US', { weekday: 'short' });
            insights.push(`💡 You studied most in ${strongest[0]} on ${bestDayFormatted} (${strongest[1].bestDay.minutes} min) — try balancing with ${weakest[0]} next week`);
        }
    }

    return insights;
}

/**
 * Format session for text export (matches Daily Summary format)
 * @param {Object} session - Study session
 * @returns {string} Formatted session string
 */
export function formatSessionForExport(session) {
    const timeRange = `${session.start_time || '?'}–${session.end_time || '?'}`;
    const subject = session.subject || 'Unknown';
    const chapter = session.chapter || '-';
    const duration = `${session.duration_min || 0} min`;
    const questions = session.questions_solved ? `${session.questions_solved} questions` : '';

    const parts = [timeRange, subject, chapter, duration, questions].filter(p => p && p !== '-');
    return parts.join(' | ');
}

/**
 * Build text-based weekly report for copy/export
 * @param {Array} sessions - All sessions for the week
 * @param {string} startDate - Week start date (YYYY-MM-DD)
 * @param {string} endDate - Week end date (YYYY-MM-DD)
 * @returns {string} Formatted text report
 */
export function buildWeeklyTextReport(sessions, startDate, endDate) {
    if (!sessions || sessions.length === 0) {
        return "No study sessions logged this week.";
    }

    const { dailyBreakdown, subjectTotals, weekTotal } = buildWeeklyReport(sessions);
    const { total, avgLength, medianLength, longestSession } = calculateSessionStats(sessions);

    let text = `WEEK: ${startDate} → ${endDate}\n\n`;
    text += `TOTAL SESSIONS: ${total}\n`;
    text += `TOTAL TIME: ${weekTotal} min\n`;
    text += `AVERAGE SESSION: ${avgLength} min\n`;
    text += `MEDIAN SESSION: ${medianLength} min\n\n`;

    // Per-day breakdown
    text += `DAILY BREAKDOWN:\n`;
    const dates = Object.keys(dailyBreakdown).sort();
    dates.forEach(date => {
        const day = dailyBreakdown[date];
        const dateObj = new Date(date);
        const dateLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit' }).toUpperCase();
        const goalStatus = day.totalMinutes >= DAILY_GOAL_MINUTES ? '✔' : '✖';

        text += `\n${dateLabel} — ${day.totalMinutes} min (${day.sessions.length} sessions) ${goalStatus}\n`;

        // Sort sessions by start time
        const sortedSessions = [...day.sessions].sort((a, b) =>
            (a.start_time || '').localeCompare(b.start_time || '')
        );

        sortedSessions.forEach(session => {
            text += `  - ${formatSessionForExport(session)}\n`;
            if (session.notes) {
                text += `    Notes: ${session.notes}\n`;
            }
        });
    });

    // Subject totals
    text += `\nSUBJECT BREAKDOWN:\n`;
    Object.entries(subjectTotals)
        .sort(([, a], [, b]) => b.totalMinutes - a.totalMinutes)
        .forEach(([subject, data]) => {
            text += `- ${subject}: ${data.totalMinutes} min (${data.percentage}% of week, avg ${data.avgPerSession} min/session)\n`;
        });

    // Longest session
    if (longestSession) {
        text += `\nLONGEST SESSION: ${longestSession.duration_min} min — ${longestSession.subject || 'Unknown'}`;
        if (longestSession.chapter) {
            text += ` (${longestSession.chapter})`;
        }
        text += ` on ${new Date(longestSession.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}\n`;
    }

    return text;
}
