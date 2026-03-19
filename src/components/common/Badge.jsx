import { classNames } from '../../utils/helpers';

const colorMap = {
  primary: 'bg-[#EFF6FF] text-[#1D4ED8]',
  success: 'bg-[#ECFDF5] text-[#047857]',
  warning: 'bg-[#FFFBEB] text-[#B45309]',
  danger:  'bg-[#FEF2F2] text-[#B91C1C]',
  purple:  'bg-[#F5F3FF] text-[#6D28D9]',
  teal:    'bg-[#F0FDFA] text-[#0F766E]',
  gray:    'bg-[#F3F4F6] text-[#4B5563]',
};

export default function Badge({ children, color = 'primary', dot, className }) {
  return (
    <span className={classNames(
      'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold tracking-wide uppercase whitespace-nowrap',
      colorMap[color],
      className,
    )}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
