import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Calendar, CheckCircle, Circle, Trash2, Edit2, X, Save } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function Tasks() {
    const [tasks, setTasks] = useState([]);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        date: new Date().toISOString().split('T')[0],
        subject: '',
        chapter: '',
        category: 'Study',
        description: ''
    });

    useEffect(() => {
        fetchTasks();
    }, [date]);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:5000/api/tasks?date=${date}`);
            setTasks(res.data);
        } catch (err) {
            console.error(err);
            toast.error('Failed to load tasks');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDone = async (task) => {
        const newStatus = !task.is_done;
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, is_done: newStatus } : t));

        try {
            await axios.put(`http://localhost:5000/api/tasks/${task.id}`, { ...task, is_done: newStatus });
        } catch (err) {
            console.error(err);
            toast.error('Failed to update task');
            fetchTasks(); // Revert on error
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure?')) return;
        try {
            await axios.delete(`http://localhost:5000/api/tasks/${id}`);
            setTasks(prev => prev.filter(t => t.id !== id));
            toast.success('Task deleted');
        } catch (err) {
            console.error(err);
            toast.error('Failed to delete task');
        }
    };

    const openModal = (task = null) => {
        if (task) {
            setEditingTask(task);
            setFormData({
                title: task.title,
                date: task.date,
                subject: task.subject || '',
                chapter: task.chapter || '',
                category: task.category,
                description: task.description || ''
            });
        } else {
            setEditingTask(null);
            setFormData({
                title: '',
                date: date,
                subject: '',
                chapter: '',
                category: 'Study',
                description: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingTask) {
                await axios.put(`http://localhost:5000/api/tasks/${editingTask.id}`, {
                    ...formData,
                    is_done: editingTask.is_done
                });
                toast.success('Task updated');
            } else {
                await axios.post('http://localhost:5000/api/tasks', formData);
                toast.success('Task created');
            }
            setIsModalOpen(false);
            fetchTasks();
        } catch (err) {
            console.error(err);
            toast.error('Failed to save task');
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">Today's Tasks</h1>
                    <p className="text-slate-400 mt-1">Stay focused and track your daily goals</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Calendar size={16} className="absolute left-3 top-2.5 text-slate-400" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                    </div>
                    <Button onClick={() => openModal()}>
                        <Plus size={18} className="mr-2" /> Add Task
                    </Button>
                </div>
            </div>

            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading tasks...</div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl">
                        <p>No tasks found for this date.</p>
                        <button onClick={() => openModal()} className="text-blue-400 hover:underline mt-2 text-sm">Create one now</button>
                    </div>
                ) : (
                    tasks.map(task => (
                        <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={clsx(
                                "group bg-slate-900/50 border rounded-xl p-4 flex items-start gap-4 transition-all hover:bg-slate-800/50",
                                task.is_done ? "border-slate-800 opacity-60" : "border-slate-700"
                            )}
                        >
                            <button
                                onClick={() => handleToggleDone(task)}
                                className={clsx(
                                    "mt-1 flex-shrink-0 transition-colors",
                                    task.is_done ? "text-green-500" : "text-slate-500 hover:text-blue-400"
                                )}
                            >
                                {task.is_done ? <CheckCircle size={24} /> : <Circle size={24} />}
                            </button>

                            <div className="flex-1 min-w-0" onClick={() => openModal(task)}>
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className={clsx("font-medium truncate", task.is_done && "line-through text-slate-500")}>
                                        {task.title}
                                    </h3>
                                    <span className={clsx("text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider",
                                        task.category === 'Study' ? "border-blue-500/30 text-blue-400 bg-blue-500/10" :
                                            task.category === 'Mock' ? "border-purple-500/30 text-purple-400 bg-purple-500/10" :
                                                "border-slate-500/30 text-slate-400 bg-slate-500/10"
                                    )}>
                                        {task.category}
                                    </span>
                                </div>

                                {(task.subject || task.chapter) && (
                                    <p className="text-xs text-slate-400 mb-1">
                                        {task.subject && <span className="font-semibold">{task.subject}</span>}
                                        {task.subject && task.chapter && <span className="mx-1">•</span>}
                                        {task.chapter}
                                    </p>
                                )}

                                {task.description && (
                                    <p className="text-sm text-slate-500 line-clamp-2">{task.description}</p>
                                )}
                            </div>

                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openModal(task)} className="p-2 text-slate-500 hover:text-blue-400 hover:bg-slate-800 rounded-lg">
                                    <Edit2 size={16} />
                                </button>
                                <button onClick={() => handleDelete(task.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded-lg">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* TASK MODAL */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">{editingTask ? 'Edit Task' : 'Add New Task'}</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    label="Title"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="e.g. Complete Geometry Revision"
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        type="date"
                                        label="Date"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                        required
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Category</label>
                                        <select
                                            value={formData.category}
                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                                        >
                                            {['Study', 'Mock', 'Revision', 'Other'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-1">Subject (Optional)</label>
                                        <select
                                            value={formData.subject}
                                            onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200"
                                        >
                                            <option value="">None</option>
                                            {['Quant', 'Reasoning', 'English', 'GK'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <Input
                                        label="Chapter (Optional)"
                                        value={formData.chapter}
                                        onChange={e => setFormData({ ...formData, chapter: e.target.value })}
                                        placeholder="e.g. Number System"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-400 mb-1">Description (Optional)</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <Button type="button" onClick={() => setIsModalOpen(false)} variant="secondary" className="flex-1">
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1">
                                        {editingTask ? 'Save Changes' : 'Create Task'}
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
