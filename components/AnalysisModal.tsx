import React from 'react';
import { XMarkIcon, TikTokIcon, FacebookIcon, AmazonIcon, SnapchatIcon, YouTubeIcon, SparklesIcon, InstagramIcon, GoogleAdsIcon } from './icons';
import { PlatformIconConfig } from '../types';

type AnalysisType = 'pattern' | 'campaign' | 'facebook' | 'tiktok' | 'amazon' | 'snapchat' | 'youtube' | 'comparison' | 'instagram' | 'google';

interface AnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectAnalysis: (type: AnalysisType) => void;
    platformIconConfig: PlatformIconConfig;
}

const defaultIcons: { [key: string]: React.FC<{ className?: string }> } = {
    tiktok: TikTokIcon,
    facebook: FacebookIcon,
    instagram: InstagramIcon,
    amazon: AmazonIcon,
    snapchat: SnapchatIcon,
    youtube: YouTubeIcon,
    google: GoogleAdsIcon,
};

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, onSelectAnalysis, platformIconConfig }) => {
    if (!isOpen) return null;

    const analysisOptions: { type: string, title: string, color: string }[] = [
        { type: 'tiktok', title: 'تحليل تيكتوك', color: 'black' },
        { type: 'facebook', title: 'تحليل فيسبوك', color: 'blue' },
        { type: 'instagram', title: 'تحليل انستغرام', color: 'pink' },
        { type: 'youtube', title: 'تحليل يوتيوب', color: 'red' },
        { type: 'google', title: 'تحليل إعلانات جوجل', color: 'blue' },
        { type: 'amazon', title: 'تحليل أمازون', color: 'orange' },
        { type: 'snapchat', title: 'تحليل سنابشات', color: 'yellow' },
    ];

    return (
        <div 
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl p-8 text-gray-900 relative flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors"
                >
                    <XMarkIcon className="w-8 h-8" />
                </button>

                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <SparklesIcon className="w-8 h-8 text-violet-500" />
                        <h2 className="text-3xl font-bold text-gray-800">اختر منصة التحليل</h2>
                    </div>
                    <p className="text-gray-500 mt-2">حدد المنصة التي ترغب في تحليل إعلانك عليها.</p>
                </div>


                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 overflow-y-auto p-1">
                    {analysisOptions.map(option => {
                        const customIconSrc = platformIconConfig[option.type];
                        const IconComponent = defaultIcons[option.type];
                        const colorClass = option.type === 'tiktok' ? '' : `text-${option.color}-500`;

                        return (
                            <button
                                key={option.type}
                                onClick={() => onSelectAnalysis(option.type as AnalysisType)}
                                className="relative p-3 rounded-2xl border border-gray-200 text-center aspect-square flex flex-col items-center justify-center hover:bg-violet-50 hover:border-violet-300 transition-colors duration-200"
                            >
                               <div className="mb-2 w-9 h-9 flex items-center justify-center">
                                    {customIconSrc ? (
                                        <img src={customIconSrc} alt={option.title} className="w-full h-full object-contain" />
                                    ) : (
                                        <IconComponent className={`w-9 h-9 ${colorClass}`} />
                                    )}
                                </div>
                                <h3 className="text-sm font-bold text-gray-800">{option.title}</h3>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AnalysisModal;