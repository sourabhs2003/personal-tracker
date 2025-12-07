import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Card } from '../components/ui/Card';
import usePageTitle from '../hooks/usePageTitle';
import {
    Clock, Target, Award, ArrowLeft, BarChart2,
    CheckCircle2, XCircle, AlertCircle, FileText
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
        const fetchMock = async () => {
            try {
                const docRef = doc(db, 'mocks', id);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setMock({ id: docSnap.id, ...docSnap.data() });
                } else {
                    console.error("No such mock!");
                }
            } catch (error) {
                console.error("Error fetching mock:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMock();
    }, [id]);

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
