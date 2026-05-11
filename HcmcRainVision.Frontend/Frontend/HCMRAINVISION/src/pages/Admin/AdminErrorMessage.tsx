/**
 * Shared error display for Admin pages.
 */
interface AdminErrorMessageProps {
  message: string;
}

export default function AdminErrorMessage({ message }: AdminErrorMessageProps) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl shadow-sm flex items-start gap-3" role="alert">
      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span>{message}</span>
    </div>
  );
}
