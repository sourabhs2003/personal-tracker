import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, AlertTriangle, CheckCircle2, TrendingUp, Calculator } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export default function LogMock() {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        mock_name: '',
        platform: '',
        tier: 'Pre',
        max_marks: 200,
        score: '',
        time_taken_min: 60,
        attempts_total: '',
        qa_score: '',
        reasoning_score: '',
        english_score: '',
        gk_score: '',
        notes: ''
    });

    const [derived, setDerived] = useState({
        correct: 0,
        wrong: 0,
        accuracy: 0,
        negative: 0,
        percentScore: 0
    });

    const [loading, setLoading] = useState(false);

    // Live Calculations
    useEffect(() => {
        const score = parseFloat(formData.score) || 0;
        const attempts = parseFloat(formData.attempts_total) || 0;
        const max = parseFloat(formData.max_marks) || 200;

        let correct = 0;
        let wrong = 0;
        let accuracy = 0;
        let negative = 0;

        if (attempts > 0 && formData.score !== '') {
            // Formula: Score = 2*C - 0.5*W
            // Attempts = C + W  => W = A - C
            // Score = 2C - 0.5(A - C) = 2.5C - 0.5A
            // 2.5C = Score + 0.5A
            // C = (Score + 0.5A) / 2.5

            const c = (score + 0.5 * attempts) / 2.5;
            correct = Math.max(0, Math.round(c));
            wrong = Math.max(0, attempts - correct);

            negative = wrong * 0.5;
            accuracy = (correct / attempts) * 100;
        }

        const percentScore = max > 0 ? (score / max) * 100 : 0;

        setDerived({ correct, wrong, accuracy, negative, percentScore });

    }, [formData.score, formData.attempts_total, formData.max_marks]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Include derived data in payload if backend needs it, 
        // though backend recalculates. We send what the form has.
        const payload = {
            ...formData,
            // ensure numbers
            score: Number(formData.score),
            attempts_total: Number(formData.attempts_total),
            max_marks: Number(formData.max_marks)
        };

        try {
            await axios.post('http://localhost:5000/api/mocks', payload);
            toast.success('Mock score saved!');
            setFormData(prev => ({
                ...prev,
                mock_name: '',
                score: '',
                attempts_total: '',
                qa_score: '',
                reasoning_score: '',
                english_score: '',
                gk_score: '',
                notes: ''
            }));
        } catch (err) {
            toast.error('Failed to log mock.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white">Log Mock Result</h1>
                <p className="text-slate-400 mt-1">Analyze your performance deeply</p>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="space-y-6 lg:col-span-2">
                    <Card title="Mock Details">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <Input label="Date" type="date" name="date" value={formData.date} onChange={handleChange} required />
                            <Input label="Mock Name" name="mock_name" value={formData.mock_name} onChange={handleChange} placeholder="e.g. Oliveboard All India Live 1" required />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <Input label="Platform" name="platform" value={formData.platform} onChange={handleChange} placeholder="Testbook, etc." />
                            <div>
                                <label className="block text-sm font-medium text-slate-400 mb-1.5">Tier</label>
                                <select name="tier" value={formData.tier} onChange={handleChange} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                                    <option value="Pre">Pre (Tier 1)</option>
                                    <option value="Mains">Mains (Tier 2)</option>
                                </select>
                            </div>
                            <Input label="Time Taken (min)" type="number" name="time_taken_min" value={formData.time_taken_min} onChange={handleChange} />
                        </div>
                    </Card>

                    <Card className="relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <TrendingUp size={120} />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-6">Performance Metrics</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                            {/* Inputs */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-slate-400 text-sm block mb-1">Total Score</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            step="0.5"
                                            name="score"
                                            value={formData.score}
                                            onChange={handleChange}
                                            className="bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-2xl font-bold text-white w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="0"
                                            required
                                        />
                                        <span className="text-slate-500 whitespace-nowrap">/ {formData.max_marks}</span>
                                    </div>
                                </div>
                                <Input
                                    label="Total Attempts"
                                    name="attempts_total"
                                    type="number"
                                    value={formData.attempts_total}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            {/* Calculated Preview */}
                            <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-800 flex flex-col justify-center space-y-4">
                                <div className="flex items-center gap-2 text-slate-400 mb-2 border-b border-slate-800 pb-2">
                                    <Calculator size={16} />
                                    <span className="text-sm font-medium">Auto-Calculated</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-400">{derived.correct}</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider">Correct</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-400">{derived.wrong}</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider">Wrong</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-800 pt-6">
                            <h4 className="text-sm font-medium text-slate-400 mb-4">Sectional Scores (Optional)</h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <Input label="Quant" type="number" step="0.5" name="qa_score" value={formData.qa_score} onChange={handleChange} placeholder="--" className="text-center" />
                                <Input label="Reasoning" type="number" step="0.5" name="reasoning_score" value={formData.reasoning_score} onChange={handleChange} placeholder="--" className="text-center" />
                                <Input label="English" type="number" step="0.5" name="english_score" value={formData.english_score} onChange={handleChange} placeholder="--" className="text-center" />
                                <Input label="GK" type="number" step="0.5" name="gk_score" value={formData.gk_score} onChange={handleChange} placeholder="--" className="text-center" />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Right Column: Live Summary */}
                <div className="space-y-6">
                    <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-blue-900/30 sticky top-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <CheckCircle2 className="text-blue-400" size={20} />
                            Summary
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-3 bg-slate-950/30 rounded-lg">
                                <span className="text-slate-400 text-sm">Accuracy</span>
                                <span className={`font-bold ${derived.accuracy >= 90 ? 'text-green-400' : derived.accuracy >= 80 ? 'text-blue-400' : 'text-amber-400'}`}>
                                    {derived.accuracy.toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-950/30 rounded-lg">
                                <span className="text-slate-400 text-sm">Percentage</span>
                                <span className="font-bold text-white">
                                    {derived.percentScore.toFixed(1)}%
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-950/30 rounded-lg">
                                <span className="text-slate-400 text-sm">Negative Marks</span>
                                <span className="font-bold text-red-400">-{derived.negative}</span>
                            </div>

                            <div className="h-px bg-slate-700/50 my-2"></div>

                            <div className="text-xs text-slate-500 leading-relaxed">
                                {derived.accuracy > 90
                                    ? "Excellent accuracy! Focus on speed now."
                                    : derived.accuracy < 75
                                        ? "Accuracy is low. Avoid guessing."
                                        : "Balanced performance."}
                            </div>
                        </div>

                        <Button type="submit" isLoading={loading} className="w-full mt-6 py-3">
                            Save Result
                        </Button>
                    </Card>

                    <Card>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Analysis Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={6}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                            placeholder="Weak areas? Silly mistakes?"
                        />
                    </Card>
                </div>
            </form>
        </div>
    );
}
