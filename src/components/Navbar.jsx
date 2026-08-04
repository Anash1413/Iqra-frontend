import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Menu, X, LogOut, LayoutDashboard, UserCheck, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, logout, user } = useAuth();
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [allowPublicReg, setAllowPublicReg] = useState(false);

  useEffect(() => {
    const fetchRegSettings = async () => {
      try {
        const status = await api.getRegistrationStatus();
        setAllowPublicReg(status.allowPublicRegistration);
      } catch (err) {
        console.warn('Could not read signup permission settings:', err.message);
      }
    };
    fetchRegSettings();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          
          {/* Logo brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <img 
                className="h-10 w-10 rounded-full object-cover border-2 border-emerald-900 shadow-sm group-hover:scale-105 transition-transform duration-300" 
                src="/logo.jpg" 
                alt="IQRA Logo" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=100&auto=format&fit=crop&q=60"; // fallback
                }}
              />
              <span className="font-sans font-extrabold text-lg tracking-tight text-emerald-955 group-hover:text-emerald-800 transition-colors">
                IQRA <span className="text-amber-500 font-medium font-serif">Board</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 items-center font-semibold text-xs tracking-wider uppercase">
            <NavLink 
              to="/" 
              className={({ isActive }) => 
                `px-1 py-1.5 border-b-2 transition-all ${
                  isActive 
                    ? 'border-emerald-900 text-emerald-955 font-extrabold' 
                    : 'border-transparent text-slate-500 hover:text-emerald-955 hover:border-slate-300'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => 
                `px-1 py-1.5 border-b-2 transition-all ${
                  isActive 
                    ? 'border-emerald-900 text-emerald-955 font-extrabold' 
                    : 'border-transparent text-slate-500 hover:text-emerald-955 hover:border-slate-300'
                }`
              }
            >
              About Us
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => 
                `px-1 py-1.5 border-b-2 transition-all ${
                  isActive 
                    ? 'border-emerald-900 text-emerald-955 font-extrabold' 
                    : 'border-transparent text-slate-500 hover:text-emerald-955 hover:border-slate-300'
                }`
              }
            >
              Contact
            </NavLink>
            <NavLink 
              to="/merit-list" 
              className={({ isActive }) => 
                `px-1 py-1.5 border-b-2 transition-all ${
                  isActive 
                    ? 'border-emerald-900 text-emerald-955 font-extrabold' 
                    : 'border-transparent text-slate-500 hover:text-emerald-955 hover:border-slate-300'
                }`
              }
            >
              Merit List
            </NavLink>
            <NavLink 
              to="/verify" 
              className={({ isActive }) => 
                `px-1 py-1.5 border-b-2 transition-all ${
                  isActive 
                    ? 'border-emerald-900 text-emerald-955 font-extrabold' 
                    : 'border-transparent text-slate-500 hover:text-emerald-955 hover:border-slate-300'
                }`
              }
            >
              Verify Certificate
            </NavLink>

            {isAuthenticated ? (
              <div className="flex gap-4 items-center pl-4 border-l border-slate-200">
                {user?.role === 'user' ? (
                  <Link 
                    to="/profile" 
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm border border-emerald-950"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    My Profile
                  </Link>
                ) : (
                  <Link 
                    to="/admin" 
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm border border-emerald-955"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Admin Panel
                  </Link>
                )}
                <button 
                  onClick={handleLogout} 
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-550 hover:text-red-655 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="text-xs font-bold text-slate-500 hover:text-emerald-955 transition-colors border border-slate-250 hover:border-slate-350 rounded-xl px-4 py-2.5 shadow-xs"
              >
                {allowPublicReg ? 'Register / Sign In' : 'Admin Login'}
              </Link>
            )}
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-emerald-955 hover:bg-slate-50 transition-colors focus:outline-none"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 shadow-md">
          <div className="px-3 pt-2 pb-4 space-y-1.5 flex flex-col gap-1 text-xs font-bold uppercase tracking-wider">
            <NavLink
              to="/"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition-all ${
                  isActive ? 'bg-emerald-950 text-white shadow' : 'text-slate-600 hover:bg-slate-55'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/about"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition-all ${
                  isActive ? 'bg-emerald-950 text-white shadow' : 'text-slate-600 hover:bg-slate-55'
                }`
              }
            >
              About Us
            </NavLink>
            <NavLink
              to="/contact"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition-all ${
                  isActive ? 'bg-emerald-950 text-white shadow' : 'text-slate-600 hover:bg-slate-55'
                }`
              }
            >
              Contact
            </NavLink>
            <NavLink
              to="/merit-list"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition-all ${
                  isActive ? 'bg-emerald-950 text-white shadow' : 'text-slate-600 hover:bg-slate-55'
                }`
              }
            >
              Merit List
            </NavLink>
            <NavLink
              to="/verify"
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg transition-all ${
                  isActive ? 'bg-emerald-950 text-white shadow' : 'text-slate-600 hover:bg-slate-55'
                }`
              }
            >
              Verify Certificate
            </NavLink>

            {isAuthenticated ? (
              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                {user?.role === 'user' ? (
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="mx-3 text-center py-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-white font-bold text-sm shadow flex items-center justify-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    My Profile
                  </Link>
                ) : (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="mx-3 text-center py-2 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-white font-bold text-sm shadow flex items-center justify-center gap-1.5"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="mx-3 text-center py-2 rounded-lg bg-red-50 text-red-655 hover:bg-red-100 font-bold text-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="mx-3 text-center py-2.5 rounded-lg border border-slate-200 hover:border-slate-350 text-slate-700 font-bold text-xs transition-all block shadow-xs"
              >
                {allowPublicReg ? 'Register / Sign In' : 'Admin Login'}
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
export { Navbar };
