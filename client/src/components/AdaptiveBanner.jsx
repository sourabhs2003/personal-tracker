import { motion } from 'framer-motion';
import { getMotivationalMessage } from '../utils/studyAnalytics';
import clsx from 'clsx';

/**
 * Adaptive motivational banner that changes based on user performance
 */
export default function AdaptiveBanner({ todayMin, yesterdayMin, streak }) {
    const { message, subMessage, icon, type } = getMotivationalMessage(todayMin, yesterdayMin, streak);

    // Color scheme based on type
    const colorClasses = {
        success: 'border-l-emerald-400 bg-emerald-400/10',
        progress: 'border-l-blue-400 bg-blue-400/10',
        motivate: 'border-l-amber-400 bg-amber-400/10',
        recovery: 'border-l-purple-400 bg-purple-400/10',
        neutral: 'border-l-slate-400 bg-slate-400/10'
    };

    const iconBgClasses = {
        success: 'bg-emerald-500/20 border-emerald-500/30',
        progress: 'bg-blue-500/20 border-blue-500/30',
        motivate: 'bg-amber-500/20 border-amber-500/30',
        recovery: 'bg-purple-500/20 border-purple-500/30',
        neutral: 'bg-slate-500/20 border-slate-500/30'
    };

    // Pulse animation for urgent messages
    const shouldPulse = type === 'motivate' || type === 'recovery';

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className={clsx(
                'relative overflow-hidden border-l-4 rounded-xl p-6',
                'bg-slate-800 border border-slate-700 shadow-lg',
                colorClasses[type],
                shouldPulse && 'animate-pulse-glow'
            )}
        >
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-50 pointer-events-none" />

            <div className="relative flex items-start gap-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className={clsx(
                        'p-3 rounded-xl border text-2xl flex-shrink-0',
                        iconBgClasses[type]
                    )}
                >
                    {icon}
                </motion.div>

                <div className="flex-1 min-w-0">
                    <motion.h2
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-xl font-bold text-white mb-1"
                    >
                        {message}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-sm text-slate-300"
                    >
                        {subMessage}
                    </motion.p>
                </div>
            </div>
        </motion.div>
    );
}
