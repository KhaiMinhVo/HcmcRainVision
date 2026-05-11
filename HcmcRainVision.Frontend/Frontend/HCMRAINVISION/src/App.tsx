/**
 * App – Router and global providers
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { FavoritesProvider } from './contexts/FavoritesContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import AdminGuard from './components/AdminGuard';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminAudit from './pages/Admin/AdminAudit';
import AdminCameras from './pages/Admin/AdminCameras';
import AdminIngestion from './pages/Admin/AdminIngestion';
import AdminTestAi from './pages/Admin/AdminTestAi';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import ChatbotWidget from './components/ChatbotWidget';

/** Base path for router (phải khớp với Vite base để route đúng khi deploy GitHub Pages). */
const routerBasename = import.meta.env.BASE_URL === '/' ? '' : import.meta.env.BASE_URL.replace(/\/$/, '');

function App() {
  return (
    <BrowserRouter basename={routerBasename}>
      <AuthProvider>
        <FavoritesProvider>
          <NotificationsProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/profile" element={<Profile />} />
              <Route
                path="/admin"
                element={
                  <AdminGuard>
                    <AdminLayout />
                  </AdminGuard>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="audit" element={<AdminAudit />} />
                <Route path="cameras" element={<AdminCameras />} />
                <Route path="ingestion" element={<AdminIngestion />} />
                <Route path="test-ai" element={<AdminTestAi />} />
              </Route>
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </NotificationsProvider>
        </FavoritesProvider>
      </AuthProvider>
      <Toaster
        position="top-center"
        gutter={12}
        toastOptions={{
          duration: 4000,
          className: 'animate-fade-in !rounded-xl !border !border-gray-200 !bg-white !text-gray-900 !shadow-lg',
          style: { maxWidth: 'min(100vw - 2rem, 24rem)' },
          success: {
            iconTheme: { primary: '#059669', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#dc2626', secondary: '#fff' },
          },
        }}
      />
      <ChatbotWidget />
    </BrowserRouter>
  );
}

export default App;
