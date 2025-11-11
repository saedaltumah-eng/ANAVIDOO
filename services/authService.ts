//
// NOTE: This is a SIMULATED auth service using localStorage.
// In a real production application, this would be replaced with API calls
// to a secure backend server with a proper database.
// Storing passwords, even "hashed" ones, in localStorage is NOT secure.
//

import type { User, AnyHistoricAnalysisResult, SubscriptionTier, PlatformIconConfig, ToolIconConfig, TrainingData, BannerConfig, ImageBannerConfig, LogoConfig, VersionConfig, SubscriptionPlan, RibbonConfig } from '../types';

const USERS_KEY = 'video_analyzer_users_v3';
const HISTORY_KEY_PREFIX = 'video_analyzer_history_v5_'; 
const CURRENT_USER_KEY = 'video_analyzer_currentUser_v3';
const ICON_CONFIG_KEY = 'anavi_icon_config_v1';
const PLATFORM_ICON_CONFIG_KEY = 'anavi_platform_icon_config_v1';
const TOOL_ICON_CONFIG_KEY = 'anavi_tool_icon_config_v1';
const TRAINING_DATA_KEY = 'anavi_training_data_v1';
const BANNER_CONFIG_KEY = 'anavi_banner_config_v1';
const IMAGE_BANNER_CONFIG_KEY = 'anavi_image_banner_config_v1';
const LOGO_CONFIG_KEY = 'anavi_logo_config_v1';
const VERSION_CONFIG_KEY = 'anavi_version_config_v1';
const SUBSCRIPTION_PLANS_KEY = 'anavi_subscription_plans_v1';
const RIBBON_CONFIG_KEY = 'anavi_ribbon_config_v1';
const ADMIN_DOMAIN = 'advidoo.com';

interface UserRecord {
    password?: string;
    name?: string;
    picture?: string;
    provider: 'email' | 'google';
    country?: string;
    notificationPreferences?: { onAnalysisComplete: boolean };
    subscriptionTier: SubscriptionTier;
    analysisCount: number;
    lastAnalysisDate: number; // Timestamp
    isVerified: boolean;
}

// --- Ribbon Configuration Management ---
export const getRibbonConfig = (): RibbonConfig => {
    try {
        const config = localStorage.getItem(RIBBON_CONFIG_KEY);
        const defaultConfig: RibbonConfig = {
            isEnabled: true,
            text: 'خطتك الحالية',
            backgroundColor: '#10b981', // emerald-500
            textColor: '#ffffff',
            appliesTo: ['current'],
        };
        return config ? { ...defaultConfig, ...JSON.parse(config) } : defaultConfig;
    } catch (e) {
        return {
            isEnabled: true,
            text: 'خطتك الحالية',
            backgroundColor: '#10b981',
            textColor: '#ffffff',
            appliesTo: ['current'],
        };
    }
};

export const saveRibbonConfig = (config: RibbonConfig) => {
    localStorage.setItem(RIBBON_CONFIG_KEY, JSON.stringify(config));
};

// --- Version Configuration Management ---
export const getVersionConfig = (): VersionConfig => {
    try {
        const config = localStorage.getItem(VERSION_CONFIG_KEY);
        const defaultConfig: VersionConfig = { version: '1.0.0' };
        return config ? { ...defaultConfig, ...JSON.parse(config) } : defaultConfig;
    } catch (e) {
        return { version: '1.0.0' };
    }
};

export const saveVersionConfig = (config: VersionConfig) => {
    localStorage.setItem(VERSION_CONFIG_KEY, JSON.stringify(config));
};


// --- Logo Configuration Management ---
export const getLogoConfig = (): LogoConfig => {
    try {
        const config = localStorage.getItem(LOGO_CONFIG_KEY);
        const defaultConfig: LogoConfig = { imageUrl: '' };
        return config ? { ...defaultConfig, ...JSON.parse(config) } : defaultConfig;
    } catch (e) {
        return { imageUrl: '' };
    }
};

export const saveLogoConfig = (config: LogoConfig) => {
    localStorage.setItem(LOGO_CONFIG_KEY, JSON.stringify(config));
};


