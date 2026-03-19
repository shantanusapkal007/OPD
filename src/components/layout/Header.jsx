import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../common/Avatar';

export default function Header({ title, subtitle, onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-[#E5E7EB] shadow-[0_1px_2px_rgba(0,0,0,0.04)] flex items-center justify-between px-4 sm:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <button onClick={onMenuClick} className="md:hidden p-2 -ml-2 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
          <Menu size={20} />
        </button>
        <div>
          <h1 className="text-base sm:text-lg font-semibold text-[#111827] leading-tight">{title}</h1>
          {subtitle && <p className="text-xs text-[#6B7280] hidden sm:block mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Bell */}
        <button className="relative p-2 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#EF4444] rounded-full ring-2 ring-white" />
        </button>

        {/* User info (desktop) */}
        <div className="hidden sm:flex items-center gap-2.5 pl-3 ml-1 border-l border-[#E5E7EB]">
          <Avatar name={user?.displayName} src={user?.photoURL} size="sm" />
          <div className="hidden lg:block">
            <p className="text-[13px] font-medium text-[#111827] leading-tight">{user?.displayName}</p>
            <p className="text-[11px] text-[#6B7280] capitalize">{user?.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
