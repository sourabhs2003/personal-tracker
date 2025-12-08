import { motion } from 'framer-motion';
import { calculateSubjectTrends } from '../utils/studyAnalytics';
import clsx from 'clsx';

/**
 * Subject status badges with trend indicators
 */
export default function SubjectBadges({ sessions }) {
    const trends = calculateSubjectTrends(sessions);
    const subjects = Object.keys(trends).sort();

    if (subjects.length === 0) {
        return null;
    }

    const statusColors = {
        'Strong': 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300',
        'Improving': 'bg-blue-500/20 border-blue-500/40 text-blue-300',
        'Needs Work': 'bg-amber-500/20 border-amber-500/40 text-amber-300',
        'Stable': 'bg-slate-500/20 border-slate-500/40 text-slate-300',
        'Active': 'bg-purple-500/20 border-purple-500/40 text-purple-300'
    };

    return (
        <div className="mt-4 pt-4 border-t border-slate-700/50">
            <h4 className="text-sm font-medium text-slate-400 mb-3">Subject Status</h4>
            <div className="flex flex-wrap gap-2">
                {subjects.map((subject, idx) => {
                    const trend = trends[subject];
                    return (
                        <motion.div
                            key={subject}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className={clsx(
                                'px-3 py-1.5 rounded-full border text-xs font-medium',
                                'flex items-center gap-1.5 transition-all hover:scale-105',
                                statusColors[trend.status] || statusColors['Stable']
                            )}
                        >
                            <span>{subject}</span>
                            <span>{trend.icon}</span>
                            <span className="opacity-80">{trend.status}</span>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