// --- Banner Configuration Management ---

export const getBannerConfig = (): BannerConfig => {
    try {
        const config = localStorage.getItem(BANNER_CONFIG_KEY);
        const defaultConfig: BannerConfig = { isVisible: false, message: '' };
        return config ? { ...defaultConfig, ...JSON.parse(config) } : defaultConfig;
    } catch (e) {
        return { isVisible: false, message: '' };
    }
};

export const saveBannerConfig = (config: BannerConfig) => {
    localStorage.setItem(BANNER_CONFIG_KEY, JSON.stringify(config));
};

export const getImageBannerConfig = (): ImageBannerConfig => {
    try {
        const config = localStorage.getItem(IMAGE_BANNER_CONFIG_KEY);
        const defaultConfig: ImageBannerConfig = { isVisible: false, imageUrl: '', linkUrl: '' };
        return config ? { ...defaultConfig, ...JSON.parse(config) } : defaultConfig;
    } catch (e) {
        return { isVisible: false, imageUrl: '', linkUrl: '' };
    }
};

export const saveImageBannerConfig = (config: ImageBannerConfig) => {
    localStorage.setItem(IMAGE_BANNER_CONFIG_KEY, JSON.stringify(config));
};


// --- Icon Configuration Management ---

const DEFAULT_ICON_CONFIG: Record<string, string> = {
  // Facebook
  silentViewingClarity: 'EyeIcon',
  threeSecondHook: 'ClockIcon',
  mobileFirstDesign: 'VideoCameraIcon',
  brandProminence: 'TagIcon',
  ctaClarity: 'CursorArrowRaysIcon',
  feedAdAdaptation: 'Square3Stack3DIcon',
  // Instagram
  verticalFormatAndImmersiveness: 'VideoCameraIcon',
  firstTwoSecondHook: 'BoltIcon',
  soundStrategyEffectiveness: 'SpeakerWaveIcon',
  authenticityAndNativeFeel: 'UserCircleIcon',
  interactiveElementsUsage: 'CursorArrowRaysIcon',
  ctaEffectiveness: 'MagnetIcon',
  // TikTok
  ugcAuthenticity: 'VideoCameraIcon',
  trendingSoundEffectiveness: 'MusicNoteIcon',
  firstSecondImpact: 'BoltIcon',
  nativeTextOverlay: 'DocumentTextIcon',
  viralityPotential: 'SparklesIcon',
  platformNativeFeel: 'PuzzlePieceIcon',
  // Amazon
  productShowcaseClarity: 'EyeIcon',
  benefitOrientedCopy: 'PencilSquareIcon',
  conversionFocus: 'TargetIcon',
  trustAndCredibility: 'CheckBadgeIcon',
  directnessOfMessage: 'ChatBubbleBottomCenterTextIcon',
  customerProblemSolution: 'LightBulbIcon',
  platformAlignment: 'PuzzlePieceIcon',
  policyCompliance: 'ShieldExclamationIcon',
  // Snapchat
  immediateImpact: 'BoltIcon',
  verticalVideoFormat: 'VideoCameraIcon',
  soundOnExperience: 'SpeakerWaveIcon',
  authenticityAndRelatability: 'FaceSmileIcon',
  swipeUpEffectiveness: 'CursorArrowRaysIcon',
  fastPacedEditing: 'FilmIcon',
  // YouTube
  fiveSecondHook: 'ClockIcon',
  valuePropositionClarity: 'LightBulbIcon',
  pacingAndEngagement: 'FilmIcon',
  audioVisualQuality: 'SparklesIcon',
  brandIntegrationEffectiveness: 'TagIcon',
  ctaStrength: 'CursorArrowRaysIcon',
  // Google
  formatSuitability: 'PuzzlePieceIcon',
  hookAndBranding: 'MagnetIcon',
  visualStorytelling: 'FilmIcon',
  pacingAndStructure: 'ClockIcon',
  ctaStrengthAndPlacement: 'CursorArrowRaysIcon',
  audienceResonance: 'UsersIcon',
};

