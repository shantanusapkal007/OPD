import { Search } from 'lucide-react';
import { classNames } from '../../utils/helpers';

export default function SearchBar({ value, onChange, placeholder = 'Search by name or mobile...', className }) {
  return (
    <div className={classNames('relative', className)}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-10 pl-9 pr-4 text-sm bg-white border border-[#E5E7EB] rounded-lg text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all duration-150"
      />
    </div>
  );
}
