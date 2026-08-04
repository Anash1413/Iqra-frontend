import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { KeyRound, Mail, User, ShieldAlert, ArrowLeft } from 'lucide-react';

const Login = () => {
  const { login, register, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [allowPublicReg, setAllowPublicReg] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false); // Toggle between Sign In & Sign Up

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Query registration settings status
  useEffect(() => {
    const getRegSettings = async () => {
      try {
        const status = await api.getRegistrationStatus();
        setAllowPublicReg(status.allowPublicRegistration);
      } catch (err) {
        console.warn('Could not load signup permissions settings:', err.message);
      }
    };
    getRegSettings();
  }, []);

  // Handle redirects based on roles
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'user') {
        navigate('/profile');
      } else {
        navigate('/admin');
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { name, email, password } = formData;

    if (!email || !password) {
      toast.error('Email and password are required.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        if (!name) {
          toast.error('Full Name is required for registration.');
          setLoading(false);
          return;
        }
        await register(name, email, password);
        toast.success('Registration successful! Redirecting to profile...');
      } else {
        await login(email, password);
        toast.success('Successfully signed in!');
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-50 rounded-full blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-50 rounded-full blur-3xl opacity-60 translate-x-1/2 translate-y-1/2"></div>
 
      {/* Brand Heading */}
      <div className="text-center mb-8 relative z-10 animate-fade-in-up">
        <h2 className="font-serif font-extrabold text-3xl text-emerald-955 tracking-tight">
          IQRA <span className="text-amber-500 font-sans font-semibold">Foundation</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1.5 font-bold uppercase tracking-wider">Credential Registry Console</p>
      </div>

      {/* Login Card */}
      <div className="bg-white p-8 rounded-3xl border border-slate-150 shadow-lg w-full max-w-md relative z-10 animate-fade-in-up">
        <h3 className="font-serif font-bold text-2xl text-emerald-955 text-center mb-6">
          {isSignUp ? 'Student Registration' : 'Account Sign-In'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 font-semibold text-xs text-slate-500">
          
          {isSignUp && (
            <div className="form-group">
              <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5" htmlFor="regName">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-450 pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  id="regName"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full py-2.5 pl-9 pr-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 focus:bg-white rounded-xl transition-all"
                  placeholder="e.g. Ahmad Anash"
                  required={isSignUp}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5" htmlFor="loginEmail">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-455 pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                id="loginEmail"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full py-2.5 pl-9 pr-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 focus:bg-white rounded-xl transition-all"
                placeholder="name@example.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5" htmlFor="loginPassword">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-455 pointer-events-none">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type="password"
                id="loginPassword"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full py-2.5 pl-9 pr-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 focus:bg-white rounded-xl transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-md transition-all mt-2 flex items-center justify-center cursor-pointer"
          >
            {loading ? 'Processing...' : isSignUp ? 'Create Student Account' : 'Sign In'}
          </button>
        </form>

        {/* Dynamic toggle switches for register screen */}
        {allowPublicReg && (
          <div className="mt-4 text-center text-xs font-semibold text-slate-450 border-t border-slate-100 pt-3">
            {isSignUp ? (
              <p>
                Already have an account?{' '}
                <button 
                  onClick={() => setIsSignUp(false)}
                  className="text-emerald-900 font-bold hover:underline"
                >
                  Sign In here
                </button>
              </p>
            ) : (
              <p>
                Don't have a student account?{' '}
                <button 
                  onClick={() => setIsSignUp(true)}
                  className="text-emerald-900 font-bold hover:underline"
                >
                  Register here
                </button>
              </p>
            )}
          </div>
        )}

        <div className="mt-4 text-center border-t border-slate-100 pt-3">
          <Link 
            to="/" 
            className="text-xs font-semibold text-slate-450 hover:text-emerald-950 transition-colors inline-flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
export { Login };
