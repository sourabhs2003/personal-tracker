import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Play, Pause, RotateCcw, X, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_DURATION = 25; // minutes

/**
 * Quick Sprint Timer (Pomodoro) with Study Logging
 */
export default function QuickSprintTimer() {
    const [isOpen, setIsOpen] = useState(false);
    const [duration, setDuration] = useState(() => {
        const saved = localStorage.getItem('zowrox.sprintDuration');
        return saved ? parseInt(saved) : DEFAULT_DURATION;
    });
    const [timeLeft, setTimeLeft] = useState(duration * 60); // in seconds
    const [isRunning, setIsRunning] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const intervalRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        localStorage.setItem('zowrox.sprintDuration', duration.toString());
    }, [duration]);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        setIsCompleted(true);
                        // Optional: Play sound notification
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeLeft]);

    const handleStart = () => {
        setIsRunning(true);
        setIsCompleted(false);
    };

    const handlePause = () => {
        setIsRunning(false);
    };

    const handleReset = () => {
        setIsRunning(false);
        setTimeLeft(duration * 60);
        setIsCompleted(false);
    };

    const handleLogSprint = () => {
        // Navigate to log study page with pre-filled data
        const actualMinutes = Math.ceil((duration * 60 - timeLeft) / 60);
        navigate('/log-study', {
            state: {
                prefillMinutes: actualMinutes,
                fromSprint: true
            }
        });
        setIsOpen(false);
        handleReset();
    };

    const handleDurationChange = (newDuration) => {
        setDuration(newDuration);
        setTimeLeft(newDuration * 60);
        setIsCompleted(false);
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;
    const radius = 80;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <>
            {/* Floating Action Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1, type: 'spring', stiffness: 200 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 
                    rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center 
                    hover:scale-110 transition-transform duration-200 z-40 group"
                title="Quick Sprint Timer"
            >
                <Timer className="text-white" size={24} />
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full 
                    flex items-center justify-center text-xs font-bold text-white
                    opacity-0 group-hover:opacity-100 transition-opacity">
                    {duration}
                </div>
            </motion.button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                        />

                        {/* Modal Content */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                                w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl 
                                shadow-2xl z-50 p-8"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white 
                                    transition-colors"
                            >
                                <X size={20} />
                            </button>

                            <h2 className="text-2xl font-bold text-white mb-6 text-center">
                                Quick Sprint Timer
                            </h2>

                            {/* Timer Display */}
                            <div className="relative w-48 h-48 mx-auto mb-6">
                                <svg className="transform -rotate-90 w-full h-full">
                                    {/* Background circle */}
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r={radius}
                                        className="stroke-slate-700"
                                        strokeWidth="8"
                                        fill="none"
                                    />
                                    {/* Progress circle */}
                                    <motion.circle
                                        cx="96"
                                        cy="96"
                                        r={radius}
                                        className="stroke-blue-500"
                                        strokeWidth="8"
                                        fill="none"
                                        strokeLinecap="round"
                                        animate={{ strokeDashoffset }}
                                        transition={{ duration: 0.3 }}
                                        style={{
                                            strokeDasharray: circumference
                                        }}
                                    />
                                </svg>

                                {/* Center text */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-4xl font-bold text-white tabular-nums">
                                        {formatTime(timeLeft)}
                                    </div>
                                    <div className="text-sm text-slate-400 mt-1">
                                        {isCompleted ? 'Completed!' : isRunning ? 'Running...' : 'Ready'}
                                    </div>
                                </div>
                            </div>

                            {/* Duration Selector */}
                            {!isRunning && !isCompleted && (
                                <div className="flex gap-2 justify-center mb-6">
                                    {[15, 25, 45, 60].map(min => (
                                        <button
                                            key={min}
                                            onClick={() => handleDurationChange(min)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${duration === min
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                                }`}
                                        >
                                            {min}m
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Controls */}
                            <div className="flex gap-3 justify-center mb-6">
                                {!isRunning ? (
                                    <button
                                        onClick={handleStart}
                                        disabled={timeLeft === 0}
                                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 
                                            hover:bg-emerald-700 text-white rounded-lg font-medium 
                                            transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Play size={18} />
                                        Start
                                    </button>
                                ) : (
                                    <button
                                        onClick={handlePause}
                                        className="flex items-center gap-2 px-6 py-3 bg-amber-600 
                                            hover:bg-amber-700 text-white rounded-lg font-medium 
                                            transition-colors"
                                    >
                                        <Pause size={18} />
                                        Pause
                                    </button>
                                )}

                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-2 px-6 py-3 bg-slate-700 
                                        hover:bg-slate-600 text-white rounded-lg font-medium 
                                        transition-colors"
                                >
                                    <RotateCcw size={18} />
                                    Reset
                                </button>
                            </div>

                            {/* Log Sprint Button */}
                            {(isCompleted || timeLeft < duration * 60) && (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    onClick={handleLogSprint}
                                    className="w-full flex items-center justify-center gap-2 px-6 py-3 
                                        bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 
                                        hover:to-purple-700 text-white rounded-lg font-medium 
                                        transition-all shadow-lg shadow-blue-600/20"
                                >
                                    <BookOpen size={18} />
                                    Log this sprint ({Math.ceil((duration * 60 - timeLeft) / 60)} min)
                                </motion.button>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
