import { useState, useEffect } from 'react';
import axios from 'axios';
import { BookOpen, Clock, Activity, Search, Plus, Edit2, Save, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function Chapters() {
    const [chapters, setChapters] = useState([]);
    const [filterSubject, setFilterSubject] = useState('Quant');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedChapter, setSelectedChapter] = useState(null);
    const [details, setDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingChapterId, setEditingChapterId] = useState(null);
    const [newChapter, setNewChapter] = useState({
        subject: 'Quant',
        chapter_name: '',
        target_hours: 10,
        status: 'Not Started',
        notes: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchChapters();
        setSelectedChapter(null); // Reset selection on subject switch
        setDetails(null);
        setNewChapter(prev => ({ ...prev, subject: filterSubject, chapter_name: '', target_hours: 10, status: 'Not Started', notes: '' }));
    }, [filterSubject]);

    const fetchChapters = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/api/chapters?subject=${filterSubject}`);
            const sorted = res.data.sort((a, b) => a.progress_percent - b.progress_percent);
            setChapters(sorted);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load chapters");
        }
    };

    const handleChapterClick = async (chapter) => {
        if (editingChapterId) return; // Prevention
        setSelectedChapter(chapter);
        setLoadingDetails(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/chapters/${chapter.id}/details`);
            setDetails(res.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load details");
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleOpenCreate = () => {
        setEditingChapterId(null);
        setNewChapter({
            subject: filterSubject,
            chapter_name: '',
            target_hours: 10,
            status: 'Not Started',
            notes: ''
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (e, chapter) => {
        e.stopPropagation();
        setEditingChapterId(chapter.id);
        setNewChapter({
            subject: chapter.subject,
            chapter_name: chapter.chapter_name,
            target_hours: chapter.target_hours,
            status: chapter.status,
            notes: chapter.notes || ''
        });
        setIsModalOpen(true);
    };

    const handleSaveChapter = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (editingChapterId) {
                await axios.put(`http://localhost:5000/api/chapters/${editingChapterId}`, newChapter);
                toast.success('Chapter updated');

                // If the updated chapter was selected, update valid details
                if (selectedChapter?.id === editingChapterId) {
                    setSelectedChapter(prev => ({ ...prev, ...newChapter }));
                    const res = await axios.get(`http://localhost:5000/api/chapters/${editingChapterId}/details`);
                    setDetails(res.data);
                }

            } else {
                await axios.post('http://localhost:5000/api/chapters', newChapter);
                toast.success('Chapter added successfully');
            }
            setIsModalOpen(false);
            fetchChapters();
        } catch (err) {
            console.error(err);
            toast.error('Failed to save chapter');
        } finally {
            setIsSaving(false);
        }
    };

    const filteredChapters = chapters.filter(c =>
        c.chapter_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="h-[calc(100vh-8rem)] flex flex-col relative">

            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 flex-shrink-0">
                <div>
                    <h1 className="text-3xl font-bold text-white">Chapters</h1>
                    <p className="text-slate-400 mt-1">Syllabus tracking & analytics</p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Subject Tabs */}
                    <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex">
                        {['Quant', 'Reasoning', 'English', 'GK'].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterSubject(s)}
                                className={clsx(
                                    'px-4 py-1.5 rounded-md text-sm font-medium transition-all',
                                    filterSubject === s ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>

                    <Button onClick={handleOpenCreate} className="px-4 py-2">
                        <Plus size={18} className="mr-2" />
                        Add Chapter
                    </Button>
                </div>
            </div>

            <div className="flex-1 flex gap-6 min-h-0">
                {/* LEFT PANEL: LIST */}
                <div className="w-full lg:w-1/3 flex flex-col gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search chapters..."
                            className="pl-10"
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                        {filteredChapters.length === 0 ? (
                            <div className="text-center py-12 text-slate-500">
                                <p>No chapters found.</p>
                            </div>
                        ) : (
                            filteredChapters.map(ch => (
                                <motion.div
                                    key={ch.id}
                                    layoutId={`chapter-${ch.id}`}
                                    onClick={() => handleChapterClick(ch)}
                                    className={clsx(
                                        'p-4 rounded-xl border cursor-pointer transition-all group relative pr-10',
                                        selectedChapter?.id === ch.id
                                            ? 'bg-blue-900/20 border-blue-500/50 shadow-md'
                                            : 'bg-slate-800/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800'
                                    )}
                                >
                                    <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                        <button
                                            onClick={(e) => handleOpenEdit(e, ch)}
                                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
                                            title="Edit Chapter"
                                        >
                                            <Edit2 size={14} />
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className={clsx("font-medium", selectedChapter?.id === ch.id ? "text-blue-400" : "text-slate-300")}>
                                            {ch.chapter_name}
                                        </h3>
                                        <StatusBadge status={ch.status} />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>{ch.hours_done.toFixed(1)} / {ch.target_hours} hrs</span>
                                            <span>{Math.round(ch.progress_percent)}%</span>
                                        </div>
                                        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                                            <motion.div
                                                className={clsx("h-full rounded-full", getProgressColor(ch.progress_percent))}
                                                initial={{ width: 0 }}
                                                animate={{ width: `${ch.progress_percent}%` }}
                                                transition={{ duration: 0.5 }}
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )))}
                    </div>
                </div>

                {/* RIGHT PANEL: DETAILS */}
                <div className="hidden lg:flex flex-1 flex-col bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden relative">
                    {!selectedChapter ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                            <BookOpen size={48} className="mb-4 opacity-50" />
                            <p>Select a chapter to view details</p>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col h-full">
                            {/* Header */}
                            <div className="p-8 border-b border-slate-800 bg-slate-800/30">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <motion.span
                                            className="text-xs font-semibold text-blue-400 tracking-wider uppercase mb-1 block"
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        >
                                            {selectedChapter.subject} Chapter
                                        </motion.span>
                                        <motion.h2
                                            className="text-3xl font-bold text-white mb-2"
                                            layoutId={`title-${selectedChapter.id}`}
                                        >
                                            {selectedChapter.chapter_name}
                                        </motion.h2>
                                        <div className="flex items-center gap-4 text-sm text-slate-400">
                                            <span className="flex items-center gap-1"><Clock size={14} /> Last studied: {details?.stats.last_studied ? new Date(details.stats.last_studied).toLocaleDateString() : 'Never'}</span>
                                            <span className="flex items-center gap-1"><Activity size={14} /> {details?.stats.sessions_count || 0} Sessions</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => handleOpenEdit(e, selectedChapter)}
                                        className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
                                    >
                                        <Edit2 size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-8">
                                {loadingDetails ? (
                                    <div className="flex items-center justify-center p-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                                    </div>
                                ) : details && (
                                    <>
                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-3 gap-4">
                                            <StatBox label="Total Hours" value={details.stats.total_hours} />
                                            <StatBox label="Sessions" value={details.stats.sessions_count} />
                                            <StatBox label="Avg. Session" value={details.stats.sessions_count > 0 ? (details.stats.total_hours * 60 / details.stats.sessions_count).toFixed(0) + ' min' : '0 min'} />
                                        </div>

                                        {/* Chart */}
                                        <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50">
                                            <h3 className="text-lg font-semibold text-white mb-6">Progress Over Time</h3>
                                            {details.chartData && details.chartData.length > 0 ? (
                                                <div className="h-[250px]">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={details.chartData}>
                                                            <defs>
                                                                <linearGradient id="colorCum" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                                                            <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} tickFormatter={(str) => new Date(str).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} />
                                                            <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                                                            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} itemStyle={{ color: '#fff' }} />
                                                            <Area type="monotone" dataKey="cumulative_mins" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCum)" />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            ) : (
                                                <div className="h-[200px] flex items-center justify-center text-slate-500 border border-dashed border-slate-700 rounded-lg">
                                                    No study sessions logged yet for this chapter.
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ADD / EDIT CHAPTER MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">{editingChapterId ? 'Edit Chapter' : 'Add New Chapter'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSaveChapter} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Subject</label>
                                    <select
                                        value={newChapter.subject}
                                        onChange={e => setNewChapter({ ...newChapter, subject: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                                    >
                                        {['Quant', 'Reasoning', 'English', 'GK'].map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>

                                <Input
                                    label="Chapter Name"
                                    value={newChapter.chapter_name}
                                    onChange={e => setNewChapter({ ...newChapter, chapter_name: e.target.value })}
                                    required
                                    placeholder="e.g. Geometry"
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Target Hours"
                                        type="number"
                                        value={newChapter.target_hours}
                                        onChange={e => setNewChapter({ ...newChapter, target_hours: Number(e.target.value) })}
                                        required
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Status</label>
                                        <select
                                            value={newChapter.status}
                                            onChange={e => setNewChapter({ ...newChapter, status: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                                        >
                                            {['Not Started', 'Learning', 'Revising', 'Strong'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Notes (Optional)</label>
                                    <textarea
                                        value={newChapter.notes}
                                        onChange={e => setNewChapter({ ...newChapter, notes: e.target.value })}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        placeholder="Add any specific goals..."
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <Button type="button" onClick={() => setIsModalOpen(false)} variant="secondary" className="flex-1">
                                        Cancel
                                    </Button>
                                    <Button type="submit" isLoading={isSaving} className="flex-1">
                                        {editingChapterId ? 'Save Changes' : 'Create Chapter'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatusBadge({ status }) {
    const colors = {
        'Strong': 'bg-green-500/10 text-green-400 border-green-500/20',
        'Revising': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        'Learning': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        'Not Started': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };
    return (
        <span className={clsx('px-2 py-0.5 text-[10px] uppercase font-bold tracking-wide rounded border', colors[status] || colors['Not Started'])}>
            {status}
        </span>
    );
}

function getProgressColor(percent) {
    if (percent >= 100) return 'bg-emerald-500';
    if (percent >= 60) return 'bg-blue-500';
    if (percent >= 30) return 'bg-amber-500';
    return 'bg-slate-600';
}

function StatBox({ label, value }) {
    return (
        <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
            <div className="text-sm text-slate-400 mb-1">{label}</div>
            <div className="text-xl font-bold text-white">{value}</div>
        </div>
    );
}
