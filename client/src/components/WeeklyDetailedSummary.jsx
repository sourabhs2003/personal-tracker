import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Card } from './ui/Card';
import { Copy, RefreshCw, CalendarRange, ChevronDown, ChevronUp, TrendingUp, Award, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
    buildWeeklyReport,
    calculateSessionStats,
    generateWeeklyInsights,
    buildWeeklyTextReport,
    formatSessionForExport
} from '../utils/summaryUtils';

const DAILY_GOAL = 180;

/**
 * Weekly Detailed Summary Component
 * Comprehensive weekly report with per-day breakdowns, stats, and insights
 */
export default function WeeklyDetailedSummary() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedDays, setExpandedDays] = useState({});
    const [weekStart, setWeekStart] = useState('');
    const [weekEnd, setWeekEnd] = useState('');

    useEffect(() => {
        // Load expanded states from localStorage
        const saved = localStorage.getItem('zowrox.weeklyDayExpanded');
        if (saved) {
            try {
                setExpandedDays(JSON.parse(saved));
            } catch (e) {
                console.error('Failed to parse expanded days:', e);
            }
        }
        generateWeeklySummary();
    }, []);

    useEffect(() => {
        // Save expanded states to localStorage
        localStorage.setItem('zowrox.weeklyDayExpanded', JSON.stringify(expandedDays));
    }, [expandedDays]);

    const generateWeeklySummary = async () => {
        setLoading(true);
        try {
            const today = new Date();
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 6); // inclusive of today + 6 days back = 7 days

            const todayStr = today.toISOString().split('T')[0];
            const startStr = sevenDaysAgo.toISOString().split('T')[0];

            setWeekStart(startStr);
            setWeekEnd(todayStr);

            const q = query(
                collection(db, 'study_sessions'),
                where('date', '>=', startStr),
                where('date', '<=', todayStr)
            );

            const querySnapshot = await getDocs(q);
            const sessionsData = querySnapshot.docs.map(doc => doc.data());

            setSessions(sessionsData);
            console.log(`Loaded ${sessionsData.length} sessions for week ${startStr} → ${todayStr}`);
        } catch (error) {
            console.error('Error generating weekly summary:', error);
            toast.error('Failed to generate summary.');
        } finally {
            setLoading(false);
        }
    };

    const toggleDay = (date) => {
        setExpandedDays(prev => ({
            ...prev,
            [date]: !prev[date]
        }));
    };

    const copyToClipboard = () => {
        if (sessions.length === 0) return;
        const text = buildWeeklyTextReport(sessions, weekStart, weekEnd);
        navigator.clipboard.writeText(text);
        toast.success('Weekly report copied!');
    };

    if (loading) {
        return (
            <Card className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
            </Card>
        );
    }

    if (sessions.length === 0) {
        return (
            <Card className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
                    <div className="flex items-center gap-2">
                        <CalendarRange className="text-purple-400" size={20} />
                        <h3 className="text-lg font-semibold text-white">Weekly Summary</h3>
                    </div>
                    <button
                        onClick={generateWeeklySummary}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                        title="Refresh Summary"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
                <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                    <CalendarRange size={48} className="mb-4 opacity-50" />
                    <p className="text-lg">No study sessions logged this week</p>
                </div>
            </Card>
        );
    }

    const { dailyBreakdown, subjectTotals, weekTotal } = buildWeeklyReport(sessions);
    const { total, avgLength, medianLength, longestSession } = calculateSessionStats(sessions);
    const insights = generateWeeklyInsights(dailyBreakdown, subjectTotals, DAILY_GOAL);

    const dates = Object.keys(dailyBreakdown).sort();

    return (
        <Card className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
                <div className="flex items-center gap-2">
                    <CalendarRange className="text-purple-400" size={20} />
                    <div>
                        <h3 className="text-lg font-semibold text-white">Weekly Summary</h3>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {new Date(weekStart).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → {new Date(weekEnd).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={generateWeeklySummary}
                        disabled={loading}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white disabled:opacity-50"
                        title="Refresh Summary"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors text-sm"
                    >
                        <Copy size={16} />
                        Copy Report
                    </button>
                </div>
            </div>

            {/* Week Stats Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="text-blue-400" size={16} />
                        <span className="text-xs text-slate-400">Total Time</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{weekTotal} min</div>
                    <div className="text-xs text-slate-500 mt-1">{Math.round(weekTotal / 60)} hours</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="text-emerald-400" size={16} />
                        <span className="text-xs text-slate-400">Sessions</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{total}</div>
                    <div className="text-xs text-slate-500 mt-1">Avg {avgLength} min</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Award className="text-amber-400" size={16} />
                        <span className="text-xs text-slate-400">Longest</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{longestSession?.duration_min || 0} min</div>
                    <div className="text-xs text-slate-500 mt-1">{longestSession?.subject || 'N/A'}</div>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                        <CalendarRange className="text-purple-400" size={16} />
                        <span className="text-xs text-slate-400">Median</span>
                    </div>
                    <div className="text-2xl font-bold text-white">{medianLength} min</div>
                    <div className="text-xs text-slate-500 mt-1">Per session</div>
                </div>
            </div>

            {/* Actionable Insights */}
            {insights.length > 0 && (
                <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <span className="text-lg">💡</span>
                        Insights
                    </h4>
                    <div className="space-y-2">
                        {insights.map((insight, idx) => (
                            <div key={idx} className="text-sm text-slate-300">
                                {insight}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Per-Subject Weekly Totals */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-slate-700">
                    <h4 className="text-sm font-semibold text-white">Subject Breakdown</h4>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th className="p-3 text-left text-slate-400 font-medium">Subject</th>
                                <th className="p-3 text-right text-slate-400 font-medium">Total</th>
                                <th className="p-3 text-right text-slate-400 font-medium">% of Week</th>
                                <th className="p-3 text-right text-slate-400 font-medium">Avg/Session</th>
                                <th className="p-3 text-right text-slate-400 font-medium">Best Day</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {Object.entries(subjectTotals)
                                .sort(([, a], [, b]) => b.totalMinutes - a.totalMinutes)
                                .map(([subject, data]) => (
                                    <tr key={subject} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="p-3 font-medium text-white">{subject}</td>
                                        <td className="p-3 text-right text-blue-400">{data.totalMinutes} min</td>
                                        <td className="p-3 text-right text-slate-300">{data.percentage}%</td>
                                        <td className="p-3 text-right text-slate-300">{data.avgPerSession} min</td>
                                        <td className="p-3 text-right text-slate-400 text-xs">
                                            {data.bestDay.date
                                                ? `${new Date(data.bestDay.date).toLocaleDateString('en-US', { weekday: 'short' })} (${data.bestDay.minutes} min)`
                                                : 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Per-Day Breakdown */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-white">Daily Breakdown</h4>
                {dates.map(date => {
                    const day = dailyBreakdown[date];
                    const dateObj = new Date(date);
                    const dateLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                    const goalMet = day.totalMinutes >= DAILY_GOAL;
                    const isExpanded = expandedDays[date];

                    // Sort sessions by start time
                    const sortedSessions = [...day.sessions].sort((a, b) =>
                        (a.start_time || '').localeCompare(b.start_time || '')
                    );

                    return (
                        <div key={date} className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden">
                            {/* Day Header */}
                            <button
                                onClick={() => toggleDay(date)}
                                className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${goalMet ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                    <div className="text-left">
                                        <div className="font-semibold text-white">{dateLabel}</div>
                                        <div className="text-xs text-slate-400">
                                            {day.totalMinutes} min • {day.sessions.length} session{day.sessions.length !== 1 ? 's' : ''} • {goalMet ? '✔' : '✖'} Goal
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-bold text-blue-400">{day.totalMinutes} min</span>
                                    {isExpanded ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                                </div>
                            </button>

                            {/* Day Sessions */}
                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="border-t border-slate-700 overflow-hidden"
                                    >
                                        <div className="p-4 space-y-3 bg-slate-900/30">
                                            {sortedSessions.map((session, idx) => (
                                                <div key={idx} className="flex items-start justify-between gap-4 p-3 bg-slate-800/50 rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="text-sm font-semibold text-white">
                                                                {session.start_time}–{session.end_time}
                                                            </span>
                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400">
                                                                {session.subject}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-slate-300">
                                                            {session.chapter || 'General study'}
                                                            {session.source && ` • ${session.source}`}
                                                        </div>
                                                        {session.questions_solved > 0 && (
                                                            <div className="text-xs text-slate-500 mt-1">
                                                                {session.questions_solved} questions solved
                                                            </div>
                                                        )}
                                                        {session.notes && (
                                                            <div className="text-xs text-slate-500 mt-2 italic">
                                                                {session.notes}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-lg font-bold text-blue-400">
                                                            {session.duration_min} min
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}
