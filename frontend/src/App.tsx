import { useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoadingScreen from './components/LoadingScreen';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardLayout from './pages/DashboardLayout';
import AllProjects from './pages/AllProjects';
import TemplateBrowser from './pages/TemplateBrowser';
import TrashPage from './pages/TrashPage';
import Settings from './pages/Settings';
import Editor from './pages/Editor';
import RequireAuth from './components/RequireAuth';

export default function App() {
  const [loading, setLoading] = useState(true);

  const handleLoadingComplete = useCallback(() => {
    setLoading(false);
  }, []);

  if (loading) {
    return <LoadingScreen onComplete={handleLoadingComplete} />;
  }

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--color-background)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border)',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/templates" element={<TemplateBrowser />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<AllProjects />} />
          <Route path="projects" element={<AllProjects />} />
          <Route path="recent" element={<AllProjects />} />
          <Route path="shared" element={<AllProjects />} />
          <Route path="trash" element={<TrashPage />} />
        </Route>
        <Route path="/project/:projectId" element={<RequireAuth><Editor /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
