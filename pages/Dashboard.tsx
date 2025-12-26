
import React, { useState } from 'react';
import { User, LeaveRequest, LeaveTypeDefinition } from '../types';
import { getLeaveInsights } from '../services/geminiService';
import { SparklesIcon } from '../components/Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  user: User;
  requests: LeaveRequest[];
  users: User[];
  leaveTypes: LeaveTypeDefinition[];
  t: any;
  isRtl: boolean;
  language: 'en' | 'ar';
}

const Dashboard: React.FC<DashboardProps> = ({ user, requests, users, leaveTypes, t, isRtl, language }) => {
  const [insights, setInsights] = useState<string | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  const fetchInsights = async () => {
    setLoadingInsights(true);
    const result = await getLeaveInsights(requests, users, language);
    setInsights(result || null);
    setLoadingInsights(false);
  };

  const chartData = leaveTypes.map(lt => ({
    name: isRtl ? lt.nameAr : lt.nameEn,
    value: user.balance[lt.id] || 0,
    color: lt.color
  }));

  const myRequests = requests.filter(r => r.userId === user.id);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-800">{t.welcome}, {user.fullName.split(' ')[0]}!</h1>
          <p className="text-slate-500 mt-1 font-medium">{isRtl ? 'هنا نظرة عامة على إجازاتك.' : 'Here is an overview of your leave status.'}</p>
        </div>
        {user.role === 'ADMIN' && (
          <button 
            onClick={fetchInsights}
            disabled={loadingInsights}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50 font-bold w-full md:w-auto"
          >
            <SparklesIcon className="w-5 h-5" />
            <span>{loadingInsights ? t.loadingInsights : t.insights}</span>
          </button>
        )}
      </div>

      {insights && (
        <div className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-[2rem] p-6 md:p-8 shadow-xl shadow-indigo-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <SparklesIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black">{t.insights}</h3>
          </div>
          <p className="text-indigo-50 leading-relaxed text-sm md:text-base font-medium">{insights}</p>
        </div>
      )}

      {/* Stats Grid - Responsive column count */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {leaveTypes.slice(0, 3).map(lt => (
          <div key={lt.id} className="p-5 md:p-8 bg-white border border-slate-200 rounded-[1.5rem] md:rounded-[2rem] shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <span className="text-slate-400 font-black uppercase tracking-widest text-[10px] md:text-xs">
                {isRtl ? lt.nameAr : lt.nameEn}
              </span>
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: lt.color }}></div>
            </div>
            <div className="text-3xl md:text-5xl font-black text-slate-800 tabular-nums">{user.balance[lt.id] || 0}</div>
            <div className="text-[10px] md:text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">
              {t.days} {t.availableBalance}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Chart Card */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 min-h-[400px]">
          <h3 className="text-lg md:text-xl font-black text-slate-800 mb-6">{t.summary}</h3>
          <div className="h-64 md:h-80 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                    {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 font-bold">
                {isRtl ? 'لا توجد بيانات للعرض' : 'No data available to display'}
              </div>
            )}
          </div>
        </div>

        {/* History Card */}
        <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg md:text-xl font-black text-slate-800">{t.history}</h3>
            <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg uppercase">
              {myRequests.length} {isRtl ? 'طلب' : 'Total'}
            </span>
          </div>
          <div className="space-y-3">
            {myRequests.slice(0, 5).length > 0 ? (
              myRequests.slice(0, 5).map(req => {
                const type = leaveTypes.find(lt => lt.id === req.typeId);
                return (
                  <div key={req.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between transition-colors hover:bg-slate-100/50">
                    <div>
                      <div className="font-bold text-slate-700 text-sm">{isRtl ? type?.nameAr : type?.nameEn}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-0.5">{req.startDate}</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase ${
                      req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                      req.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {t[req.status.toLowerCase()]}
                    </span>
                  </div>
                )
              })
            ) : (
              <div className="py-12 text-center">
                <p className="text-slate-400 text-sm font-bold">{isRtl ? 'لا يوجد سجل بعد' : 'No history yet'}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
