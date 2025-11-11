import React, { useMemo } from 'react';
import type { User, AnyHistoricAnalysisResult, AnalysisCategory, BannerConfig, ImageBannerConfig } from '../types';
import { SparklesIcon, ClipboardDocumentListIcon, VideoCameraIcon, InformationCircleIcon } from './icons';

type AnalysisType = 'pattern' | 'campaign' | 'facebook' | 'tiktok' | 'amazon' | 'snapchat' | 'comparison';

interface DashboardProps {
    user: User;
    history: AnyHistoricAnalysisResult[];
    onOpenAnalysisModal: () => void;
    bannerConfig: BannerConfig;
    imageBannerConfig: ImageBannerConfig;
}

// --- START: Chart Components ---

const Tooltip: React.FC<{ content: string; x: number; y: number; }> = ({ content, x, y }) => {
    return (
        <div 
            className="absolute bg-gray-800 text-white text-xs rounded py-1 px-2 pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{ left: x, top: y, marginTop: '-8px' }}
        >
            {content}
        </div>
    );
};


const BarChart: React.FC<{ data: { label: string; value: number }[]; title: string; color: string }> = ({ data, title, color }) => {
    const [tooltip, setTooltip] = React.useState<{ content: string; x: number; y: number } | null>(null);
    const SVG_WIDTH = 300;
    const SVG_HEIGHT = 150;
    const PADDING = 20;
    const maxValue = Math.max(...data.map(d => d.value), 1);
    const barWidth = (SVG_WIDTH - PADDING * 2) / data.length;

    const handleMouseMove = (e: React.MouseEvent<SVGRectElement>, item: { label: string; value: number }) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltip({
            content: `${item.label}: ${item.value}`,
            x: rect.left + rect.width / 2,
            y: rect.top,
        });
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 transition-all hover:shadow-md hover:border-gray-300 relative">
            <h3 className="text-lg font-bold text-gray-700 mb-4">{title}</h3>
            {data.reduce((sum, item) => sum + item.value, 0) > 0 ? (
                <div onMouseLeave={() => setTooltip(null)}>
                    <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-auto">
                        {data.map((item, index) => {
                            const barHeight = (item.value / maxValue) * (SVG_HEIGHT - PADDING * 2);
                            const x = PADDING + index * barWidth;
                            const y = SVG_HEIGHT - PADDING - barHeight;
                            return (
                                <g key={index}>
                                    <rect
                                        x={x + barWidth * 0.1}
                                        y={y}
                                        width={barWidth * 0.8}
                                        height={barHeight}
                                        className={`fill-current text-${color}-400 hover:text-${color}-500 transition-colors`}
                                        onMouseMove={(e) => handleMouseMove(e, item)}
                                    />
                                </g>
                            );
                        })}
                        {data.map((item, index) => (
                             <text key={index} x={PADDING + index * barWidth + barWidth / 2} y={SVG_HEIGHT - 5} textAnchor="middle" className="text-xs fill-current text-gray-500">{item.label.slice(0,3)}</text>
                        ))}
                    </svg>
                    {tooltip && <Tooltip {...tooltip} />}
                </div>
            ) : (
                <div className="h-[150px] flex items-center justify-center text-gray-400">لا توجد بيانات كافية للعرض</div>
            )}
        </div>
    );
};

const getSmoothPath = (data: number[], svgWidth: number, svgHeight: number, padding: number): string => {
    const maxValue = 10;
    const minValue = 0;

    const points = data.map((value, index) => {
        const x = padding + (index / (data.length - 1)) * (svgWidth - padding * 2);
        const y = svgHeight - padding - ((value - minValue) / (maxValue - minValue)) * (svgHeight - padding * 2);
        return [x, y];
    });

    if (points.length < 2) return "";

    const line = (pointA: number[], pointB: number[]) => {
        const lengthX = pointB[0] - pointA[0];
        const lengthY = pointB[1] - pointA[1];
        return {
            length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
            angle: Math.atan2(lengthY, lengthX)
        };
    };

    const controlPoint = (current: number[], previous: number[] | undefined, next: number[] | undefined, reverse?: boolean) => {
        const p = previous || current;
        const n = next || current;
        const smoothing = 0.2;
        const o = line(p, n);
        const angle = o.angle + (reverse ? Math.PI : 0);
        const length = o.length * smoothing;
        const x = current[0] + Math.cos(angle) * length;
        const y = current[1] + Math.sin(angle) * length;
        return [x, y];
    };

    const pathData = points.reduce((acc, point, i, a) => {
        if (i === 0) {
            return `M ${point[0]},${point[1]}`;
        }
        const [cpsX, cpsY] = controlPoint(a[i - 1], a[i - 2], point);
        const [cpeX, cpeY] = controlPoint(point, a[i - 1], a[i + 1], true);
        return `${acc} C ${cpsX},${cpsY} ${cpeX},${cpeY} ${point[0]},${point[1]}`;
    }, "");

    return pathData;
};


