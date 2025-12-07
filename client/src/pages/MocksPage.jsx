import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigate, Link } from 'react-router-dom';
import usePageTitle from '../hooks/usePageTitle';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Plus, Search, Trash2, ChevronRight, BarChart2 } from 'lucide-react';
import { Input } from '../components/ui/Input';
import { toast } from 'react-hot-toast';

export default function MocksPage() {
    usePageTitle('Mocks');
    const navigate = useNavigate();
    const [mocks, setMocks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchMocks();
    }, []);

    const fetchMocks = async () => {
        try {
            const q = query(collection(db, 'mocks'), orderBy('date', 'desc'));
            const snapshot = await getDocs(q);
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setMocks(data);
        } catch (error) {
            console.error("Error loading mocks:", error);
            toast.error("Failed to load mocks");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e, id) => {
        e.stopPropagation(); // Prevent row click
        if (!window.confirm("Are you sure you want to delete this mock? data will be lost.")) return;

        try {
            await deleteDoc(doc(db, 'mocks', id));
            setMocks(prev => prev.filter(m => m.id !== id));
            toast.success("Mock deleted");
        } catch (error) {
            console.error("Error deleting mock:", error);
            toast.error("Failed to delete");
        }
    };

    const filteredMocks = mocks.filter(m =>
        m.mock_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.platform?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white">All Mocks</h1>
                    <p className="text-slate-400 mt-2">Track your progress and analyze performance.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <Button onClick={() => navigate('/log-mock')}>
                        <Plus size={18} className="mr-2" /> Log New Mock
                    </Button>
                </div>
            </div>

            <div className="relative max-w-md">
                <Search className="absolute left-3 top-2.5 text-slate-500" size={18} />
                <Input
                    placeholder="Search mocks..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div></div>
            ) : (
                <div className="grid gap-4">
                    {filteredMocks.length === 0 ? (
                        <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-xl border border-slate-800">
                            <p>No mocks found.</p>
                        </div>
                    ) : (
                        filteredMocks.map(mock => (
                            <div
                                key={mock.id}
                                onClick={() => navigate(`/mocks/${mock.id}`)}
                                className="group bg-slate-800 border border-slate-700 rounded-xl p-4 hover:border-blue-500/50 hover:bg-slate-800/80 transition-all cursor-pointer relative"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold text-white text-lg group-hover:text-blue-400 transition-colors">
                                                {mock.mock_name}
                                            </h3>
                                            {mock.tier && <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-slate-700 rounded text-slate-300">{mock.tier}</span>}
                                        </div>
                                        <div className="text-sm text-slate-400 mt-1 flex items-center gap-3">
                                            <span>{mock.date}</span>
                                            {mock.platform && <span>• {mock.platform}</span>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6 md:gap-8">
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-white">{mock.score}</div>
                                            <div className="text-xs text-slate-500 uppercase">Score</div>
                                        </div>

                                        <div className="text-right hidden sm:block">
                                            <div className={`text-xl font-bold ${mock.accuracy >= 90 ? 'text-green-400' : mock.accuracy >= 80 ? 'text-blue-400' : 'text-slate-400'}`}>
                                                {mock.accuracy ? Math.round(mock.accuracy) + '%' : '--'}
                                            </div>
                                            <div className="text-xs text-slate-500 uppercase">Accuracy</div>
                                        </div>

                                        <button
                                            onClick={(e) => handleDelete(e, mock.id)}
                                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors z-10"
                                            title="Delete Mock"
                                        >
                                            <Trash2 size={18} />
                                        </button>

                                        <ChevronRight className="text-slate-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
