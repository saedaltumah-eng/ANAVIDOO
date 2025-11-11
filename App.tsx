import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { 
    AnalysisCategory, User, AnyHistoricAnalysisResult, ChatMessage, SubscriptionTier,
    PatternAnalysisResult, HistoricPatternAnalysisResult, 
    CampaignAnalysisResult, HistoricCampaignAnalysisResult, HistoricFacebookAnalysisResult, HistoricTikTokAnalysisResult, 
    HistoricAmazonAnalysisResult, HistoricSnapchatAnalysisResult, FacebookAnalysisMetrics, TikTokAnalysisMetrics, 
    AmazonAnalysisMetrics, SnapchatAnalysisMetrics, ComparisonAnalysisResult, HistoricComparisonAnalysisResult,
    YouTubeAnalysisMetrics, HistoricYouTubeAnalysisResult,
    InstagramAnalysisMetrics, HistoricInstagramAnalysisResult,
    GoogleAnalysisMetrics, HistoricGoogleAnalysisResult,
    MetricConfig,
    PlatformIconConfig,
    ToolIconConfig,
    TrainingData,
    BannerConfig,
    ImageBannerConfig,
    LogoConfig,
    VersionConfig,
    RibbonConfig
} from './types';
import { analyzePatterns, analyzeCampaignResults, analyzeFacebookVideo, analyzeTikTokVideo, analyzeAmazonVideo, analyzeSnapchatVideo, analyzeYouTubeVideo, analyzeInstagramVideo, analyzeGoogleVideo, compareVideos, continueChat } from './services/geminiService';
import Loader from './components/Loader';
import Tooltip from './components/Tooltip';
import Auth from './components/Auth';
import Settings from './components/Settings';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Tools from './components/Tools';
import Notification from './components/Notification';
import Chat from './components/Chat';
import UpgradeModal from './components/UpgradeModal';
import AnalysisModal from './components/AnalysisModal';
import { AdminWelcome, AdminOverview, AdminCustomizeUI, AdminStrategicGuidance } from './components/AdminDashboard';
import * as authService from './services/authService';
import { 
    UploadIcon, LightBulbIcon, XCircleIcon, MusicNoteIcon, FaceSmileIcon, 
    PaintBrushIcon, PencilSquareIcon, TagIcon, TargetIcon, 
    VideoCameraIcon, CursorArrowRaysIcon, SparklesIcon,
    ArrowDownTrayIcon, PuzzlePieceIcon, DocumentTextIcon, FilmIcon,
    ScaleIcon, TrophyIcon, ShieldExclamationIcon,
    Bars3Icon, XMarkIcon, Cog6ToothIcon, ClipboardDocumentListIcon,
    UserCircleIcon, ArrowRightOnRectangleIcon, ArchiveBoxIcon, HomeIcon,
    EyeIcon, SpeakerWaveIcon, ChatBubbleBottomCenterTextIcon, ClockIcon, BoltIcon, Square3Stack3DIcon,
    CheckBadgeIcon, ChartPieIcon, PhotoIcon, FacebookIcon, TikTokIcon, AmazonIcon, SnapchatIcon, ArrowsRightLeftIcon,
    MagicWandIcon, ChatBubbleLeftRightIcon, LockClosedIcon, MagnetIcon,
    // FIX: Import InformationCircleIcon to resolve 'Cannot find name' error.
    InformationCircleIcon,
    iconMap
} from './components/icons';

interface NotificationType {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}


declare const jspdf: any;
declare const html2canvas: any;

const FRAME_EXTRACT_INTERVAL = 1; // Extract one frame per second

const METRIC_CONFIG: MetricConfig = {
  // Facebook
  silentViewingClarity: { label: 'وضوح العرض الصامت', tooltip: 'هل يمكن فهم الإعلان بالكامل وجذب الانتباه بدون صوت؟' },
  threeSecondHook: { label: 'خطاف الثلاث ثواني', tooltip: 'هل يوقف الإعلان التمرير في أول 3 ثوانٍ؟' },
  mobileFirstDesign: { label: 'تصميم الجوال أولاً', tooltip: 'هل الفيديو مصمم للعرض العمودي والنصوص واضحة على شاشة صغيرة؟' },
  brandProminence: { label: 'بروز العلامة التجارية', tooltip: 'هل تظهر العلامة التجارية أو المنتج بوضوح في الثواني الأولى؟' },
  ctaClarity: { label: 'وضوح الدعوة للإجراء', tooltip: 'هل الـ CTA واضح ومباشر في بيئة المشاهدة الصامتة؟' },
  feedAdAdaptation: { label: 'التوافق مع الخلاصة', tooltip: 'هل يبرز الإعلان في خلاصة (Feed) مزدحمة بصرياً؟' },
  // Instagram
  verticalFormatAndImmersiveness: { label: 'التنسيق العمودي الغامر', tooltip: 'هل الفيديو مصمم بنسبة 9:16 ليملأ الشاشة بالكامل ويجذب الانتباه؟' },
  firstTwoSecondHook: { label: 'خطاف أول ثانيتين', tooltip: 'هل الإعلان يجذب الانتباه فورًا خلال أول ثانيتين لمنع التخطي السريع؟' },
  soundStrategyEffectiveness: { label: 'استراتيجية الصوت', tooltip: 'هل الصوت (موسيقى، تعليق) يعزز التجربة؟ وهل يمكن فهم الرسالة بدون صوت؟' },
  authenticityAndNativeFeel: { label: 'الأصالة والشعور الأصلي', tooltip: 'هل يبدو الإعلان كمحتوى أصلي من صانع محتوى بدلاً من كونه إعلانًا مصقولًا؟' },
  interactiveElementsUsage: { label: 'استخدام العناصر التفاعلية', tooltip: 'هل يوحي الإعلان باستخدام ملصقات تفاعلية (استطلاع، سؤال) لزيادة المشاركة؟' },
  ctaEffectiveness: { label: 'فعالية الدعوة للإجراء', tooltip: 'هل الدعوة لاتخاذ إجراء واضحة ومناسبة للصيغة (مثل السحب لأعلى في القصص)؟' },
  // TikTok
  ugcAuthenticity: { label: 'أصالة محتوى UGC', tooltip: 'هل يبدو الفيديو كمحتوى أصلي مصور بالهاتف (UGC)؟' },
  trendingSoundEffectiveness: { label: 'فعالية الصوت الرائج', tooltip: 'هل الصوت المستخدم هو صوت رائج حالياً وهل يتزامن مع المشاهد؟' },
  firstSecondImpact: { label: 'تأثير الثانية الأولى', tooltip: 'هل الثانية الأولى صادمة، غير متوقعة، أو تثير الفضول فوراً؟' },
  nativeTextOverlay: { label: 'استخدام النصوص الأصلية', tooltip: 'هل النصوص على الشاشة تستخدم أسلوب تيك توك الأصلي (الخط، الموضع، الألوان)؟' },
  viralityPotential: { label: 'إمكانية الانتشار', tooltip: 'هل يحتوي الفيديو على عناصر يمكن أن تجعله فيروسياً (فكاهة، تحدي، محتوى مفيد)؟' },
  platformNativeFeel: { label: 'الشعور الأصلي للمنصة', tooltip: 'هل يبدو الإعلان كأنه "ينتمي" إلى صفحة "لك"، أم أنه يصرخ "أنا إعلان"؟' },
  // Amazon
  productShowcaseClarity: { label: 'وضوح عرض المنتج', tooltip: 'هل المنتج هو البطل؟ هل يتم عرضه بوضوح وهو قيد الاستخدام؟' },
  benefitOrientedCopy: { label: 'نص يركز على الفوائد', tooltip: 'هل النصوص تركز على كيف يحل المنتج مشكلة العميل بدلاً من سرد الميزات؟' },
  conversionFocus: { label: 'التركيز على التحويل', tooltip: 'هل كل عنصر في الإعلان يخدم هدفاً واحداً وهو دفع المشاهد للشراء؟' },
  trustAndCredibility: { label: 'الثقة والمصداقية', tooltip: 'هل جودة الإنتاج احترافية وتبني الثقة؟' },
  directnessOfMessage: { label: 'مباشرة الرسالة', tooltip: 'هل الرسالة واضحة ومباشرة بدون أي غموض؟' },
  customerProblemSolution: { label: 'حل مشكلة العميل', tooltip: 'هل يتبع الإعلان مسار "مشكلة -> حل (المنتج) -> نتيجة إيجابية"؟' },
  platformAlignment: { label: 'توافق المنصة', tooltip: "تقييم مدى توافق الإعلان مع أفضل الممارسات للمنصة المستهدفة، مثل الأبعاد، والإيقاع، ونمط المحتوى." },
  policyCompliance: { label: 'الامتثال للسياسات', tooltip: "تقييم مدى التزام الإعلان بسياسات أمازون الإعلانية الصارمة، وتجنب الانتهاكات الشائعة مثل استخدام مراجعات العملاء، أو ذكر الأسعار، أو تقديم ادعاءات غير مدعومة." },
  // Snapchat
  immediateImpact: { label: 'التأثير الفوري', tooltip: 'هل الثواني 1-2 الأولى صادمة بصرياً أو سمعياً وتجبر على التوقف؟' },
  verticalVideoFormat: { label: 'صيغة الفيديو العمودي', tooltip: 'هل الفيديو مصمم بنسبة 9:16 ويملأ الشاشة بالكامل بشكل جذاب؟' },
  soundOnExperience: { label: 'تجربة الصوت', tooltip: 'هل الصوت ملفت للانتباه ويضيف قيمة فورية؟' },
  authenticityAndRelatability: { label: 'الأصالة والارتباط', tooltip: 'هل يبدو الإعلان كمحتوى أصلي من صديق أو صانع محتوى على سناب شات؟' },
  swipeUpEffectiveness: { label: 'فعالية السحب لأعلى', tooltip: 'هل هناك دعوة واضحة ومبكرة ومقنعة للسحب لأعلى (Swipe Up)؟' },
  fastPacedEditing: { label: 'المونتاج السريع', tooltip: 'هل المونتاج سريع جداً ومليء بالقطعات والانتقالات للحفاظ على الانتباه؟' },
  // YouTube
  fiveSecondHook: { label: 'خطاف الخمس ثواني', tooltip: 'هل الثواني الخمس الأولى تجذب الانتباه بقوة وتجعل المشاهد يتردد في تخطي الإعلان؟' },
  valuePropositionClarity: { label: 'وضوح القيمة المقدمة', tooltip: 'هل يفهم المشاهد بسرعة (خلال 5-10 ثوانٍ) ما هو المنتج أو الخدمة وما هي الفائدة التي سيحصل عليها؟' },
  pacingAndEngagement: { label: 'الإيقاع والتفاعل', tooltip: 'بعد الثواني الخمس الأولى، هل يحافظ الإعلان على اهتمام المشاهد؟' },
  audioVisualQuality: { label: 'جودة الصوت والصورة', tooltip: 'هل جودة الفيديو والصوت احترافية ومناسبة ليوتيوب؟' },
  brandIntegrationEffectiveness: { label: 'فعالية دمج العلامة التجارية', tooltip: 'هل يتم دمج العلامة التجارية بشكل طبيعي وفعال في الثواني الخمس الأولى؟' },
  ctaStrength: { label: 'قوة الدعوة للإجراء', tooltip: 'هل الدعوة لاتخاذ إجراء واضحة ومقنعة؟' },
  // Google Ads
  formatSuitability: { label: 'ملائمة الصيغة', tooltip: 'هل بنية الإعلان مناسبة للصيغ المحتملة (In-Stream, In-Feed, Bumper)؟' },
  hookAndBranding: { label: 'الجذب والعلامة التجارية (أول 5 ثوانٍ)', tooltip: 'هل يجذب الإعلان الانتباه فورًا ويبرز العلامة التجارية بوضوح؟ (Attract & Brand)' },
  visualStorytelling: { label: 'التواصل وسرد القصص', tooltip: 'هل يتواصل الإعلان مع المشاهد عاطفيًا أو يروي قصة بصرية؟ (Connect)' },
  pacingAndStructure: { label: 'الإيقاع والبنية', tooltip: 'هل يحافظ الإعلان على اهتمام المشاهد من خلال إيقاع جيد وبنية سردية واضحة؟' },
  ctaStrengthAndPlacement: { label: 'قوة وموضع الدعوة للإجراء', tooltip: 'هل الدعوة لاتخاذ إجراء واضحة، مقنعة، وموجودة في الوقت المناسب؟ (Direct)' },
  audienceResonance: { label: 'رنين الجمهور', tooltip: 'هل يبدو أن الرسالة والمحتوى مصممان للتحدث مباشرة إلى جمهور معين؟' },
};

const CircularProgress: React.FC<{ score: number }> = ({ score }) => {
    const percentage = score * 10;
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percentage / 100) * circumference;
    
    const scoreColor = score < 5 ? 'text-red-500' : score < 8 ? 'text-yellow-500' : 'text-green-500';
    const trackColor = score < 5 ? 'text-red-200' : score < 8 ? 'text-yellow-200' : 'text-green-200';

    return (
        <div className="relative flex items-center justify-center w-32 h-32 flex-shrink-0">
            <svg className="absolute w-full h-full" viewBox="0 0 120 120">
                <circle
                    className={`stroke-current ${trackColor}`}
                    strokeWidth="8"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                />
                <circle
                    className={`stroke-current ${scoreColor} transition-all duration-500`}
                    strokeWidth="8"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx="60"
                    cy="60"
                    transform="rotate(-90 60 60)"
                />
            </svg>
            <span className={`text-4xl font-bold ${scoreColor}`}>{score.toFixed(1)}</span>
        </div>
    );
};

interface MetricDetailViewProps {
  title: string;
  data: AnalysisCategory;
  averageScore?: number;
  tooltipText?: string;
  isExporting?: boolean;
}
const MetricDetailView: React.FC<MetricDetailViewProps> = ({ title, data, averageScore, tooltipText, isExporting }) => {
    const { score, analysis } = data;

    const comparison = averageScore !== undefined && averageScore > 0 ? {
        diff: score - averageScore,
        avg: averageScore.toFixed(1)
    } : null;

    return (
        <div className={`p-6 md:p-8 ${isExporting ? 'border-b border-gray-200 last:border-b-0' : ''}`}>
             <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 mb-6">
                <CircularProgress score={score} />
                 <div className="flex-grow text-center md:text-right">
                    <div className="flex items-center justify-center md:justify-start mb-2">
                        <h3 className="text-4xl font-bold text-gray-800">
                            {tooltipText && !isExporting ? (
                                <Tooltip text={tooltipText}>
                                    <span className="border-b border-dotted border-gray-400 cursor-help">{title}</span>
                                </Tooltip>
                            ) : (
                                title
                            )}
                        </h3>
                    </div>
                    {comparison && (
                        <div className={`text-sm flex items-center justify-center md:justify-start gap-1 mt-1 ${comparison.diff > 0.1 ? 'text-green-500' : comparison.diff < -0.1 ? 'text-red-500' : 'text-gray-500'}`}>
                           {comparison.diff > 0.1 ? '▲' : comparison.diff < -0.1 ? '▼' : '~'}
                           <span>{Math.abs(comparison.diff).toFixed(1)} مقابل متوسط ({comparison.avg})</span>
                        </div>
                    )}
                 </div>
            </div>
            
            <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                <h4 className="font-bold text-gray-700">التحليل التفصيلي:</h4>
                <ul className="list-disc pr-5 space-y-2">
                  {analysis.split('- ').filter(item => item.trim() !== '').map((item, index) => (
                    <li key={index}>{item.trim()}</li>
                  ))}
                </ul>
            </div>
        </div>
    );
};


