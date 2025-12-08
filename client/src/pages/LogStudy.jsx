import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Save, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function LogStudy() {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        subject: '',
        chapter: '',
        topic_type: 'Concept',
        source: '',
        questions_solved: '',
        notes: ''
    });

    const [duration, setDuration] = useState(0);
    const [chapters, setChapters] = useState([]);
    const [loading, setLoading] = useState(false);



    // Load chapters when subject changes
    useEffect(() => {
        if (formData.subject) {
            const fetchChapters = async () => {
                try {
                    const q = query(
                        collection(db, 'chapters'),
                        where('subject', '==', formData.subject)
                    );
                    const snap = await getDocs(q);
                    setChapters(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                } catch (err) {
                    console.error(err);
                }
            };
            fetchChapters();
        } else {
            setChapters([]);
        }
    }, [formData.subject]);

    // Auto-calc duration
    useEffect(() => {
        if (formData.start_time && formData.end_time) {
            const start = new Date(`1970-01-01T${formData.start_time}:00`);
            const end = new Date(`1970-01-01T${formData.end_time}:00`);
            let diff = (end - start) / 1000 / 60;
            if (diff < 0) diff += 24 * 60;
            setDuration(Math.round(diff));
        } else {
            setDuration(0);
        }
    }, [formData.start_time, formData.end_time]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePreset = (mins) => {
        const now = new Date();
        // round to nearest 5 mins
        const coeff = 1000 * 60 * 5;
        const roundedStart = new Date(Math.round(now.getTime() / coeff) * coeff);

        const startStr = roundedStart.toTimeString().slice(0, 5);

        const end = new Date(roundedStart.getTime() + mins * 60000);
        const endStr = end.toTimeString().slice(0, 5);

        setFormData(prev => ({
            ...prev,
            start_time: startStr,
            end_time: endStr
        }));
    };

    const setNow = (field) => {
        const now = new Date();
        const timeStr = now.toTimeString().slice(0, 5);
        setFormData(prev => ({ ...prev, [field]: timeStr }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Calc duration for storage
        const start = new Date(`1970-01-01T${formData.start_time}:00`);
        const end = new Date(`1970-01-01T${formData.end_time}:00`);
        let diff = (end - start) / 1000 / 60;
        if (diff < 0) diff += 24 * 60;
        const duration_min = Math.round(diff);

        try {
            await addDoc(collection(db, 'study_sessions'), {
                ...formData,
                duration_min,
                questions_solved: Number(formData.questions_solved) || 0,
                created_at: Timestamp.now(),
                updated_at: Timestamp.now()
            });
            console.log("Study session logged successfully");
            toast.success('Study session logged!');
            setFormData(prev => ({
                ...prev,
                start_time: '',
                end_time: '',
                questions_solved: '',
                notes: ''
            }));
        } catch (err) {
            console.error("Error logging session:", err);
            toast.error('Failed to save session.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white">Log Study Session</h1>
                    <p className="text-slate-400 mt-1">Record your daily learning progress</p>
                </div>
                <div className="hidden md:flex gap-2">
                    <span className="text-sm text-slate-500 py-2">Quick Presets:</span>
                    {[25, 45, 60, 90].map(m => (
                        <button
                            key={m}
                            onClick={() => handlePreset(m)}
                            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-full border border-slate-700 transition-colors"
                        >
                            {m} min
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <Card className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <Input type="date" label="Date" name="date" value={formData.date} onChange={handleChange} required />
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-slate-400">Subject</label>
                            <select
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                required
                            >
                                <option value="">Select Subject</option>
                                {['Quant', 'Reasoning', 'English', 'GK', 'Mock'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 items-end">
                        <div className="relative">
                            <Input type="time" label="Start Time" name="start_time" value={formData.start_time} onChange={handleChange} required />
                            <button type="button" onClick={() => setNow('start_time')} className="absolute right-2 top-[30px] p-1 text-slate-500 hover:text-blue-400 text-xs">NOW</button>
                        </div>
                        <div className="relative">
                            <Input type="time" label="End Time" name="end_time" value={formData.end_time} onChange={handleChange} required />
                            <button type="button" onClick={() => setNow('end_time')} className="absolute right-2 top-[30px] p-1 text-slate-500 hover:text-blue-400 text-xs">NOW</button>
                        </div>
                    </div>

                    {/* Smart Duration Display */}
                    <div className="bg-slate-900/50 rounded-lg p-4 flex items-center justify-between border border-dashed border-slate-800">
                        <div className="flex items-center gap-3 text-slate-400">
                            <Clock size={16} />
                            <span className="text-sm">Calculated Duration</span>
                        </div>
                        <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                            {duration > 0 ? `${Math.floor(duration / 60)}h ${duration % 60}m` : '--'}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-sm font-medium text-slate-400">Chapter</label>
                        <div className="relative">
                            <select
                                name="chapter"
                                value={formData.chapter}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                                required={!formData.subject}
                            >
                                <option value="">Select Chapter</option>
                                {chapters.map(c => <option key={c.id} value={c.chapter_name}>{c.chapter_name}</option>)}
                            </select>
                            <div className="absolute right-4 top-3.5 pointer-events-none text-slate-500">
                                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                        </div>
                        {chapters.length === 0 && formData.subject && (
                            <p className="text-xs text-amber-500 mt-1">No chapters found for {formData.subject}.</p>
                        )}
                    </div>
                </Card>

                {/* Details Side Panel */}
                <div className="space-y-6">
                    <Card className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-3">Session Type</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['Concept', 'Practice', 'Revision', 'Analysis'].map(t => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setFormData(prev => ({ ...prev, topic_type: t }))}
                                        className={`px-3 py-2 text-xs font-medium rounded-lg border transition-all ${formData.topic_type === t
                                            ? 'bg-blue-500/10 border-blue-500/50 text-blue-400'
                                            : 'border-slate-700 text-slate-400 hover:border-slate-600'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <Input
                            type="number"
                            label="Questions Solved"
                            name="questions_solved"
                            value={formData.questions_solved}
                            onChange={handleChange}
                            placeholder="0"
                        />

                        <Input
                            label="Source"
                            name="source"
                            value={formData.source}
                            onChange={handleChange}
                            placeholder="e.g. Blackbook, Class Notes"
                        />
                    </Card>

                    <Card>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Session Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={4}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                            placeholder="What did you learn today?"
                        />
                    </Card>

                    <Button type="submit" isLoading={loading} className="w-full py-3 shadow-lg shadow-blue-900/20">
                        <Save size={18} />
                        Save Session
                    </Button>
                </div>
            </form>
        </div>
    );
}
