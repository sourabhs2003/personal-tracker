import { motion } from 'framer-motion';
import { Card } from './ui/Card';
import { Sparkles, Trophy, Target, Calendar } from 'lucide-react';
import clsx from 'clsx';

export default function WelcomeCard({ todayMin, yesterdayMin }) {
    // Generate message based on stats
    let message = "Let's make today count!";
    let subMessage = "Consistency is the key to success.";
    let icon = <Target className="text-blue-400" size={24} />;
    let type = 'neutral';

    if (yesterdayMin === 0 && todayMin === 0) {
        message = "Fresh start! Log your first session.";
        subMessage = "You didn't study yesterday. Today is a clean slate.";
        icon = <Calendar className="text-slate-400" size={24} />;
    } else if (yesterdayMin > 0 && todayMin === 0) {
        message = `Yesterday: ${yesterdayMin} min. Don't break the chain!`;
        subMessage = "Log a session to keep the momentum going.";
        icon = <Sparkles className="text-amber-400" size={24} />;
        type = 'warning';
    } else if (todayMin > yesterdayMin) {
        message = `You're crushing it! ${todayMin} min today.`;
        subMessage = `You've already beaten yesterday's ${yesterdayMin} min.`;
        icon = <Trophy className="text-yellow-400" size={24} />;
        type = 'success';
    } else {
        const diff = yesterdayMin - todayMin;
        message = `Great start! ${todayMin} min so far.`;
        subMessage = `Only ${diff} min more to match yesterday (${yesterdayMin} min).`;
        icon = <Target className="text-emerald-400" size={24} />;
        type = 'progress';
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className={clsx(
                "relative overflow-hidden border-l-4",
                type === 'success' ? "border-l-yellow-400 bg-yellow-400/5" :
                    type === 'warning' ? "border-l-amber-400 bg-amber-400/5" :
                        type === 'progress' ? "border-l-emerald-400 bg-emerald-400/5" :
                            "border-l-blue-400 bg-blue-400/5"
            )}>
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 shadow-sm">
                        {icon}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-1">
                            {message}
                        </h2>
                        <p className="text-slate-400 text-sm">
                            {subMessage}
                        </p>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
