import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import BottomNav from './BottomNav';

const pageTitles = {
  '/':             { title: 'Dashboard',    subtitle: "Overview of your clinic's daily activity" },
  '/patients':     { title: 'Patients',     subtitle: 'Manage all patient records and histories' },
  '/appointments': { title: 'Appointments', subtitle: 'Schedule and manage patient visits' },
  '/visits':       { title: 'Visits',       subtitle: 'Record diagnoses, vitals, and treatments' },
  '/payments':     { title: 'Payments',     subtitle: 'Track revenue, receipts, and transactions' },
  '/settings':     { title: 'Settings',     subtitle: 'Configure your clinic profile and preferences' },
};

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const getPageInfo = () => {
    if (pageTitles[location.pathname]) return pageTitles[location.pathname];
    const parentPath = '/' + location.pathname.split('/')[1];
    return pageTitles[parentPath] || { title: 'ClinicFlow', subtitle: '' };
  };

  const { title, subtitle } = getPageInfo();

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col md:flex-row overflow-hidden">
      <Sidebar />

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-[#111827]/40 backdrop-blur-sm" />
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto overflow-x-hidden">
        <Header title={title} subtitle={subtitle} onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />
        
        {/* Content wrapper with max-width for ultra-wide monitors */}
        <div className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 flex flex-col min-w-0">
          <Outlet />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
