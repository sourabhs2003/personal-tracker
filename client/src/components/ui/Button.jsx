import { motion } from 'framer-motion';
import { twMerge } from 'tailwind-merge';

export function Button({ children, className, variant = 'primary', isLoading, ...props }) {
    const baseStyles = 'px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20',
        secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-200',
        danger: 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20',
        ghost: 'bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white',
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={twMerge(baseStyles, variants[variant], className)}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? <span className="animate-spin mr-2">⭮</span> : null}
            {children}
        </motion.button>
    );
}
