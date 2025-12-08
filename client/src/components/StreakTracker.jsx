import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { calculateStreak } from '../utils/studyAnalytics';
import clsx from 'clsx';

/**
 * Streak tracker widget with gamification elements
 */
export default function StreakTracker({ sessions }) {
    const { currentStreak, bestStreak } = calculateStreak(sessions);

    const streakLevel = currentStreak >= 7 ? 'high' : currentStreak >= 3 ? 'medium' : 'low';

    const levelColors = {
        high: 'from-emerald-500 to-green-500',
        medium: 'from-amber-500 to-orange-500',
        low: 'from-slate-500 to-slate-600'
    };

    return (
        <Card delay={0.2} className="h-full relative overflow-hidden">
            {/* Gradient background */}
            <div className={clsx(
                'absolute inset-0 opacity-10 bg-gradient-to-br',
                levelColors[streakLevel]
            )} />

            <div className="relative">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-white">Streaks & Consistency</h3>
                    {currentStreak >= 3 && (
                        <motion.span
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="text-2xl"
                        >
                            🔥
                        </motion.span>
                    )}
                </div>

                <div className="space-y-4">
                    {/* Current Streak */}
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white tabular-nums">
                            {currentStreak}
                        </span>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-300">days</span>
                            <span className="text-xs text-slate-500">current streak</span>
                        </div>
                    </div>

                    {/* Best Streak */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-700/50">
                        <span className="text-sm text-slate-400">Best Streak</span>
                        <span className="text-lg font-bold text-amber-400 tabular-nums">
                            {bestStreak} days
                        </span>
                    </div>

                    {/* Message */}
                    <div className="pt-2 border-t border-slate-700/50">
                        {currentStreak === 0 ? (
                            <p className="text-sm text-slate-400">
                                💪 Start a new streak today!
                            </p>
                        ) : currentStreak >= 7 ? (
                            <p className="text-sm text-emerald-400">
                                🎉 Incredible consistency! Keep it up!
                            </p>
                        ) : currentStreak >= 3 ? (
                            <p className="text-sm text-amber-400">
                                ✨ Great momentum! Don't break the chain!
                            </p>
                        ) : (
                            <p className="text-sm text-slate-400">
                                🎯 Keep going! Build your streak!
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
