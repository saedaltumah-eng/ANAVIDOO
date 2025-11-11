// types.ts
import React from 'react';

// From App.tsx - UI configs
export interface MetricConfig {
    [key: string]: {
        label: string;
        tooltip: string;
    };
}

export interface PlatformIconConfig {
    [key: string]: string;
}

export interface ToolIconConfig {
    comparison: string;
    pattern: string;
    campaign: string;
}

// from AdminDashboard
export interface TrainingData {
    [key: string]: {
        positiveKeywords: string;
        negativeKeywords: string;
    };
}

export interface BannerConfig {
    isVisible: boolean;
    message: string;
}

export interface ImageBannerConfig {
    isVisible: boolean;
    imageUrl: string;
    linkUrl: string;
}

export interface LogoConfig {
    imageUrl: string;
}

export interface VersionConfig {
    version: string;
}


// From Auth
export type SubscriptionTier = 'free' | 'basic' | 'pro';

export interface SubscriptionPlan {
    tier: SubscriptionTier;
    name: string;
    priceMonthly: string;
    priceAnnually: string;
    limit: number;
    features: string[];
}


export interface User {
    email: string;
    name?: string;
    picture?: string;
    provider: 'email' | 'google';
    country?: string;
    notificationPreferences?: { onAnalysisComplete: boolean };
    subscriptionTier: SubscriptionTier;
    analysisCount: number;
    lastAnalysisDate: number;
    isAdmin: boolean;
    isVerified: boolean;
}

export interface RibbonConfig {
    isEnabled: boolean;
    text: string;
    backgroundColor: string;
    textColor: string;
    appliesTo: ('current' | SubscriptionTier)[];
}

// From Chat
export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

// Base Analysis types
export interface AnalysisCategory {
  score: number;
  analysis: string;
}

interface BaseAnalysisMetrics {
    mistakes: string;
    adType: string;
    adGoal: string;
    recommendations: string;
}

// Platform-specific metrics
export interface FacebookAnalysisMetrics extends BaseAnalysisMetrics {
    silentViewingClarity: AnalysisCategory;
    threeSecondHook: AnalysisCategory;
    mobileFirstDesign: AnalysisCategory;
    brandProminence: AnalysisCategory;
    ctaClarity: AnalysisCategory;
    feedAdAdaptation: AnalysisCategory;
}

export interface InstagramAnalysisMetrics extends BaseAnalysisMetrics {
    verticalFormatAndImmersiveness: AnalysisCategory;
    firstTwoSecondHook: AnalysisCategory;
    soundStrategyEffectiveness: AnalysisCategory;
    authenticityAndNativeFeel: AnalysisCategory;
    interactiveElementsUsage: AnalysisCategory;
    ctaEffectiveness: AnalysisCategory;
}

export interface TikTokAnalysisMetrics extends BaseAnalysisMetrics {
    ugcAuthenticity: AnalysisCategory;
    trendingSoundEffectiveness: AnalysisCategory;
    firstSecondImpact: AnalysisCategory;
    nativeTextOverlay: AnalysisCategory;
    viralityPotential: AnalysisCategory;
    platformNativeFeel: AnalysisCategory;
}

export interface AmazonAnalysisMetrics extends BaseAnalysisMetrics {
    platformAlignment: AnalysisCategory;
    productShowcaseClarity: AnalysisCategory;
    benefitOrientedCopy: AnalysisCategory;
    conversionFocus: AnalysisCategory;
    trustAndCredibility: AnalysisCategory;
    directnessOfMessage: AnalysisCategory;
    customerProblemSolution: AnalysisCategory;
    policyCompliance: AnalysisCategory;
}

export interface SnapchatAnalysisMetrics extends BaseAnalysisMetrics {
    immediateImpact: AnalysisCategory;
    verticalVideoFormat: AnalysisCategory;
    soundOnExperience: AnalysisCategory;
    authenticityAndRelatability: AnalysisCategory;
    swipeUpEffectiveness: AnalysisCategory;
    fastPacedEditing: AnalysisCategory;
}

