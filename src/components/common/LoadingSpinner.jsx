export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`${sizeClasses[size]} border-[3px] border-[#E5E7EB] border-t-[#2563EB] rounded-full animate-spin`} />
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-10 h-10 border-[3px] border-[#E5E7EB] border-t-[#2563EB] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-[#6B7280]">Loading...</p>
      </div>
    </div>
  );
}
