import { Timer, BookOpen, Calendar, Lightbulb, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatMinutesToDuration } from '../utils/studyAnalytics';
import MobileMetricsGrid from './MobileMetricsGrid';
import CollapsibleSection from './CollapsibleSection';
import TabbedCharts from './TabbedCharts';
import StudyInsights from './StudyInsights';

/**
 * Compact Mobile Dashboard
 * Space-efficient layout that minimizes scrolling while showing all details
 */
export default function MobileCompactDashboard({ data }) {
    const navigate = useNavigate();

    const goalPercentage = Math.round((data.stats.today_min / 180) * 100);
    const todayFormatted = formatMinutesToDuration(data.stats.today_min);

    return (
        <div className="space-y-3 p-4 pb-20">
            {/* Compact Banner */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="text-sm opacity-90">
                            {goalPercentage >= 100 ? '🎉 Goal crushed!' : '💪 Keep going!'}
                        </div>
                        <div className="text-2xl font-bold mt-1">
                            {todayFormatted}
                        </div>
                        <div className="text-xs opacity-75 mt-1">
                            {goalPercentage}% of daily goal
                        </div>
                    </div>
                    <div className="text-5xl opacity-20">
                        {goalPercentage >= 100 ? '🏆' : '📚'}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => navigate('/log-study')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 
                        hover:bg-blue-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                    <BookOpen size={18} />
                    Log Study
                </button>
                <button
                    onClick={() => {/* Quick sprint timer */ }}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 
                        hover:bg-purple-700 text-white rounded-lg font-medium transition-colors text-sm"
                >
                    <Timer size={18} />
                    Quick Sprint
                </button>
            </div>

            {/* Metrics Grid */}
            <MobileMetricsGrid
                stats={{
                    today_min: data.stats.today_min,
                    week_min: data.stats.week_min,
                    streak: data.streakData?.currentStreak || 0
                }}
            />

            {/* Timeline - Collapsible */}
            <CollapsibleSection
                title="Today's Timeline"
                icon={<Calendar size={16} />}
                badge={`${data.todaySessions.length} sessions`}
                defaultOpen={data.todaySessions.length > 0}
            >
                {data.todaySessions.length > 0 ? (
                    <div className="space-y-2">
                        {data.todaySessions.map((session, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-white">{session.subject}</div>
                                    <div className="text-xs text-slate-400">
                                        {session.chapter || 'General study'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-blue-400">
                                        {session.duration_min} min
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {new Date(session.date).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-sm text-slate-500 text-center py-4">
                        No study sessions logged today
                    </p>
                )}
            </CollapsibleSection>

            {/* Charts - Tabbed */}
            <TabbedCharts sessions={data.allSessions} />

            {/* Insights - Collapsible */}
            <CollapsibleSection
                title="Study Insights"
                icon={<Lightbulb size={16} />}
                defaultOpen={false}
            >
                <StudyInsights sessions={data.allSessions} />
            </CollapsibleSection>

            {/* Recent Mocks - Compact */}
            <CollapsibleSection
                title="Recent Mocks"
                icon={<Trophy size={16} />}
                badge={`${data.latestMocks.length} total`}
                defaultOpen={false}
            >
                <div className="space-y-2">
                    {data.latestMocks.slice(0, 3).map((mock, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                            <div className="flex-1">
                                <div className="text-sm font-medium text-white">{mock.mock_name}</div>
                                <div className="text-xs text-slate-400">
                                    {new Date(mock.date).toLocaleDateString()} • {Math.round(mock.accuracy || 0)}% Acc
                                </div>
                            </div>
                            <div className="text-lg font-bold text-emerald-400">
                                {mock.score}
                            </div>
                        </div>
                    ))}
                    {data.latestMocks.length > 3 && (
                        <button
                            onClick={() => navigate('/mocks')}
                            className="w-full text-center text-sm text-blue-400 hover:text-blue-300 py-2"
                        >
                            View All Mocks →
                        </button>
                    )}
                </div>
            </CollapsibleSection>

            {/* Stats Summary */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-white">{data.stats.mocks_30d}</div>
                        <div className="text-xs text-slate-400 mt-1">Mocks (30d)</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-white">{data.stats.mockWeekMin || 0}</div>
                        <div className="text-xs text-slate-400 mt-1">Mock Study (min)</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
