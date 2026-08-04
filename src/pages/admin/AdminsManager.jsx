import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import { ToggleLeft, ToggleRight, Plus, Trash2, KeyRound, Mail, User, ShieldAlert } from 'lucide-react';

const AdminsManager = () => {
  const { token, user: currentUser } = useAuth();
  
  const [admins, setAdmins] = useState([]);
  const [allowPublicReg, setAllowPublicReg] = useState(false);
  const [allowStudentForm, setAllowStudentForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Add Admin form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin'
  });

  useEffect(() => {
    loadAdminsData();
  }, []);

  const loadAdminsData = async () => {
    setLoading(true);
    try {
      const adminList = await api.listAdmins(token);
      setAdmins(adminList);

      const status = await api.getRegistrationStatus();
      setAllowPublicReg(status.allowPublicRegistration);
      setAllowStudentForm(status.allowStudentForm);
    } catch (err) {
      toast.error('Failed to load administrative settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleToggleReg = async () => {
    const nextVal = !allowPublicReg;
    const toastId = toast.loading(nextVal ? 'Enabling public signups...' : 'Disabling public signups...');
    try {
      await api.toggleRegistration({ allowPublicRegistration: nextVal }, token);
      setAllowPublicReg(nextVal);
      toast.success(nextVal ? 'Public registration enabled successfully!' : 'Public registration disabled successfully!', { id: toastId });
    } catch (err) {
      toast.error(err.message || 'Failed to update toggle setting.', { id: toastId });
    }
  };

  const handleToggleStudentForm = async () => {
    const nextVal = !allowStudentForm;
    const toastId = toast.loading(nextVal ? 'Enabling student form...' : 'Disabling student form...');
    try {
      await api.toggleRegistration({ allowStudentForm: nextVal }, token);
      setAllowStudentForm(nextVal);
      toast.success(nextVal ? 'Student form enabled successfully!' : 'Student form disabled successfully!', { id: toastId });
    } catch (err) {
      toast.error(err.message || 'Failed to update toggle setting.', { id: toastId });
    }
  };

  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error('All fields are required.');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Creating administrative account...');
    try {
      await api.addAdmin(formData, token);
      toast.success('Admin account created successfully!', { id: toastId });
      setFormData({ name: '', email: '', password: '', role: 'admin' });
      loadAdminsData();
    } catch (err) {
      toast.error(err.message || 'Failed to create account.', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAdmin = (id, email) => {
    if (email === currentUser.email) {
      toast.error("You cannot delete your own administrative session.");
      return;
    }

    Swal.fire({
      title: 'Remove Admin Access?',
      text: `This will permanently delete the admin account for ${email}. They will lose all backend access immediately.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#cbd5e1',
      confirmButtonText: 'Yes, remove admin',
      cancelButtonText: 'Cancel'
    }).then(async (result) => {
      if (result.isConfirmed) {
        const toastId = toast.loading('Deleting account...');
        try {
          await api.deleteAdmin(id, token);
          toast.success('Admin deleted successfully!', { id: toastId });
          loadAdminsData();
        } catch (err) {
          toast.error(err.message || 'Failed to delete admin.', { id: toastId });
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center bg-transparent">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-950 border-t-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Title */}
      <div className="border-b border-slate-200/80 pb-4">
        <h1 className="font-serif font-bold text-2xl text-emerald-950">System Logins & Controls</h1>
        <p className="text-slate-400 text-xs mt-0.5">Manage administrative credentials and toggle registration permissions.</p>
      </div>

      {/* Toggle Public Registration Control Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
        <div className="space-y-1 max-w-lg">
          <h3 className="font-serif font-bold text-base text-emerald-955 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            Public Registration Portal Switch
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            When enabled, visitors can self-register accounts on the login/signup screen. Turn this option off to lock log-ins to invite-only.
          </p>
        </div>
        <button 
          onClick={handleToggleReg}
          className="flex items-center gap-1.5 focus:outline-none"
        >
          {allowPublicReg ? (
            <ToggleRight className="w-14 h-10 text-emerald-800 cursor-pointer" />
          ) : (
            <ToggleLeft className="w-14 h-10 text-slate-300 cursor-pointer" />
          )}
        </button>
      </div>

      {/* Toggle Student Nomination Form Control Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow">
        <div className="space-y-1 max-w-lg">
          <h3 className="font-serif font-bold text-base text-emerald-955 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            Student Nomination Form Switch
          </h3>
          <p className="text-slate-500 text-xs leading-relaxed">
            When enabled, the public Student Nomination Form button will be displayed on the homepage, allowing logged-in students to submit their marks and profiles.
          </p>
        </div>
        <button 
          onClick={handleToggleStudentForm}
          className="flex items-center gap-1.5 focus:outline-none"
        >
          {allowStudentForm ? (
            <ToggleRight className="w-14 h-10 text-emerald-800 cursor-pointer" />
          ) : (
            <ToggleLeft className="w-14 h-10 text-slate-300 cursor-pointer" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Add Admin form */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-150 shadow-sm h-fit">
          <h3 className="font-serif font-bold text-base text-emerald-950 mb-4 border-b border-slate-100 pb-2">Create Administrative Account</h3>
          
          <form onSubmit={handleAddAdminSubmit} className="space-y-4">
            <div className="form-group">
              <label className="form-label text-[10px] uppercase tracking-wider" htmlFor="adminName">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <User className="w-4 h-4" />
                </span>
                <input 
                  type="text" 
                  id="adminName"
                  name="name"
                  value={formData.name} 
                  onChange={handleInputChange}
                  className="form-control pl-9 text-xs" 
                  placeholder="Abdullah" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label text-[10px] uppercase tracking-wider" htmlFor="adminEmail">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <Mail className="w-4 h-4" />
                </span>
                <input 
                  type="email" 
                  id="adminEmail"
                  name="email"
                  value={formData.email} 
                  onChange={handleInputChange}
                  className="form-control pl-9 text-xs" 
                  placeholder="name@email.com" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label text-[10px] uppercase tracking-wider" htmlFor="adminPass">Login Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input 
                  type="password" 
                  id="adminPass"
                  name="password"
                  value={formData.password} 
                  onChange={handleInputChange}
                  className="form-control pl-9 text-xs" 
                  placeholder="••••••••" 
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label text-[10px] uppercase tracking-wider" htmlFor="adminRole">Console Role Access</label>
              <select 
                id="adminRole"
                name="role"
                value={formData.role} 
                onChange={handleInputChange}
                className="form-control text-xs py-2 bg-white"
              >
                <option value="admin">Normal Admin (Wording Updates)</option>
                <option value="superadmin">Super Admin (Add Admins/Toggles)</option>
              </select>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full py-2.5 bg-emerald-950 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Create Account
            </button>
          </form>
        </div>

        {/* Right: Admins List */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-150 shadow-sm">
          <h3 className="font-serif font-bold text-base text-emerald-950 mb-4 border-b border-slate-100 pb-2">Administrative Directory</h3>

          <div className="divide-y divide-slate-100">
            {admins.map((admin) => (
              <div key={admin._id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-950 border border-slate-200 flex items-center justify-center font-bold text-sm uppercase font-serif">
                    {admin.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-950 leading-tight">{admin.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{admin.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                    admin.role === 'superadmin' 
                      ? 'bg-amber-50 border-amber-200 text-amber-800' 
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}>
                    {admin.role}
                  </span>
                  
                  <button 
                    onClick={() => handleDeleteAdmin(admin._id, admin.email)}
                    disabled={admin.email === currentUser.email}
                    className={`p-1.5 rounded border transition-colors ${
                      admin.email === currentUser.email 
                        ? 'bg-slate-50 border-slate-100 text-slate-305 cursor-not-allowed'
                        : 'bg-slate-50 border-slate-200 hover:bg-red-50 text-slate-500 hover:text-red-650'
                    }`}
                    title={admin.email === currentUser.email ? "Self-deletion locked" : "Revoke Access"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminsManager;
export { AdminsManager };