const DEFAULT_TOOL_ICON_CONFIG: ToolIconConfig = {
    comparison: 'ArrowsRightLeftIcon',
    pattern: 'Square3Stack3DIcon',
    campaign: 'ChartPieIcon',
};


export const getIconConfig = (): Record<string, string> => {
    try {
        const config = localStorage.getItem(ICON_CONFIG_KEY);
        if (config) {
            const parsedConfig = JSON.parse(config);
            return { ...DEFAULT_ICON_CONFIG, ...parsedConfig };
        }
        return DEFAULT_ICON_CONFIG;
    } catch (e) {
        return DEFAULT_ICON_CONFIG;
    }
};

export const saveIconConfig = (config: Record<string, string>) => {
    localStorage.setItem(ICON_CONFIG_KEY, JSON.stringify(config));
};

export const getPlatformIconConfig = (): PlatformIconConfig => {
    try {
        const config = localStorage.getItem(PLATFORM_ICON_CONFIG_KEY);
        const defaultConfig: PlatformIconConfig = { facebook: '', tiktok: '', amazon: '', snapchat: '', youtube: '', instagram: '', google: '' };
        return config ? { ...defaultConfig, ...JSON.parse(config) } : defaultConfig;
    } catch (e) {
        return { facebook: '', tiktok: '', amazon: '', snapchat: '', youtube: '', instagram: '', google: '' };
    }
};

export const savePlatformIconConfig = (config: PlatformIconConfig) => {
    localStorage.setItem(PLATFORM_ICON_CONFIG_KEY, JSON.stringify(config));
};

export const getToolIconConfig = (): ToolIconConfig => {
    try {
        const config = localStorage.getItem(TOOL_ICON_CONFIG_KEY);
        if (config) {
             const parsedConfig = JSON.parse(config);
             return { ...DEFAULT_TOOL_ICON_CONFIG, ...parsedConfig };
        }
        return DEFAULT_TOOL_ICON_CONFIG;
    } catch (e) {
        return DEFAULT_TOOL_ICON_CONFIG;
    }
};

export const saveToolIconConfig = (config: ToolIconConfig) => {
    localStorage.setItem(TOOL_ICON_CONFIG_KEY, JSON.stringify(config));
};

export const getTrainingData = (): TrainingData => {
    try {
        const data = localStorage.getItem(TRAINING_DATA_KEY);
        return data ? JSON.parse(data) : {};
    } catch (e) {
        return {};
    }
};

export const saveTrainingData = (data: TrainingData) => {
    localStorage.setItem(TRAINING_DATA_KEY, JSON.stringify(data));
};


// --- Subscription Management ---
const DEFAULT_PLANS: SubscriptionPlan[] = [
    {
        tier: 'free',
        name: 'مجاني',
        priceMonthly: '0',
        priceAnnually: '0',
        limit: 1,
        features: [
            'تحليل المنصات (Meta, TikTok, etc.)',
            'سجل التحليلات',
            'تصدير التقارير (PDF)',
        ],
    },
    {
        tier: 'basic',
        name: 'أساسي',
        priceMonthly: '19',
        priceAnnually: '190',
        limit: 10,
        features: [
            'كل شيء في الخطة المجانية',
            'الوصول لأدوات التحليل المتقدمة',
            'كاشف الأنماط',
            'تحليل نتائج الحملات',
            'مقارنة الفيديوهات',
        ],
    },
    {
        tier: 'pro',
        name: 'برو',
        priceMonthly: '49',
        priceAnnually: '490',
        limit: 30,
        features: [
            'كل شيء في الخطة الأساسية',
            'حد تحليلات أعلى',
            'دعم ذو أولوية',
            'ميزات حصرية قادمة',
        ],
    },
];

export const getSubscriptionPlans = (): SubscriptionPlan[] => {
    try {
        const plansJSON = localStorage.getItem(SUBSCRIPTION_PLANS_KEY);
        return plansJSON ? JSON.parse(plansJSON) : DEFAULT_PLANS;
    } catch (e) {
        return DEFAULT_PLANS;
    }
};

