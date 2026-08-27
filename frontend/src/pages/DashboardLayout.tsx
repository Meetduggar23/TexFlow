import { Outlet } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';

export default function DashboardLayout() {
  return (
    <div className="h-screen flex" style={{ background: '#0a0c3d' }}>
      <DashboardSidebar />
      <main className="flex-1 overflow-auto" style={{ background: '#0a0c3d' }}>
        <Outlet />
      </main>
    </div>
  );
}
