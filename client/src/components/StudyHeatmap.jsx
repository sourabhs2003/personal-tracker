import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from './ui/Card';
import { generateHeatmapData, formatMinutesToDuration } from '../utils/studyAnalytics';
import { useState } from 'react';

const INTENSITY_COLORS = [
    'bg-slate-800', // 0 minutes
    'bg-emerald-900/30', // 1-29 min
    'bg-emerald-700/50', // 30-89 min
    'bg-emerald-600/70', // 90-149 min
    'bg-emerald-500', // 150+ min
];

/**
 * Study Heatmap - Last 30 days of study activity
 */
export default function StudyHeatmap({ sessions }) {
    const navigate = useNavigate();
    const [hoveredDay, setHoveredDay] = useState(null);

    const heatmapData = generateHeatmapData(sessions, 30);

    // Group by weeks (7 days each)
    const weeks = [];
    for (let i = 0; i < heatmapData.length; i += 7) {
        weeks.push(heatmapData.slice(i, i + 7));
    }

    const handleClick = () => {
        navigate('/summary');
    };

    return (
        <Card
            delay={0.9}
            className="cursor-pointer hover:scale-[1.02] transition-transform duration-300"
            onClick={handleClick}
        >
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">Study Activity</h3>
                <p className="text-xs text-slate-400">Last 30 days • Click to view summary</p>
            </div>

            {/* Heatmap Grid */}
            <div className="space-y-1.5">
                {weeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="flex gap-1.5">
                        {week.map((day, dayIdx) => {
                            const isToday = day.date === new Date().toISOString().split('T')[0];

                            return (
                                <motion.div
                                    key={day.date}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: (weekIdx * 7 + dayIdx) * 0.01 }}
                                    className="relative group"
                                    onMouseEnter={() => setHoveredDay(day)}
                                    onMouseLeave={() => setHoveredDay(null)}
                                >
                                    <div
                                        className={`w-8 h-8 rounded-sm ${INTENSITY_COLORS[day.intensity]} 
                                            transition-all duration-200 group-hover:scale-110 group-hover:ring-2 
                                            group-hover:ring-blue-400 ${isToday ? 'ring-2 ring-white' : ''}`}
                                    />

                                    {/* Tooltip */}
                                    {hoveredDay?.date === day.date && (
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 pointer-events-none">
                                            <div className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                                                <p className="text-white text-xs font-semibold">
                                                    {day.dateObj.toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                                <p className="text-slate-300 text-xs mt-0.5">
                                                    {day.minutes > 0
                                                        ? `${day.minutes} min (${formatMinutesToDuration(day.minutes)})`
                                                        : 'No study'
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-700/50">
                <span className="text-xs text-slate-500">Less</span>
                {INTENSITY_COLORS.map((color, idx) => (
                    <div key={idx} className={`w-4 h-4 rounded-sm ${color}`} />
                ))}
                <span className="text-xs text-slate-500">More</span>
            </div>
        </Card>
    );
}