export const saveSubscriptionPlans = (plans: SubscriptionPlan[]) => {
    localStorage.setItem(SUBSCRIPTION_PLANS_KEY, JSON.stringify(plans));
};

export const getSubscriptionLimits = (tier: SubscriptionTier) => {
    const plans = getSubscriptionPlans();
    const currentPlan = plans.find(p => p.tier === tier);

    const defaultLimits = {
        pro: { limit: 30, hasToolsAccess: true },
        basic: { limit: 10, hasToolsAccess: true },
        free: { limit: 1, hasToolsAccess: false },
    };

    if (currentPlan) {
        return {
            limit: currentPlan.limit,
            hasToolsAccess: currentPlan.tier !== 'free',
        };
    }
    // Fallback to defaults if something goes wrong
    return defaultLimits[tier] || defaultLimits.free;
};


const checkAndResetMonthlyCount = (userRecord: UserRecord): UserRecord => {
    const now = new Date();
    const lastDate = new Date(userRecord.lastAnalysisDate);
    if (now.getMonth() !== lastDate.getMonth() || now.getFullYear() !== lastDate.getFullYear()) {
        userRecord.analysisCount = 0;
    }
    return userRecord;
};

// --- User Management ---

const getUsers = (): { [email: string]: UserRecord } => {
    try {
        const usersJSON = localStorage.getItem(USERS_KEY);
        if (!usersJSON) return {};
        const parsedUsers = JSON.parse(usersJSON);
        // Basic validation to prevent crashes from malformed data
        if (typeof parsedUsers !== 'object' || parsedUsers === null) {
            localStorage.removeItem(USERS_KEY); // Clear corrupted data
            return {};
        }
        return parsedUsers;
    } catch (e) {
        console.error("Failed to parse users from localStorage:", e);
        // If parsing fails, it's likely corrupted. Clear it.
        localStorage.removeItem(USERS_KEY);
        return {};
    }
};

const saveUsers = (users: { [email: string]: UserRecord }) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

const persistUser = (user: User, remember: boolean) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

const userRecordToUser = (email: string, record: UserRecord): User => ({
    email,
    name: record.name,
    picture: record.picture,
    provider: record.provider,
    country: record.country,
    notificationPreferences: record.notificationPreferences,
    subscriptionTier: record.subscriptionTier,
    analysisCount: record.analysisCount,
    lastAnalysisDate: record.lastAnalysisDate,
    isAdmin: email.toLowerCase().endsWith(`@${ADMIN_DOMAIN}`),
    isVerified: record.isVerified,
});

export const getAllUsers = (): User[] => {
    const users = getUsers();
    return Object.entries(users).map(([email, record]) => userRecordToUser(email, record));
};

export const register = (email: string, password: string, name: string): void => {
    const users = getUsers();
    if (users[email]) {
        throw new Error('هذا البريد الإلكتروني مسجل بالفعل.');
    }
    
    users[email] = { 
        password, 
        name, 
        provider: 'email',
        subscriptionTier: 'free',
        analysisCount: 0,
        lastAnalysisDate: 0,
        country: '',
        notificationPreferences: { onAnalysisComplete: true },
        isVerified: false, // New users start as unverified
    };
    saveUsers(users);
};

export const verifyEmail = (email: string): void => {
    const users = getUsers();
    if (users[email]) {
        users[email].isVerified = true;
        saveUsers(users);
    } else {
        throw new Error('المستخدم غير موجود.');
    }
};

export const login = (email: string, password: string, rememberMe: boolean): User => {
    const users = getUsers();
    let userRecord = users[email];
    if (!userRecord || userRecord.provider !== 'email' || userRecord.password !== password) {
        throw new Error('البريد الإلكتروني أو كلمة المرور غير صحيحة.');
    }

    if (!userRecord.isVerified) {
        throw new Error('الرجاء التحقق من بريدك الإلكتروني أولاً قبل تسجيل الدخول.');
    }
    
    userRecord = checkAndResetMonthlyCount(userRecord);
    users[email] = userRecord;
    saveUsers(users);

    const user = userRecordToUser(email, userRecord);
    persistUser(user, rememberMe);
    return user;
};

