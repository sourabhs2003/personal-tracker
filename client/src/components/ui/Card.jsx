import { motion } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({ children, className, delay = 0, variant = 'default' }) {
    const variantClasses = {
        default: 'bg-slate-800 border-slate-700',
        glow: 'bg-slate-800 border-slate-700 shadow-lg shadow-blue-500/10',
        gradient: 'bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
            className={twMerge(
                'border rounded-xl p-6 shadow-sm',
                'transition-all duration-300',
                'hover:shadow-xl hover:-translate-y-1',
                variantClasses[variant],
                className
            )}
        >
            {children}
        </motion.div>
    );
}
