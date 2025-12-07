import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, PenTool, Database, Upload, Sun, Moon, User, CheckSquare, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import clsx from 'clsx';

const NAV_ITEMS = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/tasks', label: "Today's Tasks", icon: CheckSquare },
    { path: '/log-study', label: 'Log Study', icon: BookOpen },
    { path: '/log-mock', label: 'Log Mock', icon: PenTool },
    { path: '/chapters', label: 'Chapters', icon: Database },
    { path: '/import', label: 'Import', icon: Upload },
];

export default function Layout({ children }) {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const SidebarContent = () => (
        <>
            <div className="p-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                    SSC Tracker
                </h1>
                <button onClick={toggleMobileMenu} className="lg:hidden text-slate-400">
                    <X size={24} />
                </button>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {NAV_ITEMS.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)}>
                            <motion.div
                                whileHover={{ x: 4 }}
                                className={clsx(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative',
                                    isActive ? 'text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute inset-0 bg-blue-500/10 rounded-lg border-l-2 border-blue-500"
                                        initial={false}
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <item.icon size={20} className={isActive ? 'text-blue-400' : ''} />
                                <span className="relative z-10">{item.label}</span>
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-xs">
                        ME
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium">Sourabh</p>
                        <p className="text-xs text-slate-500">Aspirant</p>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex-col">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50 lg:hidden"
                        onClick={toggleMobileMenu}
                    >
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                            className="absolute left-0 top-0 bottom-0 w-64 bg-slate-900 border-r border-slate-800 flex flex-col"
                            onClick={e => e.stopPropagation()}
                        >
                            <SidebarContent />
                        </motion.aside>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-6 lg:px-8 border-b border-slate-900 bg-slate-950/50 backdrop-blur z-10">
                    <div className="flex items-center gap-4">
                        <button onClick={toggleMobileMenu} className="lg:hidden text-slate-400 hover:text-white">
                            <Menu size={24} />
                        </button>
                        <div className="text-sm text-slate-500">
                            Today is <span className="text-slate-300 font-medium hidden sm:inline">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                            <span className="text-slate-300 font-medium sm:hidden">{new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
