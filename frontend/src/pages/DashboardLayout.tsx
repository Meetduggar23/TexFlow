import { Outlet } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';

export default function DashboardLayout() {
  return (
    <div className="h-screen flex" style={{ background: 'var(--color-background)' }}>
      <DashboardSidebar />
      <main className="flex-1 overflow-auto" style={{ background: 'var(--color-background)' }}>
        <Outlet />
      </main>
    </div>
  );
}
