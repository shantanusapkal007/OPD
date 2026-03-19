import { NavLink, useLocation } from 'react-router-dom';
import { LogOut, ChevronLeft, ChevronRight, Activity } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';
import { NAV_ITEMS } from '../../utils/constants';
import { classNames } from '../../utils/helpers';

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const filteredNav = NAV_ITEMS.filter(item => user && item.roles.includes(user.role));

  return (
    <aside className={classNames(
      'hidden md:flex flex-col h-screen bg-white border-r border-[#E5E7EB] transition-all duration-300 relative z-30 shrink-0',
      collapsed ? 'w-16' : 'w-64',
    )}>
      {/* ── Logo ── */}
      <div className={classNames(
        'flex items-center h-16 border-b border-[#E5E7EB] shrink-0',
        collapsed ? 'justify-center px-2' : 'gap-3 px-5',
      )}>
        <div className="w-8 h-8 rounded-lg bg-[#2563EB] flex items-center justify-center shrink-0">
          <Activity size={18} className="text-white" />
        </div>
        {!collapsed && <span className="text-[15px] font-bold text-[#111827] tracking-tight">ClinicFlow</span>}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-3 px-3 space-y-0.5 overflow-y-auto">
        {filteredNav.map((item) => {
          const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <NavLink
              key={item.id}
              to={item.disabled ? '#' : item.path}
              className={classNames(
                'flex items-center gap-3 h-10 px-3 rounded-lg text-[13px] font-medium transition-all duration-150 relative group',
                item.disabled && 'opacity-40 cursor-not-allowed pointer-events-none',
                isActive
                  ? 'bg-[#EFF6FF] text-[#2563EB]'
                  : 'text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#111827]',
                collapsed && 'justify-center px-0',
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span>{item.label}</span>}
              {item.disabled && !collapsed && (
                <span className="ml-auto text-[10px] bg-[#F3F4F6] text-[#9CA3AF] px-1.5 py-0.5 rounded font-medium">Soon</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ── Collapse toggle ── */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mx-3 mb-2 h-8 rounded-lg text-[#9CA3AF] hover:bg-[#F3F4F6] hover:text-[#6B7280] transition-colors flex items-center justify-center"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* ── User ── */}
      <div className={classNames('border-t border-[#E5E7EB] p-3', collapsed && 'flex flex-col items-center gap-2')}>
        <div className={classNames('flex items-center gap-3', collapsed && 'flex-col')}>
          <Avatar name={user?.displayName} src={user?.photoURL} size="sm" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#111827] truncate">{user?.displayName}</p>
              <p className="text-[11px] text-[#6B7280] capitalize">{user?.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={signOut}
          className={classNames(
            'flex items-center gap-2 text-[13px] text-[#6B7280] hover:text-[#EF4444] transition-colors mt-2',
            collapsed ? 'justify-center w-full' : 'px-0.5',
          )}
        >
          <LogOut size={15} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
