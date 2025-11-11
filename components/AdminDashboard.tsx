import React, { useState, useMemo, useRef } from 'react';
import { User, SubscriptionTier, MetricConfig, PlatformIconConfig, ToolIconConfig, AnyHistoricAnalysisResult, SubscriptionPlan, TrainingData, BannerConfig, ImageBannerConfig, LogoConfig, VersionConfig, RibbonConfig } from '../types';
import * as authService from '../services/authService';
import { UsersIcon, ClipboardDocumentListIcon, ChartPieIcon, Cog6ToothIcon, PaintBrushIcon, UploadIcon, FilmIcon, SparklesIcon, CheckBadgeIcon, ClockIcon, InformationCircleIcon, MagnetIcon, XMarkIcon, XCircleIcon } from './icons';
import { iconMap, iconNames, FacebookIcon, TikTokIcon, AmazonIcon, SnapchatIcon, YouTubeIcon, InstagramIcon, GoogleIcon } from './icons';


const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
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

const DistributionChart: React.FC<{ data: { label: string; value: number; color: string }[]; title: string }> = ({ data, title }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-700 mb-4">{title}</h3>
            {total > 0 ? (
                <div className="space-y-3">
                    {data.map((item, index) => {
                        const percentage = total > 0 ? (item.value / total) * 100 : 0;
                        return (
                            <div key={index}>
                                <div className="flex justify-between items-center text-sm font-semibold mb-1">
                                    <span className="text-gray-600">{item.label}</span>
                                    <span className={`text-${item.color}-600`}>{percentage.toFixed(0)}% ({item.value})</span>
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

const getTierName = (tier: SubscriptionTier) => {
    if (tier === 'free') return 'مجاني';
    if (tier === 'basic') return 'أساسي';
    if (tier === 'pro') return 'برو';
    return '';
};

const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; label: string; description?: string; }> = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between">
        <div>
            <h4 className="font-semibold text-gray-700">{label}</h4>
            {description && <p className="text-sm text-gray-500">{description}</p>}
        </div>
        <button
            type="button"
            className={`${enabled ? 'bg-violet-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2`}
            onClick={() => onChange(!enabled)}
        >
            <span className={`${enabled ? 'translate-x-5' : 'translate-x-0'} inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}/>
        </button>
    </div>
);


const AdminSubscriptionSettings: React.FC<{
    addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}> = ({ addNotification }) => {
    const [plans, setPlans] = useState<SubscriptionPlan[]>(() => authService.getSubscriptionPlans());

    const handlePlanChange = (tier: SubscriptionTier, field: keyof SubscriptionPlan, value: string | number) => {
        setPlans(prevPlans => prevPlans.map(plan => 
            plan.tier === tier ? { ...plan, [field]: value } : plan
        ));
    };

    const handleFeatureChange = (tier: SubscriptionTier, featureIndex: number, value: string) => {
        setPlans(prevPlans => prevPlans.map(plan => 
            plan.tier === tier 
                ? { ...plan, features: plan.features.map((feat, i) => i === featureIndex ? value : feat) } 
                : plan
        ));
    };

    const addFeature = (tier: SubscriptionTier) => {
        setPlans(prevPlans => prevPlans.map(plan => 
            plan.tier === tier ? { ...plan, features: [...plan.features, 'ميزة جديدة'] } : plan
        ));
    };
    
    const removeFeature = (tier: SubscriptionTier, featureIndex: number) => {
        setPlans(prevPlans => prevPlans.map(plan => 
            plan.tier === tier ? { ...plan, features: plan.features.filter((_, i) => i !== featureIndex) } : plan
        ));
    };

    const handleSave = () => {
        authService.saveSubscriptionPlans(plans);
        addNotification('تم حفظ إعدادات خطط الاشتراك بنجاح!', 'success');
    };

    return (
        <div className="space-y-6">
            {plans.map(plan => (
                <div key={plan.tier} className="p-4 rounded-lg border border-gray-200">
                    <h4 className="font-bold text-lg text-violet-700 mb-4">خطة {plan.name} ({plan.tier})</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="text-sm font-medium">اسم الخطة</label>
                            <input type="text" value={plan.name} onChange={e => handlePlanChange(plan.tier, 'name', e.target.value)} className="w-full mt-1 p-2 bg-gray-50 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">السعر الشهري ($)</label>
                            <input type="number" value={plan.priceMonthly} onChange={e => handlePlanChange(plan.tier, 'priceMonthly', e.target.value)} className="w-full mt-1 p-2 bg-gray-50 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">السعر السنوي ($)</label>
                            <input type="number" value={plan.priceAnnually} onChange={e => handlePlanChange(plan.tier, 'priceAnnually', e.target.value)} className="w-full mt-1 p-2 bg-gray-50 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="text-sm font-medium">حد التحليلات/شهر</label>
                            <input type="number" value={plan.limit} onChange={e => handlePlanChange(plan.tier, 'limit', parseInt(e.target.value, 10))} className="w-full mt-1 p-2 bg-gray-50 border border-gray-300 rounded-md" />
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="text-sm font-medium">الميزات</label>
                        <div className="space-y-2 mt-1">
                            {plan.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input type="text" value={feature} onChange={e => handleFeatureChange(plan.tier, index, e.target.value)} className="flex-grow p-2 bg-gray-50 border border-gray-300 rounded-md" />
                                    <button onClick={() => removeFeature(plan.tier, index)} className="text-red-500 hover:text-red-700 p-1"><XCircleIcon className="w-5 h-5"/></button>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => addFeature(plan.tier)} className="text-sm text-violet-600 font-semibold mt-2 hover:underline">إضافة ميزة</button>
                    </div>
                </div>
            ))}
            <div className="flex justify-end mt-6">
                <button onClick={handleSave} className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-6 rounded-lg">حفظ جميع الخطط</button>
            </div>
        </div>
    );
};



export const AdminCustomizeUI: React.FC<{
    currentPlatformConfig: PlatformIconConfig;
    currentToolConfig: ToolIconConfig;
    onPlatformSave: (config: PlatformIconConfig) => void;
    onToolSave: (config: ToolIconConfig) => void;
    addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
    currentBannerConfig: BannerConfig;
    onBannerSave: (config: BannerConfig) => void;
    currentImageBannerConfig: ImageBannerConfig;
    onImageBannerSave: (config: ImageBannerConfig) => void;
    currentLogoConfig: LogoConfig;
    onLogoSave: (config: LogoConfig) => void;
    currentVersionConfig: VersionConfig;
    onVersionSave: (config: VersionConfig) => void;
    currentRibbonConfig: RibbonConfig;
    onRibbonSave: (config: RibbonConfig) => void;
    currentMetricIconConfig: Record<string, string>;
    onMetricIconConfigSave: (config: Record<string, string>) => void;
    metricConfig: MetricConfig;
}> = ({
    currentPlatformConfig,
    currentToolConfig,
    onPlatformSave,
    onToolSave,
    addNotification,
    currentBannerConfig,
    onBannerSave,
    currentImageBannerConfig,
    onImageBannerSave,
    currentLogoConfig,
    onLogoSave,
    currentVersionConfig,
    onVersionSave,
    currentRibbonConfig,
    onRibbonSave,
    currentMetricIconConfig,
    onMetricIconConfigSave,
    metricConfig
}) => {
    const [activeTab, setActiveTab] = useState('general');
    
    // States for each section
    const [platformConfig, setPlatformConfig] = useState(currentPlatformConfig);
    const [toolConfig, setToolConfig] = useState(currentToolConfig);
    const [metricIconConfig, setMetricIconConfig] = useState(currentMetricIconConfig);
    const [bannerConfig, setBannerConfig] = useState(currentBannerConfig);
    const [imageBannerConfig, setImageBannerConfig] = useState(currentImageBannerConfig);
    const [logoConfig, setLogoConfig] = useState(currentLogoConfig);
    const [versionConfig, setVersionConfig] = useState(currentVersionConfig);
    const [ribbonConfig, setRibbonConfig] = useState(currentRibbonConfig);
    
    const logoInputRef = useRef<HTMLInputElement>(null);
    const imageBannerInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'banner') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'logo') {
                    setLogoConfig(prev => ({ ...prev, imageUrl: reader.result as string }));
                } else {
                    setImageBannerConfig(prev => ({ ...prev, imageUrl: reader.result as string }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRibbonChange = (field: keyof RibbonConfig, value: any) => {
        setRibbonConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleAppliesToChange = (value: 'current' | SubscriptionTier) => {
        const currentAppliesTo = ribbonConfig.appliesTo || [];
        const newAppliesTo = currentAppliesTo.includes(value)
            ? currentAppliesTo.filter(item => item !== value)
            : [...currentAppliesTo, value];
        handleRibbonChange('appliesTo', newAppliesTo);
    };
    
    const appliesToOptions: { value: 'current' | SubscriptionTier, label: string }[] = [
        { value: 'current', label: 'الخطة الحالية للمستخدم' },
        { value: 'free', label: 'خطة مجانية' },
        { value: 'basic', label: 'خطة أساسية' },
        { value: 'pro', label: 'خطة برو' },
    ];
    
    const platformMetrics = {
        'فيسبوك': ['silentViewingClarity', 'threeSecondHook', 'mobileFirstDesign', 'brandProminence', 'ctaClarity', 'feedAdAdaptation'],
        'انستغرام': ['verticalFormatAndImmersiveness', 'firstTwoSecondHook', 'soundStrategyEffectiveness', 'authenticityAndNativeFeel', 'interactiveElementsUsage', 'ctaEffectiveness'],
        'تيكتوك': ['ugcAuthenticity', 'trendingSoundEffectiveness', 'firstSecondImpact', 'nativeTextOverlay', 'viralityPotential', 'platformNativeFeel'],
        'يوتيوب': ['fiveSecondHook', 'valuePropositionClarity', 'pacingAndEngagement', 'audioVisualQuality', 'brandIntegrationEffectiveness', 'ctaStrength'],
        'إعلانات جوجل': ['formatSuitability', 'hookAndBranding', 'visualStorytelling', 'pacingAndStructure', 'ctaStrengthAndPlacement', 'audienceResonance'],
        'أمازون': ['productShowcaseClarity', 'benefitOrientedCopy', 'conversionFocus', 'trustAndCredibility', 'directnessOfMessage', 'customerProblemSolution', 'platformAlignment', 'policyCompliance'],
        'سنابشات': ['immediateImpact', 'verticalVideoFormat', 'soundOnExperience', 'authenticityAndRelatability', 'swipeUpEffectiveness', 'fastPacedEditing'],
    };

    const platforms = [
        { key: 'facebook', name: 'فيسبوك', Icon: FacebookIcon },
        { key: 'tiktok', name: 'تيكتوك', Icon: TikTokIcon },
        { key: 'instagram', name: 'انستغرام', Icon: InstagramIcon },
        { key: 'youtube', name: 'يوتيوب', Icon: YouTubeIcon },
        { key: 'google', name: 'إعلانات جوجل', Icon: GoogleIcon },
        { key: 'amazon', name: 'أمازون', Icon: AmazonIcon },
        { key: 'snapchat', name: 'سنابشات', Icon: SnapchatIcon },
    ];

    const tools = [
        { key: 'comparison', name: 'مقارنة الفيديوهات' },
        { key: 'pattern', name: 'كاشف الأنماط' },
        { key: 'campaign', name: 'تحليل النتائج' },
    ];

    const tabs = [
        { id: 'general', label: 'الإعدادات العامة' },
        { id: 'subscriptions', label: 'خطط الاشتراك' },
        { id: 'icons', label: 'الأيقونات' },
        { id: 'ribbon', label: 'شريط العروض' },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <Cog6ToothIcon className="w-8 h-8 text-violet-500" />
                    تخصيص واجهة المستخدم
                </h1>
                <p className="text-lg text-gray-500 mt-2">تحكم في مظهر ووظائف التطبيق للمستخدمين.</p>
            </div>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6 rtl:space-x-reverse" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`${
                                activeTab === tab.id
                                    ? 'border-violet-500 text-violet-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <h3 className="text-xl font-bold text-gray-700">الشعار والبانرات والإصدار</h3>
                         {/* Logo */}
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <label className="font-medium text-gray-700">شعار التطبيق:</label>
                            <div className="md:col-span-2 flex items-center gap-4">
                                <div className="w-32 h-12 flex items-center justify-center bg-gray-100 rounded-md overflow-hidden">
                                   {logoConfig.imageUrl ? (
                                        <img src={logoConfig.imageUrl} alt="preview" className="h-full object-contain"/>
                                   ) : (
                                        <span className="text-xs text-gray-400">لا يوجد شعار</span>
                                   )}
                                </div>
                                <input type="file" accept="image/*" ref={logoInputRef} onChange={(e) => handleFileChange(e, 'logo')} className="hidden"/>
                                <button onClick={() => logoInputRef.current?.click()} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-3 rounded-md">تغيير</button>
                                <button onClick={() => setLogoConfig({ imageUrl: '' })} className="text-sm text-red-500 hover:text-red-700">إزالة</button>
                            </div>
                         </div>
                         <div className="flex justify-end">
                            <button onClick={() => onLogoSave(logoConfig)} className="text-sm bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-lg">حفظ الشعار</button>
                        </div>

                        <hr className="border-gray-200" />
                        
                         {/* Text Banner */}
                         <div className="space-y-4">
                            <h4 className="font-medium text-gray-700">بانر نصي في لوحة التحكم:</h4>
                            <ToggleSwitch enabled={bannerConfig.isVisible} onChange={(e) => setBannerConfig(p => ({...p, isVisible: e}))} label="عرض البانر النصي" />
                            <textarea value={bannerConfig.message} onChange={(e) => setBannerConfig(p => ({...p, message: e.target.value}))} rows={2} className="w-full p-2 bg-gray-50 border border-gray-300 rounded-md" placeholder="اكتب رسالتك هنا..."/>
                            <div className="flex justify-end">
                                <button onClick={() => onBannerSave(bannerConfig)} className="text-sm bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-lg">حفظ البانر النصي</button>
                            </div>
                         </div>
                         
                         <hr className="border-gray-200" />
                         
                         {/* Image Banner */}
                         <div className="space-y-4">
                            <h4 className="font-medium text-gray-700">بانر صوري في لوحة التحكم:</h4>
                            <ToggleSwitch enabled={imageBannerConfig.isVisible} onChange={(e) => setImageBannerConfig(p => ({...p, isVisible: e}))} label="عرض البانر الصوري" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">رابط الصورة:</label>
                                     <div className="flex items-center gap-2 mt-1">
                                        <img src={imageBannerConfig.imageUrl} alt="preview" className="h-10 w-20 object-cover bg-gray-100 rounded"/>
                                        <input type="file" accept="image/*" ref={imageBannerInputRef} onChange={(e) => handleFileChange(e, 'banner')} className="hidden"/>
                                        <button onClick={() => imageBannerInputRef.current?.click()} className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-1 px-2 rounded-md">تغيير</button>
                                     </div>
                                </div>
                                 <div>
                                    <label className="text-sm font-medium text-gray-600">رابط الوجهة (عند النقر):</label>
                                    <input value={imageBannerConfig.linkUrl} onChange={(e) => setImageBannerConfig(p => ({...p, linkUrl: e.target.value}))} className="w-full mt-1 p-2 bg-gray-50 border border-gray-300 rounded-md" placeholder="https://example.com"/>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <button onClick={() => onImageBannerSave(imageBannerConfig)} className="text-sm bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-lg">حفظ البانر الصوري</button>
                            </div>
                         </div>
                         <hr className="border-gray-200" />
                        {/* App Version */}
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <label className="font-medium text-gray-700">رقم نسخة الأداة:</label>
                            <div className="md:col-span-2">
                                <input
                                    type="text"
                                    value={versionConfig.version}
                                    onChange={(e) => setVersionConfig({ version: e.target.value })}
                                    className="w-full max-w-xs p-2 bg-gray-50 border border-gray-300 rounded-md"
                                    placeholder="e.g., 1.0.1-beta"
                                />
                            </div>
                         </div>
                         <div className="flex justify-end">
                            <button onClick={() => onVersionSave(versionConfig)} className="text-sm bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-lg">حفظ رقم النسخة</button>
                        </div>
                    </div>
                )}
                {activeTab === 'subscriptions' && <AdminSubscriptionSettings addNotification={addNotification} />}
                {activeTab === 'icons' && (
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-700 mb-4">أيقونات المنصات والأدوات</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <h4 className="font-medium text-gray-600 mb-3">أيقونات المنصات</h4>
                                    <div className="space-y-3">
                                        {platforms.map(({key, name, Icon}) => (
                                            <div key={key} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <Icon className="w-6 h-6"/>
                                                    <span className="text-gray-700">{name}</span>
                                                </div>
                                                <select value={platformConfig[key]} onChange={e => setPlatformConfig(p => ({...p, [key]: e.target.value}))}
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-40 p-2"
                                                >
                                                    <option value="">Default Icon</option>
                                                    {iconNames.map(name => <option key={name} value={name}>{name}</option>)}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <button onClick={() => onPlatformSave(platformConfig)} className="text-sm bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-lg">حفظ أيقونات المنصات</button>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-600 mb-3">أيقونات الأدوات</h4>
                                    <div className="space-y-3">
                                        {tools.map(({key, name}) => (
                                            <div key={key} className="flex items-center justify-between">
                                                <span className="text-gray-700">{name}</span>
                                                <select value={toolConfig[key as keyof ToolIconConfig]} onChange={e => setToolConfig(p => ({...p, [key]: e.target.value as any}))}
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-40 p-2"
                                                >
                                                    {iconNames.map(name => <option key={name} value={name}>{name}</option>)}
                                                </select>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-end mt-4">
                                        <button onClick={() => onToolSave(toolConfig)} className="text-sm bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-lg">حفظ أيقونات الأدوات</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <hr/>
                        <div>
                             <h3 className="text-xl font-bold text-gray-700">أيقونات مقاييس التحليل</h3>
                              <div className="space-y-6 mt-4">
                                {Object.entries(platformMetrics).map(([platformName, metrics]) => (
                                    <div key={platformName} className="p-4 rounded-lg border border-gray-200">
                                        <h3 className="text-lg font-bold text-gray-700 mb-4">{platformName}</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                            {metrics.map(metricKey => {
                                                const IconComponent = iconMap[metricIconConfig[metricKey]];
                                                return (
                                                    <div key={metricKey} className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            {IconComponent && <IconComponent className="w-6 h-6 text-gray-500" />}
                                                            <span className="font-medium text-gray-600">{metricConfig[metricKey]?.label || metricKey}</span>
                                                        </div>
                                                        <select 
                                                            value={metricIconConfig[metricKey]} 
                                                            onChange={e => setMetricIconConfig(p => ({ ...p, [metricKey]: e.target.value }))}
                                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-violet-500 focus:border-violet-500 block w-40 p-2"
                                                        >
                                                            {iconNames.map(name => (
                                                                <option key={name} value={name}>{name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end mt-6">
                                <button 
                                    onClick={() => onMetricIconConfigSave(metricIconConfig)}
                                    className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                                >
                                    حفظ أيقونات المقاييس
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                 {activeTab === 'ribbon' && (
                     <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-700">تخصيص شريط العروض</h3>
                        <ToggleSwitch enabled={ribbonConfig.isEnabled} onChange={(e) => handleRibbonChange('isEnabled', e)} label="تفعيل الشريط" />
                        <div>
                            <label className="text-sm font-medium">نص الشريط</label>
                            <input type="text" value={ribbonConfig.text} onChange={e => handleRibbonChange('text', e.target.value)} className="w-full mt-1 p-2 bg-gray-50 border border-gray-300 rounded-md" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium">لون الخلفية</label>
                                <input type="color" value={ribbonConfig.backgroundColor} onChange={e => handleRibbonChange('backgroundColor', e.target.value)} className="w-full mt-1 p-1 h-10 bg-gray-50 border border-gray-300 rounded-md" />
                            </div>
                             <div>
                                <label className="text-sm font-medium">لون النص</label>
                                <input type="color" value={ribbonConfig.textColor} onChange={e => handleRibbonChange('textColor', e.target.value)} className="w-full mt-1 p-1 h-10 bg-gray-50 border border-gray-300 rounded-md" />
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">تطبيق الشريط على:</label>
                            <div className="flex flex-wrap gap-4 mt-2">
                                {appliesToOptions.map(opt => (
                                    <div key={opt.value} className="flex items-center">
                                        <input 
                                            type="checkbox" 
                                            id={`ribbon-${opt.value}`}
                                            checked={ribbonConfig.appliesTo.includes(opt.value)}
                                            onChange={() => handleAppliesToChange(opt.value)}
                                            className="h-4 w-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                                        />
                                        <label htmlFor={`ribbon-${opt.value}`} className="mr-2 text-sm text-gray-600">{opt.label}</label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-end mt-4">
                            <button onClick={() => onRibbonSave(ribbonConfig)} className="text-sm bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-4 rounded-lg">حفظ إعدادات الشريط</button>
                        </div>
                    </div>
                 )}
            </div>
        </div>
    );
};

export const AdminStrategicGuidance: React.FC<{
    currentData: TrainingData;
    onSave: (data: TrainingData) => void;
    metricConfig: MetricConfig;
}> = ({ currentData, onSave, metricConfig }) => {
    const [data, setData] = useState(currentData);

    const handleChange = (metric: string, type: 'positiveKeywords' | 'negativeKeywords', value: string) => {
        setData(prev => ({
            ...prev,
            [metric]: {
                ...prev[metric],
                [type]: value,
            }
        }));
    };
    
    const allMetrics = Object.keys(metricConfig);

    return (
        <div className="space-y-8 animate-fade-in">
             <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <MagnetIcon className="w-8 h-8 text-violet-500" />
                    التوجيه الاستراتيجي للذكاء الاصطناعي
                </h1>
                <p className="text-lg text-gray-500 mt-2">
                    قم بتوجيه نماذج التحليل عن طريق تحديد الكلمات الرئيسية الإيجابية والسلبية لكل مقياس. هذا يساعد في تحسين دقة وجودة التحليل بمرور الوقت.
                </p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {allMetrics.map(metric => (
                        <div key={metric} className="p-4 rounded-lg border border-gray-200">
                            <h3 className="font-bold text-gray-700 mb-3">{metricConfig[metric]?.label}</h3>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-sm font-semibold text-green-700">كلمات إيجابية (افصل بفاصلة)</label>
                                    <textarea
                                        value={data[metric]?.positiveKeywords || ''}
                                        onChange={e => handleChange(metric, 'positiveKeywords', e.target.value)}
                                        rows={3}
                                        className="w-full mt-1 p-2 bg-green-50 border border-green-200 rounded-md focus:ring-green-500 focus:border-green-500"
                                        placeholder="مثال: واضح، جذاب، سريع، مبتكر"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-red-700">كلمات سلبية (افصل بفاصلة)</label>
                                    <textarea
                                        value={data[metric]?.negativeKeywords || ''}
                                        onChange={e => handleChange(metric, 'negativeKeywords', e.target.value)}
                                        rows={3}
                                        className="w-full mt-1 p-2 bg-red-50 border border-red-200 rounded-md focus:ring-red-500 focus:border-red-500"
                                        placeholder="مثال: بطيء، ممل، غير واضح، تقليدي"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex justify-end">
                <button 
                    onClick={() => onSave(data)}
                    className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                >
                    حفظ التوجيهات
                </button>
            </div>
        </div>
    );
};

export const AdminWelcome: React.FC<{ user: User }> = ({ user }) => (
    <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-200 animate-fade-in">
        <h1 className="text-4xl font-bold text-gray-800">مرحباً بك في لوحة تحكم المشرف</h1>
        <p className="text-lg text-gray-500 mt-2">
            هنا يمكنك إدارة المستخدمين، وتخصيص واجهة التطبيق، ومراقبة النشاط العام.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 font-semibold px-4 py-2 rounded-full">
            <InformationCircleIcon className="w-5 h-5"/>
            <span>أنت حالياً في وضع المشرف.</span>
        </div>
    </div>
);


export const AdminOverview: React.FC<{ allUsers: User[], allHistory: (AnyHistoricAnalysisResult & { userEmail: string })[] }> = ({ allUsers, allHistory }) => {
    const totalUsers = allUsers.length;
    const totalAnalyses = allHistory.length;

    const subscriptionDistribution = useMemo(() => {
        const counts = allUsers.reduce((acc, user) => {
            acc[user.subscriptionTier] = (acc[user.subscriptionTier] || 0) + 1;
            return acc;
        }, {} as Record<SubscriptionTier, number>);
        
        const colors: Record<SubscriptionTier, string> = { free: 'gray', basic: 'violet', pro: 'indigo' };
        
        return Object.entries(counts).map(([tier, count]) => ({
            label: getTierName(tier as SubscriptionTier),
            value: count,
            color: colors[tier as SubscriptionTier]
        }));
    }, [allUsers]);

    return (
        <div className="space-y-8 animate-fade-in">
             <div>
                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                    <ChartPieIcon className="w-8 h-8 text-violet-500" />
                    النظرة العامة
                </h1>
                <p className="text-lg text-gray-500 mt-2">إحصاءات رئيسية حول استخدام التطبيق.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="إجمالي المستخدمين" value={totalUsers} icon={<UsersIcon className="w-6 h-6" />} color="blue" />
                <StatCard title="إجمالي التحليلات" value={totalAnalyses} icon={<ClipboardDocumentListIcon className="w-6 h-6" />} color="green" />
                <DistributionChart data={subscriptionDistribution} title="توزيع الاشتراكات" />
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h3 className="text-xl font-bold text-gray-700 mb-4">آخر التحليلات</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">المستخدم</th>
                                <th scope="col" className="px-6 py-3">نوع التحليل</th>
                                <th scope="col" className="px-6 py-3">اسم الملف</th>
                                <th scope="col" className="px-6 py-3">التاريخ</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allHistory.slice(0, 10).map(item => (
                                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{item.userEmail}</td>
                                    <td className="px-6 py-4">{item.type}</td>
                                    <td className="px-6 py-4">{item.fileName}</td>
                                    <td className="px-6 py-4">{new Date(item.timestamp).toLocaleString('ar-EG')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
