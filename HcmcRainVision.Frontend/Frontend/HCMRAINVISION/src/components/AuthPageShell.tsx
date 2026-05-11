import type { ReactNode } from 'react';
import { CloudRain } from 'lucide-react';

interface AuthPageShellProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Links/actions below the card */
  footer?: ReactNode;
}

export default function AuthPageShell({ title, subtitle, children, footer }: AuthPageShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-10 [background-image:radial-gradient(circle_at_1px_1px,rgb(148_163_184_/_0.12)_1px,transparent_0)] [background-size:20px_20px]">
      <div className="w-full max-w-md animate-fade-in">
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-gray-200/60">
          <div className="bg-gradient-to-r from-sky-500 to-blue-600 px-6 py-8 text-center text-white">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 shadow-inner backdrop-blur-sm">
              <CloudRain className="h-8 w-8 text-white" strokeWidth={1.75} aria-hidden />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-sm text-sky-100/95">{subtitle}</p>
            )}
          </div>
          <div className="p-8">{children}</div>
        </div>
        {footer}
      </div>
    </div>
  );
}
