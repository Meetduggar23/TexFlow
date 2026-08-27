import { Outlet } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';

export default function DashboardLayout() {
  return (
    <div className="h-screen flex bg-dark-900">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
