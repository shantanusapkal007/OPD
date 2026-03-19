import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { classNames } from '../../utils/helpers';

const widths = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-full mx-4',
};

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md', className }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#111827]/50 backdrop-blur-[2px] animate-fadeIn" onClick={onClose} />

      {/* Panel */}
      <div className={classNames(
        'relative w-full bg-white rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] animate-scaleIn flex flex-col max-h-[85vh]',
        widths[size],
        /* mobile: bottom‑sheet */
        'max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:rounded-b-none max-sm:rounded-t-2xl max-sm:max-h-[90vh]',
        className,
      )}>
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
            <h2 className="text-base font-semibold text-[#111827]">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 -mr-1.5 rounded-lg text-[#9CA3AF] hover:text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E5E7EB]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
