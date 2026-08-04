import React, { useState, useEffect } from 'react';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import CertificateCanvas from '../../../components/CertificateCanvas';
import { Award, FileText, ChevronLeft, Save, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const SingleGenerate = () => {
  const { token } = useAuth();
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form Fields State
  const [formData, setFormData] = useState({
    studentName: '',
    fatherName: '',
    class: '',
    board: 'CBSE',
    percentage: '',
    awardName: 'Academic Excellence Topper Award',
    awardYear: new Date().getFullYear(),
    certificateNo: '',
    issueDate: new Date().toISOString().split('T')[0],
    language: 'English'
  });

  // Fetch templates and initial next cert number on mount
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const templatesList = await api.fetchTemplates(token);
        setTemplates(templatesList);
        if (templatesList.length > 0) {
          setSelectedTemplate(templatesList[0]);
          setFormData(prev => ({
            ...prev,
            language: templatesList[0].language
          }));
        }

        const nextNo = await api.fetchNextCertificateNo(new Date().getFullYear(), token);
        setFormData(prev => ({ ...prev, certificateNo: nextNo }));
      } catch (err) {
        console.error('Failed to initialize page data:', err);
        toast.error('Could not load active design templates.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [token]);

  // Handle template selection change
  const handleTemplateChange = (e) => {
    const tId = e.target.value;
    const template = templates.find(t => t._id === tId);
    if (template) {
      setSelectedTemplate(template);
      setFormData(prev => ({
        ...prev,
        language: template.language
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Re-fetch certificate number for a specific year
  const handleYearChange = async (e) => {
    const year = e.target.value;
    setFormData(prev => ({ ...prev, awardYear: year }));
    try {
      const nextNo = await api.fetchNextCertificateNo(year, token);
      setFormData(prev => ({ ...prev, certificateNo: nextNo }));
    } catch (err) {
      console.warn('Could not auto-fetch next certificate number:', err);
    }
  };

  // Save audit log to backend history
  const handleSaveToHistory = async (e) => {
    e.preventDefault();
    if (!formData.studentName || !formData.certificateNo || !selectedTemplate) {
      toast.error('Please input Student Name, Certificate Number, and select a Template.');
      return;
    }

    const saveToast = toast.loading('Recording certificate log...');
    try {
      await api.recordCertificate({
        ...formData,
        templateId: selectedTemplate._id
      }, token);
      
      toast.success('Certificate logged in public registry history!', { id: saveToast });

      // Automatically increment next certificate number
      const nextNo = await api.fetchNextCertificateNo(formData.awardYear, token);
      setFormData(prev => ({
        ...prev,
        studentName: '',
        fatherName: '',
        percentage: '',
        certificateNo: nextNo
      }));
    } catch (err) {
      toast.error(err.message || 'Failed to save certificate log.', { id: saveToast });
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-50 font-sans space-y-6">
      
      {/* Top Navigation Backbar */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/certificates" 
            className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-500 transition-colors shadow-xs"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif font-extrabold text-2xl text-emerald-950">Generate Single Certificate</h1>
            <p className="text-slate-400 text-xs mt-0.5 font-bold uppercase tracking-wider">Credential Generator System</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex justify-center w-full">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-950 border-t-amber-600"></div>
        </div>
      ) : templates.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-150 shadow-xs text-center max-w-lg mx-auto space-y-4">
          <Award className="w-12 h-12 text-amber-500 mx-auto" />
          <h3 className="font-serif font-bold text-lg text-emerald-950">No Templates Found</h3>
          <p className="text-slate-400 text-xs leading-relaxed">You must create at least one certificate template first using the visual template editor before you can generate certificates.</p>
          <Link
            to="/admin/certificates/templates"
            className="inline-flex items-center px-4 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow transition-colors"
          >
            Go to Template Editor
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Form Settings inputs */}
          <form 
            onSubmit={handleSaveToHistory} 
            className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-150 shadow-xs space-y-5"
          >
            <h3 className="font-serif font-bold text-base text-emerald-955 border-b border-slate-100 pb-2">Student Parameters</h3>
            
            <div className="space-y-4 text-xs font-semibold text-slate-500">
              
              {/* Template dropdown */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Design Template</label>
                <select
                  value={selectedTemplate?._id || ''}
                  onChange={handleTemplateChange}
                  className="w-full py-2.5 px-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 rounded-xl transition-all font-bold text-slate-700"
                >
                  {templates.map(t => (
                    <option key={t._id} value={t._id}>{t.templateName} ({t.language})</option>
                  ))}
                </select>
              </div>

              {/* Student Name */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Student Name</label>
                <input
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleInputChange}
                  placeholder="e.g. Ahmad Anash"
                  required
                  className="w-full py-2.5 px-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 focus:bg-white rounded-xl transition-all"
                />
              </div>

              {/* Father Name */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Father's Name</label>
                <input
                  type="text"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  placeholder="e.g. Rashid Ahmad"
                  className="w-full py-2.5 px-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 focus:bg-white rounded-xl transition-all"
                />
              </div>

              {/* Grid: Class & Board */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Class</label>
                  <input
                    type="text"
                    name="class"
                    value={formData.class}
                    onChange={handleInputChange}
                    placeholder="e.g. 10 or 12"
                    className="w-full py-2.5 px-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 focus:bg-white rounded-xl transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Board</label>
                  <input
                    type="text"
                    name="board"
                    value={formData.board}
                    onChange={handleInputChange}
                    placeholder="e.g. CBSE or MP Board"
                    className="w-full py-2.5 px-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 focus:bg-white rounded-xl transition-all"
                  />
                </div>
              </div>

              {/* Grid: Score & Award Year */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Percentage Score</label>
                  <input
                    type="text"
                    name="percentage"
                    value={formData.percentage}
                    onChange={handleInputChange}
                    placeholder="e.g. 94.5%"
                    className="w-full py-2.5 px-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 focus:bg-white rounded-xl transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Award Year</label>
                  <input
                    type="number"
                    name="awardYear"
                    value={formData.awardYear}
                    onChange={handleYearChange}
                    className="w-full py-2.5 px-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 focus:bg-white rounded-xl transition-all"
                  />
                </div>
              </div>

              {/* Award Name */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Award Name</label>
                <input
                  type="text"
                  name="awardName"
                  value={formData.awardName}
                  onChange={handleInputChange}
                  placeholder="e.g. Academic Excellence Award"
                  className="w-full py-2.5 px-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 focus:bg-white rounded-xl transition-all"
                />
              </div>

              {/* Grid: Certificate number & Issue Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Certificate Number</label>
                  <input
                    type="text"
                    name="certificateNo"
                    value={formData.certificateNo}
                    onChange={handleInputChange}
                    required
                    className="w-full py-2.5 px-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 focus:bg-white rounded-xl transition-all font-mono font-bold text-red-600"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Issue Date</label>
                  <input
                    type="date"
                    name="issueDate"
                    value={formData.issueDate}
                    onChange={handleInputChange}
                    className="w-full py-2.5 px-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 focus:bg-white rounded-xl transition-all"
                  />
                </div>
              </div>

            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 mt-4"
            >
              <Save className="w-4 h-4" />
              Save to Public Registry History
            </button>

          </form>

          {/* Right Column: Visual Live Canvas Preview */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-150 shadow-xs flex flex-col items-center">
            <h3 className="font-serif font-bold text-base text-emerald-955 border-b border-slate-100 pb-2 w-full mb-4">Visual Live Preview</h3>
            <CertificateCanvas 
              template={selectedTemplate} 
              data={formData} 
              showControls={true} 
            />
          </div>

        </div>
      )}

    </div>
  );
};

export default SingleGenerate;
export { SingleGenerate };