export const loginWithGoogle = (googleUser: { email: string; name: string; picture?: string }): User => {
    const users = getUsers();
    let userRecord = users[googleUser.email];
    
    if (userRecord && userRecord.provider !== 'google') {
        throw new Error('هذا البريد الإلكتروني مسجل بالفعل. الرجاء تسجيل الدخول بكلمة المرور.');
    }
    
    if (!userRecord) {
        userRecord = {
            name: googleUser.name,
            picture: googleUser.picture,
            provider: 'google',
            subscriptionTier: 'free',
            analysisCount: 0,
            lastAnalysisDate: 0,
            country: '',
            notificationPreferences: { onAnalysisComplete: true },
            isVerified: true, // Google accounts are considered verified
        };
    }

    userRecord = checkAndResetMonthlyCount(userRecord);
    users[googleUser.email] = userRecord;
    
    const user = userRecordToUser(googleUser.email, userRecord);
    persistUser(user, true); // Remember Google users by default
    return user;
};


export const logout = () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    sessionStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
    try {
        const sessionUser = sessionStorage.getItem(CURRENT_USER_KEY);
        if (sessionUser) return JSON.parse(sessionUser) as User;

        const localUser = localStorage.getItem(CURRENT_USER_KEY);
        if (!localUser) return null;

        const parsedUser = JSON.parse(localUser) as User;
        // Ensure isAdmin flag is correctly set on session restore
        if (parsedUser.email.toLowerCase().endsWith(`@${ADMIN_DOMAIN}`)) {
            parsedUser.isAdmin = true;
        }
        return parsedUser;

    } catch (e) {
        return null;
    }
};

export const updateProfile = (email: string, updates: { name?: string; picture?: string; country?: string; notificationPreferences?: { onAnalysisComplete: boolean } }): User => {
    const users = getUsers();
    if (!users[email]) {
        throw new Error('المستخدم غير موجود.');
    }

    users[email] = { ...users[email], ...updates };
    saveUsers(users);

    const updatedUser = userRecordToUser(email, users[email]);
    
    const currentUser = getCurrentUser();
    if (currentUser && currentUser.email === email) {
      persistUser(updatedUser, !!localStorage.getItem(CURRENT_USER_KEY));
    }
    
    return updatedUser;
};

export const changePassword = (email: string, oldPassword: string, newPassword: string) => {
    const users = getUsers();
    const userRecord = users[email];

    if (!userRecord || userRecord.provider !== 'email' || userRecord.password !== oldPassword) {
        throw new Error('كلمة المرور الحالية غير صحيحة.');
    }
    if (newPassword.length < 6) {
        throw new Error('يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل.');
    }

    userRecord.password = newPassword;
    users[email] = userRecord;
    saveUsers(users);
};

// --- Analysis & Subscription Checks ---

type AnalysisPermission = { canAnalyze: true } | { canAnalyze: false; message: string; reason: 'limit' | 'permission' };
type AnalysisToolType = 'pattern' | 'campaign' | 'comparison' | 'platform';

export const canPerformAnalysis = (email: string, toolType: AnalysisToolType): AnalysisPermission => {
    const users = getUsers();
    let userRecord = users[email];
    if (!userRecord) {
        return { canAnalyze: false, message: 'المستخدم غير موجود.', reason: 'permission' };
    }

    // Check for monthly reset and update the record if needed
    const originalCount = userRecord.analysisCount;
    userRecord = checkAndResetMonthlyCount(userRecord);
    if (userRecord.analysisCount !== originalCount) {
        users[email] = userRecord;
        saveUsers(users);
    }
    
    const { limit, hasToolsAccess } = getSubscriptionLimits(userRecord.subscriptionTier);

    if (toolType !== 'platform' && !hasToolsAccess) {
        return { canAnalyze: false, message: 'هذه الأداة متاحة فقط في الخطط المدفوعة. يرجى الترقية.', reason: 'permission' };
    }

    if (userRecord.analysisCount >= limit) {
        return { canAnalyze: false, message: `لقد وصلت إلى الحد الأقصى الشهري (${limit} تحليلات). يرجى الترقية للمتابعة.`, reason: 'limit' };
    }

    return { canAnalyze: true };
};

