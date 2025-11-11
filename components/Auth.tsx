import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import * as authService from '../services/authService';
import { GoogleIcon, CheckCircleIcon } from './icons';

interface AuthProps {
    onLoginSuccess: (user: User) => void;
    addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
}

const Auth: React.FC<AuthProps> = ({ onLoginSuccess, addNotification }) => {
    type View = 'login' | 'register' | 'verify';
    const [view, setView] = useState<View>('login');
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [emailToVerify, setEmailToVerify] = useState('');
    const [logoUrl, setLogoUrl] = useState('');

    useEffect(() => {
        const config = authService.getLogoConfig();
        if (config.imageUrl) {
            setLogoUrl(config.imageUrl);
        }
    }, []);

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!email || !password || !name) {
            setError('الرجاء تعبئة جميع الحقول المطلوبة.');
            return;
        }

        try {
            authService.register(email, password, name);
            setEmailToVerify(email);
            setView('verify');
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!email || !password) {
            setError('الرجاء تعبئة جميع الحقول المطلوبة.');
            return;
        }

        try {
            const user = authService.login(email, password, rememberMe);
            onLoginSuccess(user);
        } catch (err) {
            setError((err as Error).message);
        }
    };
    
    const handleVerify = () => {
        try {
            authService.verifyEmail(emailToVerify);
            addNotification('تم التحقق من بريدك الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول.', 'success');
            setView('login');
            setEmail('');
            setPassword('');
        } catch (err) {
            setError((err as Error).message);
        }
    };

    const handleGoogleLogin = () => {
        try {
            const googleUser = {
                email: 'user.google@example.com',
                name: 'مستخدم جوجل',
            };
            const user = authService.loginWithGoogle(googleUser);
            onLoginSuccess(user);
        } catch (err) {
            setError((err as Error).message);
        }
    };
    
    const AuthHeader = () => (
        <div className="text-center h-10 flex items-center justify-center">
            {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="h-10 object-contain" />
            ) : (
                <h1 className="text-3xl font-bold text-violet-700">ANA<span className="font-light">VIDOO</span></h1>
            )}
        </div>
    );

    const renderLogin = () => (
        <>
            <div className="text-center space-y-2">
                <AuthHeader />
                <p className="text-gray-500">سجل الدخول للمتابعة</p>
            </div>
            <form className="space-y-4" onSubmit={handleLoginSubmit}>
                <div>
                    <label htmlFor="email" className="text-sm font-semibold text-gray-600">البريد الإلكتروني</label>
                    <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 mt-2 text-base text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                        placeholder="your@email.com" />
                </div>
                <div>
                    <label htmlFor="password"className="text-sm font-semibold text-gray-600">كلمة المرور</label>
                    <input id="password" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 mt-2 text-base text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                        placeholder="********" />
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input id="remember-me" name="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)}
                            className="h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded" />
                        <label htmlFor="remember-me" className="mr-2 block text-sm text-gray-900">تذكرني</label>
                    </div>
                </div>
                {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                <div>
                    <button type="submit" className="w-full px-4 py-3 font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors duration-300">
                        تسجيل الدخول
                    </button>
                </div>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
                <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">أو أكمل باستخدام</span></div>
            </div>
            <div>
                <button type="button" onClick={handleGoogleLogin} className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                    <GoogleIcon className="w-5 h-5" />
                    <span className="ml-2">التسجيل باستخدام جوجل</span>
                </button>
            </div>
            <div className="text-center">
                <button onClick={() => { setView('register'); setError(null); }} className="text-sm font-medium text-violet-600 hover:text-violet-500 hover:underline">
                    ليس لديك حساب؟ أنشئ واحدًا
                </button>
            </div>
        </>
    );

    const renderRegister = () => (
         <>
            <div className="text-center space-y-2">
                <AuthHeader />
                <p className="text-gray-500">أنشئ حسابًا جديدًا</p>
            </div>
            <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                 <div>
                    <label htmlFor="name" className="text-sm font-semibold text-gray-600">الاسم</label>
                    <input id="name" name="name" type="text" required value={name} onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 mt-2 text-base text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                        placeholder="اسمك الكامل" />
                </div>
                <div>
                    <label htmlFor="email" className="text-sm font-semibold text-gray-600">البريد الإلكتروني</label>
                    <input id="email" name="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 mt-2 text-base text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                        placeholder="your@email.com" />
                </div>
                <div>
                    <label htmlFor="password"className="text-sm font-semibold text-gray-600">كلمة المرور</label>
                    <input id="password" name="password" type="password" autoComplete="new-password" required value={password} onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 mt-2 text-base text-gray-800 bg-gray-50 border border-gray-300 rounded-lg focus:ring-violet-500 focus:border-violet-500"
                        placeholder="6+ أحرف" />
                </div>
                {error && <p className="text-sm text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</p>}
                <div>
                    <button type="submit" className="w-full px-4 py-3 font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-colors duration-300">
                        إنشاء حساب
                    </button>
                </div>
            </form>
             <div className="text-center">
                <button onClick={() => { setView('login'); setError(null); }} className="text-sm font-medium text-violet-600 hover:text-violet-500 hover:underline">
                    لديك حساب بالفعل؟ سجل الدخول
                </button>
            </div>
        </>
    );

    const renderVerify = () => (
        <div className="text-center space-y-6">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-bold text-gray-800">تحقق من بريدك الإلكتروني</h2>
            <p className="text-gray-500">
                لقد أرسلنا رابط تحقق إلى <span className="font-semibold text-gray-700">{emailToVerify}</span>.
                <br />
                الرجاء النقر على الرابط لتفعيل حسابك.
            </p>
             <div className="bg-yellow-100 text-yellow-800 text-sm p-3 rounded-lg">
                <p><span className="font-bold">ملاحظة:</span> هذه نسخة تجريبية. انقر على الزر أدناه لمحاكاة عملية التحقق.</p>
            </div>
            <button
                onClick={handleVerify}
                className="w-full px-4 py-3 font-semibold text-white bg-violet-600 rounded-lg hover:bg-violet-700 transition-colors duration-300"
            >
                لقد تحققت من بريدي (محاكاة)
            </button>
            <button
                onClick={() => { setView('login'); setError(null); }}
                className="text-sm font-medium text-gray-500 hover:text-gray-700"
            >
                العودة لتسجيل الدخول
            </button>
        </div>
    );


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
                {view === 'login' && renderLogin()}
                {view === 'register' && renderRegister()}
                {view === 'verify' && renderVerify()}
            </div>
        </div>
    );
};

export default Auth;