import React from 'react';
import usePageTitle from '../hooks/usePageTitle';
import DailySummaryGenerator from '../components/DailySummaryGenerator';
import WeeklyDetailedSummary from '../components/WeeklyDetailedSummary';
import { Card } from '../components/ui/Card';

export default function SummaryPage() {
    usePageTitle('Study Summary');

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-white">Study Summary</h1>
                <p className="text-slate-400 mt-2">Generate and review your daily and weekly study reports.</p>
            </div>

            {/* Daily Summary - Half Width on Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DailySummaryGenerator />
                <div className="hidden lg:block">
                    <Card className="h-full flex items-center justify-center">
                        <div className="text-center text-slate-500">
                            <p className="text-sm">Weekly summary below</p>
                            <p className="text-xs mt-1">Scroll down for detailed weekly breakdown</p>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Weekly Summary - Full Width */}
            <WeeklyDetailedSummary />
        </div>
    );
}
