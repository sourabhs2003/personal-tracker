import { twMerge } from 'tailwind-merge';

export function Input({ label, error, className, ...props }) {
    return (
        <div className="w-full">
            {label && <label className="block text-sm font-medium text-slate-400 mb-1.5">{label}</label>}
            <input
                className={twMerge(
                    'w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all',
                    error && 'border-red-500 focus:ring-red-500/50 focus:border-red-500',
                    className
                )}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        </div>
    );
}
