import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, GraduationCap, FileText, Users, LogOut, Menu, X, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Successfully logged out.');
    navigate('/');
  };

  const isSuperAdmin = user?.role === 'superadmin';

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200/85 flex-shrink-0 shadow-sm justify-between">
        <div>
          {/* Logo brand */}
          <div className="h-16 flex items-center px-6 border-b border-slate-100 gap-2.5">
            <img 
              className="h-8 w-8 rounded-full object-cover border-2 border-emerald-900 shadow-sm" 
              src="/logo.jpg" 
              alt="Logo" 
            />
            <span className="font-extrabold text-sm text-emerald-950 tracking-tight uppercase">Admin Console</span>
          </div>

          {/* Links list */}
          <nav className="px-4 py-6 space-y-1.5">
            <NavLink 
              to="/admin" 
              end
              className={({ isActive }) => 
                `flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                  isActive 
                    ? 'bg-emerald-950 text-white shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-emerald-950'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </NavLink>

            <NavLink 
              to="/admin/students" 
              className={({ isActive }) => 
                `flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                  isActive 
                    ? 'bg-emerald-950 text-white shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-emerald-950'
                }`
              }
            >
              <GraduationCap className="w-4 h-4" />
              Merit Directory
            </NavLink>

            {isSuperAdmin && (
              <NavLink 
                to="/admin/admins" 
                className={({ isActive }) => 
                  `flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-all ${
                    isActive 
                      ? 'bg-emerald-950 text-white shadow-sm' 
                      : 'text-slate-500 hover:bg-slate-100 hover:text-emerald-950'
                  }`
                }
              >
                <Users className="w-4 h-4" />
                System Logins
              </NavLink>
            )}
          </nav>
        </div>

        {/* Profile Footer */}
        <div className="p-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-950 border border-slate-200 flex items-center justify-center font-bold text-sm uppercase">
              {user?.name.charAt(0)}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-emerald-950 truncate leading-snug">{user?.name}</p>
              <p className="text-[9px] text-amber-600 font-bold uppercase tracking-wider mt-0.5">{user?.role}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors border border-red-150 flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout Session
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Toolbar */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 shadow-sm z-25">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileOpen(!mobileOpen)} 
              className="md:hidden p-1.5 rounded-lg text-emerald-950 hover:bg-slate-50 focus:outline-none"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h2 className="font-bold text-emerald-950 text-sm md:text-base">System Administrator Panel</h2>
          </div>

          <div className="flex items-center">
            <NavLink to="/" className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 shadow-sm">
              <Globe className="w-3.5 h-3.5" />
              Live Site
            </NavLink>
          </div>
        </header>

        {/* Dynamic Outlet */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            onClick={() => setMobileOpen(false)} 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
          ></div>

          {/* Drawer Container */}
          <div className="relative flex flex-col w-64 bg-white shadow-xl animate-fade-in-up h-full border-r border-slate-200 justify-between">
            <div>
              <div className="h-16 flex items-center justify-between border-b border-slate-100 px-6">
                <div className="flex items-center gap-2">
                  <img 
                    className="h-7 w-7 rounded-full object-cover border border-emerald-900 shadow-sm" 
                    src="/logo.jpg" 
                    alt="Logo" 
                  />
                  <span className="font-extrabold text-xs text-emerald-950 tracking-tight uppercase">IQRA Board</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="px-4 py-6 space-y-1.5">
                <NavLink 
                  to="/admin" 
                  end
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive ? 'bg-emerald-950 text-white shadow' : 'text-slate-500 hover:bg-slate-100 hover:text-emerald-950'
                    }`
                  }
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Overview
                </NavLink>

                <NavLink 
                  to="/admin/students" 
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) => 
                    `flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      isActive ? 'bg-emerald-950 text-white shadow' : 'text-slate-500 hover:bg-slate-100 hover:text-emerald-950'
                    }`
                  }
                >
                  <GraduationCap className="w-4 h-4" />
                  Merit Directory
                </NavLink>

                {isSuperAdmin && (
                  <NavLink 
                    to="/admin/admins" 
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) => 
                      `flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                        isActive ? 'bg-emerald-950 text-white shadow' : 'text-slate-500 hover:bg-slate-100 hover:text-emerald-950'
                      }`
                    }
                  >
                    <Users className="w-4 h-4" />
                    System Logins
                  </NavLink>
                )}
              </nav>
            </div>

            <div className="p-4 border-t border-slate-100">
              <button 
                onClick={() => { handleLogout(); setMobileOpen(false); }} 
                className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg text-xs font-bold transition-all border border-red-150 flex items-center justify-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout Session
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminLayout;
export { AdminLayout };
