import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CertificateCanvas from '../components/CertificateCanvas';
import { User, FileText, Phone, Award, School, MapPin, Upload, Edit3, CheckCircle, Clock, XCircle, Users } from 'lucide-react';
import toast from 'react-hot-toast';

const StudentProfile = () => {
  const { token, user } = useAuth();
  
  // Application details
  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState(null); // stores { application, certificate }
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form parameters
  const [formData, setFormData] = useState({
    studentName: '',
    fathersName: '',
    schoolPartner: '',
    studentMobile: '',
    parentMobile: '',
    rollNo: '',
    examType: 'CBSE',
    villageName: '',
    percentage: ''
  });

  const [markSheetFile, setMarkSheetFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [profilePicFile, setProfilePicFile] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState('');

  const loadApplicationMe = async () => {
    setLoading(true);
    try {
      const res = await api.fetchStudentApplicationMe(token);
      setAppData(res);
      if (res && res.application) {
        setFormData({
          studentName: res.application.studentName,
          fathersName: res.application.fathersName || '',
          schoolPartner: res.application.schoolPartner,
          studentMobile: res.application.studentMobile,
          parentMobile: res.application.parentMobile,
          rollNo: res.application.rollNo,
          examType: res.application.examType,
          villageName: res.application.villageName,
          percentage: res.application.percentage
        });
        setPreviewUrl(res.application.markSheetPhoto);
        setProfilePicPreview(res.application.profilePic || '');
        setIsEditing(false);
      } else {
        // Prefill studentName from user account
        setFormData(prev => ({
          ...prev,
          studentName: user?.name || ''
        }));
        setIsEditing(true);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load student profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadApplicationMe();
    }
  }, [token]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Marksheet file size exceeds 5MB limit.');
      return;
    }

    setMarkSheetFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Profile photo file size exceeds 5MB limit.');
      return;
    }

    setProfilePicFile(file);
    setProfilePicPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.studentName || !formData.fathersName || !formData.schoolPartner || !formData.studentMobile || !formData.parentMobile || !formData.rollNo || !formData.villageName || !formData.percentage) {
      toast.error('All text fields are required.');
      return;
    }

    if (!markSheetFile && !previewUrl) {
      toast.error('Please upload your marksheet copy for verification.');
      return;
    }

    if (!profilePicFile && !profilePicPreview) {
      toast.error('Please upload your profile picture or selfie.');
      return;
    }

    setSubmitting(true);
    const saveToast = toast.loading('Submitting nomination profile...');

    const fd = new FormData();
    Object.keys(formData).forEach(key => {
      fd.append(key, formData[key]);
    });

    if (markSheetFile) {
      fd.append('markSheetPhoto', markSheetFile);
    } else {
      fd.append('markSheetPhoto', previewUrl);
    }

    if (profilePicFile) {
      fd.append('profilePic', profilePicFile);
    } else {
      fd.append('profilePic', profilePicPreview);
    }

    try {
      await api.submitStudentApplication(fd, token);
      toast.success('Nomination profile submitted successfully!', { id: saveToast });
      loadApplicationMe();
    } catch (err) {
      toast.error(err.message || 'Submission failed.', { id: saveToast });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-955 border-t-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        
        {/* Profile Header */}
        <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            {profilePicPreview ? (
              <img 
                src={profilePicPreview} 
                alt="Student Profile Pic" 
                className="h-12 w-12 rounded-2xl object-cover border border-emerald-100 shadow-sm"
              />
            ) : (
              <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-950 border border-emerald-100 flex items-center justify-center font-bold text-lg font-serif">
                {user?.name.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="font-serif font-bold text-xl text-emerald-955">{user?.name}</h2>
              <p className="text-slate-400 text-xs font-semibold">{user?.email}</p>
            </div>
          </div>

          {appData?.application && !isEditing && appData.application.status !== 'Approved' && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Edit Profile Details
            </button>
          )}
        </div>

        {/* STATUS BANNER */}
        {appData?.application && !isEditing && (
          <div className={`p-6 rounded-3xl border shadow-sm flex items-center gap-4 ${
            appData.application.status === 'Approved'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : appData.application.status === 'Rejected'
                ? 'bg-red-50 border-red-200 text-red-950'
                : 'bg-amber-50 border-amber-200 text-amber-950'
          }`}>
            <div className="flex-shrink-0">
              {appData.application.status === 'Approved' ? (
                <CheckCircle className="w-8 h-8 text-emerald-700" />
              ) : appData.application.status === 'Rejected' ? (
                <XCircle className="w-8 h-8 text-red-650" />
              ) : (
                <Clock className="w-8 h-8 text-amber-600 animate-pulse" />
              )}
            </div>
            <div className="space-y-1">
              <h3 className="font-serif font-bold text-base">
                Verification Status: {appData.application.status}
              </h3>
              <p className="text-xs opacity-80 leading-normal">
                {appData.application.status === 'Approved'
                  ? 'Congratulations! Your topper profile has been approved and automatically added to the official Merit List. You can download your certificate below.'
                  : appData.application.status === 'Rejected'
                    ? `Your profile could not be approved. Remarks: ${appData.application.remarks || 'No remarks left by administrator.'}`
                    : 'Your submitted data is currently undergoing administrative review. We will verify and publish your topper record to the Merit List soon.'}
              </p>
            </div>
          </div>
        )}

        {/* PROFILE WORKSPACE */}
        {isEditing ? (
          
          /* VIEW 1: REGISTRATION/EDIT NOMINATION FORM */
          <form 
            onSubmit={handleSubmit}
            className="bg-white p-6 md:p-8 rounded-3xl border border-slate-150 shadow-xs space-y-6"
          >
            <div className="border-b border-slate-100 pb-3">
              <h3 className="font-serif font-bold text-lg text-emerald-955">
                {appData?.application ? 'Modify Topper Nomination Profile' : 'Student Nomination Registration'}
              </h3>
              <p className="text-slate-400 text-xs mt-0.5 font-semibold">Please ensure all details match your official board marksheet.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs font-semibold text-slate-500">
              {/* Student Name */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Student Full Name</label>
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

              {/* Father's Name */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Father's / Guardian's Full Name</label>
                <input
                  type="text"
                  name="fathersName"
                  value={formData.fathersName}
                  onChange={handleInputChange}
                  placeholder="e.g. Mohammad Anash"
                  required
                  className="w-full py-2.5 px-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 focus:bg-white rounded-xl transition-all"
                />
              </div>

              {/* School Partner */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">School / College / Institution Partner</label>
                <input
                  type="text"
                  name="schoolPartner"
                  value={formData.schoolPartner}
                  onChange={handleInputChange}
                  placeholder="e.g. CBSE Senior Secondary School"
                  required
                  className="w-full py-2.5 px-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 focus:bg-white rounded-xl transition-all"
                />
              </div>

              {/* Student Mobile */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Student Mobile Number</label>
                <input
                  type="tel"
                  name="studentMobile"
                  value={formData.studentMobile}
                  onChange={handleInputChange}
                  placeholder="e.g. +91 9876543210"
                  required
                  className="w-full py-2.5 px-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 focus:bg-white rounded-xl transition-all"
                />
              </div>

              {/* Parents Mobile */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Parent's Mobile Number</label>
                <input
                  type="tel"
                  name="parentMobile"
                  value={formData.parentMobile}
                  onChange={handleInputChange}
                  placeholder="e.g. +91 9876543210"
                  required
                  className="w-full py-2.5 px-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 focus:bg-white rounded-xl transition-all"
                />
              </div>

              {/* Roll Number */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Examination Roll Number</label>
                <input
                  type="text"
                  name="rollNo"
                  value={formData.rollNo}
                  onChange={handleInputChange}
                  placeholder="e.g. Roll No or ID"
                  required
                  className="w-full py-2.5 px-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 focus:bg-white rounded-xl transition-all"
                />
              </div>

              {/* Exam Type */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Examination Type</label>
                <select
                  name="examType"
                  value={formData.examType}
                  onChange={handleInputChange}
                  className="w-full py-2.5 px-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 rounded-xl text-slate-700 font-bold"
                >
                  <option value="CBSE">CBSE Board</option>
                  <option value="MPBSE">MP Board (MPBSE)</option>
                  <option value="Madrasa">Madrasa Curriculum</option>
                  <option value="Hifz">Hifz (Quran Memorization)</option>
                  <option value="Others">Others</option>
                </select>
              </div>

              {/* Village Name */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Village / Locality Name</label>
                <input
                  type="text"
                  name="villageName"
                  value={formData.villageName}
                  onChange={handleInputChange}
                  placeholder="e.g. Amdara"
                  required
                  className="w-full py-2.5 px-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 focus:bg-white rounded-xl transition-all"
                />
              </div>

              {/* Percentage Score */}
              <div>
                <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider mb-1.5">Score / Percentage Secured</label>
                <input
                  type="text"
                  name="percentage"
                  value={formData.percentage}
                  onChange={handleInputChange}
                  placeholder="e.g. 94.5% or 9.5 CGPA"
                  required
                  className="w-full py-2.5 px-3 border border-slate-200 focus:border-emerald-700/60 outline-hidden bg-slate-50/50 focus:bg-white rounded-xl transition-all font-bold text-emerald-900"
                />
              </div>
            </div>

            {/* Photos upload grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-semibold text-slate-500 border-t border-slate-100 pt-4">
              
              {/* Marksheet File Upload */}
              <div className="space-y-2">
                <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Official Marksheet Photo (JPG/PNG)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center bg-slate-50/30 flex flex-col items-center justify-center space-y-3 min-h-[150px]">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="font-serif font-bold text-xs text-emerald-955">Marksheet Image</p>
                  </div>
                  <label className="cursor-pointer py-1.5 px-3 bg-emerald-950 hover:bg-emerald-900 text-white text-[10px] font-bold rounded-lg transition-colors">
                    Select File
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      className="hidden" 
                    />
                  </label>
                  {previewUrl && (
                    <img 
                      src={previewUrl} 
                      alt="Marksheet Preview" 
                      className="h-14 object-contain rounded border border-slate-200 shadow-xs"
                    />
                  )}
                </div>
              </div>

              {/* Profile Pic Upload */}
              <div className="space-y-2">
                <label className="block text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Student Profile Photo / Selfie (Required)</label>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center bg-slate-50/30 flex flex-col items-center justify-center space-y-3 min-h-[150px]">
                  <Upload className="w-5 h-5 text-slate-400" />
                  <div>
                    <p className="font-serif font-bold text-xs text-emerald-955">Profile Picture</p>
                  </div>
                  <label className="cursor-pointer py-1.5 px-3 bg-emerald-950 hover:bg-emerald-900 text-white text-[10px] font-bold rounded-lg transition-colors">
                    Select File
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleProfilePicChange} 
                      className="hidden" 
                    />
                  </label>
                  {profilePicPreview && (
                    <div className="relative group mt-2">
                      <div className="absolute -inset-0.5 bg-gradient-to-tr from-amber-500 to-emerald-600 rounded-full blur-xs opacity-65"></div>
                      <div className="relative h-20 w-20 rounded-full overflow-hidden border-2 border-white shadow-md">
                        <img 
                          src={profilePicPreview} 
                          alt="Profile Preview" 
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <span className="absolute -bottom-1 -right-1 bg-emerald-600 text-white w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center border border-white shadow-xs">
                        ✓
                      </span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Form actions */}
            <div className="flex gap-3 border-t border-slate-100 pt-4 justify-end">
              {appData?.application && (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="py-2.5 px-5 border border-slate-250 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-xs"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="py-2.5 px-6 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Profile Nomination'}
              </button>
            </div>

          </form>
        ) : (
          
          /* VIEW 2: DETAILS STATUS & CERTIFICATE CANVAS PREVIEW */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Details Panel card */}
            <div className="md:col-span-5 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm space-y-4">
              <h3 className="font-serif font-bold text-base text-emerald-955 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-900" />
                Submitted Profile
              </h3>

              {/* Verified Masked Profile Selfie Box */}
              <div className="flex flex-col items-center py-4 bg-slate-50/40 rounded-2xl border border-slate-100/50">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-amber-500 to-emerald-700 rounded-full blur-xs opacity-40"></div>
                  <div className="relative h-24 w-24 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    {appData?.application?.profilePic ? (
                      <img 
                        src={appData.application.profilePic} 
                        alt="Student Selfie" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-slate-150 flex items-center justify-center font-bold text-slate-400">
                        No Photo
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider mt-3">Official Student Selfie</p>
              </div>

              <div className="space-y-4 text-xs font-semibold text-slate-500">
                <div className="flex items-start gap-2.5">
                  <User className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Student Name</p>
                    <p className="text-sm font-bold text-emerald-955 mt-0.5">{appData.application.studentName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Father's / Guardian Name</p>
                    <p className="text-sm font-bold text-emerald-955 mt-0.5">{appData.application.fathersName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <School className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">School Partner</p>
                    <p className="text-slate-700 font-bold mt-0.5">{appData.application.schoolPartner}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Exam / Roll</p>
                      <p className="text-slate-700 font-bold mt-0.5">{appData.application.examType} (Roll: {appData.application.rollNo})</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Secured Score</p>
                    <p className="text-emerald-805 font-bold text-sm mt-0.5">{appData.application.percentage}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Contact Numbers</p>
                    <p className="text-slate-750 font-bold mt-0.5">Student: {appData.application.studentMobile}</p>
                    <p className="text-slate-750 font-bold mt-0.5">Parent: {appData.application.parentMobile}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Village / Locality</p>
                    <p className="text-slate-700 font-bold mt-0.5">{appData.application.villageName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Certificate Card */}
            <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col items-center">
              <h3 className="font-serif font-bold text-base text-emerald-955 border-b border-slate-100 pb-2 w-full mb-4 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-emerald-900" />
                Linked Certificate
              </h3>
              
              {appData.certificate ? (
                <CertificateCanvas 
                  template={appData.certificate.templateId} 
                  data={appData.certificate} 
                  showControls={true} 
                />
              ) : (
                <div className="text-center py-12 px-6 flex flex-col items-center justify-center space-y-3">
                  <Clock className="w-10 h-10 text-amber-500 animate-pulse" />
                  <h4 className="font-serif font-bold text-sm text-emerald-955">Certificate Pending Approval</h4>
                  <p className="text-slate-400 text-xs max-w-xs">Your certificate becomes downloadable here immediately after our administrative review board confirms verification.</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default StudentProfile;
export { StudentProfile };
