import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { StudentCard } from '../components/StudentCard';
import { ArrowRight, Star, GraduationCap, CheckCircle } from 'lucide-react';

const Home = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { value: '0', label: 'Total Awards Given' },
    { value: '0', label: 'Covered Boards' },
    { value: '0', label: 'Active Years' }
  ]);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        // Fetch all students to compute counts dynamically
        const allStudentsData = await api.fetchStudents();
        const list = allStudentsData.data || [];
        
        // Count totals
        const totalAwards = list.length;
        
        // Boards unique count
        const uniqueBoards = new Set(list.map(s => s.board.trim().toLowerCase())).size;
        
        // Years unique count
        const uniqueYears = new Set(list.map(s => s.year)).size;

        setStats([
          { value: totalAwards > 0 ? `${totalAwards}+` : '0', label: 'Total Awards Given' },
          { value: uniqueBoards > 0 ? `${uniqueBoards}+` : '0', label: 'Covered Boards' },
          { value: uniqueYears > 0 ? `${uniqueYears}+` : '0', label: 'Active Years' }
        ]);

        // Show toppers of the current year
        const currentYear = new Date().getFullYear();
        const currentToppers = list.filter(s => s.year === currentYear);
        setStudents(currentToppers.slice(0, 3));
      } catch (err) {
        console.error('Error loading Home Toppers:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  const heroTitle = 'IQRA Foundation';
  const heroSubtitle = 'Rewarding Academic Excellence in Secular & Religious Education';
  const welcomeText = 'The IQRA Foundation stands to promote and reward academic excellence. Every year, we recognize outstanding student achievers in both secular boards (CBSE, ICSE, MP Board) and traditional Islamic curricula. We empower toppers as well as outstanding students from Madrasas and Quran memorization (Hifz) circles, ensuring every form of knowledge is celebrated.';

  return (
    <div className="flex flex-col min-h-screen bg-slate-50/40">
      {/* Light Hero Section */}
      <header className="relative bg-gradient-to-br from-slate-100 via-emerald-50/20 to-amber-50/30 border-b border-slate-200/80 py-20 md:py-28 overflow-hidden">
        {/* Dot backdrop */}
        <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8 animate-fade-in-up">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100/80 text-emerald-805 text-xs font-bold uppercase tracking-wider">
            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
            Empowering Academic Growth
          </div>
          
          <h1 className="font-serif font-bold text-4xl sm:text-6xl tracking-tight leading-tight max-w-4xl mx-auto text-emerald-950">
            {heroTitle}
          </h1>
          <p className="font-sans text-slate-555 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
            {heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
            <Link 
              to="/merit-list" 
              className="px-6 py-3 text-sm font-bold bg-emerald-950 hover:bg-emerald-900 text-white rounded-xl shadow-sm hover:shadow-md transition-all text-center min-w-[180px] flex items-center justify-center gap-1.5 group"
            >
              Browse Merit List
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link 
              to="/about" 
              className="px-6 py-3 text-sm font-bold bg-white hover:bg-slate-50 text-slate-700 rounded-xl border border-slate-250 transition-all text-center min-w-[180px]"
            >
              Learn More
            </Link>
          </div>
        </div>
      </header>

      {/* Welcome Section */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Welcome Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-2">
              <span className="h-0.5 w-6 bg-amber-500 rounded"></span>
              <span className="text-amber-500 font-bold uppercase tracking-wider text-xs">Our Purpose</span>
            </div>
            <h2 className="font-serif font-bold text-3xl md:text-4xl text-emerald-950">
              Striving For Double Excellence
            </h2>
            <p className="text-slate-600 leading-relaxed text-sm md:text-base">
              {welcomeText}
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-start gap-2 text-sm text-slate-650 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                Secular curricula (CBSE, ICSE, MP Board)
              </div>
              <div className="flex items-start gap-2 text-sm text-slate-650 font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                Religious courses (Madrasas, Hifz)
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
            {stats.map((stat, i) => (
              <div 
                key={i} 
                className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex lg:flex-row items-center gap-4 hover:shadow-md transition-shadow"
              >
                <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-900 flex items-center justify-center text-lg flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-emerald-800" />
                </div>
                <div>
                  <p className="font-serif font-bold text-2xl text-emerald-950 leading-tight">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mt-0.5">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Spotlight Section */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-950 border-t-amber-600"></div>
        </div>
      ) : students.length > 0 ? (
        <section className="bg-slate-100/50 py-16 md:py-24 border-t border-slate-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-12">
              <div className="flex justify-center items-center gap-2 mb-2">
                <span className="h-0.5 w-6 bg-amber-500 rounded"></span>
                <span className="text-amber-500 font-bold uppercase tracking-wider text-xs">Spotlight Achievers</span>
                <span className="h-0.5 w-6 bg-amber-500 rounded"></span>
              </div>
              <h2 className="font-serif font-bold text-3xl md:text-4xl text-emerald-950 mb-3">
                Honoring This Year's Toppers
              </h2>
              <p className="text-slate-500 text-sm">
                A brief showcase of some of our merit awardees who achieved top-tier academic scores.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {students.map((student) => (
                <StudentCard key={student._id} student={student} />
              ))}
            </div>

            <div className="text-center mt-12">
              <Link 
                to="/merit-list" 
                className="inline-flex items-center gap-1.5 text-emerald-950 hover:text-emerald-800 font-bold text-sm transition-colors group"
              >
                View Full Archive List
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

          </div>
        </section>
      ) : null}
    </div>
  );
};

export default Home;
export { Home };