interface InfoCardProps {
    title: string;
    text: string;
    icon: React.ReactNode;
    tooltipText?: string;
    isExporting?: boolean;
    gradient?: string;
}
const InfoCard: React.FC<InfoCardProps> = ({ title, text, icon, tooltipText, isExporting, gradient }) => {
    const isLightGradient = gradient && (gradient.includes('-50') || gradient.includes('-100'));

    const baseClasses = `rounded-xl p-6 h-full transition-all duration-300`;
    const interactiveClasses = !isExporting ? 'shadow-sm hover:shadow-lg' : '';
    const backgroundClasses = gradient 
        ? `bg-gradient-to-br ${gradient}` 
        : `bg-white border border-gray-200`;
    
    const titleColor = isLightGradient ? 'text-gray-800' : gradient ? 'text-white' : 'text-gray-800';
    const textColor = isLightGradient ? 'text-gray-600' : gradient ? 'text-white/90' : 'text-gray-600';
    
    let specificIconColor = '';
    if (isLightGradient) {
        if (gradient.includes('red')) specificIconColor = 'text-red-600';
        else if (gradient.includes('green')) specificIconColor = 'text-green-600';
        else if (gradient.includes('blue')) specificIconColor = 'text-blue-600';
        else if (gradient.includes('yellow')) specificIconColor = 'text-yellow-600';
        else if (gradient.includes('indigo')) specificIconColor = 'text-indigo-600';
        else if (gradient.includes('violet')) specificIconColor = 'text-violet-600';
        else specificIconColor = 'text-gray-700';
    }
    const iconColor = specificIconColor ? specificIconColor : gradient ? 'text-white' : 'text-violet-600';

    return (
        <div className={`${baseClasses} ${interactiveClasses} ${backgroundClasses}`}>
            <div className="flex items-center mb-3">
                <div className={`w-8 h-8 ${iconColor} mr-3 flex-shrink-0`}>{icon}</div>
                <h3 className={`text-lg font-semibold ${titleColor}`}>
                    {tooltipText && !isExporting ? (
                        <Tooltip text={tooltipText}>
                            <span className="border-b border-dotted border-gray-400 cursor-help">{title}</span>
                        </Tooltip>
                    ) : (
                        title
                    )}
                </h3>
            </div>
            <ul className={`${textColor} leading-relaxed text-right w-full list-disc pr-5 space-y-1`}>
                {text.split('- ').filter(item => item.trim() !== '').map((item, index) => (
                <li key={index}>{item.trim()}</li>
                ))}
            </ul>
        </div>
    );
};

const facebookObjectiveOptions = [
    { id: 'Conversions/Sales', label: 'تحقيق مبيعات' },
    { id: 'Lead Generation', label: 'جذب عملاء محتملين' },
    { id: 'Traffic', label: 'زيارات للموقع' },
    { id: 'Engagement', label: 'تفاعل مع المنشور' },
    { id: 'Brand Awareness', label: 'وعي بالعلامة التجارية' },
];

const facebookAudienceOptions = [
    { id: 'Broad', label: 'جمهور واسع' },
    { id: 'Interest-based', label: 'جمهور قائم على الاهتمامات' },
    { id: 'Lookalike', label: 'جمهور مشابه' },
    { id: 'Retargeting', label: 'إعادة استهداف' },
];

const facebookAdTypeOptions = [
    { id: 'UGC Style', label: 'أسلوب محتوى المستخدم' },
    { id: 'Product Demo', label: 'عرض للمنتج' },
    { id: 'Testimonial', label: 'شهادة عميل' },
    { id: 'Unboxing', label: 'فتح صندوق' },
    { id: 'Educational', label: 'تعليمي/شرح' },
];

const facebookAdFormatOptions = [
    { id: 'Reel', label: 'ريل (Reel)' },
    { id: 'Story', label: 'قصة (Story)' },
    { id: 'In-Feed Video', label: 'فيديو في الخلاصة (Feed)' },
    { id: 'In-Stream Video', label: 'فيديو ضمن البث (In-Stream)' },
];

const instagramObjectiveOptions = [
    { id: 'Sales', label: 'مبيعات' },
    { id: 'Reach', label: 'الوصول' },
    { id: 'Brand Awareness', label: 'وعي بالعلامة التجارية' },
    { id: 'Traffic', label: 'زيارات للموقع' },
    { id: 'Engagement', label: 'تفاعل' },
];

const instagramAdFormatOptions = [
    { id: 'Reel Ad', label: 'إعلان ريل (Reel)' },
    { id: 'Story Ad', label: 'إعلان قصة (Story)' },
    { id: 'In-Feed Video Ad', label: 'إعلان فيديو في الخلاصة' },
];

const tiktokObjectiveOptions = [
    { id: 'Reach', label: 'الوصول (Reach)' },
    { id: 'Video Views', label: 'مشاهدات الفيديو' },
    { id: 'Traffic', label: 'زيارات للموقع' },
    { id: 'Conversions', label: 'تحويلات (Conversions)' },
    { id: 'Spark Ad Promotion', label: 'ترويج Spark Ad' },
];

const tiktokAudienceOptions = [
    { id: 'Broad', label: 'جمهور واسع' },
    { id: 'Interest-based', label: 'قائم على الاهتمامات' },
    { id: 'Lookalike', label: 'جمهور مشابه' },
    { id: 'Retargeting', label: 'إعادة استهداف' },
];

const tiktokVideoStyleOptions = [
    { id: 'UGC', label: 'أسلوب محتوى المستخدم (UGC)' },
    { id: 'Trending Format', label: 'صيغة رائجة (Trend)' },
    { id: 'Educational/How-to', label: 'تعليمي / كيف' },
    { id: 'Product Demo', label: 'عرض للمنتج' },
    { id: 'Brand Story', label: 'قصة علامة تجارية' },
];

const tiktokTrendingSoundOptions = [
    { id: 'Yes, relevant to the ad', label: 'نعم، وهو ملائم' },
    { id: 'Yes, but not relevant', label: 'نعم، ولكنه غير ملائم' },
    { id: 'No, using custom/original sound', label: 'لا، أستخدم صوتاً أصلياً' },
];

const amazonObjectiveOptions = [
    { id: 'Sales/Conversions', label: 'مبيعات / تحويلات' },
    { id: 'Brand Awareness', label: 'وعي بالعلامة التجارية' },
    { id: 'Consideration', label: 'زيادة الاهتمام' },
];

const amazonProductCategoryOptions = [
    { id: 'Electronics', label: 'إلكترونيات' },
    { id: 'Fashion', label: 'أزياء' },
    { id: 'Home Goods', label: 'مستلزمات منزلية' },
    { id: 'Beauty', label: 'جمال وعناية' },
    { id: 'Groceries', label: 'بقالة' },
    { id: 'Other', label: 'أخرى' },
];

const snapchatObjectiveOptions = [
    { id: 'Awareness', label: 'الوعي' },
    { id: 'App Installs', label: 'تثبيت التطبيق' },
    { id: 'Drive Traffic', label: 'زيارات للموقع' },
    { id: 'Engagement', label: 'تفاعل' },
    { id: 'Conversions', label: 'تحويلات' },
];

const snapchatAdFormatOptions = [
    { id: 'Snap Ad', label: 'إعلان سناب (فيديو واحد)' },
    { id: 'Story Ad', label: 'إعلان قصة' },
    { id: 'Collection Ad', label: 'إعلان مجموعة' },
];

const youtubeObjectiveOptions = [
    { id: 'Sales', label: 'مبيعات' },
    { id: 'Leads', label: 'عملاء محتملين' },
    { id: 'Website traffic', label: 'زيارات للموقع' },
    { id: 'Product and brand consideration', label: 'الاهتمام بالمنتج والعلامة التجارية' },
    { id: 'Brand awareness and reach', label: 'الوعي بالعلامة التجارية والوصول' },
];

const youtubeAdFormatOptions = [
    { id: 'Skippable in-stream', label: 'إعلان ضمن البث قابل للتخطي' },
    { id: 'Non-skippable in-stream', label: 'إعلان ضمن البث غير قابل للتخطي' },
    { id: 'In-feed video', label: 'إعلان فيديو ضمن الخلاصة' },
    { id: 'Bumper', label: 'إعلان Bumper' },
];

const googleObjectiveOptions = [
    { id: 'Sales', label: 'مبيعات' },
    { id: 'Leads', label: 'عملاء محتملين' },
    { id: 'Website traffic', label: 'زيارات للموقع' },
    { id: 'Brand awareness and reach', label: 'الوعي بالعلامة التجارية والوصول' },
];

const googleAdNetworkOptions = [
    { id: 'YouTube', label: 'يوتيوب' },
    { id: 'Google Video Partners', label: 'شركاء جوجل للفيديو' },
    { id: 'Both', label: 'كلاهما' },
];


