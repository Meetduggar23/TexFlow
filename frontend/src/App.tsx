import { useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoadingScreen from './components/LoadingScreen';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './pages/DashboardLayout';
import AllProjects from './pages/AllProjects';
import TemplateBrowser from './pages/TemplateBrowser';
import TrashPage from './pages/TrashPage';
import Settings from './pages/Settings';
import Editor from './pages/Editor';

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
            background: '#0a0c3d',
            color: '#f1f5f9',
            border: '1px solid #3C0753',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
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
        <Route path="/project/:projectId" element={<Editor />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
