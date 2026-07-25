import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { GraduationCap, FileText, UserPlus, BookOpen, Star, Sparkles } from 'lucide-react';

const Dashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    secularCount: 0,
    islamicCount: 0
  });
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const studentData = await api.fetchStudentsAdmin(token);
        const total = studentData.length;
        const secular = studentData.filter(s => s.examType === 'secular').length;
        const islamic = studentData.filter(s => s.examType === 'islamic').length;

        setStats({
          totalStudents: total,
          secularCount: secular,
          islamicCount: islamic
        });

        // Set recent 4 students
        setRecentStudents(studentData.slice(0, 4));
      } catch (err) {
        console.error('Error loading dashboard:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [token]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center bg-transparent">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-950 border-t-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Welcome Hero Panel */}
      <div className="bg-gradient-to-r from-emerald-950 to-emerald-900 text-white rounded-3xl p-6 md:p-8 shadow-md relative overflow-hidden">
        {/* Subtle circles */}
        <div className="absolute right-0 top-0 h-40 w-40 bg-emerald-800 rounded-full blur-2xl opacity-40 translate-x-10 -translate-y-10"></div>
        <div className="absolute right-20 bottom-0 h-28 w-28 bg-amber-500 rounded-full blur-2xl opacity-20 translate-x-10 translate-y-10"></div>

        <div className="relative z-10 space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1 bg-emerald-800/40 text-amber-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-700/50">
            <Sparkles className="w-3.5 h-3.5" />
            Dashboard Live
          </div>
          <h1 className="font-serif font-bold text-2xl md:text-3xl">Welcome Back, {user?.name}!</h1>
          <p className="text-emerald-100 text-xs md:text-sm leading-relaxed">
            Manage the merit list records, upload certificates, and edit all sections of the public landing pages.
          </p>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Total Merit list */}
        <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-950 flex items-center justify-center text-xl shadow-sm border border-emerald-100 flex-shrink-0">
            <GraduationCap className="w-6 h-6 text-emerald-900" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Achievers</p>
            <h3 className="font-serif font-extrabold text-2xl text-emerald-950 mt-0.5">{stats.totalStudents}</h3>
          </div>
        </div>

        {/* Secular */}
        <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-amber-50 text-amber-950 flex items-center justify-center text-xl shadow-sm border border-amber-100 flex-shrink-0">
            <Star className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Secular Curricula</p>
            <h3 className="font-serif font-extrabold text-2xl text-emerald-950 mt-0.5">{stats.secularCount}</h3>
          </div>
        </div>

        {/* Islamic */}
        <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-950 flex items-center justify-center text-xl shadow-sm border border-emerald-100 flex-shrink-0">
            <BookOpen className="w-6 h-6 text-emerald-900" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Islamic Curricula</p>
            <h3 className="font-serif font-extrabold text-2xl text-emerald-950 mt-0.5">{stats.islamicCount}</h3>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Quick Actions Panel */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-150 shadow-sm h-fit">
          <h3 className="font-serif font-bold text-lg text-emerald-950 mb-4 border-b border-slate-100 pb-2">Quick Controls</h3>
          <div className="grid grid-cols-1 gap-2.5">
            <Link 
              to="/admin/students" 
              className="inline-flex items-center gap-2.5 px-4 py-3 bg-slate-50 hover:bg-slate-100 text-slate-650 text-xs font-bold rounded-xl transition-all border border-slate-200"
            >
              <UserPlus className="w-4 h-4 text-emerald-900" />
              Add Student Entry
            </Link>

          </div>
        </div>

        {/* Recent Additions List */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-150 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
            <h3 className="font-serif font-bold text-lg text-emerald-950">Recent Student Additions</h3>
            <Link to="/admin/students" className="text-[10px] font-bold text-emerald-805 hover:underline uppercase tracking-wider">
              Manage All
            </Link>
          </div>

          {recentStudents.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {recentStudents.map((student) => (
                <div key={student._id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {student.profilePic ? (
                      <img 
                        src={student.profilePic} 
                        alt={student.name} 
                        className="w-10 h-10 rounded-full object-cover shadow-sm border border-slate-100" 
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-950 flex items-center justify-center font-bold text-xs uppercase border border-slate-150 font-serif">
                        {student.name.charAt(0)}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-emerald-950 leading-tight">{student.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{student.board} • {student.year}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-extrabold uppercase">
                      {student.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 space-y-2">
              <span className="text-2xl">📋</span>
              <p className="text-xs text-slate-400 font-semibold">No student records registered yet.</p>
              <Link 
                to="/admin/students" 
                className="inline-block text-xs font-bold text-emerald-800 hover:text-emerald-950 hover:underline"
              >
                Create your first record
              </Link>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
export { Dashboard };
