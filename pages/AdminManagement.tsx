
import React, { useState, useEffect } from 'react';
import { User, LeaveRequest, LeaveTypeDefinition, LeaveStatus } from '../types';
import { 
  CheckIcon, XCircleIcon, UsersIcon, DownloadIcon, SearchIcon, 
  SettingsIcon, EditIcon, SaveIcon, XIcon, PlusIcon, CalendarIcon
} from '../components/Icons';

interface AdminManagementProps {
  users: User[];
  requests: LeaveRequest[];
  leaveTypes: LeaveTypeDefinition[];
  onUpdateStatus: (id: string, status: LeaveStatus) => void;
  onSyncUsers: (users: User[]) => void;
  onSyncTypes: (types: LeaveTypeDefinition[]) => void;
  t: any;
  isRtl: boolean;
}

const AdminManagement: React.FC<AdminManagementProps> = ({ 
  users, requests, leaveTypes, onUpdateStatus, onSyncUsers, onSyncTypes, t, isRtl 
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'employees' | 'settings'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    fullName: '',
    username: '',
    password: '',
    role: 'EMPLOYEE' as const,
    balances: {} as Record<string, number>
  });

  // Initialize balances when leaveTypes change or when opening the add modal
  useEffect(() => {
    const initialBalances: Record<string, number> = {};
    leaveTypes.forEach(lt => {
      initialBalances[lt.id] = lt.defaultBalance;
    });
    setNewUser(prev => ({ ...prev, balances: initialBalances }));
  }, [leaveTypes, showAddUser]);

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const filteredUsers = users.filter(u => u.fullName.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const updated = users.map(u => u.id === editingUser.id ? editingUser : u);
    onSyncUsers(updated);
    setEditingUser(null);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!newUser.fullName || !newUser.username || !newUser.password) {
      alert(isRtl ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
      return;
    }

    // Check for unique username
    if (users.some(u => u.username.toLowerCase() === newUser.username.toLowerCase())) {
      alert(isRtl ? 'اسم المستخدم موجود بالفعل' : 'Username already exists');
      return;
    }

    const createdUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      fullName: newUser.fullName,
      username: newUser.username.toLowerCase(),
      password: newUser.password,
      role: newUser.role,
      balance: { ...newUser.balances }
    };

    onSyncUsers([...users, createdUser]);
    setShowAddUser(false);
    // Reset form
    setNewUser({
      fullName: '',
      username: '',
      password: '',
      role: 'EMPLOYEE',
      balances: leaveTypes.reduce((acc, lt) => ({ ...acc, [lt.id]: lt.defaultBalance }), {})
    });
  };

  const handleUpdateLeaveType = (id: string, field: string, value: any) => {
    const updated = leaveTypes.map(lt => lt.id === id ? { ...lt, [field]: value } : lt);
    onSyncTypes(updated);
  };

  const handleExport = () => {
    const headers = "Name,Role," + leaveTypes.map(lt => lt.id).join(",") + "\n";
    const rows = users.map(u => `${u.fullName},${u.role},` + leaveTypes.map(lt => u.balance[lt.id] || 0).join(",")).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.csv';
    a.click();
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex bg-white p-2 rounded-[1.5rem] border border-slate-200 shadow-sm w-fit overflow-x-auto">
          {['pending', 'employees', 'settings'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-8 py-3 rounded-2xl text-sm font-black transition-all whitespace-nowrap ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-blue-600'}`}
            >
              {tab === 'pending' ? `${t.pendingApprovals} (${pendingRequests.length})` : tab === 'employees' ? t.employees : t.settings}
            </button>
          ))}
        </div>
        <div className="flex gap-4">
          {activeTab === 'employees' && (
            <button onClick={() => setShowAddUser(true)} className="flex items-center gap-2 px-6 py-4 bg-green-600 text-white rounded-2xl font-bold shadow-lg shadow-green-100 hover:bg-green-700 transition-all">
              <PlusIcon className="w-5 h-5" />
              <span>{t.addEmployee}</span>
            </button>
          )}
          <button onClick={handleExport} className="flex items-center gap-2 px-6 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold shadow-sm hover:bg-slate-50">
            <DownloadIcon className="w-5 h-5" />
            <span>{t.export}</span>
          </button>
        </div>
      </div>

      {activeTab === 'pending' && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {pendingRequests.map(req => {
            const type = leaveTypes.find(lt => lt.id === req.typeId);
            const requester = users.find(u => u.id === req.userId);
            const currentBalance = requester?.balance[req.typeId] || 0;

            return (
              <div key={req.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all flex flex-col h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-600 uppercase">
                    {req.userName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black text-slate-800 line-clamp-1">{req.userName}</h4>
                    <p className="text-xs text-slate-400 tracking-widest uppercase font-bold">
                      {isRtl ? type?.nameAr : type?.nameEn}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">{t.availableBalance}</div>
                    <div className={`text-lg font-black ${currentBalance < req.totalDays ? 'text-red-600' : 'text-blue-600'}`}>
                      {currentBalance}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 mb-6 bg-slate-50 p-6 rounded-2xl text-sm flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.startDate}</span>
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        {req.startDate}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.endDate}</span>
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        {req.endDate}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                    <span className="font-black text-slate-500 uppercase text-[10px] tracking-widest">{t.days}:</span>
                    <span className="font-black text-slate-800 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                      {req.totalDays} {isRtl ? 'أيام' : 'Days'}
                    </span>
                  </div>

                  {req.reason && (
                    <div className="pt-3 border-t border-slate-200">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">{t.reason}</span>
                       <p className="italic text-slate-600 text-xs line-clamp-3">"{req.reason}"</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <button 
                    onClick={() => onUpdateStatus(req.id, 'APPROVED')} 
                    className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-black hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-100"
                  >
                    <CheckIcon className="w-4 h-4" />
                    {t.approve}
                  </button>
                  <button 
                    onClick={() => onUpdateStatus(req.id, 'REJECTED')} 
                    className="flex-1 py-4 bg-red-500 text-white rounded-2xl font-black hover:bg-red-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-100"
                  >
                    <XCircleIcon className="w-4 h-4" />
                    {t.reject}
                  </button>
                </div>
              </div>
            );
          })}
          {pendingRequests.length === 0 && (
            <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300 shadow-sm">
               <p className="text-slate-400 font-bold text-lg">{isRtl ? 'لا توجد طلبات معلقة للمراجعة' : 'No pending requests to review.'}</p>
               <p className="text-slate-300 text-sm mt-1">{isRtl ? 'كل شيء محدث!' : 'Everything is up to date!'}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'employees' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-8 border-b"><div className="relative"><SearchIcon className={`absolute top-1/2 -translate-y-1/2 ${isRtl ? 'right-4' : 'left-4'} w-5 h-5 text-slate-300`} /><input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t.fullName} className={`w-full ${isRtl ? 'pr-12' : 'pl-12'} py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:border-blue-500 outline-none`} /></div></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-8 py-5 text-start text-xs font-black text-slate-400 uppercase tracking-widest">{t.fullName}</th>
                  {leaveTypes.map(lt => <th key={lt.id} className="px-8 py-5 text-start text-xs font-black text-slate-400 uppercase">{isRtl ? lt.nameAr : lt.nameEn}</th>)}
                  <th className="px-8 py-5 text-end"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-5"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">{u.fullName.charAt(0)}</div><span className="font-bold text-slate-700">{u.fullName}</span></div></td>
                    {leaveTypes.map(lt => <td key={lt.id} className="px-8 py-5 font-mono font-bold text-slate-600">{u.balance[lt.id] || 0}</td>)}
                    <td className="px-8 py-5 text-end"><button onClick={() => setEditingUser(u)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><EditIcon className="w-5 h-5" /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3"><SettingsIcon className="w-6 h-6 text-blue-600" />{t.manageTypes}</h3>
            <div className="space-y-6">
              {leaveTypes.map(lt => (
                <div key={lt.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full" style={{ backgroundColor: lt.color }}></div><span className="font-black text-slate-700 uppercase">{lt.id}</span></div>
                    <input type="color" value={lt.color} onChange={e => handleUpdateLeaveType(lt.id, 'color', e.target.value)} className="w-8 h-8 bg-transparent border-none p-0 cursor-pointer" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-[10px] font-black text-slate-400 uppercase">{t.type} (EN)</label><input type="text" value={lt.nameEn} onChange={e => handleUpdateLeaveType(lt.id, 'nameEn', e.target.value)} className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg" /></div>
                    <div><label className="text-[10px] font-black text-slate-400 uppercase">{t.type} (AR)</label><input type="text" value={lt.nameAr} onChange={e => handleUpdateLeaveType(lt.id, 'nameAr', e.target.value)} className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-end" /></div>
                  </div>
                  <div><label className="text-[10px] font-black text-slate-400 uppercase">{t.defaultBalance}</label><input type="number" value={lt.defaultBalance} onChange={e => handleUpdateLeaveType(lt.id, 'defaultBalance', parseInt(e.target.value))} className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg font-mono font-bold" /></div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-blue-600 p-10 rounded-[2.5rem] text-white flex flex-col justify-center shadow-2xl shadow-blue-200 h-fit">
            <h2 className="text-3xl font-black mb-4">Enterprise Dashboard</h2>
            <p className="text-blue-100 mb-8 opacity-80">Managing leave balances at scale is easy with SmartLeave. Sync changes instantly to all users.</p>
            <div className="flex items-center gap-4"><div className="bg-white/20 p-4 rounded-2xl"><UsersIcon className="w-8 h-8" /></div><div className="text-4xl font-black">{users.length} Employees</div></div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-10 border-b bg-green-50/30 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-800">{t.addEmployee}</h3>
              <button onClick={() => setShowAddUser(false)} className="p-2 hover:bg-white rounded-full transition-colors"><XIcon /></button>
            </div>
            <form onSubmit={handleAddUser} className="p-10 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">{t.fullName} *</label>
                  <input type="text" required value={newUser.fullName} onChange={e => setNewUser({ ...newUser, fullName: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-green-500 font-bold" placeholder="e.g. John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">{t.role}</label>
                  <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value as any })} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-green-500">
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">{t.username} *</label>
                  <input type="text" required value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-green-500 font-bold" placeholder="username123" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-600 mb-2">{t.password} *</label>
                  <input type="password" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-green-500 font-bold" placeholder="••••••••" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-slate-800 mb-6 uppercase tracking-widest">{t.editBalances}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {leaveTypes.map(lt => (
                    <div key={lt.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">{isRtl ? lt.nameAr : lt.nameEn}</label>
                      <input 
                        type="number" 
                        value={newUser.balances[lt.id] ?? lt.defaultBalance} 
                        onChange={e => setNewUser({ 
                          ...newUser, 
                          balances: { ...newUser.balances, [lt.id]: parseInt(e.target.value) || 0 } 
                        })} 
                        className="w-full bg-white border-2 border-slate-200 px-4 py-2 rounded-xl font-mono font-black text-lg focus:border-green-500 outline-none" 
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowAddUser(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all">{t.cancel}</button>
                <button type="submit" className="flex-1 py-4 bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-100 flex items-center justify-center gap-2 hover:bg-green-700 transition-all">
                  <PlusIcon className="w-5 h-5" />
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="p-10 border-b bg-slate-50 flex items-center justify-between">
              <h3 className="text-2xl font-black text-slate-800">{t.editEmployee}</h3>
              <button onClick={() => setEditingUser(null)} className="p-2 hover:bg-white rounded-full transition-colors"><XIcon /></button>
            </div>
            <form onSubmit={handleUpdateUser} className="p-10 space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-slate-600 mb-2">{t.fullName}</label>
                  <input type="text" required value={editingUser.fullName} onChange={e => setEditingUser({ ...editingUser, fullName: e.target.value })} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none focus:border-blue-500 font-bold" />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="block text-sm font-bold text-slate-600 mb-2">{t.role}</label>
                  <select value={editingUser.role} onChange={e => setEditingUser({ ...editingUser, role: e.target.value as any })} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold outline-none focus:border-blue-500">
                    <option value="EMPLOYEE">EMPLOYEE</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-black text-slate-800 mb-6 uppercase tracking-widest">{t.editBalances}</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                  {leaveTypes.map(lt => (
                    <div key={lt.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <label className="block text-[10px] font-black text-slate-400 uppercase mb-2">{isRtl ? lt.nameAr : lt.nameEn}</label>
                      <input type="number" value={editingUser.balance[lt.id] || 0} onChange={e => setEditingUser({ ...editingUser, balance: { ...editingUser.balance, [lt.id]: parseInt(e.target.value) || 0 } })} className="w-full bg-white border-2 border-slate-200 px-4 py-2 rounded-xl font-mono font-black text-lg focus:border-blue-500 outline-none" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all">{t.cancel}</button>
                <button type="submit" className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
                  <SaveIcon className="w-5 h-5" />
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminManagement;
