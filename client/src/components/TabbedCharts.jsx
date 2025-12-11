import { useState } from 'react';
import { motion } from 'framer-motion';
import StudyTrend from './StudyTrend';
import SubjectBreakdown from './SubjectBreakdown';
import StudyHeatmap from './StudyHeatmap';

/**
 * Tabbed Charts Component
 * Switches between different charts to save vertical space on mobile
 */
export default function TabbedCharts({ sessions }) {
    const [activeTab, setActiveTab] = useState('trend');

    const tabs = [
        { id: 'trend', label: 'Trend' },
        { id: 'subjects', label: 'Subjects' },
        { id: 'heatmap', label: 'Heatmap' }
    ];

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-slate-700">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.id
                                ? 'text-white bg-slate-700/50'
                                : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                            }`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="p-4">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'trend' && (
                        <div className="h-[250px]">
                            <StudyTrend sessions={sessions} />
                        </div>
                    )}
                    {activeTab === 'subjects' && (
                        <div className="h-[250px]">
                            <SubjectBreakdown sessions={sessions} />
                        </div>
                    )}
                    {activeTab === 'heatmap' && (
                        <div className="h-[200px]">
                            <StudyHeatmap sessions={sessions} />
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
