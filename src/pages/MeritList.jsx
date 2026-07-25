import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import PageHero from '../components/PageHero';
import StudentCard from '../components/StudentCard';
import { Search, RotateCcw, Filter } from 'lucide-react';

const MeritList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('card'); // Default state updated on load
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    year: '',
    examType: '',
    board: '',
    search: ''
  });

  // Responsive default view detection
  useEffect(() => {
    if (window.innerWidth < 768) {
      setViewMode('list');
    } else {
      setViewMode('card');
    }
  }, []);

  useEffect(() => {
    const fetchList = async () => {
      setLoading(true);
      try {
        const studentData = await api.fetchStudents(filters);
        setStudents(studentData.data);
      } catch (err) {
        console.error('Error fetching students:', err.message);
      } finally {
        setLoading(false);
      }
    };
    
    const delayDebounce = setTimeout(() => {
      fetchList();
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [filters]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleResetFilters = () => {
    setFilters({
      year: '',
      examType: '',
      board: '',
      search: ''
    });
  };

  const yearOptions = [2026, 2025, 2024, 2023, 2022];
  const boardOptions = ['CBSE', 'MP Board', 'Madrasa Board', 'Hifz / Memorization'];

  return (
    <div className="min-h-screen bg-slate-50/40 pb-20 font-sans">
      <PageHero 
        title="Merit Toppers Directory" 
        subtitle="Search and browse academic toppers who have been awarded by the IQRA Foundation." 
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-6">
        
        {/* Filters Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
          
          {/* Search bar & Mobile filters button */}
          <div className="lg:col-span-4 space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block" htmlFor="searchInput">Search Student</label>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-450">
                  <Search className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  id="searchInput"
                  name="search" 
                  value={filters.search} 
                  onChange={handleFilterChange} 
                  placeholder="Type student name..." 
                  className="form-control text-sm pl-9 py-2 pr-3 border border-slate-250 focus:border-emerald-955 rounded-xl w-full" 
                />
              </div>
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="lg:hidden px-3.5 border border-slate-250 hover:bg-slate-55 rounded-xl flex items-center justify-center text-slate-500 hover:text-emerald-950 transition-colors shadow-sm"
                title="Toggle Filters"
              >
                <Filter className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Collapsible Dropdowns container */}
          <div className={`col-span-1 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end ${
            showMobileFilters ? 'grid' : 'hidden lg:grid'
          }`}>
            {/* Year */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block" htmlFor="yearSelect">Award Year</label>
              <select 
                id="yearSelect"
                name="year" 
                value={filters.year} 
                onChange={handleFilterChange} 
                className="form-control text-sm py-2 px-3 bg-white border border-slate-250 focus:border-emerald-950 rounded-xl w-full"
              >
                <option value="">All Years</option>
                {yearOptions.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Exam Type */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block" htmlFor="curriculumSelect">Curriculum</label>
              <select 
                id="curriculumSelect"
                name="examType" 
                value={filters.examType} 
                onChange={handleFilterChange} 
                className="form-control text-sm py-2 px-3 bg-white border border-slate-250 focus:border-emerald-950 rounded-xl w-full"
              >
                <option value="">All Types</option>
                <option value="secular">Secular (School)</option>
                <option value="islamic">Islamic (Religious)</option>
              </select>
            </div>

            {/* Board */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block" htmlFor="boardSelect">Exam Board</label>
              <select 
                id="boardSelect"
                name="board" 
                value={filters.board} 
                onChange={handleFilterChange} 
                className="form-control text-sm py-2 px-3 bg-white border border-slate-250 focus:border-emerald-950 rounded-xl w-full"
              >
                <option value="">All Boards</option>
                {boardOptions.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Reset Filters */}
            <div>
              <button 
                onClick={handleResetFilters} 
                className="w-full h-10 border border-slate-250 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>

        </div>

        {/* View Mode Toggle & Results Count Bar */}
        <div className="flex justify-between items-center bg-white px-5 py-3 rounded-2xl border border-slate-150 shadow-sm text-xs">
          <p className="font-semibold text-slate-450">
            Showing <span className="text-emerald-950 font-bold">{students.length}</span> award achievers
          </p>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button 
              onClick={() => setViewMode('card')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all ${
                viewMode === 'card' 
                  ? 'bg-white text-emerald-950 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Card Grid
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wide transition-all ${
                viewMode === 'list' 
                  ? 'bg-white text-emerald-950 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Compact List
            </button>
          </div>
        </div>

        {/* Listings Result */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-950 border-t-amber-600"></div>
          </div>
        ) : students.length > 0 ? (
          viewMode === 'card' ? (
            /* Card Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in-up">
              {students.map((student) => (
                <StudentCard key={student._id} student={student} />
              ))}
            </div>
          ) : (
            /* Compact Tabular List View */
            <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden animate-fade-in-up">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-6 py-4 text-center w-16">Rank</th>
                      <th className="px-6 py-4">Topper Profile</th>
                      <th className="px-6 py-4">Score</th>
                      <th className="px-6 py-4">Institution / School</th>
                      <th className="px-6 py-4">Board / Certificate</th>
                      <th className="px-6 py-4 text-center">Year</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-655 font-sans">
                    {students.map((student, idx) => (
                      <tr key={student._id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Rank number */}
                        <td className="px-6 py-4 text-center">
                          <span className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-955 flex items-center justify-center font-bold font-serif shadow-sm text-[10px] mx-auto border border-emerald-100/80">
                            {idx + 1}
                          </span>
                        </td>


                        {/* Photo & Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {student.profilePic ? (
                              <img 
                                src={student.profilePic} 
                                alt={student.name} 
                                className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-sm" 
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-950 flex items-center justify-center font-bold text-xs font-serif shadow-sm">
                                {student.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold text-emerald-955 leading-tight">{student.name}</p>
                              {student.fathersName && (
                                <p className="text-[10px] text-slate-400 mt-0.5">S/O: {student.fathersName}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Score (Percentage - Second Column) */}
                        <td className="px-6 py-4">
                          <span className="text-emerald-900 font-extrabold text-xs bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100/80">
                            {student.score}
                          </span>
                        </td>
                        {/* Institution */}
                        <td className="px-6 py-4 font-bold text-slate-700">
                          {student.schoolName}
                        </td>

                        {/* Board */}
                        <td className="px-6 py-4 uppercase font-semibold text-slate-500">
                          {student.board}
                        </td>

                        {/* Year */}
                        <td className="px-6 py-4 text-center font-bold text-slate-750">
                          {student.year}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        ) : (
          <div className="bg-white rounded-2xl border border-slate-150/80 p-16 text-center max-w-md mx-auto space-y-4 shadow-sm">
            <span className="text-4xl block">🔍</span>
            <h3 className="font-serif font-bold text-xl text-emerald-950">No Achievers Found</h3>
            <p className="text-slate-500 text-xs leading-relaxed">
              We couldn't find any student entries matching the current filter filters.
            </p>
            <button 
              onClick={handleResetFilters} 
              className="px-4 py-2 border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default MeritList;
export { MeritList };
