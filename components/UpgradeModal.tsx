import React, { useState, useMemo } from 'react';
import { User, SubscriptionTier, RibbonConfig } from '../types';
import * as authService from '../services/authService';
import { XMarkIcon, CheckCircleIcon, SparklesIcon } from './icons';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: (tier: SubscriptionTier) => void;
    currentUser: User | null;
    reason: { message: string, reason: 'limit' | 'permission' } | null;
    ribbonConfig: RibbonConfig;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade, currentUser, reason, ribbonConfig }) => {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
    const plans = useMemo(() => authService.getSubscriptionPlans(), [isOpen]);
    
    if (!isOpen || !currentUser) return null;

    const getTitle = () => {
        if (!reason) return 'خطط الاشتراك';
        if (reason.reason === 'limit') return 'لقد وصلت إلى الحد الأقصى!';
        return 'الترقية مطلوبة';
    };
    
    const planColors: Record<SubscriptionTier, keyof typeof planStyles> = {
        free: 'gray',
        basic: 'violet',
        pro: 'indigo',
    };

    const planStyles = {
        gray: {
            containerActive: 'border-gray-500 bg-gray-50 shadow-lg',
            badge: 'bg-gray-600',
            title: 'text-gray-600',
            button: 'bg-gray-600',
            buttonHover: 'hover:bg-gray-700',
        },
        violet: {
            containerActive: 'border-violet-500 bg-violet-50 shadow-lg',
            badge: 'bg-violet-600',
            title: 'text-violet-600',
            button: 'bg-violet-600',
            buttonHover: 'hover:bg-violet-700',
        },
        indigo: {
            containerActive: 'border-indigo-500 bg-indigo-50 shadow-lg',
            badge: 'bg-indigo-600',
            title: 'text-indigo-600',
            button: 'bg-indigo-600',
            buttonHover: 'hover:bg-indigo-700',
        },
    };

    return (
        <div 
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] shadow-2xl p-8 text-gray-900 relative flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose} 
                    className="absolute top-6 left-6 text-gray-400 hover:text-gray-800 transition-colors z-10"
                >
                    <XMarkIcon className="w-8 h-8" />
                </button>

                <div className="text-center mb-6">
                    <div className="flex items-center justify-center gap-3 mb-3">
                         <SparklesIcon className="w-8 h-8 text-violet-500" />
                         <h2 className="text-3xl font-bold text-gray-800">{getTitle()}</h2>
                    </div>
                    <p className="text-gray-500 max-w-2xl mx-auto">{reason?.message || 'اختر الخطة التي تناسب احتياجاتك للوصول إلى المزيد من الميزات وزيادة حدودك.'}</p>
                </div>
                
                <div className="flex justify-center items-center gap-2 bg-gray-100 p-1.5 rounded-full w-fit mx-auto mb-8 transition-all duration-300">
                    <button 
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-2 text-sm font-bold rounded-full transition-all duration-300 ${billingCycle === 'monthly' ? 'bg-white text-violet-700 shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
                    >
                        شهري
                    </button>
                    <button 
                        onClick={() => setBillingCycle('annually')}
                        className={`flex items-center gap-2 px-6 py-2 text-sm font-bold rounded-full transition-all duration-300 ${billingCycle === 'annually' ? 'bg-white text-violet-700 shadow-md' : 'text-gray-500 hover:bg-gray-200'}`}
                    >
                        سنوي
                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">وفر 20%</span>
                    </button>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto p-1">
                    {plans.map((plan) => {
                        const price = billingCycle === 'annually' ? plan.priceAnnually : plan.priceMonthly;
                        const period = billingCycle === 'annually' ? 'سنوياً' : 'شهرياً';
                        const isCurrentPlan = currentUser.subscriptionTier === plan.tier;
                        const colorName = planColors[plan.tier];
                        const styles = planStyles[colorName];

                        const appliesToCurrent = ribbonConfig.appliesTo.includes('current') && isCurrentPlan;
                        const appliesToTier = ribbonConfig.appliesTo.includes(plan.tier);
                        const shouldShowRibbon = ribbonConfig.isEnabled && (appliesToCurrent || appliesToTier);
                        
                        let ribbonText = ribbonConfig.text;
                        if (isCurrentPlan && ribbonConfig.appliesTo.includes('current')) {
                           ribbonText = 'خطتك الحالية';
                        }


                        return (
                            <div key={plan.tier} className={`relative overflow-hidden rounded-2xl p-6 flex flex-col border-2 transition-all duration-300 ${isCurrentPlan ? styles.containerActive : 'border-gray-200 hover:border-violet-300'}`}>
                                {shouldShowRibbon && (
                                    <div 
                                        className="absolute top-[19px] -left-[43px] w-[170px] transform -rotate-45 text-center text-xs font-bold py-1 shadow-md z-10"
                                        style={{
                                            backgroundColor: ribbonConfig.backgroundColor,
                                            color: ribbonConfig.textColor,
                                        }}
                                    >
                                        {ribbonText}
                                    </div>
                                )}
                                <h3 className={`text-3xl font-bold ${styles.title}`}>{plan.name}</h3>
                                <p className="text-gray-500 mb-4">{plan.limit} تحليل/شهر</p>
                                <div className="flex items-baseline text-gray-800 mb-1">
                                    <span className="text-5xl font-extrabold">${price}</span>
                                    {plan.tier !== 'free' && <span className="text-base font-medium text-gray-500">/{period}</span>}
                                </div>
                                
                                <ul className="space-y-3 text-sm my-6 flex-grow">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start">
                                            <CheckCircleIcon className="w-5 h-5 text-green-500 ml-2 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-600">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => onUpgrade(plan.tier)}
                                    disabled={isCurrentPlan}
                                    className={`w-full font-bold py-3 px-4 rounded-lg transition-colors duration-300 mt-auto ${
                                        isCurrentPlan
                                            ? `bg-gray-200 text-gray-500 cursor-default`
                                            : `${styles.button} text-white ${styles.buttonHover} transform hover:-translate-y-0.5`
                                    }`}
                                >
                                    {isCurrentPlan ? 'هذه هي خطتك الحالية' : `الترقية إلى ${plan.name}`}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