const LineChart: React.FC<{ data: number[]; title: string; color: string }> = ({ data, title, color }) => {
    const [tooltip, setTooltip] = React.useState<{ content: string; x: number; y: number } | null>(null);
    const SVG_WIDTH = 300;
    const SVG_HEIGHT = 150;
    const PADDING = 20;
    const maxValue = 10;
    const minValue = 0;

    const smoothPath = getSmoothPath(data, SVG_WIDTH, SVG_HEIGHT, PADDING);

    const handleMouseMove = (e: React.MouseEvent<SVGCircleElement>, value: number, index: number) => {
        const circle = e.currentTarget.getBoundingClientRect();
        setTooltip({
            content: `التحليل ${index + 1}: ${value.toFixed(1)}/10`,
            x: circle.left + circle.width / 2,
            y: circle.top,
        });
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 transition-all hover:shadow-md hover:border-gray-300 relative">
            <h3 className="text-lg font-bold text-gray-700 mb-4">{title}</h3>
            {data.length > 1 ? (
                <div onMouseLeave={() => setTooltip(null)}>
                    <svg viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} className="w-full h-auto">
                        <path
                            d={smoothPath}
                            fill="none"
                            className={`stroke-current text-${color}-500`}
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        />
                        {data.map((value, index) => {
                            const x = PADDING + (index / (data.length - 1)) * (SVG_WIDTH - PADDING * 2);
                            // FIX: Corrected a typo from `padding` to `PADDING` to ensure consistent calculations for the chart's y-coordinate.
                            const y = SVG_HEIGHT - PADDING - ((value - minValue) / (maxValue - minValue)) * (SVG_HEIGHT - PADDING * 2);
                            return (
                                <circle
                                    key={index}
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    className={`fill-current text-${color}-500 hover:text-${color}-700 cursor-pointer`}
                                    onMouseMove={(e) => handleMouseMove(e, value, index)}
                                />
                            );
                        })}
                         <text x={10} y={PADDING} className="text-xs fill-current text-gray-500">10</text>
                         <text x={10} y={SVG_HEIGHT - PADDING} className="text-xs fill-current text-gray-500">0</text>
                    </svg>
                     {tooltip && <Tooltip {...tooltip} />}
                </div>
            ) : (
                <div className="h-[150px] flex items-center justify-center text-gray-400">تحليلان على الأقل مطلوبان لعرض التطور</div>
            )}
        </div>
    );
};

