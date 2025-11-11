import React from 'react';
import type { AnyHistoricAnalysisResult } from '../types';
import { VideoCameraIcon, ArrowDownTrayIcon, MagicWandIcon } from './icons';

interface HistoryProps {
    history: AnyHistoricAnalysisResult[];
    onViewReport: (report: AnyHistoricAnalysisResult) => void;
    onDownloadReport: (report: AnyHistoricAnalysisResult) => void;
    onClearHistory: () => void;
    onReanalyze: (report: AnyHistoricAnalysisResult) => void;
}

const History: React.FC<HistoryProps> = ({ history, onViewReport, onDownloadReport, onClearHistory, onReanalyze }) => {

    const getReportTypeLabel = (type: AnyHistoricAnalysisResult['type']) => {
        switch (type) {
            case 'pattern': return 'كاشف الأنماط';
            case 'campaign': return 'تحليل النتائج';
            case 'comparison': return 'مقارنة الفيديوهات';
            case 'facebook': return 'تحليل إعلانات فيسبوك';
            case 'tiktok': return 'تحليل إعلانات تيكتوك';
            case 'amazon': return 'تحليل إعلانات أمازون';
            case 'snapchat': return 'تحليل إعلانات سنابشات';
            // FIX: Added missing cases for youtube, instagram, and google.
            case 'youtube': return 'تحليل إعلانات يوتيوب';
            case 'instagram': return 'تحليل إعلانات انستغرام';
            case 'google': return 'تحليل إعلانات جوجل';
            default: return 'تحليل';
        }
    };
    
    const singleVideoTypes = ['facebook', 'tiktok', 'amazon', 'snapchat', 'youtube', 'instagram', 'google'];

    return (
        <div className="animate-fade-in space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-4xl font-bold text-gray-800">سجل التحليلات</h1>
                    <p className="text-lg text-gray-500 mt-2">
                        {history.length > 0 
                            ? 'هنا تجد جميع التقارير السابقة. انقر على أي تقرير لعرض تفاصيله.'
                            : 'لم تقم بأي تحليلات بعد. سيظهر سجلك هنا عند إكمال أول تحليل.'}
                    </p>
                </div>
                {history.length > 0 && (
                    <button 
                        onClick={onClearHistory}
                        className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                        حذف السجل
                    </button>
                )}
            </div>
            
            {history.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                        {/* FIX: Add a robust filter to prevent runtime errors with malformed history data. */}
                        {history.filter((report): report is AnyHistoricAnalysisResult => !!(report && typeof report === 'object' && typeof report.id === 'string' && typeof report.timestamp === 'number' && typeof report.fileName === 'string' && typeof report.type === 'string')).map(report => (
                            <li key={report.id} className="p-4 hover:bg-gray-50 transition-colors duration-200 flex items-center gap-4">
                                <button 
                                    onClick={() => onViewReport(report)}
                                    className="flex-grow w-full text-right flex items-center gap-4"
                                >
                                    <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                                        {report.thumbnail ? (
                                            <img src={`data:image/jpeg;base64,${report.thumbnail}`} alt="Video thumbnail" className="w-full h-full object-cover" />
                                        ) : (
                                            <VideoCameraIcon className="w-8 h-8 text-gray-500" />
                                        )}
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-bold text-gray-800 truncate">{report.fileName}</p>
                                        <p className="text-sm text-gray-500">{getReportTypeLabel(report.type)}</p>
                                    </div>
                                    <div className="flex-shrink-0 text-sm text-gray-500 text-left hidden md:block">
                                        <p>{new Date(report.timestamp).toLocaleDateString('ar-EG', {
                                            year: 'numeric', month: 'short', day: 'numeric'
                                        })}</p>
                                        <p>{new Date(report.timestamp).toLocaleTimeString('ar-EG', {
                                            hour: '2-digit', minute: '2-digit'
                                        })}</p>
                                    </div>
                                </button>
                                <div className="flex items-center gap-1">
                                    {singleVideoTypes.includes(report.type) && (
                                        <button 
                                            onClick={() => onReanalyze(report)}
                                            className="flex-shrink-0 p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
                                            title="إعادة التحليل على منصة أخرى"
                                        >
                                            <MagicWandIcon className="w-5 h-5" />
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => onDownloadReport(report)}
                                        className="flex-shrink-0 p-2 text-gray-500 hover:bg-gray-200 rounded-full transition-colors"
                                        title="تنزيل التقرير"
                                    >
                                        <ArrowDownTrayIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default History;