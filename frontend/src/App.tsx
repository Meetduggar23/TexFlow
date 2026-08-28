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
import HelpPage from './pages/HelpPage';
import DocumentationPage from './pages/DocumentationPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import BlogArticlePage from './pages/BlogArticlePage';
import LibraryPage from './pages/LibraryPage';
import NotificationsPage from './pages/NotificationsPage';
import ActivityPage from './pages/ActivityPage';
import SavedViewsPage from './pages/SavedViewsPage';
import TeamPage from './pages/TeamPage';
import FoldersPage from './pages/FoldersPage';
import CommentsPage from './pages/CommentsPage';

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

        {/* Dashboard routes (with sidebar) */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<AllProjects />} />
          <Route path="projects" element={<AllProjects />} />
          <Route path="my" element={<AllProjects />} />
          <Route path="recent" element={<AllProjects />} />
          <Route path="starred" element={<AllProjects />} />
          <Route path="shared" element={<AllProjects />} />
          <Route path="archived" element={<AllProjects />} />
          <Route path="tag/:tagName" element={<AllProjects />} />
          <Route path="trash" element={<TrashPage />} />
        </Route>

        {/* Organize routes */}
        <Route path="/folders" element={<DashboardLayout />}><Route index element={<FoldersPage />} /></Route>
        <Route path="/saved-views" element={<DashboardLayout />}><Route index element={<SavedViewsPage />} /></Route>

        {/* Workspace routes */}
        <Route path="/team" element={<DashboardLayout />}><Route index element={<TeamPage />} /></Route>
        <Route path="/comments" element={<DashboardLayout />}><Route index element={<CommentsPage />} /></Route>
        <Route path="/notifications" element={<DashboardLayout />}><Route index element={<NotificationsPage />} /></Route>
        <Route path="/activity" element={<DashboardLayout />}><Route index element={<ActivityPage />} /></Route>

        {/* Resources routes */}
        <Route path="/templates" element={<DashboardLayout />}><Route index element={<TemplateBrowser />} /></Route>
        <Route path="/documentation" element={<DashboardLayout />}><Route index element={<DocumentationPage />} /></Route>
        <Route path="/library" element={<DashboardLayout />}><Route index element={<LibraryPage />} /></Route>

        {/* System routes */}
        <Route path="/settings" element={<DashboardLayout />}><Route index element={<Settings />} /></Route>
        <Route path="/help" element={<DashboardLayout />}><Route index element={<HelpPage />} /></Route>
        <Route path="/contact" element={<DashboardLayout />}><Route index element={<ContactPage />} /></Route>

        {/* Blog */}
        <Route path="/blog" element={<DashboardLayout />}><Route index element={<BlogPage />} /></Route>
        <Route path="/blog/:slug" element={<DashboardLayout />}><Route index element={<BlogArticlePage />} /></Route>

        {/* Editor */}
        <Route path="/project/:projectId" element={<RequireAuth><Editor /></RequireAuth>} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
