import { motion } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({ children, className, delay = 0 }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
            className={twMerge('bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-sm', className)}
        >
            {children}
        </motion.div>
    );
}