export interface YouTubeAnalysisMetrics extends BaseAnalysisMetrics {
    fiveSecondHook: AnalysisCategory;
    valuePropositionClarity: AnalysisCategory;
    pacingAndEngagement: AnalysisCategory;
    audioVisualQuality: AnalysisCategory;
    brandIntegrationEffectiveness: AnalysisCategory;
    ctaStrength: AnalysisCategory;
}

export interface GoogleAnalysisMetrics extends BaseAnalysisMetrics {
    formatSuitability: AnalysisCategory;
    hookAndBranding: AnalysisCategory;
    visualStorytelling: AnalysisCategory;
    pacingAndStructure: AnalysisCategory;
    ctaStrengthAndPlacement: AnalysisCategory;
    audienceResonance: AnalysisCategory;
}

// Tool-specific results
export interface PatternAnalysisResult {
    visualPatterns: string;
    auditoryPatterns: string;
    messagingPatterns: string;
    ctaPatterns: string;
    emotionalArcPatterns: string;
    winningFormula: string;
}

export interface CampaignAnalysisResult {
    performanceOverview: string;
    creativeCorrelation: string;
    actionableRecommendations: string;
    futureTestingIdeas: string;
}

export interface ComparisonAnalysisResult {
    video1Strengths: string;
    video2Strengths: string;
    video1Weaknesses: string;
    video2Weaknesses: string;
    recommendation: string;
    winner: 'video1' | 'video2' | 'tie';
}

// Historic types for storage
interface HistoricAnalysisBase {
    id: string;
    fileName: string;
    timestamp: number;
    thumbnail: string | null;
    chatHistory: ChatMessage[];
}

export interface HistoricFacebookAnalysisResult extends FacebookAnalysisMetrics, HistoricAnalysisBase {
    type: 'facebook';
    objective: string;
    audience: string;
    adType: string;
    adFormat: string;
}

export interface HistoricInstagramAnalysisResult extends InstagramAnalysisMetrics, HistoricAnalysisBase {
    type: 'instagram';
    objective: string;
    adFormat: string;
}

export interface HistoricTikTokAnalysisResult extends TikTokAnalysisMetrics, HistoricAnalysisBase {
    type: 'tiktok';
    objective: string;
    audience: string;
    videoStyle: string;
    trendingSoundUsage: string;
}

export interface HistoricAmazonAnalysisResult extends AmazonAnalysisMetrics, HistoricAnalysisBase {
    type: 'amazon';
    objective: string;
    productCategory: string;
}

export interface HistoricSnapchatAnalysisResult extends SnapchatAnalysisMetrics, HistoricAnalysisBase {
    type: 'snapchat';
    objective: string;
    adFormat: string;
}

export interface HistoricYouTubeAnalysisResult extends YouTubeAnalysisMetrics, HistoricAnalysisBase {
    type: 'youtube';
    objective: string;
    adFormat: string;
}

export interface HistoricGoogleAnalysisResult extends GoogleAnalysisMetrics, HistoricAnalysisBase {
    type: 'google';
    objective: string;
    adNetwork: string;
}

export interface HistoricPatternAnalysisResult extends PatternAnalysisResult, HistoricAnalysisBase {
    type: 'pattern';
    fileNames: string[];
}

export interface HistoricCampaignAnalysisResult extends CampaignAnalysisResult, HistoricAnalysisBase {
    type: 'campaign';
}

export interface HistoricComparisonAnalysisResult extends ComparisonAnalysisResult, HistoricAnalysisBase {
    type: 'comparison';
    fileNames: string[];
    thumbnail2: string | null;
}

export type AnyHistoricAnalysisResult = 
    | HistoricFacebookAnalysisResult
    | HistoricInstagramAnalysisResult
    | HistoricTikTokAnalysisResult
    | HistoricAmazonAnalysisResult
    | HistoricSnapchatAnalysisResult
    | HistoricYouTubeAnalysisResult
    | HistoricGoogleAnalysisResult
    | HistoricPatternAnalysisResult
    | HistoricCampaignAnalysisResult
    | HistoricComparisonAnalysisResult;