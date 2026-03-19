import { classNames } from '../../utils/helpers';

const variants = {
  primary:   'bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:bg-[#1E40AF] shadow-sm hover:shadow',
  secondary: 'bg-white text-[#374151] border border-[#E5E7EB] hover:bg-[#F9FAFB] active:bg-[#F3F4F6] shadow-sm hover:shadow',
  danger:    'bg-[#EF4444] text-white hover:bg-[#DC2626] active:bg-[#B91C1C] shadow-sm hover:shadow',
  ghost:     'bg-transparent text-[#6B7280] hover:bg-[#F3F4F6] active:bg-[#E5E7EB]',
  success:   'bg-[#10B981] text-white hover:bg-[#059669] shadow-sm hover:shadow',
  whatsapp:  'bg-[#25D366] text-white hover:brightness-95 shadow-sm hover:shadow',
};

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-[10px]',
  md: 'h-10 px-4 text-sm gap-2 rounded-[10px]',
  lg: 'h-12 px-6 text-sm gap-2 rounded-[10px]',
};

export default function Button({
  children, variant = 'primary', size = 'md',
  icon: Icon, iconRight, className,
  disabled, loading, fullWidth, ...props
}) {
  return (
    <button
      className={classNames(
        'inline-flex items-center justify-center font-medium transition-all duration-200 select-none whitespace-nowrap',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none shadow-none',
        loading  && 'opacity-70 cursor-wait',
        fullWidth && 'w-full',
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : Icon ? <Icon size={size === 'sm' ? 14 : 18} className="shrink-0" /> : null}
      <span className="truncate">{children}</span>
      {iconRight && !loading && <span className="ml-auto shrink-0">{iconRight}</span>}
    </button>
  );
}
