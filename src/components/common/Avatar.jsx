import { getInitials, classNames } from '../../utils/helpers';

const sizes = {
  sm: 'w-8 h-8 text-[11px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-14 h-14 text-base',
  xl: 'w-[72px] h-[72px] text-xl',
};

export default function Avatar({ name, src, size = 'md', className }) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={classNames('rounded-full object-cover ring-2 ring-white', sizes[size], className)}
      />
    );
  }
  return (
    <div className={classNames(
      'rounded-full bg-[#EFF6FF] text-[#2563EB] font-semibold flex items-center justify-center shrink-0',
      sizes[size], className,
    )}>
      {getInitials(name)}
    </div>
  );
}
