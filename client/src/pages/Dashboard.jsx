import { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
    Legend, AreaChart, Area
} from 'recharts';
import { Clock, TrendingUp, BookOpen, Activity, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // Fetch Study Sessions (Last 60 days for trends)
            const sixtyDaysAgo = new Date();
            sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
            const sixtyDaysStr = sixtyDaysAgo.toISOString().split('T')[0];

            const qSessions = query(
                collection(db, 'study_sessions'),
                where('date', '>=', sixtyDaysStr)
            );
            const sessionSnap = await getDocs(qSessions);
            const sessions = sessionSnap.docs.map(d => d.data());

            // Fetch Mocks (All time or last 30? Let's fetch all for safety then filter)
            // Or limit to 50
            const qMocks = query(collection(db, 'mocks'), orderBy('date', 'desc'), limit(20));
            const mockSnap = await getDocs(qMocks);
            const mocks = mockSnap.docs.map(d => ({ id: d.id, ...d.data() })); // mocks need id? maybe not for chart

            console.log(`Loaded ${sessions.length} study sessions and ${mocks.length} mocks from Firestore.`);

            // --- Aggregation ---

            const todayStr = new Date().toISOString().split('T')[0];
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const sevenDaysStr = sevenDaysAgo.toISOString().split('T')[0];
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const thirtyDaysStr = thirtyDaysAgo.toISOString().split('T')[0];

            // 1. Stats
            const today_min = sessions
                .filter(s => s.date === todayStr)
                .reduce((acc, s) => acc + (s.duration_min || 0), 0);

            const week_min = sessions
                .filter(s => s.date >= sevenDaysStr)
                .reduce((acc, s) => acc + (s.duration_min || 0), 0);

            const mocks_30d = mocks.filter(m => m.date >= thirtyDaysStr).length;

            // 2. Study Trend (Group by Date)
            const dateMap = {};
            sessions.forEach(s => {
                dateMap[s.date] = (dateMap[s.date] || 0) + (s.duration_min || 0);
            });
            // Fill gaps or just map existing? Chart handles gaps if simple lines, but area chart better with continuous.
            // For simplicity, just map existing sorted dates
            const studyTrend = Object.keys(dateMap).sort().map(date => ({
                date,
                total_min: dateMap[date]
            }));

            // 3. Subject Trend (Group by Subject)
            const subjectTrend = sessions.map(s => ({
                subject: s.subject,
                total_min: s.duration_min
            }));

            // 4. Mocks Trend
            // Ascending order for chart
            const mocksTrend = [...mocks].sort((a, b) => new Date(a.date) - new Date(b.date));
            const latestMocks = [...mocks].sort((a, b) => new Date(b.date) - new Date(a.date));

            setData({
                stats: { today_min, week_min, mocks_30d },
                studyTrend,
                subjectTrend,
                mocksTrend,
                latestMocks
            });

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center h-full text-red-400">
            <AlertCircle size={48} className="mb-4" />
            <h2 className="text-xl font-bold">Failed to load data</h2>
            <p className="text-sm text-slate-500 mt-2">{error}</p>
            <p className="text-xs text-slate-600 mt-4">Check console for more details.</p>
        </div>
    );

    if (!data) return null;

    // Process data for charts
    const studyData = data.studyTrend.map(d => ({
        date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        minutes: d.total_min
    }));

    const mockData = data.mocksTrend.map(d => ({
        date: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: d.score,
        name: d.mock_name
    }));

    // Simple Subject Aggregation for the Bar Chart
    const subjects = [...new Set(data.subjectTrend.map(d => d.subject))];
    const subjectChartData = subjects.map(sub => {
        const total = data.subjectTrend
            .filter(d => d.subject === sub)
            .reduce((acc, curr) => acc + curr.total_min, 0);
        return { subject: sub, minutes: total };
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Dashboard</h1>
                <p className="text-slate-400 mt-1">Track your SSC CGL prep in real time</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard delay={0.1} icon={<Clock className="text-blue-400" />} label="Study Today" value={`${data.stats.today_min} min`} sub="Keep pushing!" />
                <StatCard delay={0.2} icon={<TrendingUp className="text-emerald-400" />} label="Last 7 Days" value={`${data.stats.week_min} min`} sub="Target: 1200 min" />
                <StatCard delay={0.3} icon={<BookOpen className="text-purple-400" />} label="Mocks (30d)" value={data.stats.mocks_30d} sub="Tests taken" />
                <StatCard delay={0.4} icon={<Activity className="text-amber-400" />} label="Avg. Daily" value={`${Math.round(data.stats.week_min / 7)} min`} sub="Last 7 days" />
            </div>

            {/* Main Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card delay={0.5} className="h-[400px] flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white">Study Trend</h3>
                        <p className="text-xs text-slate-400">Daily study minutes over time</p>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={studyData}>
                                <defs>
                                    <linearGradient id="colorMin" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="minutes" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorMin)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card delay={0.6} className="h-[400px] flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white">Subject Breakdown</h3>
                        <p className="text-xs text-slate-400">Total minutes by subject (Last 60 days)</p>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectChartData} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} horizontal={false} />
                                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                <YAxis dataKey="subject" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} width={80} />
                                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                                <Bar dataKey="minutes" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            {/* Mock Analysis Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card delay={0.7} className="lg:col-span-2 h-[350px] flex flex-col">
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-white">Mock Score Trend</h3>
                        <p className="text-xs text-slate-400">Performance consistency</p>
                    </div>
                    <div className="flex-1 w-full min-h-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={['auto', 'auto']} />
                                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card delay={0.8} className="h-[350px] flex flex-col overflow-hidden p-0">
                    <div className="p-6 border-b border-slate-700">
                        <h3 className="text-lg font-semibold text-white">Recent Mocks</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-0">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-900/50 sticky top-0 backdrop-blur">
                                <tr>
                                    <th className="p-3 text-slate-400 font-medium pl-6">Mock</th>
                                    <th className="p-3 text-slate-400 font-medium text-right pr-6">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800">
                                {data.latestMocks.map((mock, idx) => (
                                    <tr key={idx} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="p-3 pl-6">
                                            <div className="font-medium text-slate-200">{mock.mock_name}</div>
                                            <div className="text-xs text-slate-500">{new Date(mock.date).toLocaleDateString()} • {Math.round(mock.accuracy || 0)}% Acc</div>
                                        </td>
                                        <td className="p-3 pr-6 text-right font-bold text-emerald-400">
                                            {mock.score}
                                        </td>
                                    </tr>
                                ))}
                                {data.latestMocks.length === 0 && (
                                    <tr><td colSpan="2" className="p-6 text-center text-slate-500">No mocks found.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, sub, delay }) {
    return (
        <Card delay={delay} className="flex flex-col gap-2">
            <div className="flex items-center gap-3 mb-1">
                <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-700/50">
                    {icon}
                </div>
                <span className="text-sm font-medium text-slate-400">{label}</span>
            </div>
            <div>
                <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
                {sub && <div className="text-xs text-slate-500">{sub}</div>}
            </div>
        </Card>
    );
}
