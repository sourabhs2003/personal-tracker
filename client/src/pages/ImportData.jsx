import { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImportData() {
    return (
        <div className="max-w-5xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Import Data</h1>
                <p className="text-slate-400 mt-1">Bulk upload your previous sessions and marks</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ImportZone
                    title="Import Sessions"
                    endpoint="study-sessions"
                    desc="Upload your study history CSV"
                    headers={['date', 'start_time', 'end_time', 'subject', 'chapter']}
                />
                <ImportZone
                    title="Import Mocks"
                    endpoint="mocks"
                    desc="Upload your mock test results CSV"
                    headers={['date', 'mock_name', 'score', 'attempts_total', 'correct_total']}
                />
            </div>
        </div>
    );
}

function ImportZone({ title, endpoint, desc, headers }) {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('idle'); // idle, uploading, success, error
    const [msg, setMsg] = useState('');
    const inputRef = useRef(null);

    const handleFile = (selectedFile) => {
        if (selectedFile && selectedFile.type === 'text/csv') {
            setFile(selectedFile);
            setStatus('idle');
            setMsg('');
        } else {
            setMsg('Please upload a valid CSV file.');
            setStatus('error');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;
        setStatus('uploading');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axios.post(`http://localhost:5000/api/import/${endpoint}`, formData);
            setStatus('success');
            setMsg(`Successfully imported ${res.data.imported} records.`);
        } catch (err) {
            setStatus('error');
            setMsg('Failed to upload. Check console or file format.');
            console.error(err);
        }
    };

    return (
        <Card className="flex flex-col h-full">
            <div className="mb-4">
                <h3 className="text-xl font-semibold text-white">{title}</h3>
                <p className="text-sm text-slate-400">{desc}</p>
            </div>

            <div
                className={clsx(
                    "flex-1 border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center p-8 text-center cursor-pointer min-h-[200px]",
                    status === 'success' ? "border-green-500/50 bg-green-500/5" :
                        status === 'error' ? "border-red-500/50 bg-red-500/5" :
                            file ? "border-blue-500/50 bg-blue-500/5" : "border-slate-700 hover:border-slate-500 bg-slate-900/50"
                )}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    type="file"
                    hidden
                    accept=".csv"
                    ref={inputRef}
                    onChange={(e) => handleFile(e.target.files[0])}
                />

                <AnimatePresence mode="wait">
                    {status === 'success' ? (
                        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-green-400">
                            <CheckCircle size={48} className="mx-auto mb-2" />
                            <p className="font-medium">{msg}</p>
                            <button onClick={(e) => { e.stopPropagation(); setFile(null); setStatus('idle'); }} className="text-xs underline mt-2">Import another</button>
                        </motion.div>
                    ) : status === 'uploading' ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-blue-400">
                            <RefreshCw size={48} className="mx-auto mb-2 animate-spin" />
                            <p>Processing CSV...</p>
                        </motion.div>
                    ) : file ? (
                        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="text-slate-200">
                            <FileText size={48} className="mx-auto mb-2 text-blue-400" />
                            <p className="font-medium break-all">{file.name}</p>
                            <p className="text-xs text-slate-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                        </motion.div>
                    ) : (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-slate-500">
                            <Upload size={48} className="mx-auto mb-2 opacity-50" />
                            <p className="font-medium text-slate-400">Drop CSV file here</p>
                            <p className="text-xs mt-1">or click to browse</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {status === 'error' && (
                <div className="mt-4 p-3 bg-red-500/10 text-red-400 rounded-lg text-sm flex items-center gap-2">
                    <AlertCircle size={16} /> {msg}
                </div>
            )}

            <div className="mt-6 space-y-4">
                <Button
                    onClick={handleUpload}
                    disabled={!file || status === 'uploading' || status === 'success'}
                    className="w-full"
                >
                    {status === 'uploading' ? 'Importing...' : 'Start Import'}
                </Button>

                <div className="bg-slate-900 rounded-lg p-3 text-xs text-slate-500">
                    <span className="font-semibold block mb-1 text-slate-400">Expected Columns:</span>
                    <code className="break-words">{headers.join(', ')}, ...</code>
                </div>
            </div>
        </Card>
    );
}
