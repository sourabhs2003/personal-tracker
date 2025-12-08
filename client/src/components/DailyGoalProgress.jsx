import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { calculateDailyGoal } from '../utils/studyAnalytics';
import clsx from 'clsx';

/**
 * Circular progress widget for daily goal tracking
 */
export default function DailyGoalProgress({ todayMin }) {
    const { percentage, status, color, target } = calculateDailyGoal(todayMin);

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

    return (
        <Card delay={0.1} className="h-full flex flex-col items-center justify-center">
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
                    <div className="text-sm text-slate-400 mt-1">
                        {todayMin} / {target} min
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
        </Card>
    );
}
