import { FileQuestion } from 'lucide-react';
import Button from './Button';

export default function EmptyState({ icon: Icon = FileQuestion, title, description, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fadeIn">
      <div className="w-14 h-14 rounded-xl bg-[#F3F4F6] flex items-center justify-center mb-4">
        <Icon size={24} className="text-[#9CA3AF]" />
      </div>
      <h3 className="text-base font-semibold text-[#111827] mb-1">{title}</h3>
      {description && <p className="text-sm text-[#6B7280] max-w-sm mb-6">{description}</p>}
      {action && actionLabel && <Button onClick={action}>{actionLabel}</Button>}
    </div>
  );
}
