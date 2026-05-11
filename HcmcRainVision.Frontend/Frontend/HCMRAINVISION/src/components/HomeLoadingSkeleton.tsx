import { CloudRain } from 'lucide-react';

/**
 * Full-page loading placeholder for Home (map + sidebar) while cameras load.
 */
export default function HomeLoadingSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 [background-image:radial-gradient(circle_at_1px_1px,rgb(148_163_184_/_0.1)_1px,transparent_0)] [background-size:20px_20px]">
      <header className="border-b border-gray-200 bg-white/90 shadow-sm backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex h-10 w-10 animate-pulse rounded-xl bg-gradient-to-br from-sky-200 to-blue-200" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-6 max-w-xs animate-pulse rounded-lg bg-gray-200 sm:h-7" />
            <div className="h-3 max-w-md animate-pulse rounded bg-gray-100" />
          </div>
          <div className="hidden gap-2 lg:flex">
            <div className="h-16 w-24 animate-pulse rounded-xl bg-gray-100" />
            <div className="h-16 w-24 animate-pulse rounded-xl bg-red-50" />
          </div>
        </div>
        <div className="border-t border-gray-100 px-4 pb-4 pt-2 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="h-10 flex-1 animate-pulse rounded-lg bg-gray-100" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100 sm:w-48" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100 sm:w-40" />
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="hidden w-80 flex-col border-r border-gray-200 bg-white sm:flex lg:w-96">
          <div className="border-b border-gray-100 p-4">
            <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="flex-1 space-y-3 p-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse rounded-lg border border-gray-100 p-3">
                <div className="mb-2 h-4 w-[85%] rounded bg-gray-200" />
                <div className="h-3 w-full rounded bg-gray-100" />
              </div>
            ))}
          </div>
        </div>
        <div className="relative flex flex-1 flex-col bg-slate-100">
          <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-4 px-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30">
                <CloudRain className="h-9 w-9 animate-pulse" strokeWidth={1.75} aria-hidden />
              </div>
              <div>
                <p className="text-base font-medium text-gray-800">Đang tải bản đồ và camera…</p>
                <p className="mt-1 text-sm text-gray-500">Vui lòng đợi trong giây lát</p>
              </div>
              <div className="flex gap-1.5">
                <span className="h-2 w-2 animate-bounce rounded-full bg-sky-500 [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-sky-500 [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-sky-500 [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
