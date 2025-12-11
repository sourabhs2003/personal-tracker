import { ChevronLeft, ChevronRight } from 'lucide-react';
import useMobileCarousel from '../hooks/useMobileCarousel';
import AdaptiveBanner from './AdaptiveBanner';
import StudyTimeline from './StudyTimeline';
import DailyGoalProgress from './DailyGoalProgress';
import StreakTracker from './StreakTracker';
import StudyInsights from './StudyInsights';
import StudyTrend from './StudyTrend';
import SubjectBreakdown from './SubjectBreakdown';
import { Clock, TrendingUp, BookOpen, Activity } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';

/**
 * Mobile Dashboard Carousel
 * Swipeable carousel for mobile viewports (≤768px)
 */
export default function MobileDashboardCarousel({ data }) {
    const slides = [
        { id: 'banner', component: 'banner' },
        { id: 'timeline', component: 'timeline' },
        { id: 'goal', component: 'goal' },
        { id: 'streak', component: 'streak' },
        { id: 'insights', component: 'insights' },
        { id: 'stats', component: 'stats' },
        { id: 'trend', component: 'trend' },
        { id: 'subjects', component: 'subjects' },
        { id: 'mocks', component: 'mocks' }
    ];

    const {
        currentIndex,
        carouselRef,
        goToSlide,
        goToNext,
        goToPrev,
        canGoNext,
        canGoPrev
    } = useMobileCarousel(slides.length);

    const renderSlide = (slide) => {
        switch (slide.component) {
            case 'banner':
                return (
                    <AdaptiveBanner
                        todayMin={data.stats.today_min}
                        yesterdayMin={data.stats.yesterday_min}
                        streak={data.streakData?.currentStreak || 0}
                    />
                );

            case 'timeline':
                return (
                    <div className="h-full">
                        <StudyTimeline sessions={data.todaySessions} />
                    </div>
                );

            case 'goal':
                return <DailyGoalProgress todayMin={data.stats.today_min} />;

            case 'streak':
                return <StreakTracker sessions={data.allSessions} />;

            case 'insights':
                return <StudyInsights sessions={data.allSessions} />;

            case 'stats':
                return (
                    <div className="grid grid-cols-2 gap-3 h-full">
                        <MobileStatCard
                            icon={<Clock className="text-blue-400" size={20} />}
                            label="Today"
                            value={data.stats.today_min}
                            suffix=" min"
                        />
                        <MobileStatCard
                            icon={<TrendingUp className="text-emerald-400" size={20} />}
                            label="Last 7 Days"
                            value={data.stats.week_min}
                            suffix=" min"
                        />
                        <MobileStatCard
                            icon={<BookOpen className="text-purple-400" size={20} />}
                            label="Mocks (30d)"
                            value={data.stats.mocks_30d}
                        />
                        <MobileStatCard
                            icon={<Activity className="text-amber-400" size={20} />}
                            label="Mock Study"
                            value={data.stats.mockWeekMin || 0}
                            suffix=" min"
                        />
                    </div>
                );

            case 'trend':
                return (
                    <div className="h-full">
                        <StudyTrend sessions={data.allSessions} />
                    </div>
                );

            case 'subjects':
                return (
                    <div className="h-full">
                        <SubjectBreakdown sessions={data.allSessions} />
                    </div>
                );

            case 'mocks':
                return (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 h-full overflow-hidden flex flex-col">
                        <h3 className="text-lg font-semibold text-white mb-4">Recent Mocks</h3>
                        <div className="flex-1 overflow-y-auto">
                            <div className="space-y-3">
                                {data.latestMocks.slice(0, 5).map((mock, idx) => (
                                    <div key={idx} className="bg-slate-900/50 rounded-lg p-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <div className="font-medium text-slate-200 text-sm">{mock.mock_name}</div>
                                                <div className="text-xs text-slate-500 mt-1">
                                                    {new Date(mock.date).toLocaleDateString()} • {Math.round(mock.accuracy || 0)}% Acc
                                                </div>
                                            </div>
                                            <div className="text-lg font-bold text-emerald-400 ml-2">
                                                {mock.score}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="relative h-screen pb-20">
            {/* Carousel Container */}
            <div
                ref={carouselRef}
                className="mobile-carousel flex overflow-x-auto h-full"
                style={{
                    scrollSnapType: 'x mandatory',
                    scrollBehavior: 'smooth',
                    WebkitOverflowScrolling: 'touch',
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}
            >
                {slides.map((slide) => (
                    <div
                        key={slide.id}
                        className="carousel-slide flex-shrink-0 w-full px-4 py-6"
                        style={{
                            scrollSnapAlign: 'start',
                            scrollSnapStop: 'always'
                        }}
                    >
                        {renderSlide(slide)}
                    </div>
                ))}
            </div>

            {/* Navigation Controls */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 p-4">
                <div className="flex items-center justify-between max-w-md mx-auto">
                    {/* Previous Button */}
                    <button
                        onClick={goToPrev}
                        disabled={!canGoPrev}
                        aria-label="Previous slide"
                        className="p-2 rounded-lg bg-slate-800 text-white disabled:opacity-30 disabled:cursor-not-allowed
                            hover:bg-slate-700 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    {/* Page Dots */}
                    <div className="flex gap-2" role="tablist" aria-label="Carousel navigation">
                        {slides.map((slide, index) => (
                            <button
                                key={slide.id}
                                onClick={() => goToSlide(index)}
                                role="tab"
                                aria-label={`Slide ${index + 1}`}
                                aria-selected={currentIndex === index}
                                className={`w-2 h-2 rounded-full transition-all duration-200 ${currentIndex === index
                                        ? 'bg-blue-500 w-6'
                                        : 'bg-slate-600 hover:bg-slate-500'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Next Button */}
                    <button
                        onClick={goToNext}
                        disabled={!canGoNext}
                        aria-label="Next slide"
                        className="p-2 rounded-lg bg-slate-800 text-white disabled:opacity-30 disabled:cursor-not-allowed
                            hover:bg-slate-700 transition-colors"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
}

// Compact stat card for mobile
function MobileStatCard({ icon, label, value, suffix = '' }) {
    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-slate-900 rounded-lg border border-slate-700/50">
                    {icon}
                </div>
                <span className="text-xs font-medium text-slate-400">{label}</span>
            </div>
            <div className="text-2xl font-bold text-white">
                <AnimatedNumber value={value} suffix={suffix} />
            </div>
        </div>
    );
}
