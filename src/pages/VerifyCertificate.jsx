import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import CertificateCanvas from '../components/CertificateCanvas';
import { ShieldCheck, ShieldAlert, Award, FileText, Calendar, User, Search, Home } from 'lucide-react';

const VerifyCertificate = () => {
  const { certificateNo } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [certData, setCertData] = useState(null);
  const [error, setError] = useState(null);
  const [searchNo, setSearchNo] = useState('');

  const verify = async (certNo) => {
    setLoading(true);
    setError(null);
    setCertData(null);
    try {
      const data = await api.verifyCertificatePublic(certNo);
      setCertData(data);
    } catch (err) {
      setError(err.message || 'Certificate verification failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (certificateNo) {
      verify(certificateNo);
    }
  }, [certificateNo]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchNo.trim()) {
      navigate(`/verify/${encodeURIComponent(searchNo.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      <div className="max-w-4xl mx-auto w-full space-y-8 animate-fade-in-up">
        
        {/* Header Branding */}
        <div className="text-center">
          <h2 className="font-serif font-extrabold text-3xl text-emerald-955 tracking-tight">
            IQRA <span className="text-amber-500 font-sans font-semibold">Board</span>
          </h2>
          <p className="text-slate-400 text-xs mt-1.5 uppercase font-bold tracking-wider">Public Credential Verification</p>
        </div>

        {/* MANUAL SEARCH PANEL (Shown if no certificateNo is in url, or if verification fails) */}
        {(!certificateNo || error) && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-150 shadow-md max-w-lg mx-auto space-y-5">
            <div className="space-y-1 text-center">
              <h3 className="font-serif font-bold text-lg text-emerald-955">Manual Search Verification</h3>
              <p className="text-slate-400 text-xs font-semibold">Enter the unique Certificate Number or verification signature below.</p>
            </div>

            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <div className="relative font-semibold text-xs text-slate-500">
                <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. IQRA/2026/001"
                  value={searchNo}
                  onChange={(e) => setSearchNo(e.target.value)}
                  required
                  className="w-full py-2.5 pl-10 pr-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50 focus:bg-white rounded-xl transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-950 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                Verify Credential Status
              </button>
            </form>
          </div>
        )}

        {/* LOADING STATE */}
        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-slate-150 shadow-xl flex flex-col items-center justify-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-955 border-t-amber-600"></div>
            <p className="text-slate-500 text-sm font-semibold">Verifying credential signatures...</p>
          </div>
        ) : error ? (
          
          /* FAILURE STATE (NOT FOUND) */
          <div className="bg-white p-8 sm:p-12 rounded-3xl border border-slate-150 shadow-xl space-y-6 text-center max-w-lg mx-auto">
            <div className="h-16 w-16 bg-red-50 text-red-655 border border-red-100 rounded-2xl flex items-center justify-center mx-auto shadow-sm animate-bounce">
              <ShieldAlert className="w-8 h-8" />
            </div>
            
            <div className="space-y-2">
              <h3 className="font-serif font-bold text-xl text-emerald-955">Certificate Not Found</h3>
              <p className="text-slate-555 text-xs leading-relaxed">
                The credentials record <span className="font-mono font-bold text-red-600 bg-red-50/50 px-1.5 py-0.5 rounded border border-red-100/50">{certificateNo}</span> is not registered in the IQRA Board database.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl text-left text-xs leading-relaxed text-slate-550 space-y-2">
              <p className="font-bold text-slate-700">Need Assistance?</p>
              <p>If you have been issued a paper certificate containing this number, please contact our support desk at <span className="font-semibold text-emerald-900">support@iqrafoundation.org</span>.</p>
            </div>

            <div className="pt-2 flex gap-3">
              <Link 
                to="/merit-list" 
                className="flex-1 py-3 border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
              >
                Browse Merit List
              </Link>
              <Link 
                to="/" 
                className="flex-1 py-3 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
              >
                <Home className="w-3.5 h-3.5" />
                Go to Homepage
              </Link>
            </div>
          </div>
        ) : certData && (
          
          /* SUCCESS STATE (VERIFIED) */
          <div className="space-y-6 animate-fade-in-up">
            {/* Verification Status Banner */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-150 shadow-lg flex flex-col sm:flex-row items-center gap-5">
              <div className="h-16 w-16 bg-emerald-50 text-emerald-950 border border-emerald-100 rounded-2xl flex items-center justify-center shadow-sm flex-shrink-0">
                <ShieldCheck className="w-9 h-9 text-emerald-900 animate-pulse" />
              </div>
              <div className="text-center sm:text-left space-y-1">
                <div className="inline-flex items-center gap-1 bg-emerald-100 border border-emerald-200 text-emerald-805 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Verified Credential
                </div>
                <h3 className="font-serif font-extrabold text-2xl text-emerald-955">Verification Successful</h3>
                <p className="text-slate-400 text-xs leading-normal">This certificate is authentic and officially registered under the IQRA Board registry.</p>
              </div>
            </div>

            {/* Main info wrapper */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left Column: Details panel */}
              <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-5">
                <h4 className="font-serif font-bold text-base text-emerald-955 border-b border-slate-100 pb-2">Credential Registry Details</h4>
                
                <div className="space-y-4 text-xs font-semibold text-slate-500">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Recipient Topper</p>
                      <p className="text-sm font-bold text-emerald-955 mt-0.5">{certData.studentName}</p>
                      {certData.fatherName && (
                        <p className="text-[10px] text-slate-400 mt-0.5">S/O: {certData.fatherName}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Award className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Honorable Award</p>
                      <p className="text-sm font-bold text-slate-700 mt-0.5">{certData.awardName || 'Academic Topper Excellence Award'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Board / Class</p>
                        <p className="font-bold text-slate-700 mt-0.5">{certData.board} {certData.class && `(Class ${certData.class})`}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Percentage Score</p>
                      <p className="font-bold text-emerald-805 text-sm mt-0.5">{certData.percentage}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Allocation Registry</p>
                      <p className="font-bold text-slate-700 mt-0.5">
                        No: <span className="font-mono text-red-655">{certData.certificateNo}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Issued: {new Date(certData.issueDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex">
                  <button
                    onClick={() => { setCertData(null); setSearchNo(''); }}
                    className="w-full py-2.5 border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs"
                  >
                    Verify Another Certificate
                  </button>
                </div>
              </div>

              {/* Right Column: Visual PDF/PNG Canvas */}
              <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col items-center">
                <h4 className="font-serif font-bold text-base text-emerald-955 border-b border-slate-100 pb-2 w-full mb-4">Official Certificate Document</h4>
                <CertificateCanvas 
                  template={certData.templateId} 
                  data={certData} 
                  showControls={true} 
                />
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default VerifyCertificate;
export { VerifyCertificate };
