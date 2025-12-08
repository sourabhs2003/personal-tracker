import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { Clock } from 'lucide-react';

export default function StudyTimeline({ sessions }) {
    // 1. Process sessions into timeline blocks
    // We want a timeline from 05:00 to 24:00 (or dynamic range)
    // For simplicity, let's just map each session to a bar on a time axis.
    // Recharts isn't perfect for a gantt-like "timeline", but we can hack a BarChart or ScatterChart.
    // Or we can build a custom HTML/CSS timeline which is often better for "Daily Schedule" views.

    // Let's try a custom CSS Grid implementation for cleaner control over "gaps".

    if (!sessions || sessions.length === 0) {
        return (
            <Card className="flex flex-col items-center justify-center p-8 text-slate-500 min-h-[150px]">
                <Clock size={32} className="mb-2 opacity-50" />
                <p>No study sessions logged today yet.</p>
            </Card>
        );
    }

    // Sort by start time
    const sorted = [...sessions].sort((a, b) => a.start_time.localeCompare(b.start_time));

    // Calculate start/end minutes for positioning
    // 00:00 = 0, 24:00 = 1440.
    const getMinutes = (timeStr) => {
        const [h, m] = timeStr.split(':').map(Number);
        return h * 60 + m;
    };

    // Range: Earliest start - 1hr to Latest end + 1hr (or fixed 6am - 12pm if broader)
    const minTime = Math.min(...sorted.map(s => getMinutes(s.start_time)));
    const maxTime = Math.max(...sorted.map(s => getMinutes(s.end_time)));

    const startObj = Math.max(0, minTime - 60); // Buffer
    const endObj = Math.min(1440, maxTime + 60);
    const totalDuration = endObj - startObj;

    const getLeft = (timeStr) => {
        const mins = getMinutes(timeStr);
        return ((mins - startObj) / totalDuration) * 100;
    };

    const getWidth = (s, e) => {
        const start = getMinutes(s);
        let end = getMinutes(e);
        if (end < start) end += 1440; // overnight
        return ((end - start) / totalDuration) * 100;
    };

    // Color map for common subjects (can be extended)
    const getColor = (sub) => {
        const s = sub.toLowerCase();
        if (s.includes('quant') || s.includes('math')) return 'bg-blue-500';
        if (s.includes('reason')) return 'bg-purple-500';
        if (s.includes('eng')) return 'bg-emerald-500';
        if (s.includes('gk') || s.includes('ga')) return 'bg-amber-500';
        if (s.includes('mock')) return 'bg-purple-500';
        return 'bg-indigo-500';
    };

    return (
        <Card className="overflow-hidden">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Today's Timeline</h3>
                <div className="text-xs text-slate-500">
                    {Math.floor(startObj / 60)}:00 - {Math.ceil(endObj / 60)}:00
                </div>
            </div>

            <div className="relative h-24 bg-slate-900/50 rounded-lg w-full border border-slate-800/50">
                {/* Hour markers (approximate) */}
                <div className="absolute inset-0 flex justify-between px-2 text-[10px] text-slate-600 pointer-events-none pt-1">
                    {[...Array(6)].map((_, i) => (
                        <span key={i}>|</span>
                    ))}
                </div>

                {/* Bars */}
                {sorted.map((s, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ width: 0, opacity: 0 }}
                        animate={{
                            width: `${getWidth(s.start_time, s.end_time)}%`,
                            opacity: 1
                        }}
                        transition={{
                            duration: 0.5,
                            delay: 0.1 + idx * 0.05,
                            ease: 'easeOut'
                        }}
                        className={`absolute top-4 h-12 rounded-md shadow-lg border border-white/10 ${getColor(s.subject)} hover:opacity-90 hover:shadow-xl transition-all group cursor-default`}
                        style={{
                            left: `${getLeft(s.start_time)}%`
                        }}
                    >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-48">
                            <div className="bg-slate-800 text-xs text-slate-200 p-2 rounded shadow-xl border border-slate-700">
                                <div className="font-bold text-white mb-0.5">{s.subject}</div>
                                <div className="truncate opacity-80">{s.chapter}</div>
                                <div className="pt-1 mt-1 border-t border-slate-700/50 flex justify-between">
                                    <span>{s.start_time} - {s.end_time}</span>
                                    <span className="font-mono text-blue-300">{s.duration_min}m</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Legend */}
            <div className="mt-4 flex gap-4 text-xs text-slate-400 flex-wrap">
                {['Quant', 'Reasoning', 'English', 'GK', 'Mock'].map(sub => (
                    <div key={sub} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getColor(sub)}`}></div>
                        <span>{sub}</span>
                    </div>
                ))}
                <div className="ml-auto text-slate-500 italic">Hover blocks for details</div>
            </div>
        </Card>
    );
}
