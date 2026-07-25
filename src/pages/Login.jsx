import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { KeyRound, Mail } from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { email, password } = formData;

    if (!email || !password) {
      toast.error('Email and password are required.');
      setLoading(false);
      return;
    }

    try {
      await login(email, password);
      toast.success('Successfully signed in!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.message || 'Invalid email or password.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Decorative gradients */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-emerald-50 rounded-full blur-3xl opacity-60 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-50 rounded-full blur-3xl opacity-60 translate-x-1/2 translate-y-1/2"></div>

      {/* Brand Heading */}
      <div className="text-center mb-8 relative z-10 animate-fade-in-up">
        <h2 className="font-serif font-extrabold text-3xl text-emerald-950 tracking-tight">
          IQRA <span className="text-amber-500 font-sans font-semibold">Foundation</span>
        </h2>
        <p className="text-slate-400 text-xs mt-1 font-semibold uppercase tracking-wider">Administrative Console</p>
      </div>

      {/* Login Card */}
      <div className="bg-white p-8 rounded-2xl border border-slate-150 shadow-lg w-full max-w-md relative z-10 animate-fade-in-up">
        <h3 className="font-serif font-bold text-2xl text-emerald-950 text-center mb-6">
          Admin Sign-In
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label text-xs uppercase tracking-wider" htmlFor="loginEmail">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                id="loginEmail"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control pl-9 text-sm"
                placeholder="admin@iqrafoundation.org"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label text-xs uppercase tracking-wider" htmlFor="loginPassword">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type="password"
                id="loginPassword"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control pl-9 text-sm"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-950 hover:bg-emerald-900 text-white text-sm font-bold rounded-xl transition-all shadow-md mt-2 flex items-center justify-center"
          >
            {loading ? 'Processing...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-slate-100 pt-4">
          <Link 
            to="/" 
            className="text-xs font-semibold text-slate-450 hover:text-emerald-950 transition-colors inline-flex items-center gap-1"
          >
            &larr; Go back to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
export { Login };
