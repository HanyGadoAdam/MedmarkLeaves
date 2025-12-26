
import React, { useState } from 'react';
import { User, LeaveRequest, LeaveTypeDefinition } from '../types';
import { PlusIcon, SendIcon } from '../components/Icons';

interface LeaveRequestsProps {
  user: User;
  requests: LeaveRequest[];
  leaveTypes: LeaveTypeDefinition[];
  onSubmit: (req: any) => void;
  t: any;
  isRtl: boolean;
}

const LeaveRequests: React.FC<LeaveRequestsProps> = ({ user, requests, leaveTypes, onSubmit, t, isRtl }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    typeId: leaveTypes[0]?.id || '',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const myRequests = requests.filter(r => r.userId === user.id);

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const diff = Math.abs(new Date(end).getTime() - new Date(start).getTime());
    return Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const days = calculateDays(formData.startDate, formData.endDate);
    if (days > (user.balance[formData.typeId] || 0)) {
      alert(isRtl ? 'رصيد غير كافٍ!' : 'Insufficient balance!');
      return;
    }
    onSubmit({ ...formData, userId: user.id, userName: user.fullName, totalDays: days });
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">{t.requests}</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-100 font-bold transition-all hover:-translate-y-1">
          <PlusIcon className="w-5 h-5" />
          <span>{t.newRequest}</span>
        </button>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-start">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="px-8 py-5 text-start text-xs font-black text-slate-400 uppercase">{t.type}</th>
              <th className="px-8 py-5 text-start text-xs font-black text-slate-400 uppercase">{t.dates}</th>
              <th className="px-8 py-5 text-start text-xs font-black text-slate-400 uppercase">{t.days}</th>
              <th className="px-8 py-5 text-start text-xs font-black text-slate-400 uppercase">{t.status}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {myRequests.map(req => {
              const type = leaveTypes.find(lt => lt.id === req.typeId);
              return (
                <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-5 font-bold text-slate-700">{isRtl ? type?.nameAr : type?.nameEn}</td>
                  <td className="px-8 py-5 text-sm text-slate-500">{req.startDate} - {req.endDate}</td>
                  <td className="px-8 py-5 font-mono font-black">{req.totalDays}</td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                      req.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {t[req.status.toLowerCase()]}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-10 border-b bg-blue-50/30">
              <h3 className="text-2xl font-black text-slate-800">{t.newRequest}</h3>
            </div>
            <form onSubmit={handleFormSubmit} className="p-10 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-600 mb-2">{t.type}</label>
                  <select 
                    value={formData.typeId}
                    onChange={e => setFormData({ ...formData, typeId: e.target.value })}
                    className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none font-bold"
                  >
                    {leaveTypes.map(lt => (
                      <option key={lt.id} value={lt.id}>{isRtl ? lt.nameAr : lt.nameEn} ({t.availableBalance}: {user.balance[lt.id] || 0})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">{t.startDate}</label>
                  <input type="date" required value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">{t.endDate}</label>
                  <input type="date" required value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-bold text-slate-600 mb-2">{t.reason}</label>
                  <textarea rows={3} value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 outline-none resize-none" />
                </div>
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 transition-all">{t.cancel}</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                  <SendIcon className="w-5 h-5" />
                  {t.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveRequests;
