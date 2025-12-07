import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Card } from './ui/Card';
import { Copy, RefreshCw, CalendarRange } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WeeklySummaryGenerator() {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);

    const generateWeeklySummary = async () => {
        setLoading(true);
        try {
            const today = new Date();
            const sevenDaysAgo = new Date(today);
            sevenDaysAgo.setDate(today.getDate() - 6); // inclusive of today + 6 days back = 7 days

            const todayStr = today.toISOString().split('T')[0];
            const startStr = sevenDaysAgo.toISOString().split('T')[0];

            const q = query(
                collection(db, 'study_sessions'),
                where('date', '>=', startStr),
                where('date', '<=', todayStr)
            );

            const querySnapshot = await getDocs(q);
            const sessions = querySnapshot.docs.map(doc => doc.data());

            if (sessions.length === 0) {
                setSummary("No study sessions logged this week.");
                setLoading(false);
                return;
            }

            // Aggregation
            let totalTime = 0;
            const subjectMap = {};
            const dateMap = {};

            sessions.forEach(session => {
                const duration = parseInt(session.duration_min) || 0;
                totalTime += duration;

                // Subject breakdown
                const subj = session.subject || 'Unknown';
                subjectMap[subj] = (subjectMap[subj] || 0) + duration;

                // Daily breakdown
                const date = session.date;
                if (!dateMap[date]) {
                    dateMap[date] = { minutes: 0, subjects: new Set() };
                }
                dateMap[date].minutes += duration;
                dateMap[date].subjects.add(subj);
            });

            const totalSessions = sessions.length;
            const avgTime = Math.round(totalTime / 7);

            // Formatting
            let text = `WEEK: ${startStr} -> ${todayStr}\n\n`;
            text += `TOTAL SESSIONS: ${totalSessions}\n`;
            text += `TOTAL TIME: ${totalTime} min\n`;
            text += `AVERAGE/DAY: ${avgTime} min\n\n`;

            text += `BREAKDOWN BY SUBJECT:\n`;
            Object.entries(subjectMap)
                .sort(([, a], [, b]) => b - a)
                .forEach(([subj, min]) => {
                    text += `- ${subj}: ${min} min\n`;
                });

            text += `\nDAILY DETAIL:\n`;
            Object.keys(dateMap).sort().forEach(date => {
                const data = dateMap[date];
                const subjects = Array.from(data.subjects).join(', ');
                const dateObj = new Date(date);
                const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }).toUpperCase();
                text += `- ${dateLabel}: ${data.minutes} min (${subjects})\n`;
            });

            setSummary(text);
            toast.success("Weekly summary generated!");

        } catch (error) {
            console.error("Error generating weekly summary:", error);
            toast.error("Failed to generate summary.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!summary) return;
        navigator.clipboard.writeText(summary);
        toast.success("Summary copied!");
    };

    return (
        <Card className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
                <div className="flex items-center gap-2">
                    <CalendarRange className="text-purple-400" size={20} />
                    <h3 className="text-lg font-semibold text-white">Weekly Summary</h3>
                </div>
                <button
                    onClick={generateWeeklySummary}
                    disabled={loading}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white disabled:opacity-50"
                    title="Generate Summary"
                >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            <textarea
                className="w-full h-64 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm font-mono text-slate-300 focus:outline-none focus:border-purple-500 resize-none"
                value={summary}
                readOnly
                placeholder="Click generate to see weekly summary..."
            />

            <button
                onClick={copyToClipboard}
                disabled={!summary || summary === "No study sessions logged this week."}
                className="flex items-center justify-center gap-2 w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Copy size={18} />
                Copy Summary
            </button>
        </Card>
    );
}
