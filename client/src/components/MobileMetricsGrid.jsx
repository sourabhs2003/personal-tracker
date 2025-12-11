import { Timer, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DailyGoalProgress from './DailyGoalProgress';
import StreakTracker from './StreakTracker';
import AnimatedNumber from './AnimatedNumber';
import { Clock, TrendingUp } from 'lucide-react';

/**
 * Mobile Metrics Grid - 2×2 compact stat cards
 */
export default function MobileMetricsGrid({ stats }) {
    return (
        <div className="grid grid-cols-2 gap-3">
            {/* Daily Goal */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                        <Clock size={16} className="text-blue-400" />
                    </div>
                    <span className="text-xs text-slate-400">Goal</span>
                </div>
                <div className="text-2xl font-bold text-white">
                    {Math.round((stats.today_min / 180) * 100)}%
                </div>
                <div className="text-xs text-slate-500 mt-1">
                    {stats.today_min} / 180 min
                </div>
            </div>

            {/* Streak */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center">
                        <span className="text-lg">🔥</span>
                    </div>
                    <span className="text-xs text-slate-400">Streak</span>
                </div>
                <div className="text-2xl font-bold text-white">
                    {stats.streak || 0}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                    days
                </div>
            </div>

            {/* Today */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
                        <TrendingUp size={16} className="text-purple-400" />
                    </div>
                    <span className="text-xs text-slate-400">Today</span>
                </div>
                <div className="text-2xl font-bold text-white">
                    <AnimatedNumber value={stats.today_min} />
                </div>
                <div className="text-xs text-slate-500 mt-1">
                    minutes
                </div>
            </div>

            {/* Week */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-600/20 flex items-center justify-center">
                        <TrendingUp size={16} className="text-amber-400" />
                    </div>
                    <span className="text-xs text-slate-400">Week</span>
                </div>
                <div className="text-2xl font-bold text-white">
                    <AnimatedNumber value={stats.week_min} />
                </div>
                <div className="text-xs text-slate-500 mt-1">
                    minutes
                </div>
            </div>
        </div>
    );
}
