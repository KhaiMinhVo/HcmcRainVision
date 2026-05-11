/**
 * Drawer for "Kiểm tra lộ trình": add route points (Lat/Lng), call checkRoute API, show IsSafe and Warnings.
 */
import { useState } from 'react';
import { checkRoute } from '../services/weatherApi';
import { validate } from '../lib/validation';
import type { RoutePointDto } from '../types/api';

interface CheckRouteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type RouteResult = {
  IsSafe: boolean;
  Warnings: Array<{ Lat: number; Lng: number; Message: string }>;
};

export default function CheckRouteDrawer({ isOpen, onClose }: CheckRouteDrawerProps) {
  const [points, setPoints] = useState<RoutePointDto[]>([]);
  const [addLat, setAddLat] = useState('');
  const [addLng, setAddLng] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RouteResult | null>(null);

  const handleAddPoint = () => {
    const lat = Number.parseFloat(addLat.trim());
    const lng = Number.parseFloat(addLng.trim());
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      setError('Nhập Lat và Lng hợp lệ.');
      return;
    }
    setError(null);
    setPoints((prev) => [...prev, { Lat: lat, Lng: lng }]);
    setAddLat('');
    setAddLng('');
  };

  const handleRemovePoint = (index: number) => {
    setPoints((prev) => prev.filter((_, i) => i !== index));
    setResult(null);
  };

  const handleCheck = async () => {
    const payload = points.map((p) => ({ Lat: p.Lat, Lng: p.Lng }));
    const validated = validate('checkRoute', payload);
    if (!validated.valid) {
      setError(validated.firstMessage ?? 'Dữ liệu không hợp lệ. Cần ít nhất 2 điểm.');
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await checkRoute(validated.data as RoutePointDto[]);
      setResult(res);
    } catch (e) {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Không kiểm tra được lộ trình.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setPoints([]);
    setAddLat('');
    setAddLng('');
    setError(null);
    setResult(null);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-[2000]"
        onClick={handleClose}
        aria-hidden
      />
      <div
        className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-sm rounded-l-xl z-[2001] flex flex-col overflow-hidden"
        role="dialog"
        aria-labelledby="check-route-title"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 id="check-route-title" className="text-lg font-semibold text-gray-900">
            Kiểm tra đường đi
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Đóng"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <p className="text-sm text-gray-600">
            Thêm ít nhất 2 điểm (tọa độ Lat, Lng) rồi bấm &quot;Kiểm tra lộ trình&quot;.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Lat"
              value={addLat}
              onChange={(e) => setAddLat(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Lng"
              value={addLng}
              onChange={(e) => setAddLng(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button
              type="button"
              onClick={handleAddPoint}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm font-medium"
            >
              Thêm
            </button>
          </div>

          {points.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Điểm đã thêm ({points.length})</h3>
              <ul className="space-y-1">
                {points.map((p, i) => (
                  <li key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2">
                    <span className="text-gray-700">
                      {i + 1}. {p.Lat.toFixed(5)}, {p.Lng.toFixed(5)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemovePoint(i)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Xóa
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleCheck}
            disabled={loading || points.length < 2}
            className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Đang kiểm tra...' : 'Kiểm tra lộ trình'}
          </button>

          {result && (
            <div className="border border-gray-200 rounded-lg p-4 space-y-2">
              <h3 className="text-sm font-semibold text-gray-800">Kết quả</h3>
              <p className={result.IsSafe ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                {result.IsSafe ? 'Lộ trình an toàn' : 'Lộ trình có thể gặp mưa'}
              </p>
              {result.Warnings.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-2">Cảnh báo:</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {result.Warnings.map((w, i) => (
                      <li key={i}>
                        ({w.Lat.toFixed(4)}, {w.Lng.toFixed(4)}): {w.Message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
