
import React, { useState } from 'react';
import { User, Language } from '../types';
import { LanguagesIcon, ShieldCheckIcon } from '../components/Icons';

interface LoginProps {
  onLogin: (u: User) => void;
  users: User[];
  t: any;
  language: Language;
  setLanguage: (l: Language) => void;
  isRtl: boolean;
}

const Login: React.FC<LoginProps> = ({ onLogin, users, t, language, setLanguage, isRtl }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = users.find(u => u.username === username.toLowerCase());
    
    // Check against user-specific password or default fallback
    if (user && (user.password === password || (!user.password && password === 'password123'))) {
      onLogin(user);
    } else {
      setError(isRtl ? 'اسم مستخدم أو كلمة مرور غير صحيحة' : 'Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="max-w-md w-full">
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
              <ShieldCheckIcon className="w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-slate-800">{t.title}</h1>
            <p className="text-slate-500 mt-2">{t.login} to manage your leave</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t.username}</label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. ahmed"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">{t.password}</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                required
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all"
            >
              {t.login}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center">
            <button 
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors"
            >
              <LanguagesIcon className="w-4 h-4" />
              {language === 'en' ? 'تبديل للغة العربية' : 'Switch to English'}
            </button>
          </div>
        </div>
        <p className="text-center text-slate-400 text-sm mt-8">
          &copy; 2024 SmartLeave System. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default Login;
