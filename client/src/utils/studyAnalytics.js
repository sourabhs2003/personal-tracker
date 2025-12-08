/**
 * Study Analytics Engine
 * Provides intelligent insights, streak tracking, and trend analysis
 */

const DAILY_GOAL_MINUTES = 180; // Default daily target

/**
 * Calculate current and best study streak
 * @param {Array} sessions - All study sessions
 * @returns {Object} { currentStreak, bestStreak, lastStudyDate }
 */
export function calculateStreak(sessions) {
    if (!sessions || sessions.length === 0) {
        return { currentStreak: 0, bestStreak: 0, lastStudyDate: null };
    }

    // Get unique dates with study time, sorted descending
    const studyDates = [...new Set(sessions.map(s => s.date))]
        .sort((a, b) => b.localeCompare(a));

    if (studyDates.length === 0) {
        return { currentStreak: 0, bestStreak: 0, lastStudyDate: null };
    }

    const today = new Date().toISOString().split('T')[0];
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Calculate current streak (from today backwards)
    let expectedDate = new Date(today);
    for (const dateStr of studyDates) {
        const studyDate = new Date(dateStr);
        const expectedStr = expectedDate.toISOString().split('T')[0];

        if (dateStr === expectedStr) {
            currentStreak++;
            expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
            break;
        }
    }

    // Calculate best streak (all time)
    let prevDate = null;
    for (const dateStr of studyDates.reverse()) {
        if (!prevDate) {
            tempStreak = 1;
        } else {
            const curr = new Date(dateStr);
            const prev = new Date(prevDate);
            const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                tempStreak++;
            } else {
                bestStreak = Math.max(bestStreak, tempStreak);
                tempStreak = 1;
            }
        }
        prevDate = dateStr;
    }
    bestStreak = Math.max(bestStreak, tempStreak);

    return {
        currentStreak,
        bestStreak,
        lastStudyDate: studyDates[0]
    };
}

/**
 * Generate intelligent study insights
 * @param {Array} sessions - Study sessions (last 14+ days recommended)
 * @returns {Array} Array of insight objects { icon, text, type }
 */
export function generateInsights(sessions) {
    if (!sessions || sessions.length === 0) {
        return [{ icon: '📚', text: 'Start logging sessions to see insights', type: 'neutral' }];
    }

    const insights = [];
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const sevenDayStr = sevenDaysAgo.toISOString().split('T')[0];
    const fourteenDayStr = fourteenDaysAgo.toISOString().split('T')[0];

    // Filter sessions
    const lastWeek = sessions.filter(s => s.date >= sevenDayStr);
    const prevWeek = sessions.filter(s => s.date >= fourteenDayStr && s.date < sevenDayStr);

    // 1. Strongest Subject (last 7 days)
    const subjectTotals = {};
    lastWeek.forEach(s => {
        subjectTotals[s.subject] = (subjectTotals[s.subject] || 0) + (s.duration_min || 0);
    });

    const totalMinutes = Object.values(subjectTotals).reduce((a, b) => a + b, 0);
    if (totalMinutes > 0) {
        const strongest = Object.entries(subjectTotals).sort((a, b) => b[1] - a[1])[0];
        const percentage = Math.round((strongest[1] / totalMinutes) * 100);
        insights.push({
            icon: '💪',
            text: `${strongest[0]} is your strongest subject (${percentage}% of study time)`,
            type: 'positive'
        });
    }

    // 2. Subject Trends (week over week)
    const prevSubjectTotals = {};
    prevWeek.forEach(s => {
        prevSubjectTotals[s.subject] = (prevSubjectTotals[s.subject] || 0) + (s.duration_min || 0);
    });

    const trendSubjects = Object.keys(subjectTotals).filter(sub => prevSubjectTotals[sub] > 0);
    const trends = trendSubjects.map(sub => {
        const change = ((subjectTotals[sub] - prevSubjectTotals[sub]) / prevSubjectTotals[sub]) * 100;
        return { subject: sub, change };
    }).sort((a, b) => Math.abs(b.change) - Math.abs(a.change));

    if (trends.length > 0) {
        const topTrend = trends[0];
        if (topTrend.change > 10) {
            insights.push({
                icon: '📈',
                text: `${topTrend.subject} trending up — +${Math.round(topTrend.change)}% from last week`,
                type: 'positive'
            });
        } else if (topTrend.change < -10) {
            insights.push({
                icon: '⚠️',
                text: `${topTrend.subject} dropped ${Math.abs(Math.round(topTrend.change))}% — consider focusing tomorrow`,
                type: 'warning'
            });
        }
    }

    // 3. Daily Average
    const daysWithStudy = new Set(lastWeek.map(s => s.date)).size;
    if (daysWithStudy > 0) {
        const avgDaily = Math.round(totalMinutes / daysWithStudy);
        insights.push({
            icon: '📊',
            text: `Daily average: ${avgDaily} min/day (last ${daysWithStudy} days)`,
            type: 'neutral'
        });
    }

    // 4. Streak Milestone
    const { currentStreak } = calculateStreak(sessions);
    if (currentStreak >= 7) {
        insights.push({
            icon: '🔥',
            text: `Amazing! ${currentStreak}-day streak — you're unstoppable`,
            type: 'positive'
        });
    } else if (currentStreak >= 3) {
        insights.push({
            icon: '✨',
            text: `${currentStreak}-day streak — keep the momentum going`,
            type: 'positive'
        });
    }

    // Limit to top 4 insights
    return insights.slice(0, 4);
}

