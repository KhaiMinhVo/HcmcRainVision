/**
 * Shared loading block for Admin pages (UI only).
 */
import { ADMIN_LOADING_TEXT } from './adminShared';

export default function AdminLoadingBlock() {
  return (
    <div className="flex items-center justify-center gap-3 py-12 text-gray-600" aria-busy="true">
      <svg className="w-6 h-6 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24" aria-hidden>
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <span>{ADMIN_LOADING_TEXT}</span>
    </div>
  );
}
