import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { bucketByHour, getTimeOfDayHotspots } from '../utils/studyAnalytics';

const SUBJECT_COLORS = {
    Quant: '#3b82f6',      // blue
    Reasoning: '#8b5cf6',  // purple
    English: '#10b981',    // emerald
    GK: '#f59e0b',         // amber
    Mock: '#ef4444'        // red
};

const FILTERS = ['All', 'Mock', 'Quant', 'Reasoning', 'English', 'GK'];

/**
 * Daily Hourly Analysis Modal
 * Full-screen modal showing hourly breakdown with stacked bar chart and session timeline
 */
export default function DailyHourlyModal({ isOpen, onClose, selectedDate }) {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('All');
    const [binSize, setBinSize] = useState(60); // 60 or 30 minutes

    useEffect(() => {
        if (isOpen && selectedDate) {
            fetchDaySessions();
        }
    }, [isOpen, selectedDate]);

    const fetchDaySessions = async () => {
        setLoading(true);
        try {
            const dateStr = selectedDate || new Date().toISOString().split('T')[0];
            const q = query(
                collection(db, 'study_sessions'),
                where('date', '==', dateStr)
            );

            const querySnapshot = await getDocs(q);
            const sessionsData = querySnapshot.docs.map(doc => doc.data());

            // Sort by start time
            sessionsData.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));

            setSessions(sessionsData);
            console.log(`Loaded ${sessionsData.length} sessions for ${dateStr}`);
        } catch (error) {
            console.error('Error fetching day sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter sessions based on active filter
    const filteredSessions = activeFilter === 'All'
        ? sessions
        : sessions.filter(s => s.subject === activeFilter);

    // Bucket sessions into hours
    const buckets = bucketByHour(filteredSessions, binSize);
    const hotspots = getTimeOfDayHotspots(buckets);

    // Prepare chart data
    const chartData = buckets.map(bucket => ({
        hour: bucket.hourLabel,
        Quant: bucket.subjectMinutes.Quant,
        Reasoning: bucket.subjectMinutes.Reasoning,
        English: bucket.subjectMinutes.English,
        GK: bucket.subjectMinutes.GK,
        Mock: bucket.subjectMinutes.Mock,
        total: bucket.totalMinutes,
        sessions: bucket.sessions
    }));

    const CustomTooltip = ({ active, payload }) => {
        if (!active || !payload || !payload.length) return null;

        const data = payload[0].payload;
        const sessions = data.sessions || [];

        return (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl max-w-xs">
                <p className="text-white font-semibold mb-2">{data.hour}</p>
                <p className="text-blue-400 text-sm mb-2">Total: {data.total} min</p>

                {sessions.length > 0 && (
                    <div className="border-t border-slate-700 pt-2 mt-2 space-y-1">
                        {sessions.map((session, idx) => (
                            <div key={idx} className="text-xs text-slate-300">
                                <div className="font-medium">{session.start_time}–{session.end_time} | {session.subject}</div>
                                <div className="text-slate-400">
                                    {session.chapter || 'General'} • {session.duration_min} min
                                    {session.questions_solved ? ` • ${session.questions_solved} Q` : ''}
                                </div>
                                {session.notes && (
                                    <div className="text-slate-500 italic mt-0.5">{session.notes}</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };

    const dateFormatted = selectedDate
        ? new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
        : '';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50"
                    >
                        <div className="bg-slate-900 border border-slate-700 rounded-t-2xl md:rounded-2xl 
                            w-full md:max-w-4xl md:max-h-[90vh] max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">

                            {/* Header */}
                            <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-700">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-600/20 rounded-lg">
                                        <Calendar className="text-blue-400" size={20} />
                                    </div>
                                    <div>
                                        <h2 className="text-lg md:text-xl font-bold text-white">Hourly Breakdown</h2>
                                        <p className="text-xs md:text-sm text-slate-400">{dateFormatted}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                                    aria-label="Close modal"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
                                {loading ? (
                                    <div className="flex items-center justify-center h-64">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : sessions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                                        <Calendar size={48} className="mb-4 opacity-50" />
                                        <p className="text-lg">No study sessions logged for this day</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Filters & Controls */}
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="flex items-center gap-2">
                                                <Filter size={16} className="text-slate-400" />
                                                <span className="text-sm text-slate-400">Filter:</span>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {FILTERS.map(filter => (
                                                    <button
                                                        key={filter}
                                                        onClick={() => setActiveFilter(filter)}
                                                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${activeFilter === filter
                                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                                                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                                                            }`}
                                                    >
                                                        {filter}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Bin Size Selector */}
                                            <div className="ml-auto flex items-center gap-2">
                                                <span className="text-sm text-slate-400">Bin:</span>
                                                <button
                                                    onClick={() => setBinSize(60)}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${binSize === 60
                                                            ? 'bg-purple-600 text-white'
                                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                        }`}
                                                >
                                                    1 hr
                                                </button>
                                                <button
                                                    onClick={() => setBinSize(30)}
                                                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${binSize === 30
                                                            ? 'bg-purple-600 text-white'
                                                            : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                                        }`}
                                                >
                                                    30 min
                                                </button>
                                            </div>
                                        </div>

                                        {/* Hotspot Summary */}
                                        {hotspots.peakHour && (
                                            <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-2xl">🔥</span>
                                                    <h3 className="text-sm font-semibold text-white">Peak Study Hour</h3>
                                                </div>
                                                <p className="text-sm text-slate-300">
                                                    Most productive at <span className="font-bold text-blue-400">{hotspots.peakHour}</span> with {hotspots.peakMinutes} minutes
                                                </p>
                                                <div className="flex gap-4 mt-3 text-xs text-slate-400">
                                                    <span>Morning: {hotspots.morningTotal} min</span>
                                                    <span>Afternoon: {hotspots.afternoonTotal} min</span>
                                                    <span>Evening: {hotspots.eveningTotal} min</span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Stacked Bar Chart */}
                                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                                            <h3 className="text-sm font-semibold text-white mb-4">Hourly Study Distribution</h3>
                                            <div className="h-64 md:h-80">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={chartData}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                                        <XAxis
                                                            dataKey="hour"
                                                            stroke="#94a3b8"
                                                            fontSize={11}
                                                            tickLine={false}
                                                            angle={-45}
                                                            textAnchor="end"
                                                            height={60}
                                                        />
                                                        <YAxis
                                                            stroke="#94a3b8"
                                                            fontSize={12}
                                                            tickLine={false}
                                                            label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 12 } }}
                                                        />
                                                        <Tooltip content={<CustomTooltip />} />
                                                        <Legend
                                                            wrapperStyle={{ fontSize: '12px' }}
                                                            iconType="square"
                                                        />
                                                        <Bar dataKey="Quant" stackId="a" fill={SUBJECT_COLORS.Quant} />
                                                        <Bar dataKey="Reasoning" stackId="a" fill={SUBJECT_COLORS.Reasoning} />
                                                        <Bar dataKey="English" stackId="a" fill={SUBJECT_COLORS.English} />
                                                        <Bar dataKey="GK" stackId="a" fill={SUBJECT_COLORS.GK} />
                                                        <Bar dataKey="Mock" stackId="a" fill={SUBJECT_COLORS.Mock} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>

                                        {/* Session Timeline */}
                                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                                            <div className="p-4 border-b border-slate-700">
                                                <h3 className="text-sm font-semibold text-white">Session Timeline</h3>
                                                <p className="text-xs text-slate-400 mt-1">{filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''}</p>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto">
                                                {filteredSessions.map((session, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="p-4 border-b border-slate-800 hover:bg-slate-700/30 transition-colors"
                                                    >
                                                        <div className="flex items-start justify-between gap-4">
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
                                                                {session.questions_solved > 0 && (
                                                                    <div className="text-xs text-slate-500">
                                                                        {session.questions_solved} Q
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
