import { useNavigate } from 'react-router-dom';
import { Home, Activity } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-16 h-16 rounded-xl bg-[#F3F4F6] flex items-center justify-center mb-5">
        <Activity size={28} className="text-[#9CA3AF]" />
      </div>
      <h1 className="text-3xl font-bold text-[#111827] mb-2">404</h1>
      <p className="text-sm text-[#6B7280] mb-6 max-w-sm">The page you're looking for doesn't exist or has been moved.</p>
      <Button icon={Home} onClick={() => navigate('/')}>Back to Dashboard</Button>
    </div>
  );
}
