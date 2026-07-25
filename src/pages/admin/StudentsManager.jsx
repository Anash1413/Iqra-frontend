import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { Plus, Edit2, Trash2, ArrowLeft, Image, Check, EyeOff, Eye, Search, AlertCircle, X } from 'lucide-react';

const StudentsManager = () => {
  const { token } = useAuth();
  
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form view toggle state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingStudent, setViewingStudent] = useState(null);
  
  // Form state
  const defaultFormState = {
    name: '',
    fathersName: '',
    schoolName: '',
    board: 'CBSE',
    score: '',
    year: new Date().getFullYear().toString(),
    examType: 'secular',
    rollNumber: '',
    studentPhone: '',
    parentsPhone: '',
    visibility: {
      studentPhone: false,
      parentsPhone: false,
      rollNumber: false
    }
  };
  const [formData, setFormData] = useState(defaultFormState);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await api.fetchStudentsAdmin(token);
      setStudents(data);
    } catch (err) {
      toast.error('Failed to load students directory.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleVisibilityChange = (field) => {
    setFormData({
      ...formData,
      visibility: {
        ...formData.visibility,
        [field]: !formData.visibility[field]
      }
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setFormData(defaultFormState);
    setFile(null);
    setPreviewUrl('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingId(student._id);
    setFormData({
      name: student.name || '',
      fathersName: student.fathersName || '',
      schoolName: student.schoolName || '',
      board: student.board || 'CBSE',
      score: student.score || '',
      year: student.year?.toString() || new Date().getFullYear().toString(),
      examType: student.examType || 'secular',
      rollNumber: student.rollNumber || '',
      studentPhone: student.studentPhone || '',
      parentsPhone: student.parentsPhone || '',
      visibility: {
        studentPhone: student.visibility?.studentPhone || false,
        parentsPhone: student.visibility?.parentsPhone || false,
        rollNumber: student.visibility?.rollNumber || false
      }
    });
    setFile(null);
    setPreviewUrl(student.profilePic || '');
    setIsFormOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.schoolName || !formData.score) {
      toast.error('Name, School, and Score are required.');
      return;
    }

    const toastId = toast.loading(editingId ? 'Updating student profile...' : 'Creating student profile...');

    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('fathersName', formData.fathersName);
      formPayload.append('schoolName', formData.schoolName);
      formPayload.append('board', formData.board);
      formPayload.append('score', formData.score);
      formPayload.append('year', formData.year);
      formPayload.append('examType', formData.examType);
      formPayload.append('rollNumber', formData.rollNumber);
      formPayload.append('studentPhone', formData.studentPhone);
      formPayload.append('parentsPhone', formData.parentsPhone);
      formPayload.append('visibility', JSON.stringify(formData.visibility));

      if (file) {
        formPayload.append('profilePic', file);
      }

      if (editingId) {
        await api.updateStudent(editingId, formPayload, token);
        toast.success('Student record updated successfully!', { id: toastId });
      } else {
        await api.createStudent(formPayload, token);
        toast.success('Student record created successfully!', { id: toastId });
      }

      setIsFormOpen(false);
      loadStudents();
    } catch (err) {
      toast.error(err.message || 'Action failed.', { id: toastId });
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Delete Student Record?',
      text: 'This action cannot be undone. The student profile will be removed from the public merit list archive.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#064e3b',
      cancelButtonColor: '#cbd5e1',
      confirmButtonText: 'Yes, delete record',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const toastId = toast.loading('Deleting record...');
        try {
          await api.deleteStudent(id, token);
          toast.success('Record deleted successfully!', { id: toastId });
          loadStudents();
        } catch (err) {
          toast.error(err.message || 'Failed to delete record.', { id: toastId });
        }
      }
    });
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.board.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      
      {/* DIRECTORY VIEW */}
      {!isFormOpen ? (
        <div className="space-y-6 animate-fade-in-up">
          {/* Top action bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/80 pb-4">
            <div>
              <h1 className="font-serif font-bold text-2xl text-emerald-950">Merit Toppers Directory</h1>
              <p className="text-slate-400 text-xs mt-0.5">Manage details and public visibility flags for student records.</p>
            </div>
            <button 
              onClick={handleOpenCreate}
              className="w-full sm:w-auto px-5 py-3 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Student Record
            </button>
          </div>

          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-3">
            <span className="text-slate-400 pl-1"><Search className="w-4 h-4" /></span>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search students by name, school, or board..." 
              className="w-full bg-transparent border-none text-sm outline-none text-slate-700 placeholder-slate-400"
            />
          </div>

          {/* Students Grid Table */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-950 border-t-amber-600"></div>
            </div>
          ) : filteredStudents.length > 0 ? (
            <div className="bg-white rounded-2xl border border-slate-150 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="px-6 py-4">Topper Profile</th>
                      <th className="px-6 py-4">Institution Info</th>
                      <th className="px-6 py-4">Year & Score</th>
                      <th className="px-6 py-4">Details Visibility</th>
                      <th className="px-6 py-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-650">
                    {filteredStudents.map((student) => (
                      <tr key={student._id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Profile Photo */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {student.profilePic ? (
                              <img 
                                src={student.profilePic} 
                                alt={student.name} 
                                className="w-9 h-9 rounded-full object-cover border border-slate-100 shadow-sm" 
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-950 flex items-center justify-center font-bold text-xs font-serif shadow-sm">
                                {student.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-bold text-emerald-950 leading-tight">{student.name}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">S/O: {student.fathersName || 'N/A'}</p>
                            </div>
                          </div>
                        </td>

                        {/* Institution */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-705 truncate max-w-[200px]">{student.schoolName}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-semibold mt-0.5">{student.board}</p>
                        </td>

                        {/* score */}
                        <td className="px-6 py-4">
                          <p className="font-extrabold text-emerald-900">{student.score}</p>
                          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{student.year} • {student.examType}</p>
                        </td>

                        {/* Visibility list */}
                        <td className="px-6 py-4 space-y-1 text-[10px]">
                          <div className="flex items-center gap-1.5">
                            {student.visibility?.rollNumber ? (
                              <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> Roll</span>
                            ) : (
                              <span className="text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-0.5"><X className="w-2.5 h-2.5" /> Roll</span>
                            )}
                            {student.visibility?.studentPhone ? (
                              <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> Phone</span>
                            ) : (
                              <span className="text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-0.5"><X className="w-2.5 h-2.5" /> Phone</span>
                            )}
                            {student.visibility?.parentsPhone ? (
                              <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded flex items-center gap-0.5"><Check className="w-2.5 h-2.5" /> Parent</span>
                            ) : (
                              <span className="text-slate-400 bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded flex items-center gap-0.5"><X className="w-2.5 h-2.5" /> Parent</span>
                            )}
                          </div>
                        </td>

                        {/* Action buttons */}
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button 
                              onClick={() => setViewingStudent(student)}
                              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-emerald-950 rounded-lg border border-slate-200 transition-colors"
                              title="Quick View Details"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleOpenEdit(student)}
                              className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-emerald-950 rounded-lg border border-slate-200 transition-colors"
                              title="Edit Profile"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(student._id)}
                              className="p-2 bg-slate-50 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded-lg border border-slate-200 transition-colors"
                              title="Delete Profile"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-150 p-16 text-center max-w-sm mx-auto space-y-3 shadow-sm">
              <span className="text-3xl block">📋</span>
              <h3 className="font-serif font-bold text-lg text-emerald-950">No Student Records Found</h3>
              <p className="text-slate-500 text-xs">There are no records in the directory or none matched your search filter.</p>
              <button 
                onClick={handleOpenCreate} 
                className="px-4 py-2 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition-all"
              >
                Create First Profile
              </button>
            </div>
          )}
        </div>
      ) : (
        /* FULL WIDTH INLINE FORM VIEW (UNCOMPRESSED) */
        <div className="space-y-6 animate-fade-in-up max-w-4xl mx-auto">
          {/* Header row */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 hover:text-emerald-950 shadow-sm transition-colors"
              >
                <ArrowLeft className="w-4.5 h-4.5" />
              </button>
              <div>
                <h1 className="font-serif font-bold text-xl md:text-2xl text-emerald-950">
                  {editingId ? 'Edit Student Profile' : 'Register New Student Profile'}
                </h1>
                <p className="text-slate-400 text-xs mt-0.5">Please provide correct educational credentials for public display.</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-150 shadow-md overflow-hidden">
            
            {/* Form Fields container */}
            <div className="p-8 space-y-8">
              
              {/* Section 1: Picture & Full Names */}
              <div className="space-y-5">
                <h3 className="font-serif font-bold text-base text-emerald-950 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="h-4 w-1.5 bg-emerald-900 rounded"></span>
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center bg-slate-50/50 p-6 rounded-2xl border border-slate-200/60">
                  {/* Photo Uploader */}
                  <div className="md:col-span-3 flex flex-col items-center gap-3">
                    {previewUrl ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-md" 
                      />
                    ) : (
                      <div className="w-28 h-28 rounded-full bg-slate-100 text-slate-400 border border-slate-200 flex items-center justify-center shadow-inner">
                        <Image className="w-8 h-8" />
                      </div>
                    )}
                    <label className="text-xs font-bold bg-white border border-slate-250 hover:bg-slate-55 px-4 py-2 rounded-xl shadow-sm cursor-pointer text-slate-700 text-center tracking-wide transition-all">
                      Upload Face Photo
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleFileChange} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {/* Names */}
                  <div className="md:col-span-9 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="form-label text-xs uppercase tracking-wider" htmlFor="studentNameInput">Student Name *</label>
                        <input 
                          type="text" 
                          id="studentNameInput"
                          name="name" 
                          value={formData.name} 
                          onChange={handleInputChange} 
                          placeholder="e.g. Anash Khan" 
                          className="form-control text-sm p-3 border-2 border-slate-200 rounded-xl focus:border-emerald-900" 
                          required 
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label text-xs uppercase tracking-wider" htmlFor="fathersNameInput">Father's Name</label>
                        <input 
                          type="text" 
                          id="fathersNameInput"
                          name="fathersName" 
                          value={formData.fathersName} 
                          onChange={handleInputChange} 
                          placeholder="e.g. Ahmad Anash" 
                          className="form-control text-sm p-3 border-2 border-slate-200 rounded-xl focus:border-emerald-900" 
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label text-xs uppercase tracking-wider" htmlFor="schoolNameInput">Institution / School / Madrasa Name *</label>
                      <input 
                        type="text" 
                        id="schoolNameInput"
                        name="schoolName" 
                        value={formData.schoolName} 
                        onChange={handleInputChange} 
                        placeholder="e.g. Ideal Public CBSE School Amdara" 
                        className="form-control text-sm p-3 border-2 border-slate-200 rounded-xl focus:border-emerald-900" 
                        required 
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Academic scores */}
              <div className="space-y-5">
                <h3 className="font-serif font-bold text-base text-emerald-950 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="h-4 w-1.5 bg-emerald-900 rounded"></span>
                  Academic & Board Records
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="form-group">
                    <label className="form-label text-xs uppercase tracking-wider" htmlFor="curriculumSelect">Curriculum Type *</label>
                    <select 
                      id="curriculumSelect"
                      name="examType" 
                      value={formData.examType} 
                      onChange={handleInputChange} 
                      className="form-control text-sm p-3 border-2 border-slate-200 rounded-xl bg-white focus:border-emerald-900"
                    >
                      <option value="secular">Secular (Schools)</option>
                      <option value="islamic">Islamic (Religious)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label text-xs uppercase tracking-wider" htmlFor="boardInput">Exam Board / Certificate *</label>
                    <input 
                      type="text" 
                      id="boardInput"
                      name="board" 
                      value={formData.board} 
                      onChange={handleInputChange} 
                      placeholder="e.g. CBSE / MP Board / Hifz" 
                      className="form-control text-sm p-3 border-2 border-slate-200 rounded-xl focus:border-emerald-900" 
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label text-xs uppercase tracking-wider" htmlFor="scoreInput">Topper Score *</label>
                    <input 
                      type="text" 
                      id="scoreInput"
                      name="score" 
                      value={formData.score} 
                      onChange={handleInputChange} 
                      placeholder="e.g. 98.4% or 1st Div" 
                      className="form-control text-sm p-3 border-2 border-slate-200 rounded-xl focus:border-emerald-900" 
                      required 
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label text-xs uppercase tracking-wider" htmlFor="yearInput">Award Year *</label>
                    <input 
                      type="number" 
                      id="yearInput"
                      name="year" 
                      value={formData.year} 
                      onChange={handleInputChange} 
                      className="form-control text-sm p-3 border-2 border-slate-200 rounded-xl focus:border-emerald-900" 
                      required 
                    />
                  </div>
                </div>
              </div>

              {/* Section 3: Privacy and Visibility */}
              <div className="space-y-4">
                <h3 className="font-serif font-bold text-base text-emerald-950 flex items-center gap-2 border-b border-slate-100 pb-2">
                  <span className="h-4 w-1.5 bg-emerald-900 rounded"></span>
                  Privacy & Contact Visibility Controls
                </h3>
                
                <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-900 text-xs">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
                  <p className="leading-relaxed">
                    By default, roll numbers and telephone contact details are strictly masked on the public index. Check the corresponding box below to display a specific field to visitors.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-200/60">
                  {/* Roll No */}
                  <div className="bg-white p-4 rounded-xl border border-slate-150 space-y-3 shadow-sm">
                    <div className="form-group">
                      <label className="form-label text-[10px] uppercase tracking-wider block" htmlFor="rollNumInput">Roll Number</label>
                      <input 
                        type="text" 
                        id="rollNumInput"
                        name="rollNumber" 
                        value={formData.rollNumber} 
                        onChange={handleInputChange} 
                        placeholder="e.g. 104523" 
                        className="form-control text-xs border border-slate-250 p-2.5 rounded-lg" 
                      />
                    </div>
                    <label className="checkbox-label text-xs text-slate-500 font-bold select-none cursor-pointer flex items-center gap-2 pt-1">
                      <input 
                        type="checkbox" 
                        checked={formData.visibility.rollNumber} 
                        onChange={() => handleVisibilityChange('rollNumber')} 
                        className="checkbox-control w-5 h-5 accent-emerald-900 cursor-pointer" 
                      />
                      Make Publicly Visible
                    </label>
                  </div>

                  {/* Student Phone */}
                  <div className="bg-white p-4 rounded-xl border border-slate-150 space-y-3 shadow-sm">
                    <div className="form-group">
                      <label className="form-label text-[10px] uppercase tracking-wider block" htmlFor="studentPhInput">Student Phone</label>
                      <input 
                        type="text" 
                        id="studentPhInput"
                        name="studentPhone" 
                        value={formData.studentPhone} 
                        onChange={handleInputChange} 
                        placeholder="+91 968..." 
                        className="form-control text-xs border border-slate-250 p-2.5 rounded-lg" 
                      />
                    </div>
                    <label className="checkbox-label text-xs text-slate-500 font-bold select-none cursor-pointer flex items-center gap-2 pt-1">
                      <input 
                        type="checkbox" 
                        checked={formData.visibility.studentPhone} 
                        onChange={() => handleVisibilityChange('studentPhone')} 
                        className="checkbox-control w-5 h-5 accent-emerald-900 cursor-pointer" 
                      />
                      Make Publicly Visible
                    </label>
                  </div>

                  {/* Parents Phone */}
                  <div className="bg-white p-4 rounded-xl border border-slate-150 space-y-3 shadow-sm">
                    <div className="form-group">
                      <label className="form-label text-[10px] uppercase tracking-wider block" htmlFor="parentsPhInput">Parent's Phone</label>
                      <input 
                        type="text" 
                        id="parentsPhInput"
                        name="parentsPhone" 
                        value={formData.parentsPhone} 
                        onChange={handleInputChange} 
                        placeholder="+91 912..." 
                        className="form-control text-xs border border-slate-250 p-2.5 rounded-lg" 
                      />
                    </div>
                    <label className="checkbox-label text-xs text-slate-500 font-bold select-none cursor-pointer flex items-center gap-2 pt-1">
                      <input 
                        type="checkbox" 
                        checked={formData.visibility.parentsPhone} 
                        onChange={() => handleVisibilityChange('parentsPhone')} 
                        className="checkbox-control w-5 h-5 accent-emerald-900 cursor-pointer" 
                      />
                      Make Publicly Visible
                    </label>
                  </div>
                </div>
              </div>

            </div>

            {/* Form actions footer */}
            <div className="bg-slate-50/50 border-t border-slate-150 px-8 py-5 flex justify-end gap-3.5">
              <button 
                type="button" 
                onClick={() => setIsFormOpen(false)}
                className="px-6 py-3 border border-slate-250 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-xl transition-all"
              >
                Discard & Exit
              </button>
              <button 
                type="submit"
                className="px-8 py-3 bg-emerald-950 hover:bg-emerald-900 text-white text-sm font-bold rounded-xl shadow transition-all flex items-center gap-2"
              >
                Save Topper Profile
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Quick View Student Modal/Popup */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-150 shadow-2xl max-w-lg w-full overflow-hidden animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-950 to-emerald-900 px-6 py-4 flex justify-between items-center text-white">
              <h3 className="font-serif font-bold text-lg">Student Profile Quick View</h3>
              <button 
                onClick={() => setViewingStudent(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-emerald-100 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              
              {/* Profile Header */}
              <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                {viewingStudent.profilePic ? (
                  <img 
                    src={viewingStudent.profilePic} 
                    alt={viewingStudent.name} 
                    className="w-16 h-16 rounded-full object-cover border border-slate-200 shadow-sm" 
                  />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-950 flex items-center justify-center font-bold text-xl font-serif border border-emerald-100 shadow-sm">
                    {viewingStudent.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="font-serif font-extrabold text-xl text-emerald-950 leading-tight">{viewingStudent.name}</h4>
                  <p className="text-slate-400 text-xs mt-1 font-semibold uppercase tracking-wider">
                    {viewingStudent.examType} Topper
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                  <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Score / Rank</p>
                  <p className="font-serif font-extrabold text-base text-emerald-950 mt-1">{viewingStudent.score}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                  <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Board / Exam</p>
                  <p className="font-semibold text-sm text-slate-700 mt-1">{viewingStudent.board}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                  <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Academic Year</p>
                  <p className="font-semibold text-sm text-slate-700 mt-1">{viewingStudent.year}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                  <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Roll Number</p>
                  <p className="font-mono text-xs text-slate-700 mt-1.5">{viewingStudent.rollNumber || 'Not Specified'}</p>
                </div>
              </div>

              {/* Detailed Specs */}
              <div className="space-y-3.5 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-655">
                <div className="flex justify-between items-center">
                  <span className="text-slate-450">Father's Name:</span>
                  <span className="font-bold text-slate-700">{viewingStudent.fathersName || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-450">School/Madrasa:</span>
                  <span className="font-bold text-slate-700 text-right max-w-[220px] truncate">{viewingStudent.schoolName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-450">Student Phone:</span>
                  <span className="font-mono font-bold text-slate-700">{viewingStudent.studentPhone || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-450">Parent's Phone:</span>
                  <span className="font-mono font-bold text-slate-700">{viewingStudent.parentsPhone || 'N/A'}</span>
                </div>
              </div>

              {/* Privacy Visibility Badges */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-150 space-y-2">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Public Visibility Settings</p>
                <div className="flex flex-wrap gap-2 pt-0.5">
                  <span className={`px-2 py-1 rounded text-[10px] font-semibold border ${
                    viewingStudent.visibility?.rollNumber 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                    Roll Number: {viewingStudent.visibility?.rollNumber ? 'Visible' : 'Hidden'}
                  </span>
                  <span className={`px-2 py-1 rounded text-[10px] font-semibold border ${
                    viewingStudent.visibility?.studentPhone 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                    Student Phone: {viewingStudent.visibility?.studentPhone ? 'Visible' : 'Hidden'}
                  </span>
                  <span className={`px-2 py-1 rounded text-[10px] font-semibold border ${
                    viewingStudent.visibility?.parentsPhone 
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                      : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                    Parent Phone: {viewingStudent.visibility?.parentsPhone ? 'Visible' : 'Hidden'}
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="bg-slate-50 px-6 py-4 flex justify-end">
              <button 
                onClick={() => setViewingStudent(null)}
                className="px-5 py-2.5 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default StudentsManager;
export { StudentsManager };
