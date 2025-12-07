import React from 'react';
import usePageTitle from '../hooks/usePageTitle';
import DailySummaryGenerator from '../components/DailySummaryGenerator';
import WeeklySummaryGenerator from '../components/WeeklySummaryGenerator';
import { Card } from '../components/ui/Card';

export default function SummaryPage() {
    usePageTitle('Study Summary');

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white">Study Summary</h1>
                <p className="text-slate-400 mt-2">Generate and copy your daily and weekly study reports.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DailySummaryGenerator />
                <WeeklySummaryGenerator />
            </div>
        </div>
    );
}