/**
 * Calculate subject trends for badge status
 * @param {Array} sessions - Study sessions
 * @returns {Object} { subject: { status, icon, change } }
 */
export function calculateSubjectTrends(sessions) {
    if (!sessions || sessions.length === 0) return {};

    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const fourteenDaysAgo = new Date(today);
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    const sevenDayStr = sevenDaysAgo.toISOString().split('T')[0];
    const fourteenDayStr = fourteenDaysAgo.toISOString().split('T')[0];

    const lastWeek = sessions.filter(s => s.date >= sevenDayStr);
    const prevWeek = sessions.filter(s => s.date >= fourteenDayStr && s.date < sevenDayStr);

    const lastWeekTotals = {};
    const prevWeekTotals = {};

    lastWeek.forEach(s => {
        lastWeekTotals[s.subject] = (lastWeekTotals[s.subject] || 0) + (s.duration_min || 0);
    });

    prevWeek.forEach(s => {
        prevWeekTotals[s.subject] = (prevWeekTotals[s.subject] || 0) + (s.duration_min || 0);
    });

    // Find strongest subject
    const strongest = Object.entries(lastWeekTotals).sort((a, b) => b[1] - a[1])[0]?.[0];

    const trends = {};
    const allSubjects = new Set([...Object.keys(lastWeekTotals), ...Object.keys(prevWeekTotals)]);

    allSubjects.forEach(subject => {
        const current = lastWeekTotals[subject] || 0;
        const previous = prevWeekTotals[subject] || 0;

        if (subject === strongest && current > 0) {
            trends[subject] = { status: 'Strong', icon: '🔥', change: 0 };
        } else if (previous === 0 && current > 0) {
            trends[subject] = { status: 'Active', icon: '🟪', change: 100 };
        } else if (previous > 0) {
            const change = ((current - previous) / previous) * 100;
            if (change >= 10) {
                trends[subject] = { status: 'Improving', icon: '📈', change };
            } else if (change <= -10) {
                trends[subject] = { status: 'Needs Work', icon: '⚠️', change };
            } else {
                trends[subject] = { status: 'Stable', icon: '🧠', change };
            }
        } else if (current > 0) {
            trends[subject] = { status: 'Active', icon: '🟪', change: 0 };
        }
    });

    return trends;
}

/**
 * Generate motivational message based on performance
 * @param {number} todayMin - Today's study minutes
 * @param {number} yesterdayMin - Yesterday's study minutes
 * @param {number} streak - Current streak
 * @returns {Object} { message, subMessage, icon, type }
 */
export function getMotivationalMessage(todayMin, yesterdayMin, streak) {
    // Streak broken
    if (streak === 0 && yesterdayMin > 0) {
        return {
            message: "New day, new streak. Start strong today ✨",
            subMessage: "Every expert was once a beginner. Let's build momentum.",
            icon: '🎯',
            type: 'recovery'
        };
    }

    // Beating yesterday
    if (todayMin > yesterdayMin && yesterdayMin > 0) {
        return {
            message: "You're on fire! You've already beaten yesterday 👑",
            subMessage: `${todayMin} min today vs ${yesterdayMin} min yesterday. Keep crushing it!`,
            icon: '🔥',
            type: 'success'
        };
    }

    // Low start
    if (todayMin < 30 && yesterdayMin > 60) {
        return {
            message: "Slow start today. A 20-minute sprint will help you hit target!",
            subMessage: `You did ${yesterdayMin} min yesterday. You've got this.`,
            icon: '⚡',
            type: 'motivate'
        };
    }

    // Good progress
    if (todayMin >= 60) {
        const remaining = Math.max(0, DAILY_GOAL_MINUTES - todayMin);
        if (remaining === 0) {
            return {
                message: "Goal crushed! You're a study machine 🎉",
                subMessage: `${todayMin} minutes logged. Exceptional work today.`,
                icon: '🏆',
                type: 'success'
            };
        }
        return {
            message: `Great momentum! ${remaining} min to hit your daily goal`,
            subMessage: `You're ${Math.round((todayMin / DAILY_GOAL_MINUTES) * 100)}% there. Keep going!`,
            icon: '💪',
            type: 'progress'
        };
    }

    // Default
    return {
        message: "Let's make today count!",
        subMessage: "Consistency is the key to success. Start your first session.",
        icon: '🎯',
        type: 'neutral'
    };
}

/**
 * Calculate daily goal progress
 * @param {number} todayMin - Today's study minutes
 * @param {number} target - Daily goal target (default 180)
 * @returns {Object} { percentage, status, color }
 */
export function calculateDailyGoal(todayMin, target = DAILY_GOAL_MINUTES) {
    const percentage = Math.min(100, Math.round((todayMin / target) * 100));

    let status, color;
    if (percentage >= 100) {
        status = "Goal crushed! 🎉";
        color = "emerald";
    } else if (percentage >= 70) {
        status = "Almost there!";
        color = "emerald";
    } else if (percentage >= 40) {
        status = "You're on track!";
        color = "amber";
    } else {
        status = "Let's get started!";
        color = "red";
    }

    return { percentage, status, color, target };
}
