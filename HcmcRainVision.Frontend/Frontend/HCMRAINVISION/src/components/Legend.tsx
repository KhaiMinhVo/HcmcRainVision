interface LegendProps {
  showHeatmap?: boolean;
  onToggleHeatmap?: (show: boolean) => void;
}

export default function Legend({ showHeatmap = false, onToggleHeatmap }: LegendProps) {
  return (
    <div className="absolute top-4 right-4 bg-white rounded-xl shadow-lg p-5 z-[1000] border border-gray-200 w-80">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Chú thích mức mưa
      </h3>
      <div className="space-y-4">
        <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
          <div className="w-5 h-5 rounded-full bg-gray-300 border-2 border-gray-400 flex-shrink-0 mt-0.5"></div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-800 block">Không mưa</span>
            <p className="text-xs text-gray-500 mt-0.5">Trời quang</p>
          </div>
        </div>
        <div className="flex items-start gap-3 pb-3 border-b border-gray-100">
          <div className="w-5 h-5 rounded-full bg-yellow-400 border-2 border-yellow-500 flex-shrink-0 mt-0.5"></div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-800 block">Mưa nhẹ</span>
            <p className="text-xs text-gray-500 mt-0.5">Mưa phùn hoặc mưa rào nhẹ</p>
          </div>
        </div>
        <div className="flex items-start gap-3 pb-3">
          <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-red-600 flex-shrink-0 mt-0.5"></div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium text-gray-800 block">Mưa nặng</span>
            <p className="text-xs text-gray-500 mt-0.5">Mưa to được phát hiện</p>
          </div>
        </div>
      </div>
      {onToggleHeatmap != null && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2">
          <input
            type="checkbox"
            id="legend-heatmap"
            checked={showHeatmap}
            onChange={(e) => onToggleHeatmap(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <label htmlFor="legend-heatmap" className="text-sm font-medium text-gray-700 cursor-pointer">
            Heatmap
          </label>
        </div>
      )}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 leading-relaxed">
          Bấm vào marker để xem chi tiết camera
        </p>
      </div>
    </div>
  );
}
