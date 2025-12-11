import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card } from './ui/Card';
import { filterSessionsByRange, getDateRangeLabel, formatMinutesToDuration } from '../utils/studyAnalytics';

const RANGES = ['Total', 'Monthly', 'Weekly', 'Daily'];

/**
 * Study Trend Chart with Time Range Selector
 */
export default function StudyTrend({ sessions }) {
    const [selectedRange, setSelectedRange] = useState(() => {
        return localStorage.getItem('zowrox.studyTrendRange') || 'Total';
    });

    useEffect(() => {
        localStorage.setItem('zowrox.studyTrendRange', selectedRange);
    }, [selectedRange]);

    const filteredSessions = filterSessionsByRange(sessions, selectedRange);

    // Aggregate by date
    const dateMap = {};
    filteredSessions.forEach(s => {
        dateMap[s.date] = (dateMap[s.date] || 0) + (s.duration_min || 0);
    });

    const studyData = Object.keys(dateMap).sort().map(date => ({
        date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        minutes: dateMap[date]
    }));

    const dateRangeLabel = getDateRangeLabel(selectedRange);

    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload || !payload.length) return null;
        const minutes = payload[0].value;
        return (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
                <p className="text-white font-semibold mb-1">{payload[0].payload.date}</p>
                <p className="text-blue-400 text-sm">{minutes} min</p>
                <p className="text-slate-400 text-xs">{formatMinutesToDuration(minutes)}</p>
            </div>
        );
    };

    return (
        <Card delay={0.5} className="h-[400px] flex flex-col" variant="glow">
            {/* Header with Range Selector */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-white">Study Trend</h3>
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
                    {studyData.length === 0 ? (
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
                                <AreaChart data={studyData}>
                                    <defs>
                                        <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="minutes"
                                        stroke="#3b82f6"
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#colorMin)"
                                        animationDuration={600}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </Card>
    );
}
