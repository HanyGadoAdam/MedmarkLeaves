
import React, { useState, useEffect } from 'react';
import { User, LeaveRequest, Language, Role, LeaveTypeDefinition, LeaveStatus } from './types';
import { translations } from './i18n';
import { db } from './storage';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import LeaveRequests from './pages/LeaveRequests';
import AdminManagement from './pages/AdminManagement';
import { 
  HomeIcon, 
  CalendarIcon, 
  UsersIcon, 
  LogOutIcon, 
  LanguagesIcon,
  MenuIcon,
  XIcon
} from './components/Icons';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeDefinition[]>([]);
  const [language, setLanguage] = useState<Language>('en');
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'requests' | 'admin'>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setUsers(db.getUsers());
    setRequests(db.getRequests());
    setLeaveTypes(db.getLeaveTypes());
  }, []);

  const t = translations[language];
  const isRtl = language === 'ar';

  const handleLogin = (u: User) => {
    setCurrentUser(u);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const syncUsers = (newUsers: User[]) => {
    setUsers(newUsers);
    db.saveUsers(newUsers);
  };

  const syncRequests = (newRequests: LeaveRequest[]) => {
    setRequests(newRequests);
    db.saveRequests(newRequests);
  };

  const syncLeaveTypes = (newTypes: LeaveTypeDefinition[]) => {
    setLeaveTypes(newTypes);
    db.saveLeaveTypes(newTypes);
  };

  const addRequest = (req: Omit<LeaveRequest, 'id' | 'status' | 'createdAt'>) => {
    const newReq: LeaveRequest = {
      ...req,
      id: Math.random().toString(36).substr(2, 9),
      status: 'PENDING',
      createdAt: new Date().toISOString().split('T')[0]
    };
    syncRequests([newReq, ...requests]);
  };

  const updateRequestStatus = (requestId: string, status: LeaveStatus) => {
    const updatedRequests = requests.map(req => {
      if (req.id === requestId) {
        if (status === 'APPROVED') {
          const updatedUsers = users.map(u => {
            if (u.id === req.userId) {
              const newBalance = { ...u.balance };
              newBalance[req.typeId] = (newBalance[req.typeId] || 0) - req.totalDays;
              return { ...u, balance: newBalance };
            }
            return u;
          });
          syncUsers(updatedUsers);
        }
        return { ...req, status };
      }
      return req;
    });
    syncRequests(updatedRequests);
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} users={users} t={t} language={language} setLanguage={setLanguage} isRtl={isRtl} />;
  }

  const NavItem = ({ page, icon: Icon, label }: { page: any, icon: any, label: string }) => (
    <button
      onClick={() => { setCurrentPage(page); setIsSidebarOpen(false); }}
      className={`flex items-center w-full px-4 py-3 text-sm font-semibold transition-all rounded-xl ${
        currentPage === page 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'text-slate-600 hover:bg-slate-100 hover:text-blue-600'
      } ${isRtl ? 'flex-row-reverse space-x-reverse' : 'flex-row space-x-3'}`}
    >
      <Icon className="w-5 h-5" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-e border-slate-200 fixed h-full z-20">
        <div className="p-8 border-b border-slate-100">
          <h1 className="text-2xl font-black text-blue-600 tracking-tight">{t.title}</h1>
        </div>
        <nav className="flex-1 px-4 mt-8 space-y-2">
          <NavItem page="dashboard" icon={HomeIcon} label={t.dashboard} />
          <NavItem page="requests" icon={CalendarIcon} label={t.requests} />
          {currentUser.role === 'ADMIN' && (
            <NavItem page="admin" icon={UsersIcon} label={t.adminPanel} />
          )}
        </nav>
        <div className="p-6 border-t border-slate-100 space-y-2">
          <button 
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className={`flex items-center w-full px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-all ${isRtl ? 'flex-row-reverse space-x-reverse' : 'flex-row space-x-3'}`}
          >
            <LanguagesIcon className="w-5 h-5" />
            <span>{language === 'en' ? 'العربية' : 'English'}</span>
          </button>
          <button onClick={handleLogout} className={`flex items-center w-full px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all ${isRtl ? 'flex-row-reverse space-x-reverse' : 'flex-row space-x-3'}`}>
            <LogOutIcon className="w-5 h-5" />
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ms-72 min-w-0">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-8 py-4 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <button className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors" onClick={() => setIsSidebarOpen(true)}>
              <MenuIcon className="w-6 h-6" />
            </button>
            <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
              {currentPage === 'dashboard' ? t.dashboard : currentPage === 'requests' ? t.requests : t.adminPanel}
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <div className={`hidden sm:flex flex-col text-right ${isRtl ? 'text-left' : 'text-right'}`}>
              <span className="text-sm font-black text-slate-800 leading-none">{currentUser.fullName}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{currentUser.role}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-lg shadow-blue-100">
              {currentUser.fullName.charAt(0)}
            </div>
          </div>
        </header>

        <main className="p-4 md:p-8 flex-1 overflow-x-hidden">
          <div className="max-w-6xl mx-auto">
            {currentPage === 'dashboard' && <Dashboard user={currentUser} requests={requests} users={users} leaveTypes={leaveTypes} t={t} isRtl={isRtl} language={language} />}
            {currentPage === 'requests' && <LeaveRequests user={currentUser} requests={requests} leaveTypes={leaveTypes} onSubmit={addRequest} t={t} isRtl={isRtl} />}
            {currentPage === 'admin' && (
              <AdminManagement 
                users={users} 
                requests={requests} 
                leaveTypes={leaveTypes}
                onUpdateStatus={updateRequestStatus} 
                onSyncUsers={syncUsers}
                onSyncTypes={syncLeaveTypes}
                t={t} 
                isRtl={isRtl} 
              />
            )}
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)} />
          <aside className={`relative w-72 h-full bg-white shadow-2xl flex flex-col transition-transform duration-300 transform ${isRtl ? 'ms-auto' : 'me-auto'}`}>
            <div className="p-6 border-b flex justify-between items-center bg-slate-50/50">
              <h1 className="text-xl font-black text-blue-600">{t.title}</h1>
              <button onClick={() => setIsSidebarOpen(false)} className="p-2 text-slate-400 hover:text-slate-600">
                <XIcon className="w-6 h-6" />
              </button>
            </div>
            <nav className="flex-1 p-4 mt-4 space-y-2">
              <NavItem page="dashboard" icon={HomeIcon} label={t.dashboard} />
              <NavItem page="requests" icon={CalendarIcon} label={t.requests} />
              {currentUser.role === 'ADMIN' && <NavItem page="admin" icon={UsersIcon} label={t.adminPanel} />}
            </nav>
            <div className="p-6 border-t border-slate-100 bg-slate-50/30">
              <button 
                onClick={() => { setLanguage(language === 'en' ? 'ar' : 'en'); setIsSidebarOpen(false); }}
                className={`flex items-center w-full px-4 py-3 text-sm font-bold text-slate-600 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-slate-100 ${isRtl ? 'flex-row-reverse space-x-reverse' : 'flex-row space-x-3'}`}
              >
                <LanguagesIcon className="w-5 h-5" />
                <span>{language === 'en' ? 'العربية' : 'English'}</span>
              </button>
              <button onClick={handleLogout} className={`flex items-center w-full mt-2 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-all ${isRtl ? 'flex-row-reverse space-x-reverse' : 'flex-row space-x-3'}`}>
                <LogOutIcon className="w-5 h-5" />
                <span>{t.logout}</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
};

export default App;
