import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Collapsible Section Component
 * Used for expandable/collapsible content on mobile
 */
export default function CollapsibleSection({
    title,
    children,
    defaultOpen = false,
    icon = null,
    badge = null
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            {/* Header */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-700/30 transition-colors"
                aria-expanded={isOpen}
            >
                <div className="flex items-center gap-2">
                    {icon && <span className="text-slate-400">{icon}</span>}
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                    {badge && (
                        <span className="px-2 py-0.5 text-xs bg-blue-600/20 text-blue-400 rounded-full">
                            {badge}
                        </span>
                    )}
                </div>
                {isOpen ? (
                    <ChevronUp size={18} className="text-slate-400" />
                ) : (
                    <ChevronDown size={18} className="text-slate-400" />
                )}
            </button>

            {/* Content */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 pt-0 border-t border-slate-700/50">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
