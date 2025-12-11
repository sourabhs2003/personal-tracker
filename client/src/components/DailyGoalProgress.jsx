import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Card } from './ui/Card';
import { calculateDailyGoal, formatMinutesToDuration } from '../utils/studyAnalytics';
import Confetti from './Confetti';
import clsx from 'clsx';

/**
 * Circular progress widget for daily goal tracking
 */
export default function DailyGoalProgress({ todayMin }) {
    const { percentage, status, color, target } = calculateDailyGoal(todayMin);
    const [showConfetti, setShowConfetti] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        // Trigger confetti only once per day when crossing 100%
        const today = new Date().toISOString().split('T')[0];
        const lastConfettiDate = localStorage.getItem('zowrox.lastConfettiDate');
        const confettiEnabled = localStorage.getItem('zowrox.confettiEnabled') !== 'false';

        if (percentage >= 100 && lastConfettiDate !== today && confettiEnabled) {
            setShowConfetti(true);
            localStorage.setItem('zowrox.lastConfettiDate', today);
        }
    }, [percentage]);

    const radius = 70;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    const colorClasses = {
        emerald: 'stroke-emerald-500',
        amber: 'stroke-amber-500',
        red: 'stroke-red-500'
    };

    const textColorClasses = {
        emerald: 'text-emerald-400',
        amber: 'text-amber-400',
        red: 'text-red-400'
    };

    const formattedTime = formatMinutesToDuration(todayMin);
    const formattedTarget = formatMinutesToDuration(target);

    return (
        <>
            <Card
                delay={0.1}
                className="h-full flex flex-col items-center justify-center relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
            >
                <h3 className="text-lg font-semibold text-white mb-6">Daily Goal Progress</h3>

                {/* Circular Progress */}
                <div className="relative w-48 h-48 mb-4">
                    <svg className="transform -rotate-90 w-full h-full">
                        {/* Background circle */}
                        <circle
                            cx="96"
                            cy="96"
                            r={radius}
                            className="stroke-slate-700"
                            strokeWidth="12"
                            fill="none"
                        />
                        {/* Progress circle */}
                        <motion.circle
                            cx="96"
                            cy="96"
                            r={radius}
                            className={colorClasses[color]}
                            strokeWidth="12"
                            fill="none"
                            strokeLinecap="round"
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                            style={{
                                strokeDasharray: circumference
                            }}
                        />
                    </svg>

                    {/* Center text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                            className={clsx('text-4xl font-bold tabular-nums', textColorClasses[color])}
                        >
                            {percentage}%
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="text-sm text-slate-300 mt-1 font-medium"
                        >
                            {formattedTime}
                        </motion.div>
                        <div className="text-xs text-slate-500 mt-0.5">
                            of {formattedTarget}
                        </div>
                    </div>
                </div>

                {/* Status message */}
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-sm text-slate-300 text-center"
                >
                    {status}
                </motion.p>

                {/* Tooltip */}
                {showTooltip && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-slate-800 
                            border border-slate-700 rounded-lg px-4 py-2 shadow-xl z-10 
                            whitespace-nowrap pointer-events-none"
                    >
                        <p className="text-xs text-slate-300">
                            <span className="font-semibold text-white">{todayMin} minutes</span>
                            {todayMin >= 60 && (
                                <span className="text-slate-400"> = {formattedTime}</span>
                            )}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Target: {target} min ({formattedTarget})
                        </p>
                    </motion.div>
                )}
            </Card>

            {/* Confetti */}
            <Confetti
                trigger={showConfetti}
                onComplete={() => setShowConfetti(false)}
            />
        </>
    );
}

