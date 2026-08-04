import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import CertificateCanvas from '../../../components/CertificateCanvas';
import { ChevronLeft, Search, Calendar, Globe, Eye, Trash2, X, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const History = () => {
  const { token, user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter state
  const [filters, setFilters] = useState({
    search: '',
    language: '',
    awardYear: ''
  });

  // Modal Preview state
  const [previewCert, setPreviewCert] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await api.fetchCertificateHistory(filters, token);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history list:', err);
      toast.error('Could not fetch certificate audit logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [token, filters.language, filters.awardYear]); // Trigger automatically on select filters change

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchHistory();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  // Delete credential log from history
  const handleDeleteLog = async (id, certNo) => {
    const isSuperOrAdmin = user?.role === 'superadmin' || user?.role === 'admin';
    if (!isSuperOrAdmin) {
      toast.error('Access Denied: Admin authorization required to delete logs.');
      return;
    }

    const confirm = await Swal.fire({
      title: 'Remove Credential Log?',
      text: `Are you sure you want to delete certificate ${certNo} from the public registry? This action is irreversible.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete Record',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b'
    });

    if (confirm.isConfirmed) {
      const deleteToast = toast.loading('Deleting credential log...');
      try {
        await api.deleteCertificateHistory(id, token);
        toast.success('Credential deleted successfully.', { id: deleteToast });
        setHistory(prev => prev.filter(c => c._id !== id));
      } catch (err) {
        toast.error(err.message || 'Failed to remove log.', { id: deleteToast });
      }
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 font-sans space-y-6">
      
      {/* Header section */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/certificates" 
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-500 transition-colors shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif font-extrabold text-2xl text-emerald-950">Credential Generation History</h1>
            <p className="text-slate-400 text-xs mt-0.5 font-bold uppercase tracking-wider">Audit Registry logs</p>
          </div>
        </div>
      </div>

      {/* Advanced Search & Filtering form */}
      <form 
        onSubmit={handleSearchSubmit} 
        className="bg-white p-5 rounded-3xl border border-slate-150 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs font-semibold text-slate-500"
      >
        <div className="space-y-1.5">
          <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Search Term</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              name="search"
              placeholder="Student Name, Certificate No..."
              value={filters.search}
              onChange={handleInputChange}
              className="w-full py-2.5 pl-10 pr-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 focus:bg-white rounded-xl transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Language</label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <select
              name="language"
              value={filters.language}
              onChange={handleInputChange}
              className="w-full py-2.5 pl-10 pr-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 rounded-xl transition-all text-slate-700"
            >
              <option value="">All Languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Urdu">Urdu</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Award Year</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
            <input
              type="number"
              name="awardYear"
              placeholder="e.g. 2026"
              value={filters.awardYear}
              onChange={handleInputChange}
              className="w-full py-2.5 pl-10 pr-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 focus:bg-white rounded-xl transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          className="py-3 bg-emerald-950 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
        >
          Apply Filters
        </button>
      </form>

      {/* Main logs display list */}
      <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-xs">
        {loading ? (
          <div className="py-24 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-950 border-t-amber-600"></div>
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-400">
            No credential records match your filter parameters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium text-slate-500 border-collapse min-w-[850px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Certificate Number</th>
                  <th className="py-2.5 px-3">Award Category</th>
                  <th className="py-2.5 px-3">Language</th>
                  <th className="py-2.5 px-3">Template</th>
                  <th className="py-2.5 px-3">Generated By</th>
                  <th className="py-2.5 px-3">Created Date</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              
              <tbody>
                {history.map((cert) => (
                  <tr 
                    key={cert._id} 
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3 px-3 font-bold text-emerald-950">
                      {cert.studentName}
                      {cert.fatherName && (
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">S/O: {cert.fatherName}</p>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-red-600">
                      {cert.certificateNo}
                    </td>
                    <td className="py-3 px-3">
                      {cert.awardName || 'Academic Excellence Topper Award'}
                      <p className="text-[9px] text-amber-600 font-bold uppercase tracking-wider mt-0.5">Year {cert.awardYear}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-slate-50 text-slate-655 px-2 py-0.5 rounded-full text-[9px] font-bold border border-slate-150">
                        {cert.language}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs font-semibold text-slate-400">
                      {cert.templateId?.templateName || 'Custom'}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-400 font-bold uppercase">
                      {cert.generatedBy?.name || 'System Admin'}
                    </td>
                    <td className="py-3 px-3">
                      {new Date(cert.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-3 text-center space-x-1.5">
                      <button
                        onClick={() => setPreviewCert(cert)}
                        title="View / Download Certificate"
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-150 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      
                      {(user?.role === 'superadmin' || user?.role === 'admin') && (
                        <button
                          onClick={() => handleDeleteLog(cert._id, cert.certificateNo)}
                          title="Delete Record"
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-150 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* POPUP PREVIEW OVERLAY MODAL */}
      {previewCert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
              <div>
                <h3 className="font-serif font-bold text-base text-emerald-955">
                  Certificate Viewer
                </h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                  No: <span className="font-mono text-red-600">{previewCert.certificateNo}</span>
                </p>
              </div>
              <button 
                onClick={() => setPreviewCert(null)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body Canvas */}
            <div className="p-6 overflow-y-auto flex-grow flex flex-col items-center justify-center">
              {/* If history populated templateId, pass it. If templateId is just an ID, try to fallback.
                  Since getHistory populates templateId object (fields: templateName, backgroundImage, textCoordinates, qrSettings etc.)
                  Wait! Let's check: populate in getHistory fetches: 'templateId', which includes all fields.
                  Wait, let's view getHistory populate query in certificateController.js:
                  `.populate('templateId', 'templateName')`
                  Wait! In `certificateController.js`, getHistory ONLY populates 'templateName'!
                  `.populate('templateId', 'templateName')`
                  Oh no! If it only populates `templateName`, then the background image and coordinates won't be available on the client for the preview canvas!
                  Let's modify `getHistory` in `backend/controllers/certificateController.js` to populate the FULL template object instead!
                  Let's do this to make sure the preview modal works perfectly!
              */}
              {/* Let's render the canvas */}
              {previewCert.templateId && previewCert.templateId.backgroundImage ? (
                <CertificateCanvas 
                  template={previewCert.templateId} 
                  data={previewCert} 
                  showControls={true} 
                />
              ) : (
                <div className="text-center py-6 text-xs text-red-500 font-bold">
                  Loading full template data...
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default History;
export { History };
