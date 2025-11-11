import React from 'react';
import { ArrowsRightLeftIcon, Square3Stack3DIcon, ChartPieIcon, iconMap } from './icons';
import type { ToolIconConfig } from '../types';

type AnalysisType = 'pattern' | 'campaign' | 'comparison';

interface ToolsProps {
    onStartAnalysis: (type: AnalysisType) => void;
    toolIconConfig: ToolIconConfig;
}

const tools = [
    {
        type: 'comparison',
        title: 'مقارنة الفيديوهات',
        description: 'قارن بين إعلانين لتحديد الأقوى وتلقي توصيات مخصصة.',
        defaultIcon: ArrowsRightLeftIcon,
    },
    {
        type: 'pattern',
        title: 'كاشف الأنماط',
        description: 'حلل مجموعة من الفيديوهات لاكتشاف "الوصفة السحرية" المشتركة بينها.',
        defaultIcon: Square3Stack3DIcon,
    },
    {
        type: 'campaign',
        title: 'تحليل النتائج',
        description: 'اربط بين إبداع الفيديو ونتائج أدائه الرقمية للحصول على رؤى قابلة للتنفيذ.',
        defaultIcon: ChartPieIcon,
    }
];

const ToolCard: React.FC<{ tool: typeof tools[0], icon: React.ReactNode, onClick: () => void }> = ({ tool, icon, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="group relative bg-white p-6 rounded-2xl border border-gray-200 text-right w-full h-full hover:border-violet-400 hover:shadow-lg transition-all duration-300 flex flex-col"
        >
            <div className="mb-4 text-violet-600">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{tool.title}</h3>
            <p className="text-gray-500 text-sm flex-grow">{tool.description}</p>
             <div className="mt-4 text-violet-600 font-semibold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>ابدأ الآن</span>
                <span className="transform transition-transform group-hover:translate-x-1">→</span>
            </div>
        </button>
    );
};

const Tools: React.FC<ToolsProps> = ({ onStartAnalysis, toolIconConfig }) => {
    return (
        <div className="animate-fade-in space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-gray-800">أدوات التحليل</h1>
                <p className="text-lg text-gray-500 mt-2">اختر الأداة المناسبة لهدفك التحليلي.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map(tool => {
                    const iconName = toolIconConfig[tool.type as keyof ToolIconConfig];
                    const IconComponent = iconName ? iconMap[iconName] : tool.defaultIcon;
                    return (
                        <ToolCard 
                            key={tool.type} 
                            tool={tool}
                            icon={<IconComponent className="w-8 h-8" />}
                            onClick={() => onStartAnalysis(tool.type as AnalysisType)}
                        />
                    );
                })}
            </div>
        </div>
    );
};

export default Tools;