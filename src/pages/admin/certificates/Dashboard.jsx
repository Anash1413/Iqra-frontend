import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { Award, Layers, Users, Calendar, Plus, Grid, LayoutTemplate, History, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalCertificates: 0,
    generatedToday: 0,
    totalStudents: 0,
    downloadedToday: 0,
    templatesAvailable: 0,
    pending: 0
  });
  const [recentCerts, setRecentCerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const statsData = await api.fetchCertificateStats(token);
        setStats(statsData);

        const historyList = await api.fetchCertificateHistory({ limit: 5 }, token);
        setRecentCerts(historyList.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard metrics:', err);
        toast.error('Could not fetch latest certificate stats.');
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [token]);

  // Statistics Display Cards helper configuration
  const statCards = [
    {
      title: 'Total Certificates',
      value: stats.totalCertificates,
      icon: Award,
      color: 'bg-emerald-50 text-emerald-950 border-emerald-100',
      desc: 'Overall generated credential logs'
    },
    {
      title: 'Generated Today',
      value: stats.generatedToday,
      icon: Calendar,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
      desc: 'Certificates processed today'
    },
    {
      title: 'Total Students',
      value: stats.totalStudents,
      icon: Users,
      color: 'bg-slate-50 text-slate-700 border-slate-200',
      desc: 'Recipients in merit directory'
    },
    {
      title: 'Templates Available',
      value: stats.templatesAvailable,
      icon: Layers,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      desc: 'Active design template configurations'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 font-sans space-y-6">
      
      {/* Header Banner */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif font-extrabold text-2xl text-emerald-950">Certificates Console</h1>
          <p className="text-slate-400 text-xs mt-1.5 font-bold uppercase tracking-wider">Credential Generator System</p>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div 
            key={idx} 
            className="bg-white p-6 rounded-3xl border border-slate-150 shadow-xs flex flex-col justify-between hover:scale-[1.01] hover:shadow-sm transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">{card.title}</p>
                <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                  {loading ? '...' : card.value}
                </h3>
              </div>
              <div className={`h-11 w-11 rounded-xl flex items-center justify-center border shadow-inner ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-[10px] text-slate-400 font-medium mt-3 border-t border-slate-50 pt-2">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Grid: Quick Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link 
          to="/admin/certificates/single" 
          className="group bg-white p-6 rounded-3xl border border-slate-150 shadow-xs hover:border-emerald-700/35 flex flex-col justify-between transition-all"
        >
          <div className="space-y-3">
            <div className="h-10 w-10 bg-emerald-50 rounded-xl flex items-center justify-center border border-emerald-100 text-emerald-900 group-hover:scale-105 transition-all">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 tracking-wide">Generate Single</h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Input values manually for a single student certificate.</p>
            </div>
          </div>
          <span className="text-[10px] text-emerald-900 font-bold tracking-wide mt-4 flex items-center gap-1 group-hover:gap-1.5 transition-all">
            Launch Generator <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link 
          to="/admin/certificates/bulk" 
          className="group bg-white p-6 rounded-3xl border border-slate-150 shadow-xs hover:border-emerald-700/35 flex flex-col justify-between transition-all"
        >
          <div className="space-y-3">
            <div className="h-10 w-10 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 text-amber-600 group-hover:scale-105 transition-all">
              <Grid className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 tracking-wide">Bulk Generate</h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Process Excel worksheets or copy-paste rows in an editable table.</p>
            </div>
          </div>
          <span className="text-[10px] text-amber-600 font-bold tracking-wide mt-4 flex items-center gap-1 group-hover:gap-1.5 transition-all">
            Launch Bulk Module <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link 
          to="/admin/certificates/templates" 
          className="group bg-white p-6 rounded-3xl border border-slate-150 shadow-xs hover:border-emerald-700/35 flex flex-col justify-between transition-all"
        >
          <div className="space-y-3">
            <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center border border-indigo-100 text-indigo-600 group-hover:scale-105 transition-all">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 tracking-wide">Upload & Setup Templates</h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Configure background templates and map visual placeholder overlays.</p>
            </div>
          </div>
          <span className="text-[10px] text-indigo-600 font-bold tracking-wide mt-4 flex items-center gap-1 group-hover:gap-1.5 transition-all">
            Open Template Editor <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>

        <Link 
          to="/admin/certificates/history" 
          className="group bg-white p-6 rounded-3xl border border-slate-150 shadow-xs hover:border-emerald-700/35 flex flex-col justify-between transition-all"
        >
          <div className="space-y-3">
            <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200 text-slate-700 group-hover:scale-105 transition-all">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 tracking-wide">Credential History</h4>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Audit, re-download, print, or delete previously generated credentials.</p>
            </div>
          </div>
          <span className="text-[10px] text-slate-655 font-bold tracking-wide mt-4 flex items-center gap-1 group-hover:gap-1.5 transition-all">
            Open History Log <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </Link>
      </div>

      {/* Recent Activity Table Log */}
      <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-xs">
        <h4 className="font-serif font-bold text-base text-emerald-955 border-b border-slate-100 pb-3 mb-4">Recent Generated Certificates</h4>
        
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-950 border-t-amber-600"></div>
          </div>
        ) : recentCerts.length === 0 ? (
          <div className="py-8 text-center text-xs font-semibold text-slate-400">
            No certificates have been generated yet. Use the quick actions above to start!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium text-slate-500 border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Certificate Number</th>
                  <th className="py-2.5 px-3">Award Category</th>
                  <th className="py-2.5 px-3">Language</th>
                  <th className="py-2.5 px-3">Generated Date</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentCerts.map((cert) => (
                  <tr key={cert._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3 font-bold text-emerald-950">{cert.studentName}</td>
                    <td className="py-3 px-3 font-mono font-bold text-red-600">{cert.certificateNo}</td>
                    <td className="py-3 px-3">{cert.awardName || 'Academic Topper Excellence Award'}</td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-100 text-slate-655 px-2 py-0.5 rounded-full text-[9px] font-bold border">
                        {cert.language}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      {new Date(cert.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-805 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-100 uppercase tracking-wider">
                        <ShieldCheck className="w-3 h-3 text-emerald-900" />
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
export { Dashboard };
