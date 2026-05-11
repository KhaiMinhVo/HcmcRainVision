/**
 * TimeSlider Component
 * Time range slider for navigating through historical rain data
 */

interface TimeSliderProps {
  currentTimestamp: string;
  timestamps: string[];
  onTimestampChange: (timestamp: string) => void;
}

export default function TimeSlider({ currentTimestamp, timestamps, onTimestampChange }: TimeSliderProps) {
  const currentIndex = timestamps.indexOf(currentTimestamp);
  const totalSteps = timestamps.length - 1;

  const isLiveOnly = timestamps.length <= 1 || currentTimestamp === 'latest';
  const formatTime = (timestamp: string): string => {
    if (timestamp === 'latest') return 'Hiện tại';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const formatDate = (timestamp: string): string => {
    if (timestamp === 'latest') return '';
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
    });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const index = parseInt(e.target.value);
    onTimestampChange(timestamps[index]);
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      onTimestampChange(timestamps[currentIndex - 1]);
    }
  };

  const goToNext = () => {
    if (currentIndex < totalSteps) {
      onTimestampChange(timestamps[currentIndex + 1]);
    }
  };

  return (
    <div className="w-full bg-white border-t border-gray-200 shadow-sm rounded-t-xl lg:rounded-none">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium text-gray-700">
                {isLiveOnly ? 'Dữ liệu 30 phút gần nhất' : 'Time Range'}
              </span>
            </div>
            <div className="text-right">
              {formatDate(currentTimestamp) && <div className="text-xs text-gray-500">{formatDate(currentTimestamp)}</div>}
              <div className="text-sm font-semibold text-gray-900">{formatTime(currentTimestamp)}</div>
            </div>
          </div>

          {!isLiveOnly && (
            <>
              <div className="flex items-center gap-3 mt-3">
                <button
                  onClick={goToPrevious}
                  disabled={currentIndex === 0}
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex-1 relative">
                  <input
                    type="range"
                    min="0"
                    max={totalSteps}
                    value={currentIndex}
                    onChange={handleSliderChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    style={{
                      background: totalSteps > 0
                        ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(currentIndex / totalSteps) * 100}%, #e5e7eb ${(currentIndex / totalSteps) * 100}%, #e5e7eb 100%)`
                        : undefined,
                    }}
                  />
                </div>
                <button
                  onClick={goToNext}
                  disabled={currentIndex === totalSteps}
                  className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <div className="flex flex-col">
                  <span>{formatTime(timestamps[0])}</span>
                  <span className="text-gray-400">{formatDate(timestamps[0])}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span>{formatTime(timestamps[timestamps.length - 1])}</span>
                  <span className="text-gray-400">{formatDate(timestamps[timestamps.length - 1])}</span>
                </div>
              </div>
              <div className="mt-2 text-center">
                <span className="text-xs text-gray-500">
                  Step {currentIndex + 1} of {totalSteps + 1} (5 min intervals)
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
