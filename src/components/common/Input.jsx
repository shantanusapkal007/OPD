import { forwardRef } from 'react';
import { classNames } from '../../utils/helpers';

const Input = forwardRef(({ label, error, helperText, icon: Icon, required, className, type = 'text', ...props }, ref) => {
  const baseRing = 'focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent';
  const borderColor = error ? 'border-[#EF4444]' : 'border-[#E5E7EB] hover:border-[#D1D5DB]';

  return (
    <div className={classNames('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <label className="text-[13px] font-medium text-[#374151]">
          {label}
          {required && <span className="text-[#EF4444] ml-0.5">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 text-[#9CA3AF] pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        {type === 'textarea' ? (
          <textarea
            ref={ref}
            className={classNames(
              'w-full min-h-[80px] px-3 py-2.5 text-sm text-[#111827] bg-white border rounded-[10px] transition-all duration-200 resize-vertical shadow-sm',
              'placeholder:text-[#9CA3AF]', baseRing, borderColor,
            )}
            {...props}
          />
        ) : type === 'select' ? (
          <select
            ref={ref}
            className={classNames(
              'w-full h-10 px-3 text-sm text-[#111827] bg-white border rounded-[10px] transition-all duration-200 appearance-none shadow-sm truncate pr-8',
              baseRing, borderColor,
              'bg-[url("data:image/svg+xml,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%2716%27%20height%3D%2716%27%20viewBox%3D%270%200%2024%2024%27%20fill%3D%27none%27%20stroke%3D%27%239CA3AF%27%20stroke-width%3D%272%27%3E%3Cpath%20d%3D%27m6%209%206%206%206-6%27/%3E%3C/svg%3E")] bg-no-repeat bg-[position:right_12px_center]',
            )}
            {...props}
          >
            {props.children}
          </select>
        ) : (
          <input
            ref={ref}
            type={type}
            className={classNames(
              'w-full h-10 text-sm text-[#111827] bg-white border rounded-[10px] transition-all duration-200 shadow-sm',
              'placeholder:text-[#9CA3AF]', baseRing, borderColor,
              Icon ? 'pl-9 pr-3' : 'px-3',
            )}
            {...props}
          />
        )}
      </div>
      {(error || helperText) && (
        <p className={classNames('text-xs mt-0.5', error ? 'text-[#EF4444]' : 'text-[#6B7280]')}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