const SelectionGrid = ({ options, selectedValue, onSelect, label }: {
  options: { id: string, label: string }[];
  selectedValue: string;
  onSelect: (value: string) => void;
  label: React.ReactNode;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-600 mb-2">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map(option => (
        <button
          key={option.id}
          type="button"
          onClick={() => onSelect(option.id)}
          className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-200 border-2 ${
            selectedValue === option.id
              ? 'bg-violet-600 text-white border-violet-600 shadow-md'
              : 'bg-white text-gray-700 border-gray-300 hover:border-violet-400 hover:text-violet-600'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

const App: React.FC = () => {
  type AnalysisType = 'pattern' | 'campaign' | 'facebook' | 'tiktok' | 'amazon' | 'snapchat' | 'comparison' | 'youtube' | 'instagram' | 'google';
  type View = 'dashboard' | 'history' | 'analyzer' | 'settings' | 'tools';
  type AdminSubView = 'welcome' | 'overview' | 'customizeUI' | 'strategicGuidance';
  
  const [view, setView] = useState<View>('dashboard');
  const [analysisType, setAnalysisType] = useState<AnalysisType | null>(null);
  
  // Single analysis state (used by platform-specific analyses)
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [resultThumbnail, setResultThumbnail] = useState<string | null>(null);

  // Facebook analysis state
  const [facebookAnalysisResult, setFacebookAnalysisResult] = useState<FacebookAnalysisMetrics | null>(null);
  const [facebookObjective, setFacebookObjective] = useState('');
  const [facebookAudience, setFacebookAudience] = useState('');
  const [facebookAdType, setFacebookAdType] = useState('');
  const [facebookAdFormat, setFacebookAdFormat] = useState('');

  // Instagram analysis state
  const [instagramAnalysisResult, setInstagramAnalysisResult] = useState<InstagramAnalysisMetrics | null>(null);
  const [instagramObjective, setInstagramObjective] = useState('');
  const [instagramAdFormat, setInstagramAdFormat] = useState('');

  // TikTok analysis state
  const [tiktokAnalysisResult, setTiktokAnalysisResult] = useState<TikTokAnalysisMetrics | null>(null);
  const [tiktokObjective, setTiktokObjective] = useState('');
  const [tiktokAudience, setTiktokAudience] = useState('');
  const [tiktokVideoStyle, setTiktokVideoStyle] = useState('');
  const [tiktokTrendingSoundUsage, setTiktokTrendingSoundUsage] = useState('');

  // Amazon analysis state
  const [amazonAnalysisResult, setAmazonAnalysisResult] = useState<AmazonAnalysisMetrics | null>(null);
  const [amazonObjective, setAmazonObjective] = useState('');
  const [amazonProductCategory, setAmazonProductCategory] = useState('');
  
  // Snapchat analysis state
  const [snapchatAnalysisResult, setSnapchatAnalysisResult] = useState<SnapchatAnalysisMetrics | null>(null);
  const [snapchatObjective, setSnapchatObjective] = useState('');
  const [snapchatAdFormat, setSnapchatAdFormat] = useState('');

  // YouTube analysis state
  const [youtubeAnalysisResult, setYoutubeAnalysisResult] = useState<YouTubeAnalysisMetrics | null>(null);
  const [youtubeObjective, setYoutubeObjective] = useState('');
  const [youtubeAdFormat, setYoutubeAdFormat] = useState('');
  
  // Google analysis state
  const [googleAnalysisResult, setGoogleAnalysisResult] = useState<GoogleAnalysisMetrics | null>(null);
  const [googleObjective, setGoogleObjective] = useState('');
  const [googleAdNetwork, setGoogleAdNetwork] = useState('');

  // Pattern analysis state
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [patternAnalysisResult, setPatternAnalysisResult] = useState<PatternAnalysisResult | null>(null);
  
  // Campaign analysis state
  const [campaignVideoFile, setCampaignVideoFile] = useState<File | null>(null);
  const [campaignVideoSrc, setCampaignVideoSrc] = useState<string | null>(null);
  const [campaignResultsMode, setCampaignResultsMode] = useState<'text' | 'image'>('text');
  const [campaignResultsText, setCampaignResultsText] = useState('');
  const [campaignResultsImage, setCampaignResultsImage] = useState<File | null>(null);
  const [campaignResultsImageSrc, setCampaignResultsImageSrc] = useState<string | null>(null);
  const [campaignAnalysisResult, setCampaignAnalysisResult] = useState<CampaignAnalysisResult | null>(null);

  // Comparison analysis state
  const [comparisonAnalysisResult, setComparisonAnalysisResult] = useState<ComparisonAnalysisResult | null>(null);
  const [comparisonVideo1, setComparisonVideo1] = useState<File | null>(null);
  const [comparisonVideo1Src, setComparisonVideo1Src] = useState<string | null>(null);
  const [comparisonVideo2, setComparisonVideo2] = useState<File | null>(null);
  const [comparisonVideo2Src, setComparisonVideo2Src] = useState<string | null>(null);
  const [comparisonThumb1, setComparisonThumb1] = useState<string | null>(null);
  const [comparisonThumb2, setComparisonThumb2] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState('overview');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportTrigger, setExportTrigger] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const [analysisHistory, setAnalysisHistory] = useState<AnyHistoricAnalysisResult[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);
  const campaignVideoInputRef = useRef<HTMLInputElement>(null);
  const campaignImageInputRef = useRef<HTMLInputElement>(null);
  const comparisonVideo1Ref = useRef<HTMLInputElement>(null);
  const comparisonVideo2Ref = useRef<HTMLInputElement>(null);

  const reportRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<{ message: string; reason: 'limit' | 'permission' } | null>(null);
  const [reanalysisTarget, setReanalysisTarget] = useState<string | null>(null);
  
  // Chat state
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatMinimized, setIsChatMinimized] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [showChatTooltip, setShowChatTooltip] = useState(false);
  const chatTooltipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Admin state
  const [isAdminView, setIsAdminView] = useState(false);
  const [adminSubView, setAdminSubView] = useState<AdminSubView>('welcome');
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allHistory, setAllHistory] = useState<(AnyHistoricAnalysisResult & { userEmail: string })[]>([]);
  const [iconConfig, setIconConfig] = useState<Record<string, string>>(() => authService.getIconConfig());
  const [platformIconConfig, setPlatformIconConfig] = useState<PlatformIconConfig>(() => authService.getPlatformIconConfig());
  const [toolIconConfig, setToolIconConfig] = useState<ToolIconConfig>(() => authService.getToolIconConfig());
  const [trainingData, setTrainingData] = useState<TrainingData>(() => authService.getTrainingData());
  const [bannerConfig, setBannerConfig] = useState<BannerConfig>(() => authService.getBannerConfig());
  const [imageBannerConfig, setImageBannerConfig] = useState<ImageBannerConfig>(() => authService.getImageBannerConfig());
  const [logoConfig, setLogoConfig] = useState<LogoConfig>(() => authService.getLogoConfig());
  const [versionConfig, setVersionConfig] = useState<VersionConfig>(() => authService.getVersionConfig());
  const [ribbonConfig, setRibbonConfig] = useState<RibbonConfig>(() => authService.getRibbonConfig());


  const handleRibbonConfigUpdate = (newConfig: RibbonConfig) => {
    authService.saveRibbonConfig(newConfig);
    setRibbonConfig(newConfig);
    addNotification('تم تحديث إعدادات شريط العروض بنجاح!', 'success');
  };

  const handleVersionConfigUpdate = (newConfig: VersionConfig) => {
    authService.saveVersionConfig(newConfig);
    setVersionConfig(newConfig);
    addNotification('تم تحديث رقم النسخة بنجاح!', 'success');
  };

  const handleLogoConfigUpdate = (newConfig: LogoConfig) => {
    authService.saveLogoConfig(newConfig);
    setLogoConfig(newConfig);
    addNotification('تم تحديث الشعار بنجاح!', 'success');
  };

  const handleBannerConfigUpdate = (newConfig: BannerConfig) => {
    authService.saveBannerConfig(newConfig);
    setBannerConfig(newConfig);
    addNotification('تم تحديث إعدادات البانر بنجاح!', 'success');
  };

  const handleImageBannerConfigUpdate = (newConfig: ImageBannerConfig) => {
    authService.saveImageBannerConfig(newConfig);
    setImageBannerConfig(newConfig);
    addNotification('تم تحديث إعدادات بانر الصورة بنجاح!', 'success');
  };

  const handleIconConfigUpdate = (newConfig: Record<string, string>) => {
    authService.saveIconConfig(newConfig);
    setIconConfig(newConfig);
    addNotification('تم تحديث إعدادات أيقونات التحليل بنجاح!', 'success');
  };
  
  const handlePlatformIconConfigUpdate = (newConfig: PlatformIconConfig) => {
    authService.savePlatformIconConfig(newConfig);
    setPlatformIconConfig(newConfig);
    addNotification('تم تحديث أيقونات المنصات بنجاح!', 'success');
  };

  const handleToolIconConfigUpdate = (newConfig: ToolIconConfig) => {
    authService.saveToolIconConfig(newConfig);
    setToolIconConfig(newConfig);
    addNotification('تم تحديث أيقونات الأدوات بنجاح!', 'success');
  };

  const handleTrainingDataUpdate = (newData: TrainingData) => {
    authService.saveTrainingData(newData);
    setTrainingData(newData);
    addNotification('تم حفظ المبادئ التوجيهية بنجاح!', 'success');
  };

  const removeNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const addNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => removeNotification(id), 5000);
  }, []);

  const triggerChatTooltip = () => {
    if (chatTooltipTimerRef.current) {
        clearTimeout(chatTooltipTimerRef.current);
    }
    setShowChatTooltip(true);
    chatTooltipTimerRef.current = setTimeout(() => {
        setShowChatTooltip(false);
    }, 10000); // Hide after 10 seconds
  };


  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
        setCurrentUser(user);
        setAnalysisHistory(authService.getHistoryForUser(user.email));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
            setIsProfileOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileRef]);

  const handleLoginSuccess = (user: User) => {
      setCurrentUser(user);
      setAnalysisHistory(authService.getHistoryForUser(user.email));
      addNotification(`أهلاً بك مجدداً، ${user.name || user.email}!`, 'success');
  };
  
  const handleUserUpdate = (user: User) => {
      setCurrentUser(user);
      setView('dashboard');
  }

  const handleLogout = () => {
      authService.logout();
      setCurrentUser(null);
      setAnalysisHistory([]);
      handleReset();
      setView('dashboard');
      setIsAdminView(false);
      addNotification('تم تسجيل الخروج بنجاح.', 'info');
  };

  const handleUpgrade = (tier: SubscriptionTier) => {
    if (!currentUser) return;
    try {
        const updatedUser = authService.updateSubscription(currentUser.email, tier);
        setCurrentUser(updatedUser);
        setIsUpgradeModalOpen(false);
        addNotification(`تمت الترقية إلى الخطة ${tier} بنجاح!`, 'success');
    } catch(err) {
        addNotification((err as Error).message, 'error');
    }
  };

  const handleOpenUpgradeModal = () => {
    setUpgradeReason(null);
    setIsUpgradeModalOpen(true);
  };

  const enterAdminView = () => {
    const users = authService.getAllUsers();
    const history = authService.getAllHistory();
    setAllUsers(users);
    setAllHistory(history);
    setIsAdminView(true);
    setAdminSubView('welcome');
  };

  const checkAndPerformAnalysis = async (analysisFn: () => Promise<void>, toolType: 'platform' | 'pattern' | 'campaign' | 'comparison') => {
    if (!currentUser) return;
    
    const permission = authService.canPerformAnalysis(currentUser.email, toolType);
    if (permission.canAnalyze === false) {
        setUpgradeReason({ message: permission.message, reason: permission.reason });
        setIsUpgradeModalOpen(true);
        return;
    }

    await analysisFn();
  };

  const averageScores = useMemo(() => {
    const currentResult = facebookAnalysisResult || tiktokAnalysisResult || amazonAnalysisResult || snapchatAnalysisResult || youtubeAnalysisResult || instagramAnalysisResult || googleAnalysisResult;
    if (!currentResult || !analysisType) return null;

    // FIX: Add a more robust filter to prevent errors from malformed history objects.
    const relevantHistory = analysisHistory.filter((h): h is AnyHistoricAnalysisResult => {
        // A robust check to ensure the history item is a valid object with a 'type' property that matches.
        // FIX: Resolve TypeScript error by using type-safe access after the 'in' operator check.
        return !!(h && typeof h === 'object' && 'type' in h && h.type === analysisType);
    });
    if (relevantHistory.length === 0) return null;

    const totals: { [key: string]: number } = {};
    const counts: { [key: string]: number } = {};

    for (const result of relevantHistory) {
        for (const key in result) {
            const category = (result as any)[key];
            if (category && typeof category === 'object' && 'score' in category && typeof category.score === 'number') {
                totals[key] = (totals[key] || 0) + category.score;
                counts[key] = (counts[key] || 0) + 1;
            }
        }
    }
    
    const averages: { [key: string]: number } = {};
    for (const key in totals) {
        averages[key] = totals[key] / counts[key];
    }

    return averages;
  }, [analysisHistory, analysisType, facebookAnalysisResult, tiktokAnalysisResult, amazonAnalysisResult, snapchatAnalysisResult, youtubeAnalysisResult, instagramAnalysisResult, googleAnalysisResult]);
  
  const currentAnalysisResult = useMemo(() => 
    facebookAnalysisResult || tiktokAnalysisResult || amazonAnalysisResult || snapchatAnalysisResult || youtubeAnalysisResult || instagramAnalysisResult || googleAnalysisResult || patternAnalysisResult || campaignAnalysisResult || comparisonAnalysisResult,
    [facebookAnalysisResult, tiktokAnalysisResult, amazonAnalysisResult, snapchatAnalysisResult, youtubeAnalysisResult, instagramAnalysisResult, googleAnalysisResult, patternAnalysisResult, campaignAnalysisResult, comparisonAnalysisResult]
  );
  
  const overallScore = useMemo(() => {
    if (!currentAnalysisResult) return 0;
    if (typeof currentAnalysisResult !== 'object' || currentAnalysisResult === null) return 0;
    const scores = Object.values(currentAnalysisResult)
        .filter((v): v is AnalysisCategory => typeof v === 'object' && v !== null && 'score' in v)
        .map(c => c.score);
    if (scores.length === 0) return 0;
    return scores.reduce((acc, score) => acc + score, 0) / scores.length;
  }, [currentAnalysisResult]);

  const analysisResultTabs = useMemo(() => {
    if (!currentAnalysisResult || !(['facebook', 'tiktok', 'amazon', 'snapchat', 'youtube', 'instagram', 'google'].includes(analysisType!))) return [];
    
    const metricKeys = Object.keys(currentAnalysisResult).filter(key => 
        typeof (currentAnalysisResult as any)[key] === 'object' && 
        (currentAnalysisResult as any)[key] !== null && 
        'score' in (currentAnalysisResult as any)[key]
    );

    const tabs = metricKeys.map(key => {
        const config = METRIC_CONFIG[key as keyof typeof METRIC_CONFIG];
        const iconName = iconConfig[key] || 'PuzzlePieceIcon';
        const IconComponent = iconMap[iconName];
        return {
            id: key,
            label: config ? config.label : key,
            icon: <IconComponent className="w-6 h-6"/>
        };
    });

    return [
        { id: 'overview', label: 'نظرة عامة', icon: <ClipboardDocumentListIcon className="w-6 h-6"/> },
        ...tabs
    ];
  }, [currentAnalysisResult, analysisType, iconConfig]);

  const handleStartAnalysis = (type: AnalysisType) => {
    type AnalysisToolType = 'pattern' | 'campaign' | 'comparison' | 'platform';
    const toolTypeMap: { [key in AnalysisType]: AnalysisToolType } = {
        'pattern': 'pattern', 'campaign': 'campaign', 'comparison': 'comparison',
        'facebook': 'platform', 'tiktok': 'platform', 'amazon': 'platform', 'snapchat': 'platform',
        'youtube': 'platform', 'instagram': 'platform', 'google': 'platform'
    };
    
    if (!currentUser) return;
    const permission = authService.canPerformAnalysis(currentUser.email, toolTypeMap[type]);
    if (permission.canAnalyze === false) {
        setUpgradeReason({ message: permission.message, reason: permission.reason });
        setIsUpgradeModalOpen(true);
        return;
    }

    handleReset();
    setAnalysisType(type);
    setView('analyzer');
  };

  const handleSelectAnalysis = (type: AnalysisType) => {
    handleStartAnalysis(type);
    setIsAnalysisModalOpen(false);
    if (reanalysisTarget) {
        addNotification(`لإعادة تحليل "${reanalysisTarget}" على المنصة الجديدة، يرجى رفع ملف الفيديو مرة أخرى.`, 'info');
        setReanalysisTarget(null);
    }
  };
  
  const handleViewHistoricReport = (report: AnyHistoricAnalysisResult) => {
    handleReset();
    
    // FIX: Add a type guard to ensure the report object is valid before accessing its properties.
    if (!report || typeof report !== 'object' || !('type' in report) || typeof report.type !== 'string') {
        addNotification('لا يمكن عرض التقرير المحدد لأنه تالف.', 'error');
        return;
    }
    setAnalysisType(report.type);
    setResultThumbnail(report.thumbnail || null);
    setChatMessages(report.chatHistory || []);
    setCurrentReportId(report.id);

    switch (report.type) {
        case 'facebook':
            setFacebookAnalysisResult(report);
            setFacebookObjective(report.objective);
            setFacebookAudience(report.audience);
            setFacebookAdType(report.adType);
            setFacebookAdFormat(report.adFormat);
            break;
        case 'instagram':
            setInstagramAnalysisResult(report);
            setInstagramObjective(report.objective);
            setInstagramAdFormat(report.adFormat);
            break;
        case 'tiktok':
            setTiktokAnalysisResult(report);
            setTiktokObjective(report.objective);
            setTiktokAudience(report.audience);
            setTiktokVideoStyle(report.videoStyle);
            setTiktokTrendingSoundUsage(report.trendingSoundUsage);
            break;
        case 'amazon':
            setAmazonAnalysisResult(report);
            setAmazonObjective(report.objective);
            setAmazonProductCategory(report.productCategory);
            break;
        case 'snapchat':
            setSnapchatAnalysisResult(report);
            setSnapchatObjective(report.objective);
            setSnapchatAdFormat(report.adFormat);
            break;
        case 'youtube':
            setYoutubeAnalysisResult(report);
            setYoutubeObjective(report.objective);
            setYoutubeAdFormat(report.adFormat);
            break;
        case 'google':
            setGoogleAnalysisResult(report);
            setGoogleObjective(report.objective);
            setGoogleAdNetwork(report.adNetwork);
            break;
        case 'pattern':
            setPatternAnalysisResult(report);
            break;
        case 'campaign':
            setCampaignAnalysisResult(report);
            break;
        case 'comparison':
            setComparisonAnalysisResult(report);
            setComparisonThumb1(report.thumbnail || null);
            setComparisonThumb2(report.thumbnail2 || null);
            break;
    }
    setView('analyzer');
  };

  const handleReanalyze = (report: AnyHistoricAnalysisResult) => {
    const singleVideoTypes = ['facebook', 'tiktok', 'amazon', 'snapchat', 'youtube', 'instagram', 'google'];
    if (singleVideoTypes.includes(report.type)) {
        setReanalysisTarget(report.fileName);
        setIsAnalysisModalOpen(true);
    } else {
        addNotification('إعادة التحليل متاحة فقط للتحليلات الفردية للفيديو.', 'info');
    }
  };

  const processSelectedFile = useCallback((file: File | null | undefined, videoSlot: 'Campaign' | 'comparison1' | 'comparison2' | null = null) => {
    if (file && file.type.startsWith('video/')) {
        const fileSrc = URL.createObjectURL(file);
        if (analysisType && ['facebook', 'tiktok', 'amazon', 'snapchat', 'youtube', 'instagram', 'google'].includes(analysisType)) {
            setVideoFile(file);
            setVideoSrc(fileSrc);
            setFacebookAnalysisResult(null);
            setInstagramAnalysisResult(null);
            setTiktokAnalysisResult(null);
            setAmazonAnalysisResult(null);
            setSnapchatAnalysisResult(null);
            setYoutubeAnalysisResult(null);
            setGoogleAnalysisResult(null);
            setActiveTab('overview');
        } else if (videoSlot === 'Campaign') {
            setCampaignVideoFile(file);
            setCampaignVideoSrc(fileSrc);
        } else if (videoSlot === 'comparison1') {
            setComparisonVideo1(file);
            setComparisonVideo1Src(fileSrc);
        } else if (videoSlot === 'comparison2') {
            setComparisonVideo2(file);
            setComparisonVideo2Src(fileSrc);
        }
    } else if (file) {
      addNotification("الرجاء تحديد ملف فيديو صالح.", 'error');
    }
  }, [analysisType, addNotification]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, videoSlot: 'Campaign' | 'comparison1' | 'comparison2' | null = null) => {
    processSelectedFile(event.target.files?.[0], videoSlot);
  };

  const handleCampaignImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const fileSrc = URL.createObjectURL(file);
        setCampaignResultsImage(file);
        setCampaignResultsImageSrc(fileSrc);
    } else {
        addNotification("الرجاء تحديد ملف صورة صالح (JPEG, PNG).", 'error');
    }
  };


  const handleMultipleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
        const videoFilesArray = Array.from(files).filter(file => file.type.startsWith('video/'));
        if (videoFilesArray.length > 0) {
            setVideoFiles(prev => [...prev, ...videoFilesArray]);
        } else {
            addNotification("لم يتم العثور على ملفات فيديو صالحة في اختيارك.", 'error');
        }
    }
  };

  const removeVideoFile = (index: number) => {
    setVideoFiles(prev => prev.filter((_, i) => i !== index));
  };


  const extractFrames = useCallback((videoUrl: string, interval: number, onProgress: (progress: number) => void): Promise<{ frames: string[], width: number, height: number }> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.crossOrigin = "anonymous";
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const frames: string[] = [];

      const onError = () => {
        URL.revokeObjectURL(video.src);
        let errorMsg = 'حدث خطأ أثناء تحميل الفيديو.';
        if (video.error) {
            switch (video.error.code) {
                case video.error.MEDIA_ERR_ABORTED:
                    errorMsg = 'تم إحباط تحميل الفيديو من قبل المستخدم.'; break;
                case video.error.MEDIA_ERR_NETWORK:
                    errorMsg = 'حدث خطأ في الشبكة أثناء جلب الفيديو.'; break;
                case video.error.MEDIA_ERR_DECODE:
                    errorMsg = 'لا يمكن فك تشفير الفيديو، أو أن التنسيق غير مدعوم.'; break;
                case video.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                    errorMsg = 'تنسيق الفيديو غير مدعوم.'; break;
                default:
                    errorMsg = 'حدث خطأ غير معروف أثناء تحميل الفيديو.';
            }
        }
        reject(new Error(errorMsg));
      };
      video.addEventListener('error', onError, { once: true });

      video.addEventListener('loadedmetadata', async () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        let duration = video.duration;
        if (!isFinite(duration) || duration === 0) {
            video.currentTime = 1e101; // Seek to a large value to find the end
            await new Promise<void>((r) => {
                const onTimeUpdate = () => {
                    video.removeEventListener('timeupdate', onTimeUpdate);
                    video.currentTime = 0;
                    duration = video.duration;
                    r();
                };
                video.addEventListener('timeupdate', onTimeUpdate, { once: true });
            });
        }
        
        const totalFrames = Math.floor(duration / interval);
        if (totalFrames <= 0) {
            URL.revokeObjectURL(video.src);
            reject(new Error("لا يمكن استخراج الإطارات. قد يكون الفيديو قصيرًا جدًا أو تالفًا."));
            return;
        }
        
        try {
            for (let i = 0; i < totalFrames; i++) {
                const time = i * interval;
                video.currentTime = time;
              
                await new Promise<void>((resolveSeek, rejectSeek) => {
                    const seekTimeout = setTimeout(() => rejectSeek(new Error(`تجاوزت مهلة البحث عند ${time.toFixed(2)} ثانية. الفيديو قد يكون تالفًا.`)), 5000);
                    const onSeeked = () => {
                        clearTimeout(seekTimeout);
                        resolveSeek();
                    };
                    video.addEventListener('seeked', onSeeked, { once: true });
                });

                if (context) {
                    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                    frames.push(dataUrl.split(',')[1]);
                }
                onProgress(((i + 1) / totalFrames) * 100);
            }
            URL.revokeObjectURL(video.src);
            resolve({ frames, width: video.videoWidth, height: video.videoHeight });
        } catch (err) {
            URL.revokeObjectURL(video.src);
            reject(err);
        }
      }, { once: true });

      video.src = videoUrl;
    });
  }, []);

  const audioBufferToWavBase64 = (buffer: AudioBuffer): string => {
        const numOfChan = buffer.numberOfChannels;
        const length = buffer.length * numOfChan * 2 + 44;
        const bufferArr = new ArrayBuffer(length);
        const view = new DataView(bufferArr);
        let pos = 0;

        const setUint16 = (data: number) => { view.setUint16(pos, data, true); pos += 2; }
        const setUint32 = (data: number) => { view.setUint32(pos, data, true); pos += 4; }

        setUint32(0x46464952); setUint32(length - 8); setUint32(0x45564157);
        setUint32(0x20746d66); setUint32(16); setUint16(1); setUint16(numOfChan);
        setUint32(buffer.sampleRate); setUint32(buffer.sampleRate * 2 * numOfChan);
        setUint16(numOfChan * 2); setUint16(16); setUint32(0x61746164); setUint32(length - pos - 4);
        
        const channels = Array.from({length: buffer.numberOfChannels}, (_, i) => buffer.getChannelData(i));
        let offset = 0;
        while (pos < length) {
            for (let i = 0; i < numOfChan; i++) {
                let sample = Math.max(-1, Math.min(1, channels[i][offset]));
                sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
                view.setInt16(pos, sample, true);
                pos += 2;
            }
            offset++;
        }
        
        return btoa(new Uint8Array(bufferArr).reduce((data, byte) => data + String.fromCharCode(byte), ''));
    };

    const extractAudio = useCallback(async (file: File): Promise<string> => {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const arrayBuffer = await file.arrayBuffer();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            return audioBufferToWavBase64(audioBuffer);
        } catch (error) {
            console.error("خطأ في فك تشفير بيانات الصوت:", error);
            addNotification("تعذر فك تشفير الصوت. سيستمر التحليل بناءً على المحتوى المرئي فقط.", 'info');
            return ""; // Return empty string to proceed without audio
        }
    }, [addNotification]);
    
    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = error => reject(error);
        });
    };

    const handleAnalyzeFacebookClick = async () => {
        if (!videoSrc || !videoFile || !currentUser || analysisType !== 'facebook') return;
        if (!facebookObjective || !facebookAudience || !facebookAdType || !facebookAdFormat) {
            addNotification("الرجاء تحديد جميع الخيارات المطلوبة.", 'error');
            return;
        }
        
        setIsLoading(true); setProgress(0);
        setFacebookAnalysisResult(null); 
        setActiveTab('overview');

        try {
            setLoadingMessage(`بدء استخراج الإطارات...`);
            const framesPromise = extractFrames(videoSrc, FRAME_EXTRACT_INTERVAL, (p) => setProgress(p));
    
            setLoadingMessage(`استخراج الصوت...`);
            const audioPromise = extractAudio(videoFile);
            
            const [{ frames, width, height }, audioBase64] = await Promise.all([framesPromise, audioPromise]);
            
            setProgress(0);
            setLoadingMessage(`تم الاستخراج، جاري تحليل إعلان فيسبوك...`);

            const result = await analyzeFacebookVideo(frames, audioBase64, facebookObjective, facebookAudience, facebookAdType, facebookAdFormat, width, height);
            setFacebookAnalysisResult(result);
            setResultThumbnail(frames[0]);
            
            const baseHistoricData = { id: `${Date.now()}-${videoFile.name}`, fileName: videoFile.name, timestamp: Date.now(), thumbnail: frames[0] };
            const newHistoricResult: HistoricFacebookAnalysisResult = { 
                ...baseHistoricData, 
                ...result, 
                type: 'facebook', 
                objective: facebookObjective, 
                audience: facebookAudience,
                adType: facebookAdType,
                adFormat: facebookAdFormat,
                chatHistory: [],
            };
            const newHistory = authService.saveHistoryForUser(currentUser.email, newHistoricResult);
            const updatedUser = authService.recordAnalysis(currentUser.email);
            setCurrentUser(updatedUser);
            setAnalysisHistory(newHistory);
            setCurrentReportId(newHistoricResult.id);
            setChatMessages([]);
            addNotification('تم تحليل إعلان فيسبوك بنجاح!', 'success');
            triggerChatTooltip();

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع.";
            addNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false); setLoadingMessage(''); setProgress(0);
        }
    };

    const handleAnalyzeInstagramClick = async () => {
        if (!videoSrc || !videoFile || !currentUser || analysisType !== 'instagram') return;
        if (!instagramObjective || !instagramAdFormat) {
            addNotification("الرجاء تحديد جميع الخيارات المطلوبة.", 'error');
            return;
        }
        
        setIsLoading(true); setProgress(0);
        setInstagramAnalysisResult(null); 
        setActiveTab('overview');

        try {
            setLoadingMessage(`بدء استخراج الإطارات...`);
            const framesPromise = extractFrames(videoSrc, FRAME_EXTRACT_INTERVAL, (p) => setProgress(p));
            const audioPromise = extractAudio(videoFile);
            const [{ frames, width, height }, audioBase64] = await Promise.all([framesPromise, audioPromise]);
            
            setProgress(0);
            setLoadingMessage(`تم الاستخراج، جاري تحليل إعلان انستغرام...`);

            const result = await analyzeInstagramVideo(frames, audioBase64, instagramObjective, instagramAdFormat, width, height);
            setInstagramAnalysisResult(result);
            setResultThumbnail(frames[0]);
            
            const baseHistoricData = { id: `${Date.now()}-${videoFile.name}`, fileName: videoFile.name, timestamp: Date.now(), thumbnail: frames[0] };
            const newHistoricResult: HistoricInstagramAnalysisResult = { 
                ...baseHistoricData, 
                ...result, 
                type: 'instagram', 
                objective: instagramObjective, 
                adFormat: instagramAdFormat,
                chatHistory: [],
            };
            const newHistory = authService.saveHistoryForUser(currentUser.email, newHistoricResult);
            const updatedUser = authService.recordAnalysis(currentUser.email);
            setCurrentUser(updatedUser);
            setAnalysisHistory(newHistory);
            setCurrentReportId(newHistoricResult.id);
            setChatMessages([]);
            addNotification('تم تحليل إعلان انستغرام بنجاح!', 'success');
            triggerChatTooltip();

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع.";
            addNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false); setLoadingMessage(''); setProgress(0);
        }
    };

    const handleAnalyzeTikTokClick = async () => {
        if (!videoSrc || !videoFile || !currentUser || analysisType !== 'tiktok') return;
        if (!tiktokObjective || !tiktokAudience || !tiktokVideoStyle || !tiktokTrendingSoundUsage) {
            addNotification("الرجاء تحديد جميع الخيارات المطلوبة.", 'error');
            return;
        }
        
        setIsLoading(true); setProgress(0);
        setTiktokAnalysisResult(null); 
        setActiveTab('overview');

        try {
            setLoadingMessage(`بدء استخراج الإطارات...`);
            const framesPromise = extractFrames(videoSrc, FRAME_EXTRACT_INTERVAL, (p) => setProgress(p));

            setLoadingMessage(`استخراج الصوت...`);
            const audioPromise = extractAudio(videoFile);
            
            const [{ frames, width, height }, audioBase64] = await Promise.all([framesPromise, audioPromise]);
            
            setProgress(0);
            setLoadingMessage(`تم الاستخراج، جاري تحليل إعلان تيكتوك...`);

            const result = await analyzeTikTokVideo(frames, audioBase64, tiktokObjective, tiktokAudience, tiktokVideoStyle, tiktokTrendingSoundUsage, width, height);
            setTiktokAnalysisResult(result);
            setResultThumbnail(frames[0]);
            
            const baseHistoricData = { id: `${Date.now()}-${videoFile.name}`, fileName: videoFile.name, timestamp: Date.now(), thumbnail: frames[0] };
            const newHistoricResult: HistoricTikTokAnalysisResult = { 
                ...baseHistoricData, 
                ...result, 
                type: 'tiktok', 
                objective: tiktokObjective, 
                audience: tiktokAudience,
                videoStyle: tiktokVideoStyle,
                trendingSoundUsage: tiktokTrendingSoundUsage,
                chatHistory: [],
            };
            const newHistory = authService.saveHistoryForUser(currentUser.email, newHistoricResult);
            const updatedUser = authService.recordAnalysis(currentUser.email);
            setCurrentUser(updatedUser);
            setAnalysisHistory(newHistory);
            setCurrentReportId(newHistoricResult.id);
            setChatMessages([]);
            addNotification('تم تحليل إعلان تيكتوك بنجاح!', 'success');
            triggerChatTooltip();

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع.";
            addNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false); setLoadingMessage(''); setProgress(0);
        }
    };

    const handleAnalyzeAmazonClick = async () => {
        if (!videoSrc || !videoFile || !currentUser || analysisType !== 'amazon') return;
        if (!amazonObjective || !amazonProductCategory) {
            addNotification("الرجاء تحديد جميع الخيارات المطلوبة.", 'error');
            return;
        }
        
        setIsLoading(true); setProgress(0);
        setAmazonAnalysisResult(null); 
        setActiveTab('overview');

        try {
            setLoadingMessage(`بدء استخراج الإطارات...`);
            const framesPromise = extractFrames(videoSrc, FRAME_EXTRACT_INTERVAL, (p) => setProgress(p));
            const audioPromise = extractAudio(videoFile);
            const [{ frames, width, height }, audioBase64] = await Promise.all([framesPromise, audioPromise]);
            
            setProgress(0);
            setLoadingMessage(`تم الاستخراج، جاري تحليل إعلان أمازون...`);

            const result = await analyzeAmazonVideo(frames, audioBase64, amazonObjective, amazonProductCategory, width, height);
            setAmazonAnalysisResult(result);
            setResultThumbnail(frames[0]);
            
            const baseHistoricData = { id: `${Date.now()}-${videoFile.name}`, fileName: videoFile.name, timestamp: Date.now(), thumbnail: frames[0] };
            const newHistoricResult: HistoricAmazonAnalysisResult = { 
                ...baseHistoricData, 
                ...result, 
                type: 'amazon', 
                objective: amazonObjective, 
                productCategory: amazonProductCategory,
                chatHistory: [],
            };
            const newHistory = authService.saveHistoryForUser(currentUser.email, newHistoricResult);
            const updatedUser = authService.recordAnalysis(currentUser.email);
            setCurrentUser(updatedUser);
            setAnalysisHistory(newHistory);
            setCurrentReportId(newHistoricResult.id);
            setChatMessages([]);
            addNotification('تم تحليل إعلان أمازون بنجاح!', 'success');
            triggerChatTooltip();

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع.";
            addNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false); setLoadingMessage(''); setProgress(0);
        }
    };

    const handleAnalyzeSnapchatClick = async () => {
        if (!videoSrc || !videoFile || !currentUser || analysisType !== 'snapchat') return;
        if (!snapchatObjective || !snapchatAdFormat) {
            addNotification("الرجاء تحديد جميع الخيارات المطلوبة.", 'error');
            return;
        }
        
        setIsLoading(true); setProgress(0);
        setSnapchatAnalysisResult(null); 
        setActiveTab('overview');

        try {
            setLoadingMessage(`بدء استخراج الإطارات...`);
            const framesPromise = extractFrames(videoSrc, FRAME_EXTRACT_INTERVAL, (p) => setProgress(p));
            const audioPromise = extractAudio(videoFile);
            const [{ frames, width, height }, audioBase64] = await Promise.all([framesPromise, audioPromise]);
            
            setProgress(0);
            setLoadingMessage(`تم الاستخراج، جاري تحليل إعلان سنابشات...`);

            const result = await analyzeSnapchatVideo(frames, audioBase64, snapchatObjective, snapchatAdFormat, width, height);
            setSnapchatAnalysisResult(result);
            setResultThumbnail(frames[0]);
            
            const baseHistoricData = { id: `${Date.now()}-${videoFile.name}`, fileName: videoFile.name, timestamp: Date.now(), thumbnail: frames[0] };
            const newHistoricResult: HistoricSnapchatAnalysisResult = { 
                ...baseHistoricData, 
                ...result, 
                type: 'snapchat', 
                objective: snapchatObjective, 
                adFormat: snapchatAdFormat,
                chatHistory: [],
            };
            const newHistory = authService.saveHistoryForUser(currentUser.email, newHistoricResult);
            const updatedUser = authService.recordAnalysis(currentUser.email);
            setCurrentUser(updatedUser);
            setAnalysisHistory(newHistory);
            setCurrentReportId(newHistoricResult.id);
            setChatMessages([]);
            addNotification('تم تحليل إعلان سنابشات بنجاح!', 'success');
            triggerChatTooltip();

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع.";
            addNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false); setLoadingMessage(''); setProgress(0);
        }
    };

    const handleAnalyzeYouTubeClick = async () => {
        if (!videoSrc || !videoFile || !currentUser || analysisType !== 'youtube') return;
        if (!youtubeObjective || !youtubeAdFormat) {
            addNotification("الرجاء تحديد جميع الخيارات المطلوبة.", 'error');
            return;
        }
        
        setIsLoading(true); setProgress(0);
        setYoutubeAnalysisResult(null); 
        setActiveTab('overview');

        try {
            setLoadingMessage(`بدء استخراج الإطارات...`);
            const framesPromise = extractFrames(videoSrc, FRAME_EXTRACT_INTERVAL, (p) => setProgress(p));
            const audioPromise = extractAudio(videoFile);
            const [{ frames, width, height }, audioBase64] = await Promise.all([framesPromise, audioPromise]);
            
            setProgress(0);
            setLoadingMessage(`تم الاستخراج، جاري تحليل إعلان يوتيوب...`);

            const result = await analyzeYouTubeVideo(frames, audioBase64, youtubeObjective, youtubeAdFormat, width, height);
            setYoutubeAnalysisResult(result);
            setResultThumbnail(frames[0]);
            
            const baseHistoricData = { id: `${Date.now()}-${videoFile.name}`, fileName: videoFile.name, timestamp: Date.now(), thumbnail: frames[0] };
            const newHistoricResult: HistoricYouTubeAnalysisResult = { 
                ...baseHistoricData, 
                ...result, 
                type: 'youtube', 
                objective: youtubeObjective, 
                adFormat: youtubeAdFormat,
                chatHistory: [],
            };
            const newHistory = authService.saveHistoryForUser(currentUser.email, newHistoricResult);
            const updatedUser = authService.recordAnalysis(currentUser.email);
            setCurrentUser(updatedUser);
            setAnalysisHistory(newHistory);
            setCurrentReportId(newHistoricResult.id);
            setChatMessages([]);
            addNotification('تم تحليل إعلان يوتيوب بنجاح!', 'success');
            triggerChatTooltip();

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع.";
            addNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false); setLoadingMessage(''); setProgress(0);
        }
    };

    const handleAnalyzeGoogleClick = async () => {
        if (!videoSrc || !videoFile || !currentUser || analysisType !== 'google') return;
        if (!googleObjective || !googleAdNetwork) {
            addNotification("الرجاء تحديد جميع الخيارات المطلوبة.", 'error');
            return;
        }
        
        setIsLoading(true); setProgress(0);
        setGoogleAnalysisResult(null); 
        setActiveTab('overview');

        try {
            setLoadingMessage(`بدء استخراج الإطارات...`);
            const framesPromise = extractFrames(videoSrc, FRAME_EXTRACT_INTERVAL, (p) => setProgress(p));
            const audioPromise = extractAudio(videoFile);
            const [{ frames, width, height }, audioBase64] = await Promise.all([framesPromise, audioPromise]);
            
            setProgress(0);
            setLoadingMessage(`تم الاستخراج، جاري تحليل إعلان جوجل...`);

            const result = await analyzeGoogleVideo(frames, audioBase64, googleObjective, googleAdNetwork, width, height);
            setGoogleAnalysisResult(result);
            setResultThumbnail(frames[0]);
            
            const baseHistoricData = { id: `${Date.now()}-${videoFile.name}`, fileName: videoFile.name, timestamp: Date.now(), thumbnail: frames[0] };
            const newHistoricResult: HistoricGoogleAnalysisResult = { 
                ...baseHistoricData, 
                ...result, 
                type: 'google', 
                objective: googleObjective, 
                adNetwork: googleAdNetwork,
                chatHistory: [],
            };
            const newHistory = authService.saveHistoryForUser(currentUser.email, newHistoricResult);
            const updatedUser = authService.recordAnalysis(currentUser.email);
            setCurrentUser(updatedUser);
            setAnalysisHistory(newHistory);
            setCurrentReportId(newHistoricResult.id);
            setChatMessages([]);
            addNotification('تم تحليل إعلان جوجل بنجاح!', 'success');
            triggerChatTooltip();

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع.";
            addNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false); setLoadingMessage(''); setProgress(0);
        }
    };
    
    const handleAnalyzePatternsClick = async () => {
        if (videoFiles.length < 2 || !currentUser) {
            addNotification("الرجاء رفع فيديوهين على الأقل لكشف الأنماط.", 'error');
            return;
        }
        setIsLoading(true);
        setPatternAnalysisResult(null);
        setProgress(0);

        try {
            const videoDataPromises = videoFiles.map((file, index) => {
                return new Promise(async (resolve, reject) => {
                    try {
                        const overallProgressStart = (index / videoFiles.length) * 100;
                        const overallProgressEnd = ((index + 1) / videoFiles.length) * 100;
                        
                        setLoadingMessage(`[${index+1}/${videoFiles.length}] معالجة: ${file.name}`);
                        const videoUrl = URL.createObjectURL(file);
                        const framesPromise = extractFrames(videoUrl, FRAME_EXTRACT_INTERVAL, (p) => {
                           const fileProgress = (p / 100) * (overallProgressEnd - overallProgressStart);
                           setProgress(overallProgressStart + fileProgress);
                        });
                        const audioPromise = extractAudio(file);
                        const [data, audioBase64] = await Promise.all([framesPromise, audioPromise]);
                        resolve({ frames: data.frames, audioBase64 });
                    } catch(e) {
                        reject(e);
                    }
                });
            });

            const allVideoData = await Promise.all(videoDataPromises) as { frames: string[], audioBase64: string }[];

            setLoadingMessage(`تمت معالجة ${videoFiles.length} فيديوهات. جاري تحليل الأنماط...`);
            setProgress(0);
            const result = await analyzePatterns(allVideoData);
            setPatternAnalysisResult(result);
            
            const fileNames = videoFiles.map(f => f.name);
            const baseHistoricData = { 
                id: `${Date.now()}-pattern`, 
                fileName: `تحليل أنماط لـ ${fileNames.length} فيديوهات`, 
                fileNames, 
                timestamp: Date.now(),
                thumbnail: allVideoData[0].frames[0]
            };
            const newHistoricResult: HistoricPatternAnalysisResult = { ...baseHistoricData, ...result, type: 'pattern', chatHistory: [] };
            const newHistory = authService.saveHistoryForUser(currentUser.email, newHistoricResult);
            const updatedUser = authService.recordAnalysis(currentUser.email);
            setCurrentUser(updatedUser);
            setAnalysisHistory(newHistory);
            setCurrentReportId(newHistoricResult.id);
            setChatMessages([]);
            addNotification('تم تحليل الأنماط بنجاح!', 'success');
            triggerChatTooltip();

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "حدث خطأ غير متوقع أثناء تحليل الأنماط.";
            addNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false);
            setProgress(0);
        }
    };

    const handleAnalyzeCampaignClick = async () => {
        if (!campaignVideoFile || !campaignVideoSrc || !currentUser) {
            addNotification("الرجاء رفع فيديو الإعلان أولاً.", 'error');
            return;
        }
        if (campaignResultsMode === 'text' && !campaignResultsText.trim()) {
            addNotification("الرجاء إدخال نتائج الحملة النصية.", 'error');
            return;
        }
        if (campaignResultsMode === 'image' && !campaignResultsImage) {
            addNotification("الرجاء رفع صورة لنتائج الحملة.", 'error');
            return;
        }

        setIsLoading(true);
        setCampaignAnalysisResult(null);
        setProgress(0);

        try {
            setLoadingMessage("معالجة الفيديو...");
            const framesPromise = extractFrames(campaignVideoSrc, FRAME_EXTRACT_INTERVAL, (p) => setProgress(p));
            const audioPromise = extractAudio(campaignVideoFile);
            const [{ frames }, audioBase64] = await Promise.all([framesPromise, audioPromise]);
            
            let campaignData: { text?: string, imageBase64?: string } = {};
            if (campaignResultsMode === 'text') {
                campaignData.text = campaignResultsText;
            } else if (campaignResultsImage) {
                setLoadingMessage("معالجة صورة النتائج...");
                campaignData.imageBase64 = await fileToBase64(campaignResultsImage);
            }
            
            setProgress(0);
            setLoadingMessage("جاري تحليل الفيديو والنتائج...");
            const result = await analyzeCampaignResults({ frames, audioBase64 }, campaignData);
            setCampaignAnalysisResult(result);
            setResultThumbnail(frames[0]);

            const baseHistoricData = { 
                id: `${Date.now()}-campaign-${campaignVideoFile.name}`, 
                fileName: campaignVideoFile.name, 
                timestamp: Date.now(),
                thumbnail: frames[0]
            };
            const newHistoricResult: HistoricCampaignAnalysisResult = { ...baseHistoricData, ...result, type: 'campaign', chatHistory: [] };
            const newHistory = authService.saveHistoryForUser(currentUser.email, newHistoricResult);
            const updatedUser = authService.recordAnalysis(currentUser.email);
            setCurrentUser(updatedUser);
            setAnalysisHistory(newHistory);
            setCurrentReportId(newHistoricResult.id);
            setChatMessages([]);
            addNotification('تم تحليل نتائج الحملة بنجاح!', 'success');
            triggerChatTooltip();

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "حدث خطأ غير متوقع أثناء تحليل الحملة.";
            addNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false);
            setProgress(0);
        }
    };

    const handleAnalyzeComparisonClick = async () => {
        if (!comparisonVideo1 || !comparisonVideo2 || !comparisonVideo1Src || !comparisonVideo2Src || !currentUser) {
            addNotification("الرجاء رفع كلا الفيديوهين للمقارنة.", 'error');
            return;
        }
        setIsLoading(true);
        setComparisonAnalysisResult(null);
        setProgress(0);
    
        try {
            setLoadingMessage("معالجة الفيديو الأول...");
            const video1FramesPromise = extractFrames(comparisonVideo1Src, FRAME_EXTRACT_INTERVAL, (p) => setProgress(p / 2));
            const video1AudioPromise = extractAudio(comparisonVideo1);
            
            const [video1Data, video1Audio] = await Promise.all([video1FramesPromise, video1AudioPromise]);
            
            setLoadingMessage("معالجة الفيديو الثاني...");
            const video2FramesPromise = extractFrames(comparisonVideo2Src, FRAME_EXTRACT_INTERVAL, (p) => setProgress(50 + p / 2));
            const video2AudioPromise = extractAudio(comparisonVideo2);
            
            const [video2Data, video2Audio] = await Promise.all([video2FramesPromise, video2AudioPromise]);
    
            setLoadingMessage("تمت معالجة الفيديوهات. جاري المقارنة...");
            setProgress(0);
            
            const result = await compareVideos(
                { frames: video1Data.frames, audioBase64: video1Audio },
                { frames: video2Data.frames, audioBase64: video2Audio }
            );
            
            setComparisonAnalysisResult(result);
            setComparisonThumb1(video1Data.frames[0]);
            setComparisonThumb2(video2Data.frames[0]);
    
            const newHistoricResult: HistoricComparisonAnalysisResult = {
                id: `${Date.now()}-comparison`,
                fileName: `مقارنة: ${comparisonVideo1.name} ضد ${comparisonVideo2.name}`,
                fileNames: [comparisonVideo1.name, comparisonVideo2.name],
                timestamp: Date.now(),
                thumbnail: video1Data.frames[0],
                thumbnail2: video2Data.frames[0],
                ...result,
                type: 'comparison',
                chatHistory: [],
            };
            const newHistory = authService.saveHistoryForUser(currentUser.email, newHistoricResult);
            const updatedUser = authService.recordAnalysis(currentUser.email);
            setCurrentUser(updatedUser);
            setAnalysisHistory(newHistory);
            setCurrentReportId(newHistoricResult.id);
            setChatMessages([]);
            addNotification('تمت مقارنة الفيديوهات بنجاح!', 'success');
            triggerChatTooltip();
    
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "حدث خطأ غير متوقع أثناء المقارنة.";
            addNotification(errorMessage, 'error');
        } finally {
            setIsLoading(false);
            setProgress(0);
        }
    };
    
    const handleSendMessage = async (message: string) => {
        if (!message.trim() || !currentReportId || !currentUser) return;

        const newUserMessage: ChatMessage = { role: 'user', content: message };
        const updatedMessages = [...chatMessages, newUserMessage];
        setChatMessages(updatedMessages);
        setIsChatLoading(true);

        try {
            const currentReport = analysisHistory.find(r => r.id === currentReportId);
            if (!currentReport) throw new Error("لم يتم العثور على التقرير الحالي.");
            
            const { chatHistory, ...reportContext } = currentReport;
            const contextString = JSON.stringify(reportContext);

            const modelResponse = await continueChat(contextString, chatMessages, message);
            
            const newModelMessage: ChatMessage = { role: 'model', content: modelResponse };
            const finalMessages = [...updatedMessages, newModelMessage];
            setChatMessages(finalMessages);

            const updatedReport = { ...currentReport, chatHistory: finalMessages };
            const newHistory = authService.updateHistoryItem(currentUser.email, updatedReport);
            setAnalysisHistory(newHistory);

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "حدث خطأ.";
            addNotification(errorMessage, 'error');
            setChatMessages(chatMessages); // Revert on error
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => e.preventDefault();
    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragging(false); };
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>, videoSlot: 'Campaign' | 'comparison1' | 'comparison2' | null = null) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        processSelectedFile(file, videoSlot);
    };

    const handleMultipleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            const videoFilesArray = Array.from(files).filter(file => file.type.startsWith('video/'));
            if (videoFilesArray.length > 0) {
                setVideoFiles(prev => [...prev, ...videoFilesArray]);
            } else {
                addNotification("لم يتم العثور على ملفات فيديو صالحة في الملفات التي تم سحبها.", 'error');
            }
        }
    };


  const handleReset = () => {
      setVideoFile(null); setVideoSrc(null);
      setResultThumbnail(null);
      setVideoFiles([]); setPatternAnalysisResult(null);
      setCampaignVideoFile(null); setCampaignVideoSrc(null); setCampaignResultsText('');
      setCampaignResultsImage(null); setCampaignResultsImageSrc(null); setCampaignAnalysisResult(null);
      setFacebookAnalysisResult(null); setFacebookObjective(''); setFacebookAudience(''); setFacebookAdType(''); setFacebookAdFormat('');
      setInstagramAnalysisResult(null); setInstagramObjective(''); setInstagramAdFormat('');
      setTiktokAnalysisResult(null); setTiktokObjective(''); setTiktokAudience(''); setTiktokVideoStyle(''); setTiktokTrendingSoundUsage('');
      setAmazonAnalysisResult(null); setAmazonObjective(''); setAmazonProductCategory('');
      setSnapchatAnalysisResult(null); setSnapchatObjective(''); setSnapchatAdFormat('');
      setYoutubeAnalysisResult(null); setYoutubeObjective(''); setYoutubeAdFormat('');
      setGoogleAnalysisResult(null); setGoogleObjective(''); setGoogleAdNetwork('');
      setComparisonAnalysisResult(null); setComparisonVideo1(null); setComparisonVideo1Src(null); setComparisonVideo2(null); setComparisonVideo2Src(null);
      setComparisonThumb1(null); setComparisonThumb2(null);
      setIsLoading(false); setProgress(0);
      setActiveTab('overview');
      setChatMessages([]);
      setCurrentReportId(null);
      setIsChatOpen(false);
      setIsChatMinimized(false);
      setShowChatTooltip(false);
      setReanalysisTarget(null);
      [fileInputRef, multiFileInputRef, campaignVideoInputRef, campaignImageInputRef, comparisonVideo1Ref, comparisonVideo2Ref].forEach(ref => {
        if(ref.current) ref.current.value = "";
      });
  };

  const handleClearHistory = () => {
      if (currentUser && window.confirm("هل أنت متأكد أنك تريد حذف سجل التحليلات الخاص بك؟ لا يمكن التراجع عن هذا الإجراء.")) {
        authService.clearHistoryForUser(currentUser.email);
        setAnalysisHistory([]);
        addNotification('تم حذف السجل بنجاح.', 'success');
      }
  };
    
  useEffect(() => {
    if (!exportTrigger || !reportRef.current) return;

    const performExport = async () => {
        if (!reportRef.current) {
             setIsExporting(false);
             setExportTrigger(false);
             return;
        }
        
        let fileName = 'analysis-report.pdf';
        if ((analysisType && ['facebook', 'tiktok', 'amazon', 'snapchat', 'youtube', 'instagram', 'google'].includes(analysisType)) && videoFile) {
            fileName = `${analysisType}-analysis-${videoFile.name.split('.')[0]}.pdf`;
        } else if (analysisType === 'pattern') {
             fileName = `pattern-analysis-${Date.now()}.pdf`;
        } else if (analysisType === 'campaign' && campaignVideoFile) {
             fileName = `campaign-analysis-${campaignVideoFile.name.split('.')[0]}.pdf`;
        } else if (analysisType === 'comparison' && comparisonVideo1 && comparisonVideo2) {
             fileName = `comparison-${comparisonVideo1.name.split('.')[0]}-vs-${comparisonVideo2.name.split('.')[0]}.pdf`;
        }
        
        try {
            const { jsPDF } = jspdf;
            const canvas = await html2canvas(reportRef.current, {
                scale: 2,
                backgroundColor: '#ffffff',
                useCORS: true,
                windowWidth: reportRef.current.scrollWidth,
                windowHeight: reportRef.current.scrollHeight
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });
            
            const margin = 15;
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            
            const imgProps = pdf.getImageProperties(imgData);
            const imgWidth = pdfWidth - margin * 2;
            const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
            
            let position = 0;

            while (position < imgHeight) {
                if (position > 0) {
                    pdf.addPage();
                }
                const pageContentHeight = pdfHeight - margin * 2;
                pdf.addImage(imgData, 'PNG', margin, -position + margin, imgWidth, imgHeight);
                position += pageContentHeight;
            }
            pdf.save(fileName);
            addNotification('تم بدء تنزيل ملف PDF.', 'info');

        } catch (error) {
            console.error("Error exporting PDF:", error);
            addNotification("فشل تصدير PDF.", 'error');
        } finally {
            setIsExporting(false);
            setExportTrigger(false);
        }
    };
    const timer = setTimeout(performExport, 200);
    return () => clearTimeout(timer);

  }, [exportTrigger, analysisType, videoFile, campaignVideoFile, comparisonVideo1, comparisonVideo2, addNotification]);

  const handleExportPDF = () => {
      if (isExporting) return;
      addNotification('جاري تجهيز التقرير للتنزيل...', 'info');
      setIsExporting(true);
      setExportTrigger(true);
  };

  const handleDownloadReport = (report: AnyHistoricAnalysisResult) => {
    handleViewHistoricReport(report);
    setTimeout(() => {
        handleExportPDF();
    }, 200);
  };

  const isFacebookAnalysisDisabled = isLoading || !videoFile || !facebookObjective || !facebookAudience || !facebookAdType || !facebookAdFormat;
  const isInstagramAnalysisDisabled = isLoading || !videoFile || !instagramObjective || !instagramAdFormat;
  const isTikTokAnalysisDisabled = isLoading || !videoFile || !tiktokObjective || !tiktokAudience || !tiktokVideoStyle || !tiktokTrendingSoundUsage;
  const isAmazonAnalysisDisabled = isLoading || !videoFile || !amazonObjective || !amazonProductCategory;
  const isSnapchatAnalysisDisabled = isLoading || !videoFile || !snapchatObjective || !snapchatAdFormat;
  const isYouTubeAnalysisDisabled = isLoading || !videoFile || !youtubeObjective || !youtubeAdFormat;
  const isGoogleAnalysisDisabled = isLoading || !videoFile || !googleObjective || !googleAdNetwork;

  const VideoUploader = ({ onFileChange, videoSrc, fileInputRef, title, onDrop }: { onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void, videoSrc: string | null, fileInputRef: React.RefObject<HTMLInputElement>, title: string, onDrop: (e: React.DragEvent<HTMLDivElement>) => void }) => (
        <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-700 text-center mb-4">{title}</h3>
            {videoSrc ? (
                 <video src={videoSrc} controls className="w-full rounded-md max-h-[300px] bg-black"></video>
            ) : (
                <div 
                    className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-300 flex flex-col justify-center ${isDragging ? 'border-violet-500 bg-violet-50' : 'border-gray-300 hover:border-violet-500 hover:bg-violet-50'}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDrop={onDrop}
                >
                  <input type="file" accept="video/mp4,video/quicktime,video/webm,video/x-matroska,video/x-msvideo,video/*" onChange={onFileChange} className="hidden" ref={fileInputRef} />
                  <UploadIcon className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                  <p className="font-semibold text-gray-600">اسحب الفيديو وأفلته هنا أو انقر للرفع</p>
                  <p className="text-sm text-gray-400 mt-1">MP4, MOV, WebM, AVI, MKV والمزيد</p>
                </div>
            )}
        </div>
    );
    
    const UserAvatar: React.FC<{ user: User }> = ({ user }) => {
        const { name, picture } = user;
        const initial = name ? name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();

        if (picture) {
            return <img src={picture} alt={name || 'Profile'} className="w-10 h-10 rounded-full object-cover" />;
        }

        return (
            <div className="w-10 h-10 rounded-full bg-violet-500 text-white flex items-center justify-center font-bold text-lg">
                {initial}
            </div>
        );
    };

    const userNavConfig = [
        { id: 'dashboard', label: 'لوحة التحكم', icon: <HomeIcon className="w-6 h-6" />, disabled: false },
        { id: 'tools', label: 'أدوات التحليل', icon: <SparklesIcon className="w-6 h-6" />, disabled: currentUser?.subscriptionTier === 'free' },
        { id: 'history', label: 'سجل التحليلات', icon: <ArchiveBoxIcon className="w-6 h-6" />, disabled: false },
    ];
        
    const adminNavConfig = [
        { id: 'welcome', label: 'لوحة التحكم', icon: <HomeIcon className="w-6 h-6" /> },
        { id: 'overview', label: 'النظرة العامة', icon: <ChartPieIcon className="w-6 h-6" /> },
        { id: 'customizeUI', label: 'تخصيص الواجهة', icon: <Cog6ToothIcon className="w-6 h-6" /> },
        { id: 'strategicGuidance', label: 'التوجيه الاستراتيجي', icon: <MagnetIcon className="w-6 h-6" /> },
    ];
    
    const OverallScoreDisplay: React.FC<{ score: number, isExporting?: boolean }> = ({ score, isExporting }) => (
        <div className={`p-6 rounded-xl mb-6 text-center ${isExporting ? 'bg-gray-50 border border-gray-200' : 'bg-gradient-to-br from-gray-900 to-gray-700 text-white shadow-lg'}`}>
            <h3 className="text-lg font-semibold text-gray-300 mb-2 flex items-center justify-center gap-2">
                <CheckBadgeIcon className="w-6 h-6" />
                تقييم الإعلان النهائي
            </h3>
            <p className="text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">
                {score.toFixed(1)}
            </p>
            <p className="text-gray-400 mt-1">متوسط جميع مقاييس الأداء</p>
        </div>
    );
    
    const getReportTypeLabel = (type: AnyHistoricAnalysisResult['type']) => {
        if (typeof type !== 'string' || !type) {
            return 'تحليل غير معروف';
        }
        switch (type) {
            case 'pattern': return 'كاشف الأنماط';
            case 'campaign': return 'تحليل النتائج';
            case 'comparison': return 'مقارنة الفيديوهات';
            case 'facebook': return 'تحليل إعلانات فيسبوك';
            case 'tiktok': return 'تحليل إعلانات تيكتوك';
            case 'amazon': return 'تحليل إعلانات أمازون';
            case 'snapchat': return 'تحليل إعلانات سنابشات';
            case 'youtube': return 'تحليل إعلانات يوتيوب';
            case 'instagram': return 'تحليل إعلانات انستغرام';
            case 'google': return 'تحليل إعلانات جوجل';
            default: return 'تحليل غير معروف';
        }
    };

    const PdfHeader: React.FC<{ title: string }> = ({ title }) => (
      <div className="p-8 border-b border-gray-200 flex items-center justify-between">
          <div>
              {logoConfig.imageUrl ? (
                  <img src={logoConfig.imageUrl} alt="Logo" className="h-8 object-contain" />
              ) : (
                  <h1 className="text-2xl font-bold text-violet-700">ANA<span className="font-light">VIDOO</span></h1>
              )}
              <p className="text-gray-500 mt-1">تقرير: {title}</p>
          </div>
          <p className="text-sm text-gray-400">{new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>
    );

    const ReportWrapper: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
        return (
            <div className={`animate-fade-in`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-gray-800">{title}</h2>
                    <div className="flex items-center gap-2">
                         <button
                            onClick={handleExportPDF}
                            disabled={isExporting}
                            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            <ArrowDownTrayIcon className="w-5 h-5" />
                            <span>{isExporting ? 'جاري التصدير...' : 'تنزيل PDF'}</span>
                        </button>
                        <button
                            onClick={() => { setView('dashboard'); handleReset(); }}
                            className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            تحليل جديد
                        </button>
                    </div>
                </div>
                {children}
            </div>
        );
    };


    if (!currentUser) {
        return <Auth onLoginSuccess={handleLoginSuccess} addNotification={addNotification} />;
    }
  
  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
       <aside className={`fixed inset-y-0 right-0 z-30 w-72 bg-white p-6 flex flex-col border-l border-gray-200 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} md:relative md:translate-x-0 md:flex-shrink-0`}>
        <div className="flex-grow flex flex-col">
           <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 md:hidden">
                <XMarkIcon className="w-6 h-6" />
            </button>
            <div className="px-4 border-b border-gray-200 pb-4 mb-6 h-10 flex items-center justify-center">
                 {logoConfig.imageUrl ? (
                    <img src={logoConfig.imageUrl} alt="Logo" className="h-8 object-contain" />
                 ) : (
                    <h1 className="text-2xl font-bold text-violet-700 text-center">ANA<span className="font-light">VIDOO</span></h1>
                 )}
            </div>
          <nav className="space-y-2 flex-grow">
                <div className="space-y-3">
                    {isAdminView ? (
                        adminNavConfig.map(item => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if(item.id === 'welcome') {
                                        setView('dashboard');
                                        handleReset();
                                        setAdminSubView('welcome');
                                    } else {
                                        setView('analyzer'); // Use a generic view for admin pages
                                        setAdminSubView(item.id as AdminSubView);
                                    }
                                    setIsSidebarOpen(false);
                                }}
                                className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-lg text-right font-semibold transition-all duration-200 ${
                                    (adminSubView === item.id) || (view === 'dashboard' && item.id === 'welcome' && adminSubView === 'welcome')
                                        ? 'bg-gradient-to-r from-violet-600 to-indigo-700 text-white shadow-md'
                                        : 'text-gray-600 hover:bg-violet-100 hover:text-violet-700'
                                }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                            </button>
                        ))
                    ) : (
                        userNavConfig.map(item => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    if (item.disabled) {
                                        setUpgradeReason({ message: 'للوصول إلى أدوات التحليل المتقدمة، يرجى ترقية اشتراكك.', reason: 'permission' });
                                        setIsUpgradeModalOpen(true);
                                        return;
                                    }
                                    if (['dashboard', 'history', 'tools'].includes(item.id)) {
                                        setView(item.id as View);
                                        setAnalysisType(null);
                                        handleReset();
                                    }
                                    setIsSidebarOpen(false);
                                }}
                                disabled={item.disabled}
                                className={`w-full flex items-center gap-4 px-4 py-2.5 rounded-lg text-right font-semibold transition-all duration-200 ${
                                    (view === item.id)
                                        ? 'bg-gradient-to-r from-violet-600 to-indigo-700 text-white shadow-md'
                                        : item.disabled 
                                            ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                                            : 'text-gray-600 hover:bg-violet-100 hover:text-violet-700'
                                }`}
                            >
                                {item.icon}
                                <span>{item.label}</span>
                                {item.disabled && <LockClosedIcon className="w-5 h-5 text-gray-400 mr-auto"/>}
                            </button>
                        ))
                    )}
                </div>
          </nav>
          {!isAdminView && (
            <div className="mt-auto">
                <button
                    onClick={() => {
                        setUpgradeReason(null);
                        setIsUpgradeModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                >
                    <SparklesIcon className="w-6 h-6" />
                    <span>الاشتراك</span>
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                    النسخة {versionConfig.version}
                </p>
            </div>
           )}
        </div>
       </aside>

       <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <header className="flex items-center justify-between mb-8">
                <button onClick={() => setIsSidebarOpen(true)} className="p-1 text-gray-600 hover:text-gray-900 md:hidden">
                    <Bars3Icon className="w-6 h-6" />
                </button>
                <div className="flex-1"></div>
                
                <div className="flex items-center gap-4">
                     {!isAdminView && (
                        <div className="text-right px-4 py-2 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md">
                            <p className="text-sm font-bold">
                                {currentUser.analysisCount} / {authService.getSubscriptionLimits(currentUser.subscriptionTier).limit}
                            </p>
                            <p className="text-xs text-indigo-200">تحليلات هذا الشهر</p>
                        </div>
                     )}
                     
                    {currentUser.isAdmin && (
                        <button 
                             onClick={() => {
                                if (isAdminView) {
                                    setIsAdminView(false);
                                    setView('dashboard');
                                    handleReset();
                                } else {
                                    enterAdminView();
                                }
                            }}
                            className="bg-yellow-400 text-yellow-900 font-bold py-2 px-4 rounded-lg text-sm hover:bg-yellow-500 transition-colors"
                        >
                            {isAdminView ? 'العودة للتطبيق' : 'لوحة تحكم المشرف'}
                        </button>
                    )}

                    <div className="relative" ref={profileRef}>
                        <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 transition-colors">
                            <UserAvatar user={currentUser} />
                            <span className="font-semibold text-gray-700 truncate hidden sm:block">{currentUser.name || currentUser.email}</span>
                        </button>
                        {isProfileOpen && (
                            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                                <div className="py-1">
                                    <button
                                        onClick={() => { setView('settings'); setAnalysisType(null); handleReset(); setIsProfileOpen(false); setIsSidebarOpen(false); setIsAdminView(false); }}
                                        className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                                    >
                                        <Cog6ToothIcon className="w-5 h-5" />
                                        <span>الإعدادات والاشتراك</span>
                                    </button>
                                    <button
                                        onClick={() => { handleLogout(); setIsProfileOpen(false); }}
                                        className="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                                    >
                                        <ArrowRightOnRectangleIcon className="w-5 h-5" />
                                        <span>تسجيل الخروج</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {isLoading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <Loader message={loadingMessage} progress={progress} />
                </div>
            )}
            
            {isAdminView ? (
                 <>
                    {view === 'dashboard' && adminSubView === 'welcome' && <AdminWelcome user={currentUser} />}
                    {view === 'analyzer' && adminSubView === 'overview' && <AdminOverview allUsers={allUsers} allHistory={allHistory} />}
                    {view === 'analyzer' && adminSubView === 'customizeUI' && (
                        <AdminCustomizeUI
                            currentPlatformConfig={platformIconConfig}
                            currentToolConfig={toolIconConfig}
                            onPlatformSave={handlePlatformIconConfigUpdate}
                            onToolSave={handleToolIconConfigUpdate}
                            addNotification={addNotification}
                            currentBannerConfig={bannerConfig}
                            onBannerSave={handleBannerConfigUpdate}
                            currentImageBannerConfig={imageBannerConfig}
                            onImageBannerSave={handleImageBannerConfigUpdate}
                            currentLogoConfig={logoConfig}
                            onLogoSave={handleLogoConfigUpdate}
                            currentVersionConfig={versionConfig}
                            onVersionSave={handleVersionConfigUpdate}
                            currentRibbonConfig={ribbonConfig}
                            onRibbonSave={handleRibbonConfigUpdate}
                            currentMetricIconConfig={iconConfig}
                            onMetricIconConfigSave={handleIconConfigUpdate}
                            metricConfig={METRIC_CONFIG}
                        />
                    )}
                    {view === 'analyzer' && adminSubView === 'strategicGuidance' && (
                         <AdminStrategicGuidance
                            currentData={trainingData}
                            onSave={handleTrainingDataUpdate}
                            metricConfig={METRIC_CONFIG}
                        />
                    )}
                </>
            ) : (
                <>
                    {view === 'dashboard' && <Dashboard user={currentUser} history={analysisHistory} onOpenAnalysisModal={() => setIsAnalysisModalOpen(true)} bannerConfig={bannerConfig} imageBannerConfig={imageBannerConfig} />}
                    {view === 'history' && <History history={analysisHistory} onViewReport={handleViewHistoricReport} onDownloadReport={handleDownloadReport} onClearHistory={handleClearHistory} onReanalyze={handleReanalyze} />}
                    {view === 'tools' && <Tools onStartAnalysis={handleStartAnalysis} toolIconConfig={toolIconConfig}/>}
                    {view === 'settings' && <Settings user={currentUser} onUpdate={handleUserUpdate} onLogout={handleLogout} onUpgrade={handleUpgrade} addNotification={addNotification} />}
                    {view === 'analyzer' && (
                        analysisType && !currentAnalysisResult ? (
                            <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
                                {['facebook', 'tiktok', 'amazon', 'snapchat', 'youtube', 'instagram', 'google'].includes(analysisType) && (
                                    <>
                                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                                            <h2 className="text-2xl font-bold text-gray-800 mb-6">1. ارفع الفيديو</h2>
                                            <VideoUploader 
                                                onFileChange={(e) => handleFileChange(e)} 
                                                videoSrc={videoSrc}
                                                fileInputRef={fileInputRef}
                                                title=""
                                                onDrop={(e) => handleDrop(e)}
                                            />
                                        </div>
                                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-6">
                                            <h2 className="text-2xl font-bold text-gray-800">2. حدد سياق الإعلان</h2>
                                             {analysisType === 'facebook' && (
                                                <>
                                                    <SelectionGrid label="ما هو الهدف الرئيسي للحملة؟" options={facebookObjectiveOptions} selectedValue={facebookObjective} onSelect={setFacebookObjective} />
                                                    <SelectionGrid label="من هو الجمهور المستهدف؟" options={facebookAudienceOptions} selectedValue={facebookAudience} onSelect={setFacebookAudience} />
                                                    <SelectionGrid label="ما هو أسلوب الإعلان؟" options={facebookAdTypeOptions} selectedValue={facebookAdType} onSelect={setFacebookAdType} />
                                                    <SelectionGrid label="أين سيظهر الإعلان؟" options={facebookAdFormatOptions} selectedValue={facebookAdFormat} onSelect={setFacebookAdFormat} />
                                                </>
                                             )}
                                             {analysisType === 'instagram' && (
                                                <>
                                                    <SelectionGrid label="ما هو الهدف الرئيسي للحملة؟" options={instagramObjectiveOptions} selectedValue={instagramObjective} onSelect={setInstagramObjective} />
                                                    <SelectionGrid label="أين سيظهر الإعلان؟" options={instagramAdFormatOptions} selectedValue={instagramAdFormat} onSelect={setInstagramAdFormat} />
                                                </>
                                             )}
                                              {analysisType === 'tiktok' && (
                                                <>
                                                    <SelectionGrid label="ما هو الهدف الرئيسي للحملة؟" options={tiktokObjectiveOptions} selectedValue={tiktokObjective} onSelect={setTiktokObjective} />
                                                    <SelectionGrid label="من هو الجمهور المستهدف؟" options={tiktokAudienceOptions} selectedValue={tiktokAudience} onSelect={setTiktokAudience} />
                                                    <SelectionGrid label="ما هو أسلوب الفيديو؟" options={tiktokVideoStyleOptions} selectedValue={tiktokVideoStyle} onSelect={setTiktokVideoStyle} />
                                                    <SelectionGrid label="هل تستخدم صوتاً رائجاً (Trending Sound)؟" options={tiktokTrendingSoundOptions} selectedValue={tiktokTrendingSoundUsage} onSelect={setTiktokTrendingSoundUsage} />
                                                </>
                                             )}
                                             {analysisType === 'amazon' && (
                                                <>
                                                    <SelectionGrid label="ما هو الهدف الرئيسي للحملة؟" options={amazonObjectiveOptions} selectedValue={amazonObjective} onSelect={setAmazonObjective} />
                                                    <SelectionGrid label="ما هي فئة المنتج؟" options={amazonProductCategoryOptions} selectedValue={amazonProductCategory} onSelect={setAmazonProductCategory} />
                                                </>
                                             )}
                                             {analysisType === 'snapchat' && (
                                                <>
                                                    <SelectionGrid label="ما هو الهدف الرئيسي للحملة؟" options={snapchatObjectiveOptions} selectedValue={snapchatObjective} onSelect={setSnapchatObjective} />
                                                    <SelectionGrid label="ما هي صيغة الإعلان؟" options={snapchatAdFormatOptions} selectedValue={snapchatAdFormat} onSelect={setSnapchatAdFormat} />
                                                </>
                                             )}
                                             {analysisType === 'youtube' && (
                                                <>
                                                    <SelectionGrid label="ما هو الهدف الرئيسي للحملة؟" options={youtubeObjectiveOptions} selectedValue={youtubeObjective} onSelect={setYoutubeObjective} />
                                                    <SelectionGrid label="ما هي صيغة الإعلان؟" options={youtubeAdFormatOptions} selectedValue={youtubeAdFormat} onSelect={setYoutubeAdFormat} />
                                                </>
                                             )}
                                             {analysisType === 'google' && (
                                                <>
                                                    <SelectionGrid label="ما هو الهدف الرئيسي للحملة؟" options={googleObjectiveOptions} selectedValue={googleObjective} onSelect={setGoogleObjective} />
                                                    <SelectionGrid label="أين سيظهر الإعلان؟" options={googleAdNetworkOptions} selectedValue={googleAdNetwork} onSelect={setGoogleAdNetwork} />
                                                </>
                                             )}
                                        </div>
                                         <div className="flex justify-end">
                                            <button 
                                                onClick={() => {
                                                    const handlers = {
                                                        facebook: handleAnalyzeFacebookClick,
                                                        tiktok: handleAnalyzeTikTokClick,
                                                        amazon: handleAnalyzeAmazonClick,
                                                        snapchat: handleAnalyzeSnapchatClick,
                                                        youtube: handleAnalyzeYouTubeClick,
                                                        instagram: handleAnalyzeInstagramClick,
                                                        google: handleAnalyzeGoogleClick,
                                                    };
                                                    if (analysisType in handlers) {
                                                        checkAndPerformAnalysis(handlers[analysisType as keyof typeof handlers], 'platform');
                                                    }
                                                }}
                                                disabled={isLoading || (analysisType === 'facebook' && isFacebookAnalysisDisabled) || (analysisType === 'instagram' && isInstagramAnalysisDisabled) || (analysisType === 'tiktok' && isTikTokAnalysisDisabled) || (analysisType === 'amazon' && isAmazonAnalysisDisabled) || (analysisType === 'snapchat' && isSnapchatAnalysisDisabled) || (analysisType === 'youtube' && isYouTubeAnalysisDisabled) || (analysisType === 'google' && isGoogleAnalysisDisabled)}
                                                className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                <SparklesIcon className="w-5 h-5"/>
                                                <span>ابدأ التحليل</span>
                                            </button>
                                        </div>
                                    </>
                                )}
                                {analysisType === 'comparison' && (
                                    <div className="space-y-8">
                                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                                            <h2 className="text-2xl font-bold text-gray-800 mb-6">ارفع فيديوهات المقارنة</h2>
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <VideoUploader onFileChange={(e) => handleFileChange(e, 'comparison1')} videoSrc={comparisonVideo1Src} fileInputRef={comparisonVideo1Ref} title="الفيديو الأول" onDrop={(e) => handleDrop(e, 'comparison1')} />
                                                <VideoUploader onFileChange={(e) => handleFileChange(e, 'comparison2')} videoSrc={comparisonVideo2Src} fileInputRef={comparisonVideo2Ref} title="الفيديو الثاني" onDrop={(e) => handleDrop(e, 'comparison2')} />
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => checkAndPerformAnalysis(handleAnalyzeComparisonClick, 'comparison')}
                                                disabled={isLoading || !comparisonVideo1 || !comparisonVideo2}
                                                className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                <SparklesIcon className="w-5 h-5"/>
                                                <span>ابدأ المقارنة</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {analysisType === 'pattern' && (
                                    <div className="space-y-8">
                                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                                            <h2 className="text-2xl font-bold text-gray-800 mb-6">1. ارفع فيديوهات متعددة (2 على الأقل)</h2>
                                            <div 
                                                className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-300 flex flex-col justify-center ${isDragging ? 'border-violet-500 bg-violet-50' : 'border-gray-300 hover:border-violet-500 hover:bg-violet-50'}`}
                                                onClick={() => multiFileInputRef.current?.click()}
                                                onDragOver={handleDragOver}
                                                onDragEnter={handleDragEnter}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleMultipleFileDrop}
                                            >
                                              <input type="file" multiple accept="video/*" onChange={handleMultipleFileChange} className="hidden" ref={multiFileInputRef} />
                                              <UploadIcon className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                                              <p className="font-semibold text-gray-600">اسحب الفيديوهات وأفلتها هنا أو انقر للرفع</p>
                                            </div>
                                            {videoFiles.length > 0 && (
                                                <div className="mt-6">
                                                    <h3 className="font-semibold text-gray-700">الفيديوهات المحددة:</h3>
                                                    <ul className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                                        {videoFiles.map((file, index) => (
                                                             <li key={index} className="relative group bg-gray-100 rounded-lg p-2 flex items-center gap-2">
                                                                <FilmIcon className="w-5 h-5 text-gray-500 flex-shrink-0"/>
                                                                <span className="text-sm text-gray-700 truncate">{file.name}</span>
                                                                <button onClick={() => removeVideoFile(index)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <XMarkIcon className="w-3 h-3"/>
                                                                </button>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => checkAndPerformAnalysis(handleAnalyzePatternsClick, 'pattern')}
                                                disabled={isLoading || videoFiles.length < 2}
                                                className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                <SparklesIcon className="w-5 h-5"/>
                                                <span>ابدأ كشف الأنماط</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                                {analysisType === 'campaign' && (
                                    <div className="space-y-8">
                                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                                             <h2 className="text-2xl font-bold text-gray-800 mb-6">1. ارفع فيديو الإعلان</h2>
                                             <VideoUploader onFileChange={(e) => handleFileChange(e, 'Campaign')} videoSrc={campaignVideoSrc} fileInputRef={campaignVideoInputRef} title="" onDrop={(e) => handleDrop(e, 'Campaign')} />
                                        </div>
                                        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                                             <h2 className="text-2xl font-bold text-gray-800 mb-6">2. أدخل نتائج الحملة</h2>
                                             <div className="flex justify-center mb-4">
                                                <div className="flex rounded-lg bg-gray-200 p-1">
                                                    <button onClick={() => setCampaignResultsMode('text')} className={`px-4 py-2 text-sm font-semibold rounded-md ${campaignResultsMode === 'text' ? 'bg-white shadow' : 'text-gray-600'}`}>إدخال نصي</button>
                                                    <button onClick={() => setCampaignResultsMode('image')} className={`px-4 py-2 text-sm font-semibold rounded-md ${campaignResultsMode === 'image' ? 'bg-white shadow' : 'text-gray-600'}`}>رفع صورة</button>
                                                </div>
                                             </div>
                                             {campaignResultsMode === 'text' ? (
                                                <textarea 
                                                    value={campaignResultsText}
                                                    onChange={(e) => setCampaignResultsText(e.target.value)}
                                                    rows={6}
                                                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-md focus:ring-violet-500 focus:border-violet-500"
                                                    placeholder="مثال: CTR: 1.5%, VCR: 25%, CPA: $10..."
                                                />
                                             ) : (
                                                 <div className="flex-1">
                                                    {campaignResultsImageSrc ? (
                                                         <img src={campaignResultsImageSrc} alt="Preview" className="w-full rounded-md max-h-[300px] object-contain bg-gray-100"/>
                                                    ) : (
                                                        <div 
                                                            className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all duration-300 flex flex-col justify-center ${isDragging ? 'border-violet-500 bg-violet-50' : 'border-gray-300 hover:border-violet-500 hover:bg-violet-50'}`}
                                                            onClick={() => campaignImageInputRef.current?.click()}
                                                            onDragOver={handleDragOver}
                                                            onDragEnter={handleDragEnter}
                                                            onDragLeave={handleDragLeave}
                                                            onDrop={handleDrop}
                                                        >
                                                          <input type="file" accept="image/*" onChange={handleCampaignImageChange} className="hidden" ref={campaignImageInputRef} />
                                                          <PhotoIcon className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                                                          <p className="font-semibold text-gray-600">اسحب صورة النتائج وأفلتها هنا أو انقر للرفع</p>
                                                        </div>
                                                    )}
                                                 </div>
                                             )}
                                        </div>
                                        <div className="flex justify-end">
                                            <button
                                                onClick={() => checkAndPerformAnalysis(handleAnalyzeCampaignClick, 'campaign')}
                                                disabled={isLoading || !campaignVideoFile || (campaignResultsMode === 'text' && !campaignResultsText.trim()) || (campaignResultsMode === 'image' && !campaignResultsImage)}
                                                className="flex items-center gap-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                            >
                                                <SparklesIcon className="w-5 h-5"/>
                                                <span>ابدأ تحليل النتائج</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            currentAnalysisResult && (
                                <div id="report" ref={reportRef} className={`${isExporting ? 'bg-white' : ''}`}>
                                    {isExporting && <PdfHeader title={analysisType ? `${getReportTypeLabel(analysisType)}: ${videoFile?.name || ''}` : 'Report'} />}
                                    
                                    {analysisType === 'facebook' && facebookAnalysisResult && (
                                        <ReportWrapper title={`تحليل إعلان فيسبوك: ${videoFile?.name}`}>
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="md:w-64 flex-shrink-0">
                                                    <div className="sticky top-24 flex flex-col space-y-2">
                                                        {analysisResultTabs.map(tab => (
                                                            <button
                                                                key={tab.id}
                                                                onClick={() => setActiveTab(tab.id)}
                                                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-right font-semibold transition-all duration-200 ${
                                                                    activeTab === tab.id
                                                                        ? 'bg-violet-100 text-violet-700'
                                                                        : 'text-gray-600 hover:bg-gray-50'
                                                                }`}
                                                            >
                                                                {tab.icon}
                                                                <span>{tab.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                                    {activeTab === 'overview' ? (
                                                        <div className="p-6 md:p-8">
                                                            <OverallScoreDisplay score={overallScore} isExporting={isExporting}/>
                                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                                <InfoCard title="الأخطاء ونقاط الضعف" text={facebookAnalysisResult.mistakes} icon={<XCircleIcon />} tooltipText="تحديد الأخطاء المحتملة أو نقاط الضعف في الإعلان." gradient="from-red-100 to-red-50" isExporting={isExporting}/>
                                                                <InfoCard title="التوصيات والتحسينات" text={facebookAnalysisResult.recommendations} icon={<LightBulbIcon />} tooltipText="قائمة توصيات واضحة وقابلة للتنفيذ لتحسين الإعلان." gradient="from-green-100 to-green-50" isExporting={isExporting}/>
                                                                <InfoCard title="نوع الإعلان" text={facebookAnalysisResult.adType} icon={<TagIcon />} tooltipText="تحديد نوع الإعلان (مثال: شهادة عميل، فتح صندوق، تعليمي)." gradient="from-blue-100 to-blue-50" isExporting={isExporting}/>
                                                                <InfoCard title="هدف الإعلان" text={facebookAnalysisResult.adGoal} icon={<TargetIcon />} tooltipText="تحديد الهدف الأساسي الذي يبدو أن الإعلان يسعى لتحقيقه." gradient="from-yellow-100 to-yellow-50" isExporting={isExporting}/>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <MetricDetailView 
                                                            title={METRIC_CONFIG[activeTab]?.label || activeTab}
                                                            data={(facebookAnalysisResult as any)[activeTab]}
                                                            averageScore={averageScores ? averageScores[activeTab] : undefined}
                                                            tooltipText={METRIC_CONFIG[activeTab]?.tooltip}
                                                            isExporting={isExporting}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </ReportWrapper>
                                    )}

                                    {analysisType === 'instagram' && instagramAnalysisResult && (
                                        <ReportWrapper title={`تحليل إعلان انستغرام: ${videoFile?.name}`}>
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="md:w-64 flex-shrink-0">
                                                     <div className="sticky top-24 flex flex-col space-y-2">
                                                        {analysisResultTabs.map(tab => (
                                                            <button
                                                                key={tab.id}
                                                                onClick={() => setActiveTab(tab.id)}
                                                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-right font-semibold transition-all duration-200 ${ activeTab === tab.id ? 'bg-violet-100 text-violet-700' : 'text-gray-600 hover:bg-gray-50' }`}
                                                            >
                                                                {tab.icon}
                                                                <span>{tab.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                                    {activeTab === 'overview' ? (
                                                        <div className="p-6 md:p-8">
                                                            <OverallScoreDisplay score={overallScore} isExporting={isExporting}/>
                                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                                <InfoCard title="الأخطاء ونقاط الضعف" text={instagramAnalysisResult.mistakes} icon={<XCircleIcon />} tooltipText="تحديد الأخطاء المحتملة أو نقاط الضعف في الإعلان." gradient="from-red-100 to-red-50" isExporting={isExporting}/>
                                                                <InfoCard title="التوصيات والتحسينات" text={instagramAnalysisResult.recommendations} icon={<LightBulbIcon />} tooltipText="قائمة توصيات واضحة وقابلة للتنفيذ لتحسين الإعلان." gradient="from-green-100 to-green-50" isExporting={isExporting}/>
                                                                <InfoCard title="نوع الإعلان" text={instagramAnalysisResult.adType} icon={<TagIcon />} tooltipText="تحديد نوع الإعلان." gradient="from-blue-100 to-blue-50" isExporting={isExporting}/>
                                                                <InfoCard title="هدف الإعلان" text={instagramAnalysisResult.adGoal} icon={<TargetIcon />} tooltipText="تحديد الهدف الأساسي الذي يبدو أن الإعلان يسعى لتحقيقه." gradient="from-yellow-100 to-yellow-50" isExporting={isExporting}/>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <MetricDetailView 
                                                            title={METRIC_CONFIG[activeTab]?.label || activeTab}
                                                            data={(instagramAnalysisResult as any)[activeTab]}
                                                            averageScore={averageScores ? averageScores[activeTab] : undefined}
                                                            tooltipText={METRIC_CONFIG[activeTab]?.tooltip}
                                                            isExporting={isExporting}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </ReportWrapper>
                                    )}

                                     {analysisType === 'tiktok' && tiktokAnalysisResult && (
                                        <ReportWrapper title={`تحليل إعلان تيكتوك: ${videoFile?.name}`}>
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="md:w-64 flex-shrink-0">
                                                     <div className="sticky top-24 flex flex-col space-y-2">
                                                        {analysisResultTabs.map(tab => (
                                                            <button
                                                                key={tab.id}
                                                                onClick={() => setActiveTab(tab.id)}
                                                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-right font-semibold transition-all duration-200 ${ activeTab === tab.id ? 'bg-violet-100 text-violet-700' : 'text-gray-600 hover:bg-gray-50' }`}
                                                            >
                                                                {tab.icon}
                                                                <span>{tab.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                                    {activeTab === 'overview' ? (
                                                        <div className="p-6 md:p-8">
                                                            <OverallScoreDisplay score={overallScore} isExporting={isExporting}/>
                                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                                <InfoCard title="الأخطاء ونقاط الضعف" text={tiktokAnalysisResult.mistakes} icon={<XCircleIcon />} tooltipText="تحديد الأخطاء المحتملة أو نقاط الضعف في الإعلان." gradient="from-red-100 to-red-50" isExporting={isExporting}/>
                                                                <InfoCard title="التوصيات والتحسينات" text={tiktokAnalysisResult.recommendations} icon={<LightBulbIcon />} tooltipText="قائمة توصيات واضحة وقابلة للتنفيذ لتحسين الإعلان." gradient="from-green-100 to-green-50" isExporting={isExporting}/>
                                                                <InfoCard title="نوع الإعلان" text={tiktokAnalysisResult.adType} icon={<TagIcon />} tooltipText="تحديد نوع الإعلان." gradient="from-blue-100 to-blue-50" isExporting={isExporting}/>
                                                                <InfoCard title="هدف الإعلان" text={tiktokAnalysisResult.adGoal} icon={<TargetIcon />} tooltipText="تحديد الهدف الأساسي الذي يبدو أن الإعلان يسعى لتحقيقه." gradient="from-yellow-100 to-yellow-50" isExporting={isExporting}/>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <MetricDetailView 
                                                            title={METRIC_CONFIG[activeTab]?.label || activeTab}
                                                            data={(tiktokAnalysisResult as any)[activeTab]}
                                                            averageScore={averageScores ? averageScores[activeTab] : undefined}
                                                            tooltipText={METRIC_CONFIG[activeTab]?.tooltip}
                                                            isExporting={isExporting}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </ReportWrapper>
                                    )}

                                    {analysisType === 'amazon' && amazonAnalysisResult && (
                                        <ReportWrapper title={`تحليل إعلان أمازون: ${videoFile?.name}`}>
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="md:w-64 flex-shrink-0">
                                                     <div className="sticky top-24 flex flex-col space-y-2">
                                                        {analysisResultTabs.map(tab => (
                                                            <button
                                                                key={tab.id}
                                                                onClick={() => setActiveTab(tab.id)}
                                                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-right font-semibold transition-all duration-200 ${ activeTab === tab.id ? 'bg-violet-100 text-violet-700' : 'text-gray-600 hover:bg-gray-50' }`}
                                                            >
                                                                {tab.icon}
                                                                <span>{tab.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                                    {activeTab === 'overview' ? (
                                                        <div className="p-6 md:p-8">
                                                            <OverallScoreDisplay score={overallScore} isExporting={isExporting}/>
                                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                                <InfoCard title="الأخطاء ونقاط الضعف" text={amazonAnalysisResult.mistakes} icon={<XCircleIcon />} tooltipText="تحديد الأخطاء المحتملة أو نقاط الضعف في الإعلان." gradient="from-red-100 to-red-50" isExporting={isExporting}/>
                                                                <InfoCard title="التوصيات والتحسينات" text={amazonAnalysisResult.recommendations} icon={<LightBulbIcon />} tooltipText="قائمة توصيات واضحة وقابلة للتنفيذ لتحسين الإعلان." gradient="from-green-100 to-green-50" isExporting={isExporting}/>
                                                                <InfoCard title="نوع الإعلان" text={amazonAnalysisResult.adType} icon={<TagIcon />} tooltipText="تحديد نوع الإعلان." gradient="from-blue-100 to-blue-50" isExporting={isExporting}/>
                                                                <InfoCard title="هدف الإعلان" text={amazonAnalysisResult.adGoal} icon={<TargetIcon />} tooltipText="تحديد الهدف الأساسي الذي يبدو أن الإعلان يسعى لتحقيقه." gradient="from-yellow-100 to-yellow-50" isExporting={isExporting}/>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <MetricDetailView 
                                                            title={METRIC_CONFIG[activeTab]?.label || activeTab}
                                                            data={(amazonAnalysisResult as any)[activeTab]}
                                                            averageScore={averageScores ? averageScores[activeTab] : undefined}
                                                            tooltipText={METRIC_CONFIG[activeTab]?.tooltip}
                                                            isExporting={isExporting}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </ReportWrapper>
                                    )}

                                    {analysisType === 'snapchat' && snapchatAnalysisResult && (
                                        <ReportWrapper title={`تحليل إعلان سنابشات: ${videoFile?.name}`}>
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="md:w-64 flex-shrink-0">
                                                     <div className="sticky top-24 flex flex-col space-y-2">
                                                        {analysisResultTabs.map(tab => (
                                                            <button
                                                                key={tab.id}
                                                                onClick={() => setActiveTab(tab.id)}
                                                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-right font-semibold transition-all duration-200 ${ activeTab === tab.id ? 'bg-violet-100 text-violet-700' : 'text-gray-600 hover:bg-gray-50' }`}
                                                            >
                                                                {tab.icon}
                                                                <span>{tab.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                                    {activeTab === 'overview' ? (
                                                        <div className="p-6 md:p-8">
                                                            <OverallScoreDisplay score={overallScore} isExporting={isExporting}/>
                                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                                <InfoCard title="الأخطاء ونقاط الضعف" text={snapchatAnalysisResult.mistakes} icon={<XCircleIcon />} tooltipText="تحديد الأخطاء المحتملة أو نقاط الضعف في الإعلان." gradient="from-red-100 to-red-50" isExporting={isExporting}/>
                                                                <InfoCard title="التوصيات والتحسينات" text={snapchatAnalysisResult.recommendations} icon={<LightBulbIcon />} tooltipText="قائمة توصيات واضحة وقابلة للتنفيذ لتحسين الإعلان." gradient="from-green-100 to-green-50" isExporting={isExporting}/>
                                                                <InfoCard title="نوع الإعلان" text={snapchatAnalysisResult.adType} icon={<TagIcon />} tooltipText="تحديد نوع الإعلان." gradient="from-blue-100 to-blue-50" isExporting={isExporting}/>
                                                                <InfoCard title="هدف الإعلان" text={snapchatAnalysisResult.adGoal} icon={<TargetIcon />} tooltipText="تحديد الهدف الأساسي الذي يبدو أن الإعلان يسعى لتحقيقه." gradient="from-yellow-100 to-yellow-50" isExporting={isExporting}/>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <MetricDetailView 
                                                            title={METRIC_CONFIG[activeTab]?.label || activeTab}
                                                            data={(snapchatAnalysisResult as any)[activeTab]}
                                                            averageScore={averageScores ? averageScores[activeTab] : undefined}
                                                            tooltipText={METRIC_CONFIG[activeTab]?.tooltip}
                                                            isExporting={isExporting}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </ReportWrapper>
                                    )}

                                    {analysisType === 'youtube' && youtubeAnalysisResult && (
                                        <ReportWrapper title={`تحليل إعلان يوتيوب: ${videoFile?.name}`}>
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="md:w-64 flex-shrink-0">
                                                     <div className="sticky top-24 flex flex-col space-y-2">
                                                        {analysisResultTabs.map(tab => (
                                                            <button
                                                                key={tab.id}
                                                                onClick={() => setActiveTab(tab.id)}
                                                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-right font-semibold transition-all duration-200 ${ activeTab === tab.id ? 'bg-violet-100 text-violet-700' : 'text-gray-600 hover:bg-gray-50' }`}
                                                            >
                                                                {tab.icon}
                                                                <span>{tab.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                                    {activeTab === 'overview' ? (
                                                        <div className="p-6 md:p-8">
                                                            <OverallScoreDisplay score={overallScore} isExporting={isExporting}/>
                                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                                <InfoCard title="الأخطاء ونقاط الضعف" text={youtubeAnalysisResult.mistakes} icon={<XCircleIcon />} tooltipText="تحديد الأخطاء المحتملة أو نقاط الضعف في الإعلان." gradient="from-red-100 to-red-50" isExporting={isExporting}/>
                                                                <InfoCard title="التوصيات والتحسينات" text={youtubeAnalysisResult.recommendations} icon={<LightBulbIcon />} tooltipText="قائمة توصيات واضحة وقابلة للتنفيذ لتحسين الإعلان." gradient="from-green-100 to-green-50" isExporting={isExporting}/>
                                                                <InfoCard title="نوع الإعلان" text={youtubeAnalysisResult.adType} icon={<TagIcon />} tooltipText="تحديد نوع الإعلان." gradient="from-blue-100 to-blue-50" isExporting={isExporting}/>
                                                                <InfoCard title="هدف الإعلان" text={youtubeAnalysisResult.adGoal} icon={<TargetIcon />} tooltipText="تحديد الهدف الأساسي الذي يبدو أن الإعلان يسعى لتحقيقه." gradient="from-yellow-100 to-yellow-50" isExporting={isExporting}/>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <MetricDetailView 
                                                            title={METRIC_CONFIG[activeTab]?.label || activeTab}
                                                            data={(youtubeAnalysisResult as any)[activeTab]}
                                                            averageScore={averageScores ? averageScores[activeTab] : undefined}
                                                            tooltipText={METRIC_CONFIG[activeTab]?.tooltip}
                                                            isExporting={isExporting}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </ReportWrapper>
                                    )}

                                    {analysisType === 'google' && googleAnalysisResult && (
                                        <ReportWrapper title={`تحليل إعلان جوجل: ${videoFile?.name}`}>
                                            <div className="flex flex-col md:flex-row gap-6">
                                                <div className="md:w-64 flex-shrink-0">
                                                     <div className="sticky top-24 flex flex-col space-y-2">
                                                        {analysisResultTabs.map(tab => (
                                                            <button
                                                                key={tab.id}
                                                                onClick={() => setActiveTab(tab.id)}
                                                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-right font-semibold transition-all duration-200 ${ activeTab === tab.id ? 'bg-violet-100 text-violet-700' : 'text-gray-600 hover:bg-gray-50' }`}
                                                            >
                                                                {tab.icon}
                                                                <span>{tab.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                                    {activeTab === 'overview' ? (
                                                        <div className="p-6 md:p-8">
                                                            <OverallScoreDisplay score={overallScore} isExporting={isExporting}/>
                                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                                <InfoCard title="الأخطاء ونقاط الضعف" text={googleAnalysisResult.mistakes} icon={<XCircleIcon />} tooltipText="تحديد الأخطاء المحتملة أو نقاط الضعف في الإعلان." gradient="from-red-100 to-red-50" isExporting={isExporting}/>
                                                                <InfoCard title="التوصيات والتحسينات" text={googleAnalysisResult.recommendations} icon={<LightBulbIcon />} tooltipText="قائمة توصيات واضحة وقابلة للتنفيذ لتحسين الإعلان." gradient="from-green-100 to-green-50" isExporting={isExporting}/>
                                                                <InfoCard title="نوع الإعلان" text={googleAnalysisResult.adType} icon={<TagIcon />} tooltipText="تحديد نوع الإعلان." gradient="from-blue-100 to-blue-50" isExporting={isExporting}/>
                                                                <InfoCard title="هدف الإعلان" text={googleAnalysisResult.adGoal} icon={<TargetIcon />} tooltipText="تحديد الهدف الأساسي الذي يبدو أن الإعلان يسعى لتحقيقه." gradient="from-yellow-100 to-yellow-50" isExporting={isExporting}/>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <MetricDetailView 
                                                            title={METRIC_CONFIG[activeTab]?.label || activeTab}
                                                            data={(googleAnalysisResult as any)[activeTab]}
                                                            averageScore={averageScores ? averageScores[activeTab] : undefined}
                                                            tooltipText={METRIC_CONFIG[activeTab]?.tooltip}
                                                            isExporting={isExporting}
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        </ReportWrapper>
                                    )}

                                    {analysisType === 'pattern' && patternAnalysisResult && (
                                        <ReportWrapper title="كاشف الأنماط">
                                            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 space-y-8">
                                                <InfoCard title="الأنماط البصرية" text={patternAnalysisResult.visualPatterns} icon={<PaintBrushIcon />} gradient="from-blue-100 to-blue-50" isExporting={isExporting} />
                                                <InfoCard title="الأنماط الصوتية" text={patternAnalysisResult.auditoryPatterns} icon={<MusicNoteIcon />} gradient="from-indigo-100 to-indigo-50" isExporting={isExporting} />
                                                <InfoCard title="أنماط الرسائل" text={patternAnalysisResult.messagingPatterns} icon={<PencilSquareIcon />} gradient="from-purple-100 to-purple-50" isExporting={isExporting} />
                                                <InfoCard title="أنماط الدعوة للإجراء" text={patternAnalysisResult.ctaPatterns} icon={<CursorArrowRaysIcon />} gradient="from-pink-100 to-pink-50" isExporting={isExporting} />
                                                <InfoCard title="أنماط القوس العاطفي" text={patternAnalysisResult.emotionalArcPatterns} icon={<FaceSmileIcon />} gradient="from-yellow-100 to-yellow-50" isExporting={isExporting} />
                                                <div className="p-6 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl text-white shadow-lg">
                                                    <h3 className="text-xl font-bold flex items-center gap-3 mb-3"><SparklesIcon /> الوصفة السحرية (الملخص)</h3>
                                                    <p className="leading-relaxed">{patternAnalysisResult.winningFormula}</p>
                                                </div>
                                            </div>
                                        </ReportWrapper>
                                    )}

                                    {analysisType === 'campaign' && campaignAnalysisResult && (
                                        <ReportWrapper title={`تحليل النتائج: ${campaignVideoFile?.name}`}>
                                            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 space-y-8">
                                                <InfoCard title="نظرة عامة على الأداء" text={campaignAnalysisResult.performanceOverview} icon={<DocumentTextIcon />} gradient="from-gray-100 to-gray-50" isExporting={isExporting} />
                                                <InfoCard title="الربط بين الإبداع والنتائج" text={campaignAnalysisResult.creativeCorrelation} icon={<PuzzlePieceIcon />} gradient="from-blue-100 to-blue-50" isExporting={isExporting} />
                                                <InfoCard title="توصيات عملية" text={campaignAnalysisResult.actionableRecommendations} icon={<LightBulbIcon />} gradient="from-green-100 to-green-50" isExporting={isExporting} />
                                                <InfoCard title="أفكار لاختبارات مستقبلية" text={campaignAnalysisResult.futureTestingIdeas} icon={<SparklesIcon />} gradient="from-yellow-100 to-yellow-50" isExporting={isExporting} />
                                            </div>
                                        </ReportWrapper>
                                    )}

                                    {analysisType === 'comparison' && comparisonAnalysisResult && (
                                        <ReportWrapper title="مقارنة الفيديوهات">
                                            <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-200 space-y-8">
                                                <div className="p-6 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl text-white shadow-lg text-center">
                                                    <h3 className="text-2xl font-bold flex items-center justify-center gap-3 mb-3"><TrophyIcon /> الفائز هو</h3>
                                                    <p className="text-4xl font-extrabold capitalize">
                                                        {comparisonAnalysisResult.winner === 'video1' ? 'الفيديو الأول' : comparisonAnalysisResult.winner === 'video2' ? 'الفيديو الثاني' : 'تعادل'}
                                                    </p>
                                                </div>
                                                <InfoCard title="التوصية النهائية" text={comparisonAnalysisResult.recommendation} icon={<LightBulbIcon />} gradient="from-green-100 to-green-50" isExporting={isExporting} />

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <div className="space-y-6">
                                                        <h4 className="text-xl font-bold text-center text-gray-800">الفيديو الأول</h4>
                                                        {comparisonThumb1 && <img src={`data:image/jpeg;base64,${comparisonThumb1}`} alt="Video 1" className="rounded-lg shadow-md mx-auto" />}
                                                        <InfoCard title="نقاط القوة" text={comparisonAnalysisResult.video1Strengths} icon={<CheckBadgeIcon />} gradient="from-blue-100 to-blue-50" isExporting={isExporting} />
                                                        <InfoCard title="نقاط الضعف" text={comparisonAnalysisResult.video1Weaknesses} icon={<ShieldExclamationIcon />} gradient="from-red-100 to-red-50" isExporting={isExporting} />
                                                    </div>
                                                     <div className="space-y-6">
                                                        <h4 className="text-xl font-bold text-center text-gray-800">الفيديو الثاني</h4>
                                                        {comparisonThumb2 && <img src={`data:image/jpeg;base64,${comparisonThumb2}`} alt="Video 2" className="rounded-lg shadow-md mx-auto" />}
                                                        <InfoCard title="نقاط القوة" text={comparisonAnalysisResult.video2Strengths} icon={<CheckBadgeIcon />} gradient="from-blue-100 to-blue-50" isExporting={isExporting} />
                                                        <InfoCard title="نقاط الضعف" text={comparisonAnalysisResult.video2Weaknesses} icon={<ShieldExclamationIcon />} gradient="from-red-100 to-red-50" isExporting={isExporting} />
                                                    </div>
                                                </div>
                                            </div>
                                        </ReportWrapper>
                                    )}
                                </div>
                            )
                        )
                    )}
                </>
            )}
            
            <Notification notifications={notifications} onDismiss={removeNotification} />
            {isUpgradeModalOpen && <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} onUpgrade={handleUpgrade} currentUser={currentUser} reason={upgradeReason} ribbonConfig={ribbonConfig} />}
            <AnalysisModal isOpen={isAnalysisModalOpen} onClose={() => setIsAnalysisModalOpen(false)} onSelectAnalysis={handleSelectAnalysis} platformIconConfig={platformIconConfig} />
            
            {currentAnalysisResult && !isAdminView && (
                <>
                    <Chat 
                        isVisible={isChatOpen || showChatTooltip}
                        onClose={() => { setIsChatOpen(false); setShowChatTooltip(false); if (chatTooltipTimerRef.current) clearTimeout(chatTooltipTimerRef.current); }}
                        messages={chatMessages}
                        onSendMessage={handleSendMessage}
                        isLoading={isChatLoading}
                        isMinimized={isChatMinimized}
                        onToggleMinimize={() => setIsChatMinimized(!isChatMinimized)}
                    />

                    {/* Chat Floating Action Button */}
                    {!isChatOpen && !showChatTooltip && (
                         <button
                            onClick={() => {
                                setIsChatOpen(true);
                                setIsChatMinimized(false);
                            }}
                            className="fixed bottom-8 left-8 bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-full p-4 shadow-xl hover:scale-110 transition-transform duration-300 z-30 animate-pop-up"
                            title="اسأل مساعد التحليل"
                        >
                            <ChatBubbleLeftRightIcon className="w-8 h-8"/>
                        </button>
                    )}
                    {/* Chat Tooltip Bubble */}
                    {showChatTooltip && !isChatOpen && (
                        <div 
                            onClick={() => { setIsChatOpen(true); setIsChatMinimized(false); setShowChatTooltip(false); if (chatTooltipTimerRef.current) clearTimeout(chatTooltipTimerRef.current); }}
                            className="fixed bottom-8 left-8 w-64 bg-white p-4 rounded-lg shadow-2xl z-30 cursor-pointer animate-pop-up"
                        >
                             <button 
                                onClick={(e) => { e.stopPropagation(); setShowChatTooltip(false); if (chatTooltipTimerRef.current) clearTimeout(chatTooltipTimerRef.current); }}
                                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                            >
                                <XMarkIcon className="w-4 h-4"/>
                            </button>
                            <p className="font-bold text-gray-800">لديك سؤال عن هذا التقرير؟</p>
                            <p className="text-sm text-gray-600">انقر هنا لبدء الدردشة مع مساعد التحليل الذكي.</p>
                        </div>
                    )}
                </>
            )}

       </main>
    </div>
  );
};

export default App;