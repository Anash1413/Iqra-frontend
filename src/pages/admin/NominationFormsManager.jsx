import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FileText, Eye, Check, X, ShieldAlert, Calendar, LayoutGrid, Award, AlertCircle, Image } from 'lucide-react';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

const NominationFormsManager = () => {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals status
  const [activeApp, setActiveApp] = useState(null); // application selected for review
  const [viewPhotoUrl, setViewPhotoUrl] = useState(''); // preview viewer modal
  
  // Approval Form State
  const [approvalData, setApprovalData] = useState({
    templateId: '',
    certificateNo: ''
  });
  const [submittingApproval, setSubmittingApproval] = useState(false);

  const loadNominationData = async () => {
    setLoading(true);
    try {
      const appList = await api.listStudentApplicationsAdmin(token);
      setApplications(appList);

      const templatesList = await api.fetchTemplates(token);
      setTemplates(templatesList);
      if (templatesList.length > 0) {
        setApprovalData(prev => ({ ...prev, templateId: templatesList[0]._id }));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load nomination forms list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNominationData();
  }, [token]);

  // Open Approval Dialog and prefill auto-increment number
  const handleOpenApproveModal = async (app) => {
    setActiveApp(app);
    const toastId = toast.loading('Calculating next certificate number...');
    try {
      const nextNo = await api.fetchNextCertificateNo(new Date().getFullYear(), token);
      setApprovalData(prev => ({
        ...prev,
        certificateNo: nextNo
      }));
      toast.dismiss(toastId);
    } catch (err) {
      toast.error('Failed to pre-fetch certificate number.', { id: toastId });
    }
  };

  // Submit Approval: Create Certificate + set application status
  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!approvalData.templateId || !approvalData.certificateNo || !activeApp) {
      toast.error('Template and Certificate Number are required.');
      return;
    }

    setSubmittingApproval(true);
    const toastId = toast.loading('Linking certificate & approving...');
    
    try {
      // 1. Record/Save Certificate Log
      const selectedTemplate = templates.find(t => t._id === approvalData.templateId);
      await api.recordCertificate({
        studentName: activeApp.studentName,
        fatherName: activeApp.fathersName || '',
        class: activeApp.class || '12',
        board: activeApp.examType,
        percentage: activeApp.percentage,
        awardName: 'Academic Excellence Topper Award',
        awardYear: new Date().getFullYear(),
        certificateNo: approvalData.certificateNo,
        language: selectedTemplate?.language || 'English',
        templateId: approvalData.templateId
      }, token);

      // 2. Set Application Verification Status to Approved (also auto-adds to Merit List on backend)
      await api.reviewStudentApplicationAdmin(activeApp._id, {
        status: 'Approved',
        certificateNo: approvalData.certificateNo
      }, token);

      toast.success(`${activeApp.studentName}'s nomination approved and merit list record published!`, { id: toastId });
      setActiveApp(null);
      loadNominationData();
    } catch (err) {
      toast.error(err.message || 'Failed to approve nomination.', { id: toastId });
    } finally {
      setSubmittingApproval(false);
    }
  };

  // Trigger Rejection prompt
  const handleRejectNomination = async (app) => {
    const { value: remarks } = await Swal.fire({
      title: 'Reject Student Nomination?',
      input: 'text',
      inputLabel: 'Reason for rejection',
      placeholder: 'e.g. Marksheet photo is not legible or incorrect score...',
      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return 'You must enter a reason for rejection!';
        }
      }
    });

    if (remarks) {
      const rejectToast = toast.loading('Rejecting nomination...');
      try {
        await api.reviewStudentApplicationAdmin(app._id, {
          status: 'Rejected',
          remarks
        }, token);

        toast.success('Nomination rejected successfully.', { id: rejectToast });
        loadNominationData();
      } catch (err) {
        toast.error(err.message || 'Failed to reject nomination.', { id: rejectToast });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-955 border-t-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up font-sans">
      
      {/* Title */}
      <div className="border-b border-slate-200/80 pb-4">
        <h1 className="font-serif font-bold text-2xl text-emerald-955">Topper Nomination Forms</h1>
        <p className="text-slate-400 text-xs mt-0.5">Review, verify marksheets & profile pictures, and allocate certificates. Approved students are automatically added to the Merit List.</p>
      </div>

      {/* Applications list table */}
      <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-xs">
        {applications.length === 0 ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-400">
            No public student nomination forms have been submitted yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium text-slate-500 border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Student Name</th>
                  <th className="py-2.5 px-3">Roll No / Board</th>
                  <th className="py-2.5 px-3">Percentage</th>
                  <th className="py-2.5 px-3">Village</th>
                  <th className="py-2.5 px-3 text-center">Marksheet</th>
                  <th className="py-2.5 px-3">Contacts</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-2.5">
                        {app.profilePic ? (
                          <img 
                            src={app.profilePic} 
                            alt="Student Selfie" 
                            onClick={() => setViewPhotoUrl(app.profilePic)}
                            className="h-9 w-9 rounded-full object-cover border border-emerald-100 shadow-xs cursor-zoom-in hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500">
                            N/A
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-emerald-955">{app.studentName}</div>
                          <div className="text-[9px] text-slate-400 font-semibold mt-0.5">F: {app.fathersName || 'N/A'}</div>
                          <div className="text-[9px] text-slate-450 font-semibold mt-0.5">{app.schoolPartner}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-3">
                      <div>{app.examType}</div>
                      <div className="font-mono text-[10px] text-slate-400 font-semibold mt-0.5">Roll: {app.rollNo}</div>
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-800">{app.percentage}</td>
                    <td className="py-3.5 px-3">{app.villageName}</td>
                    <td className="py-3.5 px-3 text-center">
                      <button
                        onClick={() => setViewPhotoUrl(app.markSheetPhoto)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-100 rounded-lg text-[10px] font-bold transition-all shadow-xs"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View Marksheet
                      </button>
                    </td>
                    <td className="py-3.5 px-3 space-y-0.5 text-[10px] text-slate-450 font-bold">
                      <div>Student: {app.studentMobile}</div>
                      <div>Parent: {app.parentMobile}</div>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span className={`inline-flex items-center gap-1 text-[9px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                        app.status === 'Approved'
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-805'
                          : app.status === 'Rejected'
                            ? 'bg-red-50 border-red-100 text-red-655'
                            : 'bg-amber-50 border-amber-100 text-amber-600'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center space-x-1.5">
                      {app.status === 'Pending' ? (
                        <>
                          <button
                            onClick={() => handleOpenApproveModal(app)}
                            title="Approve & Allocate Certificate"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-150 text-emerald-955 border border-emerald-150 transition-colors cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleRejectNomination(app)}
                            title="Reject Application"
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-150 transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Reviewed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: PHOTO/IMAGE HIGH-RES VIEWER */}
      {viewPhotoUrl && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
              <h3 className="font-serif font-bold text-sm text-emerald-955">Document / Photo Verification</h3>
              <button 
                onClick={() => setViewPhotoUrl('')}
                className="p-1 rounded-lg hover:bg-slate-250 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 bg-slate-55 flex items-center justify-center">
              <img 
                src={viewPhotoUrl} 
                alt="Verification Document" 
                className="max-h-[70vh] object-contain rounded-xl shadow-md border border-slate-200"
              />
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPROVE & ALLOCATE CERTIFICATE */}
      {activeApp && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <form 
            onSubmit={handleApproveSubmit}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden flex flex-col p-6 space-y-4"
          >
            <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
              <div>
                <h3 className="font-serif font-bold text-base text-emerald-955">Approve Nomination</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Student: {activeApp.studentName}</p>
              </div>
              <button 
                type="button"
                onClick={() => setActiveApp(null)}
                className="p-1 rounded-lg hover:bg-slate-150 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {templates.length === 0 ? (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs font-semibold text-amber-705 flex gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>No layouts templates found. Please configure a design layout under Visual Template Editor first.</p>
              </div>
            ) : (
              <div className="space-y-4 text-xs font-semibold text-slate-500">
                {/* Select layout */}
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Select Certificate Template</label>
                  <select
                    value={approvalData.templateId}
                    onChange={(e) => setApprovalData({ ...approvalData, templateId: e.target.value })}
                    className="w-full py-2.5 px-3 border border-slate-200 bg-slate-50 rounded-xl font-bold text-slate-700 text-xs focus:border-emerald-700/60 outline-hidden"
                  >
                    {templates.map(t => (
                      <option key={t._id} value={t._id}>{t.templateName} ({t.language})</option>
                    ))}
                  </select>
                </div>

                {/* Certificate Number */}
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Allocate Certificate Number</label>
                  <input
                    type="text"
                    value={approvalData.certificateNo}
                    onChange={(e) => setApprovalData({ ...approvalData, certificateNo: e.target.value })}
                    required
                    className="w-full py-2.5 px-3 border border-slate-200 rounded-xl focus:border-emerald-700/60 outline-hidden bg-slate-50 font-mono font-bold text-red-600"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setActiveApp(null)}
                className="py-2 px-4 border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingApproval || templates.length === 0}
                className="py-2 px-5 bg-emerald-950 hover:bg-emerald-900 disabled:bg-slate-200 text-white text-xs font-bold rounded-xl shadow transition-colors"
              >
                Confirm & Add to Merit List
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default NominationFormsManager;
export { NominationFormsManager };