export const recordAnalysis = (email: string): User => {
    const users = getUsers();
    const userRecord = users[email];
    if (!userRecord) {
        throw new Error("لا يمكن تسجيل التحليل لمستخدم غير موجود.");
    }

    userRecord.analysisCount += 1;
    userRecord.lastAnalysisDate = Date.now();
    users[email] = userRecord;
    saveUsers(users);

    const updatedUser = userRecordToUser(email, userRecord);
    persistUser(updatedUser, !!localStorage.getItem(CURRENT_USER_KEY) || !!sessionStorage.getItem(CURRENT_USER_KEY));
    return updatedUser;
};

export const updateSubscription = (email: string, newTier: SubscriptionTier): User => {
    const users = getUsers();
    const userRecord = users[email];
    if (!userRecord) {
        throw new Error("لا يمكن تحديث اشتراك مستخدم غير موجود.");
    }

    userRecord.subscriptionTier = newTier;
    // Reset count on upgrade
    userRecord.analysisCount = 0;
    userRecord.lastAnalysisDate = 0; 
    users[email] = userRecord;
    saveUsers(users);

    const updatedUser = userRecordToUser(email, userRecord);
    persistUser(updatedUser, !!localStorage.getItem(CURRENT_USER_KEY) || !!sessionStorage.getItem(CURRENT_USER_KEY));
    return updatedUser;
};


// --- History Management ---

export const getHistoryForUser = (email: string): AnyHistoricAnalysisResult[] => {
    try {
        const historyJSON = localStorage.getItem(`${HISTORY_KEY_PREFIX}${email}`);
        if (!historyJSON) return [];

        const parsedHistory = JSON.parse(historyJSON);
        if (Array.isArray(parsedHistory)) {
            // FIX: Validate data from localStorage to prevent runtime errors with corrupted history data.
            return parsedHistory.filter((report): report is AnyHistoricAnalysisResult => 
                report && 
                typeof report === 'object' &&
                typeof report.id === 'string' &&
                typeof report.timestamp === 'number' &&
                typeof report.fileName === 'string' &&
                typeof report.type === 'string'
            );
        }
        return [];
    } catch (e) {
        console.error(`Failed to parse history for ${email}:`, e);
        localStorage.removeItem(`${HISTORY_KEY_PREFIX}${email}`); // Clear corrupted data
        return [];
    }
};

export const getAllHistory = (): (AnyHistoricAnalysisResult & { userEmail: string })[] => {
    const users = getUsers();
    let allHistory: (AnyHistoricAnalysisResult & { userEmail: string })[] = [];
    for (const email in users) {
        const userHistory = getHistoryForUser(email);
        const historyWithEmail = userHistory.map(h => ({ ...h, userEmail: email }));
        allHistory = [...allHistory, ...historyWithEmail];
    }
    // Sort by most recent first
    allHistory.sort((a, b) => b.timestamp - a.timestamp);
    return allHistory;
};

export const saveHistoryForUser = (email: string, result: AnyHistoricAnalysisResult): AnyHistoricAnalysisResult[] => {
    const history = getHistoryForUser(email);
    const newHistory = [result, ...history].slice(0, 50); // Keep last 50, new ones at the top
    localStorage.setItem(`${HISTORY_KEY_PREFIX}${email}`, JSON.stringify(newHistory));
    return newHistory;
};

export const updateHistoryItem = (email: string, updatedReport: AnyHistoricAnalysisResult): AnyHistoricAnalysisResult[] => {
    const history = getHistoryForUser(email);
    const reportIndex = history.findIndex(item => item.id === updatedReport.id);
    if (reportIndex !== -1) {
        history[reportIndex] = updatedReport;
        localStorage.setItem(`${HISTORY_KEY_PREFIX}${email}`, JSON.stringify(history));
    }
    return history;
};

export const clearHistoryForUser = (email: string) => {
    localStorage.removeItem(`${HISTORY_KEY_PREFIX}${email}`);
};