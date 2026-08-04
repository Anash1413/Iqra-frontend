import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import MeritList from './pages/MeritList';
import Login from './pages/Login';

import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import StudentsManager from './pages/admin/StudentsManager';
import AdminsManager from './pages/admin/AdminsManager';

// Certificates Module subpages
import CertificatesDashboard from './pages/admin/certificates/Dashboard';
import SingleGenerate from './pages/admin/certificates/SingleGenerate';
import BulkGenerate from './pages/admin/certificates/BulkGenerate';
import TemplateEditor from './pages/admin/certificates/TemplateEditor';
import CertificatesHistory from './pages/admin/certificates/History';
import VerifyCertificate from './pages/VerifyCertificate';

import StudentProfile from './pages/StudentProfile';
import NominationFormsManager from './pages/admin/NominationFormsManager';

// Public Layout wrapper to show Navbar and Footer
const PublicLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Website Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/merit-list" element={<MeritList />} />
            <Route path="/verify" element={<VerifyCertificate />} />
            <Route path="/verify/:certificateNo" element={<VerifyCertificate />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <StudentProfile />
                </ProtectedRoute>
              } 
            />
          </Route>

          {/* Admin Authentication Screen */}
          <Route path="/login" element={<Login />} />

          {/* Admin Protected Console Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="students" element={<StudentsManager />} />
            <Route path="certificates" element={<CertificatesDashboard />} />
            <Route path="certificates/single" element={<SingleGenerate />} />
            <Route path="certificates/bulk" element={<BulkGenerate />} />
            <Route path="certificates/templates" element={<TemplateEditor />} />
            <Route path="certificates/history" element={<CertificatesHistory />} />
            <Route path="nominations" element={<NominationFormsManager />} />
            <Route 
              path="admins" 
              element={
                <ProtectedRoute requireSuperAdmin={true}>
                  <AdminsManager />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
export { App };