const DistributionChart: React.FC<{ data: { label: string; value: number; color: string }[]; title: string }> = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 transition-all hover:shadow-md hover:border-gray-300">
            <h3 className="text-lg font-bold text-gray-700 mb-4">{title}</h3>
            {total > 0 ? (
                <div className="space-y-3">
                    {data.map((item, index) => {
                        const percentage = (item.value / total) * 100;
                        return (
                            <div key={index}>
                                <div className="flex justify-between items-center text-sm font-semibold mb-1">
                                    <span className="text-gray-600">{item.label}</span>
                                    <span className={`text-${item.color}-600`}>{percentage.toFixed(0)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className={`bg-${item.color}-500 h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                 <div className="h-[150px] flex items-center justify-center text-gray-400">لا توجد بيانات كافية للعرض</div>
            )}
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 transition-all hover:shadow-md hover:border-gray-300">
        <div className="flex items-center">
            <div className={`flex-shrink-0 p-3 rounded-full bg-${color}-100 text-${color}-600`}>
                {icon}
            </div>
            <div className="mr-4 text-right">
                <p className="text-3xl font-bold text-gray-800">{value}</p>
                <p className="text-sm font-semibold text-gray-500">{title}</p>
            </div>
        </div>
    </div>
);


// --- END: Chart Components ---

const Dashboard: React.FC<DashboardProps> = ({ user, history, onOpenAnalysisModal, bannerConfig, imageBannerConfig }) => {
    
    const chartData = useMemo(() => {
        // Weekly Activity Data
        const weeklyActivityData = [];
        const today = new Date();
        const dayLabels = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dayStart = new Date(date.setHours(0, 0, 0, 0));
            const dayEnd = new Date(date.setHours(23, 59, 59, 999));
            
            const count = history.filter(h => h && h.timestamp >= dayStart.getTime() && h.timestamp <= dayEnd.getTime()).length;
            weeklyActivityData.push({ label: dayLabels[dayStart.getDay()], value: count });
        }
        
        // Platform Distribution Data
        const platformCounts: { [key: string]: number } = {};
        const typeToPlatformName: { [key: string]: string } = {
            'facebook': 'Meta',
            'tiktok': 'TikTok',
            'amazon': 'Amazon',
            'snapchat': 'Snapchat',
            'youtube': 'YouTube',
            'instagram': 'Instagram',
            'google': 'Google',
        };

        // FIX: Add a robust check for `report` and `report.type` to prevent errors with malformed history objects.
        history.forEach((report) => {
            const reportObject = report as any;
            if (reportObject && typeof reportObject.type === 'string') {
                const platformName = typeToPlatformName[reportObject.type];
                if (platformName) {
                    platformCounts[platformName] = (platformCounts[platformName] || 0) + 1;
                }
            }
        });

        const platformColors: { [key: string]: string } = { 'TikTok': 'pink', 'Meta': 'blue', 'Amazon': 'orange', 'Snapchat': 'yellow', 'YouTube': 'red', 'Instagram': 'purple', 'Google': 'green' };
        const platformDistributionData = Object.entries(platformCounts)
            .map(([label, value]) => ({ label, value, color: platformColors[label] || 'gray' }))
            .sort((a, b) => b.value - a.value);

        // Score Trend Data
        // FIX: Add new platforms to scored history.
        const scoredHistory = history.filter((h): h is AnyHistoricAnalysisResult => {
            const hAsAny = h as any;
            return hAsAny && typeof hAsAny.type === 'string' && ['facebook', 'tiktok', 'amazon', 'snapchat', 'youtube', 'instagram', 'google'].includes(hAsAny.type);
        });
        const lastFiveAnalyses = scoredHistory.slice(0, 5).reverse();
        const scoreTrendData = lastFiveAnalyses.map(report => {
             const scores = Object.values(report)
                .filter((v): v is AnalysisCategory => typeof v === 'object' && v !== null && 'score' in v)
                .map(c => c.score);
            if (scores.length === 0) return 0;
            return scores.reduce((acc, score) => acc + score, 0) / scores.length;
        });

        const totalVideosUploaded = history.reduce((acc, report) => {
            if (!report || typeof report !== 'object') {
                return acc;
            }
            if (Array.isArray((report as any).fileNames)) {
                return acc + (report as any).fileNames.length;
            }
            if ((report as any).fileName) {
                return acc + 1;
            }
            return acc;
        }, 0);


        return { weeklyActivityData, platformDistributionData, scoreTrendData, totalVideosUploaded };
    }, [history]);

    return (
        <div className="animate-fade-in space-y-8">
            {imageBannerConfig.isVisible && imageBannerConfig.imageUrl ? (
                <div className="max-w-4xl mx-auto mb-6">
                    <a href={imageBannerConfig.linkUrl} target="_blank" rel="noopener noreferrer" className="block rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                        <img src={imageBannerConfig.imageUrl} alt="Promotional Banner" className="w-full h-auto object-contain" />
                    </a>
                </div>
            ) : bannerConfig.isVisible && bannerConfig.message ? (
                <div className="max-w-4xl mx-auto p-4 mb-6 bg-violet-100 border border-violet-200 rounded-lg flex items-start gap-3">
                    <InformationCircleIcon className="w-6 h-6 text-violet-600 flex-shrink-0 mt-0.5" />
                    <p className="text-violet-800">{bannerConfig.message}</p>
                </div>
            ) : null}

            <div>
                <h1 className="text-4xl font-bold text-gray-800">أهلاً بك، {user.name || user.email.split('@')[0]}!</h1>
                <p className="text-lg text-gray-500 mt-2">ابدأ بتحليل إعلانك أو استعرض إحصاءات أدائك.</p>
            </div>

            <div className="flex justify-start mb-6">
                <button
                    onClick={onOpenAnalysisModal}
                    className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl hover:shadow-violet-400/40 transform hover:-translate-y-1 transition-all duration-300"
                >
                    <SparklesIcon className="w-6 h-6" />
                    <span className="text-lg">تحليل جديد</span>
                </button>
            </div>
            
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-700">إحصاءات الأداء</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <StatCard title="إجمالي التحليلات" value={history.length} icon={<ClipboardDocumentListIcon className="w-6 h-6"/>} color="violet" />
                   <StatCard title="إجمالي الفيديوهات المرفوعة" value={chartData.totalVideosUploaded} icon={<VideoCameraIcon className="w-6 h-6"/>} color="blue" />
                   <BarChart data={chartData.weeklyActivityData} title="النشاط الأسبوعي" color="indigo"/>
                   <DistributionChart data={chartData.platformDistributionData} title="توزيع المنصات" />
                   <LineChart data={chartData.scoreTrendData} title="تطور متوسط الدرجات" color="green" />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;