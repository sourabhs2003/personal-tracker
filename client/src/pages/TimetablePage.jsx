import React, { useState, useEffect } from 'react';
import { collection, query, onSnapshot, doc, deleteDoc, setDoc, addDoc, serverTimestamp, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import usePageTitle from '../hooks/usePageTitle';
import { Plus, Trash2, Edit2, X, Clock, BookOpen, AlertCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Card } from '../components/ui/Card';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function TimetablePage() {
    usePageTitle('Timetable');
    const [blocks, setBlocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [chapters, setChapters] = useState([]);
    const [subjects, setSubjects] = useState([]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState(null);
    const [selectedDay, setSelectedDay] = useState('Monday');

    // Form State
    const [formData, setFormData] = useState({
        day: 'Monday',
        start_time: '08:00',
        end_time: '09:00',
        subject: '',
        chapter: '',
        notes: '',
        priority: 'Normal'
    });

    // Fetch Timetable Blocks
    useEffect(() => {
        const q = query(collection(db, 'timetable'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const loadedBlocks = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setBlocks(loadedBlocks);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching timetable:", error);
            toast.error("Failed to load timetable");
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // Fetch Chapters/Subjects
    useEffect(() => {
        const fetchChapters = async () => {
            try {
                const snap = await getDocs(collection(db, 'chapters'));
                const loadedChapters = snap.docs.map(d => d.data());
                setChapters(loadedChapters);
                const uniqueSubjects = [...new Set(loadedChapters.map(c => c.subject))].filter(Boolean).sort();
                setSubjects(uniqueSubjects);
            } catch (err) {
                console.error("Error fetching chapters:", err);
            }
        };
        fetchChapters();
    }, []);

    const resetForm = () => {
        setFormData({
            day: selectedDay,
            start_time: '08:00',
            end_time: '09:00',
            subject: '',
            chapter: '',
            notes: '',
            priority: 'Normal'
        });
        setEditingBlock(null);
    };

    const openAddModal = (day) => {
        resetForm();
        setFormData(prev => ({ ...prev, day }));
        setSelectedDay(day);
        setIsModalOpen(true);
    };

    const openEditModal = (block) => {
        setEditingBlock(block);
        setFormData({
            day: block.day,
            start_time: block.start_time,
            end_time: block.end_time,
            subject: block.subject,
            chapter: block.chapter || '',
            notes: block.notes || '',
            priority: block.priority || 'Normal'
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this block?")) return;
        try {
            await deleteDoc(doc(db, 'timetable', id));
            toast.success("Block deleted");
        } catch (err) {
            console.error("Error deleting block:", err);
            toast.error("Failed to delete");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const dataToSave = {
                ...formData,
                updated_at: serverTimestamp()
            };

            if (editingBlock) {
                await setDoc(doc(db, 'timetable', editingBlock.id), dataToSave, { merge: true });
                toast.success("Block updated");
            } else {
                dataToSave.created_at = serverTimestamp();
                await addDoc(collection(db, 'timetable'), dataToSave);
                toast.success("Block added");
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error("Error saving block:", err);
            toast.error("Failed to save");
        }
    };

    const filteredChapters = chapters.filter(c => c.subject === formData.subject);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white">Study Timetable</h1>
                    <p className="text-slate-400 mt-2">Plan your weekly schedule.</p>
                </div>
                <button
                    onClick={() => openAddModal(DAYS[0])}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors"
                >
                    <Plus size={20} /> Add Block
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div></div>
            ) : (
                <div className="flex overflow-x-auto pb-6 gap-6 snap-x">
                    {DAYS.map(day => (
                        <div key={day} className="flex-none w-80 snap-start">
                            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden flex flex-col h-full min-h-[500px]">
                                <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center sticky top-0 z-10">
                                    <h3 className="font-bold text-slate-200 uppercase tracking-wider text-sm">{day}</h3>
                                    <button onClick={() => openAddModal(day)} className="text-slate-500 hover:text-blue-400 transition-colors">
                                        <Plus size={18} />
                                    </button>
                                </div>
                                <div className="p-3 space-y-3 flex-1 bg-slate-950/30">
                                    {blocks
                                        .filter(b => b.day === day)
                                        .sort((a, b) => a.start_time.localeCompare(b.start_time))
                                        .map(block => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                key={block.id}
                                                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/50 rounded-lg p-3 group relative shadow-sm"
                                            >
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">
                                                        <Clock size={12} />
                                                        {block.start_time} - {block.end_time}
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => openEditModal(block)} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"><Edit2 size={14} /></button>
                                                        <button onClick={() => handleDelete(block.id)} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-red-400"><Trash2 size={14} /></button>
                                                    </div>
                                                </div>
                                                <h4 className="font-semibold text-slate-200 mb-1">{block.subject}</h4>
                                                {block.chapter && (
                                                    <div className="text-xs text-slate-400 flex items-center gap-1.5 mb-1">
                                                        <BookOpen size={12} /> {block.chapter}
                                                    </div>
                                                )}
                                                {block.notes && (
                                                    <div className="text-xs text-slate-500 mt-2 p-2 bg-slate-900/50 rounded border border-slate-800/50 italic">
                                                        "{block.notes}"
                                                    </div>
                                                )}
                                            </motion.div>
                                        ))}
                                    {blocks.filter(b => b.day === day).length === 0 && (
                                        <div className="text-center py-10 opacity-30 text-slate-500 text-sm italic">
                                            No study blocks
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl overflow-hidden"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900">
                                <h2 className="text-xl font-bold text-white">{editingBlock ? 'Edit Block' : 'Add Block'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X size={24} /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Day</label>
                                    <select
                                        value={formData.day}
                                        onChange={e => setFormData({ ...formData, day: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    >
                                        {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            value={formData.start_time}
                                            onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">End Time</label>
                                        <input
                                            type="time"
                                            value={formData.end_time}
                                            onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                            required
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Subject</label>
                                    <select
                                        value={formData.subject}
                                        onChange={e => setFormData({ ...formData, subject: e.target.value, chapter: '' })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        required
                                    >
                                        <option value="">Select Subject</option>
                                        {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                                        <option value="Break">Break</option>
                                        <option value="Revision">Revision</option>
                                    </select>
                                </div>

                                {formData.subject && formData.subject !== 'Break' && (
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Chapter (Optional)</label>
                                        <select
                                            value={formData.chapter}
                                            onChange={e => setFormData({ ...formData, chapter: e.target.value })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        >
                                            <option value="">Select Chapter</option>
                                            {filteredChapters.map(c => (
                                                <option key={c.id} value={c.chapter_name}>{c.chapter_name}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Notes</label>
                                    <textarea
                                        value={formData.notes}
                                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none h-20 resize-none"
                                        placeholder="Specific topics or goals..."
                                    />
                                </div>

                                <div className="pt-4 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                                    >
                                        {editingBlock ? 'Save Changes' : 'Add Block'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
