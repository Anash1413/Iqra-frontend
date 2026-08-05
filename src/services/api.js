let base = import.meta.env.VITE_API_URL || 'https://iqra-backend-o4g7.onrender.com'; 
// let base =  'http://localhost:5000'; only for localhost
if (base && !base.endsWith('/api') && !base.endsWith('/api/')) {
  base = base.replace(/\/$/, '') + '/api';
}
const BASE_URL = base;

const buildQueryString = (params) => {
  if (!params) return '';
  const parts = [];
  for (const key in params) {
    if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    }
  }
  return parts.length > 0 ? `?${parts.join('&')}` : '';
};

export const api = {
  // CMS Content
  fetchContent: async (page) => {
    const res = await fetch(`${BASE_URL}/content/${page}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Failed to fetch ${page} content`);
    return data.data;
  },

  updateContent: async (page, content, token) => {
    const res = await fetch(`${BASE_URL}/content/${page}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(content)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || `Failed to update ${page} content`);
    return data.data;
  },

  uploadMedia: async (file, token) => {
    const formData = new FormData();
    formData.append('media', file);
    const res = await fetch(`${BASE_URL}/content/upload-media`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Media upload failed');
    return data.url;
  },

  // Auth
  login: async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data.data;
  },

  register: async (name, email, password) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    return data.data;
  },

  getMe: async (token) => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Session expired');
    return data.data;
  },

  // Students Merit List
  fetchStudents: async (filters) => {
    const queryString = buildQueryString(filters);
    const res = await fetch(`${BASE_URL}/students${queryString}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch students');
    return data;
  },

  fetchStudentsAdmin: async (token, filters) => {
    const queryString = buildQueryString(filters);
    const res = await fetch(`${BASE_URL}/students/admin/list${queryString}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch admin students list');
    return data.data;
  },

  fetchStudentById: async (id, token = null) => {
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}/students/${id}`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch student info');
    return data.data;
  },

  createStudent: async (formData, token) => {
    const res = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create student');
    return data.data;
  },

  updateStudent: async (id, formData, token) => {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update student');
    return data.data;
  },

  deleteStudent: async (id, token) => {
    const res = await fetch(`${BASE_URL}/students/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete student');
    return data;
  },

  // Admin Controls
  addAdmin: async (adminData, token) => {
    const res = await fetch(`${BASE_URL}/admin/add-admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(adminData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to add admin');
    return data.data;
  },

  listAdmins: async (token) => {
    const res = await fetch(`${BASE_URL}/admin/list-admins`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to list admins');
    return data.data;
  },

  deleteAdmin: async (id, token) => {
    const res = await fetch(`${BASE_URL}/admin/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete admin');
    return data;
  },

  toggleRegistration: async (settingsData, token) => {
    const res = await fetch(`${BASE_URL}/admin/toggle-registration`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(settingsData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update settings');
    return data.data;
  },

  getRegistrationStatus: async () => {
    const res = await fetch(`${BASE_URL}/admin/registration-status`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to get signup settings');
    return data.data;
  },

  // Certificates API bindings
  fetchTemplates: async (token) => {
    const res = await fetch(`${BASE_URL}/certificates/templates`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch templates');
    return data.data;
  },

  createTemplate: async (templateData, token) => {
    const res = await fetch(`${BASE_URL}/certificates/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(templateData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create template');
    return data.data;
  },

  updateTemplate: async (id, templateData, token) => {
    const res = await fetch(`${BASE_URL}/certificates/templates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(templateData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update template');
    return data.data;
  },

  deleteTemplate: async (id, token) => {
    const res = await fetch(`${BASE_URL}/certificates/templates/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete template');
    return data;
  },

  fetchNextCertificateNo: async (year, token) => {
    const res = await fetch(`${BASE_URL}/certificates/next-number?year=${year || ''}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch next certificate number');
    return data.nextCertificateNo;
  },

  recordCertificate: async (certData, token) => {
    const res = await fetch(`${BASE_URL}/certificates/history`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(certData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to record certificate');
    return data.data;
  },

  fetchCertificateHistory: async (filters, token) => {
    const queryString = buildQueryString(filters);
    const res = await fetch(`${BASE_URL}/certificates/history${queryString}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch certificate history');
    return data.data;
  },

  deleteCertificateHistory: async (id, token) => {
    const res = await fetch(`${BASE_URL}/certificates/history/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete history log');
    return data;
  },

  fetchCertificateStats: async (token) => {
    const res = await fetch(`${BASE_URL}/certificates/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch certificate stats');
    return data.data;
  },

  verifyCertificatePublic: async (identifier) => {
    const res = await fetch(`${BASE_URL}/certificates/verify/${identifier}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to verify certificate');
    return data.data;
  },

  // Student Nomination Application APIs
  submitStudentApplication: async (formData, token) => {
    const res = await fetch(`${BASE_URL}/students/application`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData // Form data object for handling image uploads
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to submit application');
    return data;
  },

  fetchStudentApplicationMe: async (token) => {
    const res = await fetch(`${BASE_URL}/students/application/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch student application');
    return data.data;
  },

  listStudentApplicationsAdmin: async (token) => {
    const res = await fetch(`${BASE_URL}/students/application/admin/list`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to list applications');
    return data.data;
  },

  reviewStudentApplicationAdmin: async (id, reviewData, token) => {
    const res = await fetch(`${BASE_URL}/students/application/admin/review/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to review application');
    return data;
  }
};
