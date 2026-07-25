const BASE_URL = 'http://localhost:5000/api';

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

  toggleRegistration: async (allowPublicRegistration, token) => {
    const res = await fetch(`${BASE_URL}/admin/toggle-registration`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ allowPublicRegistration })
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
  }
};
