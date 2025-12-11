import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from './ui/Card';
import { filterSessionsByRange, getDateRangeLabel, aggregateSubjectData, formatMinutesToDuration } from '../utils/studyAnalytics';

const RANGES = ['Total', 'Monthly', 'Weekly', 'Daily'];

const SUBJECT_COLORS = {
    'Mock': '#a855f7', // purple
    'Reasoning': '#3b82f6', // blue
    'English': '#10b981', // emerald
    'Quantitative': '#f59e0b', // amber
    'General Awareness': '#ef4444', // red
};

/**
 * Subject Breakdown Chart with Time Range Selector
 */
export default function SubjectBreakdown({ sessions }) {
    const [selectedRange, setSelectedRange] = useState(() => {
        return localStorage.getItem('zowrox.subjectBreakdownRange') || 'Total';
    });
    const [hiddenSubjects, setHiddenSubjects] = useState(new Set());

    useEffect(() => {
        localStorage.setItem('zowrox.subjectBreakdownRange', selectedRange);
    }, [selectedRange]);

    const filteredSessions = filterSessionsByRange(sessions, selectedRange);
    const subjectData = aggregateSubjectData(filteredSessions);

    // Filter out hidden subjects
    const visibleData = subjectData.filter(item => !hiddenSubjects.has(item.subject));

    const dateRangeLabel = getDateRangeLabel(selectedRange);

    const toggleSubject = (subject) => {
        setHiddenSubjects(prev => {
            const newSet = new Set(prev);
            if (newSet.has(subject)) {
                newSet.delete(subject);
            } else {
                newSet.add(subject);
            }
            return newSet;
        });
    };

    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload || !payload.length) return null;

        const data = payload[0].payload;
        return (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
                <p className="text-white font-semibold mb-1">{data.subject}</p>
                <p className="text-slate-300 text-sm">{data.minutes} min</p>
                <p className="text-slate-400 text-xs">{formatMinutesToDuration(data.minutes)}</p>
            </div>
        );
    };

    return (
        <Card delay={0.6} className="h-[400px] flex flex-col" variant="glow">
            {/* Header with Range Selector */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white">Subject Breakdown</h3>
                    <p className="text-xs text-slate-400 mt-1">Showing: {dateRangeLabel}</p>
                </div>

                {/* Range Toggle */}
                <div className="flex gap-1 bg-slate-900/50 rounded-lg p-1 border border-slate-700/50">
                    {RANGES.map(range => (
                        <button
                            key={range}
                            onClick={() => setSelectedRange(range)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 ${selectedRange === range
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="flex-1 w-full min-h-0">
                <AnimatePresence mode="wait">
                    {visibleData.length === 0 ? (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center justify-center h-full"
                        >
                            <p className="text-slate-500 text-sm">No data for selected range</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={selectedRange}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={visibleData} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} horizontal={false} />
                                    <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                    <YAxis
                                        dataKey="subject"
                                        type="category"
                                        stroke="#94a3b8"
                                        fontSize={12}
                                        tickLine={false}
                                        width={100}
                                    />
                                    <Tooltip
                                        content={<CustomTooltip />}
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    />
                                    <Bar
                                        dataKey="minutes"
                                        fill="#6366f1"
                                        radius={[0, 4, 4, 0]}
                                        barSize={24}
                                        animationDuration={600}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Custom Legend with Toggle */}
            {subjectData.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-slate-700/50">
                    {subjectData.map(item => (
                        <button
                            key={item.subject}
                            onClick={() => toggleSubject(item.subject)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${hiddenSubjects.has(item.subject)
                                    ? 'bg-slate-800/50 text-slate-500 opacity-50'
                                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                }`}
                        >
                            <div
                                className="w-3 h-3 rounded-sm"
                                style={{
                                    backgroundColor: SUBJECT_COLORS[item.subject] || '#6366f1',
                                    opacity: hiddenSubjects.has(item.subject) ? 0.3 : 1
                                }}
                            />
                            <span>{item.subject}</span>
                            <span className="text-slate-400">({item.minutes}m)</span>
                        </button>
                    ))}
                </div>
            )}
        </Card>
    );
}
