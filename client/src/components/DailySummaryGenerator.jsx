import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { Card } from './ui/Card';
import { Copy, RefreshCw, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DailySummaryGenerator() {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);

    const generateDailySummary = async () => {
        setLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const q = query(
                collection(db, 'study_sessions'),
                where('date', '==', today)
            );

            const querySnapshot = await getDocs(q);
            const sessions = querySnapshot.docs.map(doc => doc.data());

            if (sessions.length === 0) {
                setSummary("No study sessions logged today.");
                setLoading(false);
                return;
            }

            // Sort by start time
            sessions.sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));

            let totalTime = 0;
            let totalQuestions = 0;
            let notesList = [];

            let text = `DATE: ${today}\n\nSESSIONS:\n`;

            sessions.forEach(session => {
                const duration = parseInt(session.duration_min) || 0;
                const questions = parseInt(session.questions_solved) || 0;
                totalTime += duration;
                totalQuestions += questions;

                // Format: 06:30–07:30 | Quant | Percentage | Practice | 25 questions
                const timeRange = `${session.start_time || '?'}–${session.end_time || '?'}`;
                const subject = session.subject || 'Unknown';
                const chapter = session.chapter || '-';
                const source = session.source || '-';
                const qText = questions > 0 ? `${questions} questions` : '';

                // Join parts, filtering out empty strings
                const parts = [timeRange, subject, chapter, source, qText].filter(p => p && p !== '-');
                text += `- ${parts.join(' | ')}\n`;

                if (session.notes) {
                    notesList.push(session.notes);
                }
            });

            text += `\nTOTAL TIME: ${totalTime} min\n`;
            text += `TOTAL QUESTIONS: ${totalQuestions}\n`;

            if (notesList.length > 0) {
                text += `\nNOTES:\n`;
                notesList.forEach(note => {
                    text += `- ${note}\n`;
                });
            }

            setSummary(text);
            toast.success("Daily summary generated!");

        } catch (error) {
            console.error("Error generating daily summary:", error);
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

    // Auto-generate on mount (optional, per requirements "Auto-generate daily summary on load (optional)")
    // Let's leave it as manual trigger for now to avoid unnecessary reads, or user can click it.
    // Actually user requirement said "Auto-generate daily summary on load (optional)". 
    // I'll make it load on mount for better UX.
    useEffect(() => {
        generateDailySummary();
    }, []);

    return (
        <Card className="flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
                <div className="flex items-center gap-2">
                    <FileText className="text-blue-400" size={20} />
                    <h3 className="text-lg font-semibold text-white">Daily Summary</h3>
                </div>
                <button
                    onClick={generateDailySummary}
                    disabled={loading}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white disabled:opacity-50"
                    title="Regenerate Summary"
                >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            <textarea
                className="w-full h-64 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm font-mono text-slate-300 focus:outline-none focus:border-blue-500 resize-none"
                value={summary}
                readOnly
                placeholder="Summary will appear here..."
            />

            <button
                onClick={copyToClipboard}
                disabled={!summary || summary === "No study sessions logged today."}
                className="flex items-center justify-center gap-2 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <Copy size={18} />
                Copy Summary
            </button>
        </Card>
    );
}
