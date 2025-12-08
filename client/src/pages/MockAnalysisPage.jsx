import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { Card } from '../components/ui/Card';
import usePageTitle from '../hooks/usePageTitle';
import {
    Clock, Target, Award, ArrowLeft, BarChart2,
    CheckCircle2, XCircle, AlertCircle, FileText, Zap, TrendingUp, Calendar
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';

export default function MockAnalysisPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [mock, setMock] = useState(null);
    const [loading, setLoading] = useState(true);

    usePageTitle('Mock Analysis');

    useEffect(() => {
        const fetchMockAndStats = async () => {
            try {
                // 1. Fetch Mock Details
                const docRef = doc(db, 'mocks', id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    setMock({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.error("No such mock!");
                    setLoading(false);
                    return;
                }

                // 2. Fetch Mock Study Sessions (Last 30 days for stats)
                // We'll filter clientside for "this week"
                const thirtyDaysAgo = new Date();
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

                const qSessions = query(
                    collection(db, 'study_sessions'),
                    where('subject', '==', 'Mock'),
                    where('date', '>=', dateStr),
                    orderBy('date', 'desc')
                );

                // Note: Index might be needed for Subject + Date + OrderBy. 
                // If it fails, we fall back to client sorting or just simple filtering.
                // For now, let's try simple query without complex ordering if index missing, 
                // but usually single field range or equality is fine. 
                // Subject == Mock AND Date >= X is a composite query.

                const sessionSnap = await getDocs(qSessions);
                const sessions = sessionSnap.docs.map(d => d.data());

                setMockStats(processMockStats(sessions));

            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMockAndStats();
    }, [id]);

    const [mockStats, setMockStats] = useState(null);

    const processMockStats = (sessions) => {
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const sevenDaysStr = sevenDaysAgo.toISOString().split('T')[0];

        const thisWeekSessions = sessions.filter(s => s.date >= sevenDaysStr);
        const totalWeekMin = thisWeekSessions.reduce((acc, s) => acc + (s.duration_min || 0), 0);

        // Calculate total study time (approximate, assuming we fetched enough or fetching separately)
        // Actually, user wants "If time spent on mock is < 20% of total this week".
        // To do this accurately we need TOTAL study time. 
        // For now, we will just use a fixed threshold or a specialized message based on raw minutes 
        // since fetching ALL sessions might be heavy here. 
        // User said: "Data source: study_sessions where subject = 'Mock'". 
        // So we might strictly only have mock data. 
        // Let's implement logic based on Mock Time thresholds for now (e.g. < 60 mins week is low).

        // Or we can assume a "Total Study Goal" of say 1200 mins/week (~3h/day)
        const totalGoal = 1200;
        const mockRatio = (totalWeekMin / totalGoal) * 100;

        let message = { type: 'neutral', text: "Keep reviewing your mocks regularly." };
        if (thisWeekSessions.length > 0) {
            if (mockRatio < 10) { // < 2 hrs approx
                message = { type: 'warning', text: "Your mock review time is low. Reviewing mistakes improves rank faster than new questions." };
            } else if (mockRatio > 25) { // > 5 hrs approx
                message = { type: 'success', text: "Great focus on mock review — perfect for consistency." };
            }
        }

        return {
            weekMin: totalWeekMin,
            sessionCount: thisWeekSessions.length,
            avgSession: thisWeekSessions.length ? Math.round(totalWeekMin / thisWeekSessions.length) : 0,
            message,
            recentDays: thisWeekSessions.length // Days with study
        };
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div></div>;
    if (!mock) return <div className="text-center py-20 text-slate-400">Mock not found.</div>;

    // --- Prepare Data ---

    // 1. Chart Data (Subject Scores)
    const subjects = [
        { name: 'Quant', score: mock.qa_score, color: '#3b82f6' },
        { name: 'Reasoning', score: mock.reasoning_score, color: '#8b5cf6' },
        { name: 'English', score: mock.english_score, color: '#10b981' },
        { name: 'GK', score: mock.gk_score, color: '#f59e0b' }
    ];

    // Filter out undefined scores for chart, but keep structure
    const chartData = subjects.map(s => ({
        name: s.name,
        score: s.score !== undefined && s.score !== '' ? Number(s.score) : 0,
        color: s.color
    }));

    // 2. Best/Weakest Logic (ignoring 0/empty if possible, or just raw comparision)
    // We filter only subjects that have actual scores
    const validScores = chartData.filter(s => s.score > 0);
    let bestSubject = null;
    let weakestSubject = null;

    if (validScores.length > 0) {
        // Sort descending
        const sorted = [...validScores].sort((a, b) => b.score - a.score);
        bestSubject = sorted[0];
        weakestSubject = sorted[sorted.length - 1];
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Header / Nav */}
            <div className="flex items-start gap-4 mb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors mt-1"
                >
                    <ArrowLeft size={24} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-white">{mock.mock_name}</h1>
                    <div className="flex items-center gap-3 text-slate-400 mt-1 text-sm">
                        <span>{mock.date}</span>
                        {mock.platform && <span>• {mock.platform}</span>}
                        {mock.tier && <span className="px-2 py-0.5 bg-slate-800 rounded text-xs border border-slate-700">{mock.tier}</span>}
                    </div>
                </div>
            </div>

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={<Award className="text-yellow-400" />}
                    label="Score"
                    value={<>{mock.score || 0} <span className="text-sm text-slate-500 font-normal">/ {mock.max_marks}</span></>}
                />
                <StatCard
                    icon={<Target className="text-blue-400" />}
                    label="Accuracy"
                    value={mock.accuracy ? `${Number(mock.accuracy).toFixed(1)}%` : '--'}
                />
                <StatCard
                    icon={<Clock className="text-purple-400" />}
                    label="Time Taken"
                    value={mock.time_taken_min ? `${mock.time_taken_min} min` : '--'}
                />
                <StatCard
                    icon={<BarChart2 className="text-emerald-400" />}
                    label="Percentile"
                    // Assuming percentile isn't stored, relying on existing fields. 
                    // If percent_score exists, use that, else hide or show something else.
                    value={mock.percent_score ? `${Number(mock.percent_score).toFixed(1)}%` : '--'}
                    subLabel="Percentage"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left: Chart & Breakdown */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <h3 className="text-lg font-semibold text-white mb-6">Subject Performance</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} opacity={0.5} />
                                    <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} />
                                    <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} width={80} />
                                    <RechartsTooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={32}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Best / Weakest Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-emerald-500/20">
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="text-sm font-medium text-slate-400">Best Subject</h4>
                                <CheckCircle2 size={18} className="text-emerald-400" />
                            </div>
                            <div className="text-xl font-bold text-white">
                                {bestSubject ? bestSubject.name : 'N/A'}
                            </div>
                            <div className="text-sm text-emerald-400 mt-1">
                                {bestSubject ? `${bestSubject.score} marks` : 'No data'}
                            </div>
                        </Card>

                        <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-red-500/20">
                            <div className="flex items-start justify-between mb-2">
                                <h4 className="text-sm font-medium text-slate-400">Needs Work</h4>
                                <AlertCircle size={18} className="text-red-400" />
                            </div>
                            <div className="text-xl font-bold text-white">
                                {weakestSubject ? weakestSubject.name : 'N/A'}
                            </div>
                            <div className="text-sm text-red-400 mt-1">
                                {weakestSubject ? `${weakestSubject.score} marks` : 'No data'}
                            </div>
                        </Card>
                    </div>

                    {/* Notes Section */}
                    <Card>
                        <div className="flex items-center gap-2 mb-4">
                            <FileText size={20} className="text-slate-400" />
                            <h3 className="text-lg font-semibold text-white">Your Notes</h3>
                        </div>
                        <div className="bg-slate-950/50 p-4 rounded-lg border border-slate-800 min-h-[100px] text-slate-300 text-sm whitespace-pre-wrap">
                            {mock.notes || "No notes added for this mock."}
                        </div>
                    </Card>
                </div>

                {/* Right: Detailed Stats */}
                <div className="space-y-6">
                    <Card title="Analysis Stats">
                        <div className="space-y-4">
                            <StatRow label="Correct Answers" value={mock.correct_total ?? '--'} color="text-green-400" />
                            <StatRow label="Wrong Answers" value={mock.wrong_total ?? '--'} color="text-red-400" />
                            <StatRow label="Unattempted" value={
                                (mock.attempts_total !== undefined && (mock.correct_total !== undefined || mock.wrong_total !== undefined))
                                    ? (mock.attempts_total - ((mock.correct_total || 0) + (mock.wrong_total || 0))) // Logic check: attempts usually = correct + wrong. Unattempted is usually total Qs - attempts. We don't have total Qs. 
                                    // Actually, let's just show Total Attempts + Negative marks as requested.
                                    : null
                            } skip />

                            <StatRow label="Total Attempts" value={mock.attempts_total ?? '--'} color="text-blue-400" />
                            <StatRow label="Negative Marks" value={mock.negative_marks ? `-${mock.negative_marks}` : '--'} color="text-red-400" />
                        </div>
                    </Card>

                    {/* Subject Table (Raw) */}
                    <Card className="p-0 overflow-hidden">
                        <div className="p-4 border-b border-slate-800 bg-slate-800/50">
                            <h3 className="font-semibold text-white">Score Breakdown</h3>
                        </div>
                        <div className="divide-y divide-slate-800">
                            {subjects.map(s => (
                                <div key={s.name} className="flex justify-between items-center p-3 text-sm hover:bg-slate-800/30">
                                    <span className="text-slate-300">{s.name}</span>
                                    <span className="font-mono font-medium text-white">{s.score ?? '-'}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Bottom Row: Overall Mock Focus (New Integration) */}
            {mockStats && (
                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 1. Motivational Card */}
                    <Card className={`md:col-span-2 border-l-4 ${mockStats.message.type === 'warning' ? 'border-l-amber-500' : mockStats.message.type === 'success' ? 'border-l-emerald-500' : 'border-l-blue-500'}`}>
                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-full ${mockStats.message.type === 'warning' ? 'bg-amber-500/10 text-amber-500' : mockStats.message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                <Zap size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Mock Focus Insight</h3>
                                <p className="text-slate-300 mb-4">{mockStats.message.text}</p>

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>Weekly Mock Review: {mockStats.weekMin} min</span>
                                        <span>Goal: ~300 min</span>
                                    </div>
                                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${mockStats.message.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`}
                                            style={{ width: `${Math.min((mockStats.weekMin / 300) * 100, 100)}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* 2. Focus Metrics */}
                    <Card>
                        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Calendar size={14} /> Review Habits
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-300">This Week</span>
                                <span className="font-bold text-white">{mockStats.weekMin} min</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-300">Sessions</span>
                                <span className="font-bold text-white">{mockStats.sessionCount}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-slate-300">Avg. Duration</span>
                                <span className="font-bold text-white">{mockStats.avgSession} min</span>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>

    );
}

function StatCard({ icon, label, value, subLabel }) {
    return (
        <Card className="flex items-center gap-4 p-5">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                {icon}
            </div>
            <div>
                <div className="text-xs text-slate-400 font-medium uppercase tracking-wider">{label}</div>
                <div className="text-2xl font-bold text-white tracking-tight">{value}</div>
                {subLabel && <div className="text-xs text-slate-500">{subLabel}</div>}
            </div>
        </Card>
    );
}

function StatRow({ label, value, color, skip }) {
    if (skip) return null;
    return (
        <div className="flex justify-between items-center p-3 bg-slate-900/40 rounded-lg">
            <span className="text-slate-400 text-sm">{label}</span>
            <span className={`font-bold font-mono ${color || 'text-white'}`}>{value}</span>
        </div>
    );
}
