import React, { useState, useRef, useMemo } from 'react';
import type { User, SubscriptionTier } from '../types';
import * as authService from '../services/authService';
import { PhotoIcon, KeyIcon, UserCircleIcon, SparklesIcon, BellIcon } from './icons';

interface SettingsProps {
    user: User;
    onUpdate: (user: User) => void;
    onLogout: () => void;
    onUpgrade: (tier: SubscriptionTier) => void;
    addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const countries = [
    { code: '', name: 'اختر بلدك' },
    { code: 'SA', name: 'المملكة العربية السعودية' }, { code: 'AE', name: 'الإمارات العربية المتحدة' },
    { code: 'EG', name: 'مصر' }, { code: 'KW', name: 'الكويت' },
    { code: 'QA', name: 'قطر' }, { code: 'BH', name: 'البحرين' },
    { code: 'OM', name: 'عمان' }, { code: 'JO', name: 'الأردن' },
    { code: 'LB', name: 'لبنان' }, { code: 'MA', name: 'المغرب' },
    { code: 'DZ', name: 'الجزائر' }, { code: 'TN', name: 'تونس' },
    { code: 'IQ', name: 'العراق' }, { code: 'LY', name: 'ليبيا' },
    { code: 'SD', name: 'السودان' }, { code: 'SY', name: 'سوريا' },
    { code: 'YE', name: 'اليمن' }, { code: 'PS', name: 'فلسطين' },
    { code: 'OTHER', name: 'دولة أخرى' }
];


const ToggleSwitch: React.FC<{ enabled: boolean; onChange: (enabled: boolean) => void; label: string; description: string; }> = ({ enabled, onChange, label, description }) => (
    <div className="flex items-center justify-between">
        <div>
            <h4 className="font-semibold text-gray-700">{label}</h4>
            <p className="text-sm text-gray-500">{description}</p>
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


const Settings: React.FC<SettingsProps> = ({ user, onUpdate, onUpgrade, addNotification }) => {
    // Profile states
    const [name, setName] = useState(user.name || '');
    const [picture, setPicture] = useState(user.picture || '');
    const [country, setCountry] = useState(user.country || '');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [notificationPrefs, setNotificationPrefs] = useState(user.notificationPreferences || { onAnalysisComplete: true });

    // Password states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const subscriptionPlans = useMemo(() => authService.getSubscriptionPlans(), []);
    
    const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPicture(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const updatedUser = authService.updateProfile(user.email, { 
                name, 
                picture, 
                country, 
                notificationPreferences: notificationPrefs 
            });
            onUpdate(updatedUser);
            addNotification('تم تحديث الملف الشخصي بنجاح!', 'success');
        } catch (err) {
            addNotification((err as Error).message, 'error');
        }
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            addNotification('كلمتا المرور الجديدتان غير متطابقتين.', 'error');
            return;
        }
        try {
            authService.changePassword(user.email, currentPassword, newPassword);
            addNotification('تم تغيير كلمة المرور بنجاح!', 'success');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            addNotification((err as Error).message, 'error');
        }
    };

    const currentPlan = subscriptionPlans.find(p => p.tier === user.subscriptionTier);

    const nextResetDate = new Date();
    nextResetDate.setMonth(nextResetDate.getMonth() + 1);
    nextResetDate.setDate(1);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-gray-800">إعدادات الحساب</h1>

            {/* Subscription Information */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-3"><SparklesIcon className="w-6 h-6 text-violet-500" /> خطة الاشتراك</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                        <p className="text-sm text-gray-500">خطتك الحالية</p>
                        <p className="text-2xl font-bold text-violet-600">{currentPlan?.name || user.subscriptionTier}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg text-center">
                         <p className="text-sm text-gray-500">الاستخدام الشهري</p>
                        <p className="text-2xl font-bold text-gray-800">{user.analysisCount} / {currentPlan?.limit || 'N/A'}</p>
                        <p className="text-xs text-gray-500 mt-1">
                            يتجدد في: {nextResetDate.toLocaleDateString('ar-EG', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>
            </div>


            {/* Profile Information */}
            <form onSubmit={handleProfileSubmit} className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-3"><UserCircleIcon className="w-6 h-6 text-violet-500" /> معلومات الملف الشخصي</h2>
                 <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                         <div className="relative">
                            <img 
                                src={picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || user.email)}&background=8b5cf6&color=fff`} 
                                alt="Profile" 
                                className="w-24 h-24 rounded-full object-cover ring-2 ring-offset-2 ring-violet-200"
                            />
                            <button 
                                type="button" 
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-1 -right-1 bg-white p-1.5 rounded-full shadow border hover:bg-gray-100"
                                title="تغيير الصورة"
                            >
                                <PhotoIcon className="w-5 h-5 text-gray-600" />
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                onChange={handlePictureChange} 
                            />
                        </div>
                        <div className="flex-grow w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-600 mb-1">الاسم</label>
                                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-800 rounded-md p-2 focus:ring-violet-500 focus:border-violet-500"
                                    placeholder="اسمك الكامل"
                                />
                            </div>
                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-gray-600 mb-1">البلد</label>
                                <select id="country" value={country} onChange={(e) => setCountry(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-800 rounded-md p-2 focus:ring-violet-500 focus:border-violet-500"
                                >
                                    {countries.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Notifications Section inside the same form */}
                <div className="pt-6 mt-6 border-t border-gray-200">
                     <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-3"><BellIcon className="w-6 h-6 text-violet-500" /> إعدادات الإشعارات</h2>
                     <ToggleSwitch
                        label="إشعارات اكتمال التحليل"
                        description="أرسل لي بريدًا إلكترونيًا عند اكتمال تحليل الفيديو."
                        enabled={notificationPrefs.onAnalysisComplete}
                        onChange={(enabled) => setNotificationPrefs({ onAnalysisComplete: enabled })}
                     />
                </div>
                
                <div className="flex justify-end mt-8">
                    <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-5 rounded-lg transition-colors">حفظ التغييرات</button>
                </div>
            </form>

            {/* Change Password */}
            {user.provider === 'email' && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                     <h2 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-3"><KeyIcon className="w-6 h-6 text-violet-500" /> تغيير كلمة المرور</h2>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="currentPassword"className="block text-sm font-medium text-gray-600 mb-1">كلمة المرور الحالية</label>
                            <input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 text-gray-800 rounded-md p-2 focus:ring-violet-500 focus:border-violet-500"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="newPassword"className="block text-sm font-medium text-gray-600 mb-1">كلمة المرور الجديدة</label>
                                <input
                                    id="newPassword"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-800 rounded-md p-2 focus:ring-violet-500 focus:border-violet-500"
                                />
                            </div>
                             <div>
                                <label htmlFor="confirmPassword"className="block text-sm font-medium text-gray-600 mb-1">تأكيد كلمة المرور الجديدة</label>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-300 text-gray-800 rounded-md p-2 focus:ring-violet-500 focus:border-violet-500"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-2 px-5 rounded-lg transition-colors">تغيير كلمة المرور</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Settings;