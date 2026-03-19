import { classNames } from '../../utils/helpers';

export default function Card({ children, className, hover, onClick, padding = 'p-5' }) {
  return (
    <div
      className={classNames(
        'bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col',
        padding,
        hover && 'hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-[2px] transition-all duration-200 cursor-pointer',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, icon: Icon, className }) {
  return (
    <div className={classNames('flex items-center justify-between mb-5 gap-4', className)}>
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
            <Icon size={18} className="text-[#2563EB]" />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-base font-bold text-[#111827] leading-tight truncate">{title}</h3>
          {subtitle && <p className="text-xs text-[#6B7280] mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
