import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { generateInsights } from '../utils/studyAnalytics';

/**
 * Smart study insights card with AI-like analysis
 */
export default function StudyInsights({ sessions }) {
    const insights = generateInsights(sessions);

    return (
        <Card delay={0.3} className="h-full">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">Study Insights</h3>
                <p className="text-xs text-slate-400">AI-powered analysis of your study patterns</p>
            </div>

            <div className="space-y-3">
                {insights.map((insight, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + idx * 0.1 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700/50 hover:border-slate-600/50 transition-colors"
                    >
                        <span className="text-xl flex-shrink-0">{insight.icon}</span>
                        <p className="text-sm text-slate-200 leading-relaxed">{insight.text}</p>
                    </motion.div>
                ))}
            </div>

            {insights.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                    <p className="text-sm">Log more sessions to unlock insights</p>
                </div>
            )}
        </Card>
    );
}
