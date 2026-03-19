import { NavLink, useLocation } from 'react-router-dom';
import { Home, Users, Calendar, Stethoscope, MoreHorizontal, CreditCard, Settings, LogOut, BarChart3 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { classNames } from '../../utils/helpers';

const mainItems = [
  { id: 'home', label: 'Home', icon: Home, path: '/' },
  { id: 'patients', label: 'Patients', icon: Users, path: '/patients' },
  { id: 'appointments', label: 'Appts', icon: Calendar, path: '/appointments' },
  { id: 'visits', label: 'Visits', icon: Stethoscope, path: '/visits' },
];

const moreItems = [
  { id: 'payments', label: 'Payments', icon: CreditCard, path: '/payments' },
  { id: 'reports', label: 'Reports', icon: BarChart3, path: '/reports', disabled: true },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/settings', adminOnly: true },
];

export default function BottomNav() {
  const [showMore, setShowMore] = useState(false);
  const { signOut, isAdmin } = useAuth();
  const location = useLocation();

  return (
    <>
      {/* ── More‑menu overlay ── */}
      {showMore && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-[#111827]/30" />
          <div className="absolute bottom-[64px] right-3 left-3 bg-white rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-[#E5E7EB] p-1.5 animate-slideUp">
            {moreItems.filter(item => !item.adminOnly || isAdmin).map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.id}
                  to={item.disabled ? '#' : item.path}
                  onClick={() => setShowMore(false)}
                  className={classNames(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    item.disabled && 'opacity-40 pointer-events-none',
                    location.pathname === item.path ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#374151] hover:bg-[#F9FAFB]',
                  )}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                  {item.disabled && <span className="ml-auto text-[10px] bg-[#F3F4F6] px-1.5 py-0.5 rounded font-medium text-[#9CA3AF]">Soon</span>}
                </NavLink>
              );
            })}
            <div className="border-t border-[#E5E7EB] mt-1 pt-1">
              <button
                onClick={() => { setShowMore(false); signOut(); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#EF4444] hover:bg-[#FEF2F2] w-full transition-colors"
              >
                <LogOut size={18} /><span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Bottom bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-[#E5E7EB] shadow-[0_-1px_3px_rgba(0,0,0,0.04)] pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-14">
          {mainItems.map(item => {
            const Icon = item.icon;
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={classNames(
                  'flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors min-w-[52px]',
                  isActive ? 'text-[#2563EB]' : 'text-[#9CA3AF]',
                )}
              >
                <Icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </NavLink>
            );
          })}
          <button
            onClick={() => setShowMore(!showMore)}
            className={classNames(
              'flex flex-col items-center gap-0.5 py-1 px-3 rounded-lg transition-colors min-w-[52px]',
              showMore ? 'text-[#2563EB]' : 'text-[#9CA3AF]',
            )}
          >
            <MoreHorizontal size={20} /><span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>
    </>
  );
}
