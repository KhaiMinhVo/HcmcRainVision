/**
 * CameraDetailPanel Component
 * Bottom sheet (mobile) / Sidebar (desktop) showing camera details and snapshot image
 */

import { useEffect, useState } from 'react';
import type { CameraInfo, RainDataPoint } from '../types';
import type { CameraDto } from '../types/api';
import { RAIN_LEVEL_CONFIG } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { getCameraById } from '../services/cameraApi';
import { reportIncorrectPrediction } from '../services/weatherApi';
import { validate } from '../lib/validation';
import WardDetailModal from './WardDetailModal';

interface CameraDetailPanelProps {
  camera: CameraInfo | null;
  cameraId: string | null;
  rainData: RainDataPoint | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Get rain status information (labels in Vietnamese for AI prediction display)
 */
const getRainStatus = (rainLevel: number) => {
  if (rainLevel === RAIN_LEVEL_CONFIG.NO_RAIN) {
    return {
      level: RAIN_LEVEL_CONFIG.NO_RAIN,
      label: 'Không mưa',
      color: 'bg-gray-200',
      textColor: 'text-gray-700',
      icon: '☀️',
    };
  }
  if (rainLevel === RAIN_LEVEL_CONFIG.LIGHT_RAIN) {
    return {
      level: RAIN_LEVEL_CONFIG.LIGHT_RAIN,
      label: 'Mưa nhẹ',
      color: 'bg-yellow-400',
      textColor: 'text-yellow-900',
      icon: '🌦️',
    };
  }
  return {
    level: RAIN_LEVEL_CONFIG.HEAVY_RAIN,
    label: 'Mưa nặng',
    color: 'bg-red-500',
    textColor: 'text-white',
    icon: '🌧️',
  };
};

export default function CameraDetailPanel({
  camera,
  cameraId,
  rainData,
  isOpen,
  onClose,
}: CameraDetailPanelProps) {
  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const [detail, setDetail] = useState<CameraDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  // Fetch camera detail (StreamUrl, etc.) when panel opens with a camera id
  useEffect(() => {
    if (!isOpen || !cameraId) {
      setDetail(null);
      setDetailError(null);
      setImageError(false);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    setDetailError(null);
    setImageError(false);
    getCameraById(cameraId)
      .then((data) => {
        if (!cancelled) {
          setDetail(data ?? null);
          if (data == null) setDetailError('Không tìm thấy camera.');
        }
      })
      .catch(() => {
        if (!cancelled) setDetailError('Không tải được thông tin camera.');
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, cameraId]);

  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportIsRaining, setReportIsRaining] = useState(true);
  const [reportNote, setReportNote] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  const [wardDetailId, setWardDetailId] = useState<string | null>(null);

  const handleReportSubmit = async () => {
    const camId = effectiveCamera?.id ?? cameraId;
    if (!camId) return;
    setReportError(null);
    const payload = { CameraId: camId, IsRaining: reportIsRaining, Note: reportNote.trim() || undefined };
    const result = validate('report', payload);
    if (!result.valid) {
      setReportError(result.firstMessage ?? 'Dữ liệu không hợp lệ.');
      return;
    }
    setReportLoading(true);
    try {
      await reportIncorrectPrediction({
        CameraId: camId,
        IsRaining: reportIsRaining,
        Note: reportNote.trim() || undefined,
      });
      setReportModalOpen(false);
      setReportNote('');
    } catch (err) {
      setReportError(err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : 'Gửi báo cáo thất bại.');
    } finally {
      setReportLoading(false);
    }
  };

  if (!isOpen || (!camera && !cameraId)) return null;

  const effectiveCamera = camera ?? (detail ? { id: detail.Id, name: detail.Name, address: detail.Name, ward: '', district: '', lat: detail.Latitude, lng: detail.Longitude } : null);

  const rainLevel = rainData?.rainLevel ?? RAIN_LEVEL_CONFIG.NO_RAIN;
  const rainStatus = getRainStatus(rainLevel);
  const favorited = isAuthenticated && effectiveCamera && isFavorite(effectiveCamera.id);
  const lastUpdate = (() => {
    if (!rainData?.timestamp) return 'Chưa có dữ liệu';
    const d = new Date(rainData.timestamp);
    if (!isNaN(d.getTime())) {
      return d.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
    }
    // Fallback: nếu không parse được (ví dụ "5 phút trước") hiển thị trực tiếp
    return rainData.timestamp;
  })();
  const displayName = effectiveCamera?.name ?? detail?.Name ?? 'Camera';
  /** Link ảnh camera trực tiếp từ API (StreamUrl) – không cần backend proxy */
  const imageUrl = detail?.StreamUrl ?? camera?.streamUrl ?? undefined;
  const showImage = !!imageUrl && !imageError;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50 lg:hidden transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 lg:right-auto lg:left-auto lg:top-0 lg:bottom-0 lg:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0 lg:translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 truncate">{displayName}</h2>
              <p className="text-xs text-gray-600 mt-1 truncate">{effectiveCamera?.district ?? detail?.Name ?? ''}</p>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              {isAuthenticated && effectiveCamera && (
                <button
                  type="button"
                  onClick={() =>
                    toggleFavorite(effectiveCamera.id).catch((err: Error) => {
                      alert(err?.message ?? 'Thao tác thất bại.');
                    })
                  }
                  className="p-2 rounded-md text-gray-600 hover:text-red-500 transition-colors"
                  aria-label={favorited ? 'Bỏ yêu thích' : 'Yêu thích'}
                >
                  <svg
                    className="w-5 h-5"
                    fill={favorited ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors"
                aria-label="Đóng"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Report wrong button - only when logged in */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setReportModalOpen(true)}
                className="w-full py-2 px-3 rounded-lg border border-amber-300 bg-amber-50 text-amber-800 text-sm font-medium hover:bg-amber-100"
              >
                Báo cáo kết quả AI sai
              </button>
            )}

            {/* AI prediction – rain at current time */}
            <div className={`${rainStatus.color} ${rainStatus.textColor} rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl mb-2">{rainStatus.icon}</div>
                  <div className="text-sm font-medium opacity-90">AI dự đoán (thời điểm hiện tại)</div>
                  <div className="text-2xl font-bold">{rainStatus.label}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs opacity-75">Cập nhật lúc</div>
                  <div className="text-sm font-medium">{lastUpdate}</div>
                </div>
              </div>
            </div>

            {/* Camera Info */}
            {effectiveCamera && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Camera Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Address:</span>
                      <p className="text-gray-900 font-medium">{effectiveCamera.address}</p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <span className="text-gray-600">Ward: </span>
                        {effectiveCamera.wardId ? (
                          <button
                            type="button"
                            onClick={() => setWardDetailId(effectiveCamera!.wardId ?? null)}
                            className="text-gray-900 font-medium text-blue-600 hover:underline"
                          >
                            {effectiveCamera.ward}
                          </button>
                        ) : (
                          <span className="text-gray-900 font-medium">{effectiveCamera.ward}</span>
                        )}
                      </div>
                      <div>
                        <span className="text-gray-600">District: </span>
                        <span className="text-gray-900 font-medium">{effectiveCamera.district}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">Coordinates: </span>
                      <span className="text-gray-900 font-mono text-xs">
                        {effectiveCamera.lat.toFixed(6)}, {effectiveCamera.lng.toFixed(6)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Camera snapshot / image */}
            <div className="bg-gray-900 rounded-lg overflow-hidden">
              <div className="aspect-video bg-gray-800 flex items-center justify-center relative">
                {detailLoading && (
                  <div className="text-center text-gray-400">
                    <svg className="w-10 h-10 mx-auto mb-2 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-sm">Đang tải hình ảnh...</p>
                  </div>
                )}
                {detailLoading && !imageUrl && (
                  <div className="text-center text-gray-400">
                    <svg className="w-10 h-10 mx-auto mb-2 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-sm">Đang tải thông tin camera...</p>
                  </div>
                )}
                {!detailLoading && detailError && !imageUrl && (
                  <div className="text-center text-gray-400 px-4">
                    <p className="text-sm">{detailError}</p>
                  </div>
                )}
                {!showImage && !detailLoading && !detailError && (
                  <div className="text-center text-gray-400 px-4">
                    <svg className="w-16 h-16 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Không có link ảnh camera hoặc không tải được</p>
                  </div>
                )}
                {showImage && imageUrl && (
                  <img
                    src={imageUrl}
                    alt="Camera"
                    className="w-full h-full object-contain"
                    onError={() => setImageError(true)}
                  />
                )}
                {rainLevel > RAIN_LEVEL_CONFIG.NO_RAIN && (
                  <div className="absolute top-2 right-2">
                    <div className={`${rainStatus.color} ${rainStatus.textColor} px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1`}>
                      <span>{rainStatus.icon}</span>
                      <span>{rainStatus.label}</span>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 p-2 text-center bg-gray-800 text-gray-400">
                Dữ liệu camera từ Cổng thông tin giao thông TP.HCM
              </p>
            </div>

            {/* History Section - placeholder when no time-series from API */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Lịch sử gần đây</h3>
              <div className="space-y-2">
                {[
                  { label: 'Không mưa', className: 'bg-gray-100 text-gray-800' },
                  { label: 'Mưa nhẹ', className: 'bg-yellow-100 text-yellow-800' },
                  { label: 'Không mưa', className: 'bg-gray-100 text-gray-800' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm py-2 border-b border-gray-200 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">
                        {i === 0 ? '—' : `${15 - i * 5} phút trước`}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs ${item.className}`}>
                        {item.label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => {
                onClose();
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              View on Map
            </button>
          </div>
        </div>
      </div>

      {/* Report modal */}
      {reportModalOpen && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[60]" onClick={() => !reportLoading && setReportModalOpen(false)} />
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-4 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Báo cáo kết quả sai</h3>
              <p className="text-sm text-gray-600 mb-3">Thực tế tại camera này đang như thế nào?</p>
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setReportIsRaining(true)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${reportIsRaining ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Đang mưa
                </button>
                <button
                  type="button"
                  onClick={() => setReportIsRaining(false)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium ${!reportIsRaining ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  Không mưa
                </button>
              </div>
              <div className="mb-3">
                <label className="block text-sm text-gray-700 mb-1">Ghi chú (tùy chọn)</label>
                <textarea
                  value={reportNote}
                  onChange={(e) => setReportNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  rows={2}
                  placeholder="Thêm mô tả nếu cần..."
                />
              </div>
              {reportError && <p className="text-sm text-red-600 mb-2">{reportError}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => !reportLoading && setReportModalOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleReportSubmit}
                  disabled={reportLoading}
                  className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {reportLoading ? 'Đang gửi...' : 'Gửi báo cáo'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      <WardDetailModal
        wardId={wardDetailId ?? ''}
        isOpen={wardDetailId != null}
        onClose={() => setWardDetailId(null)}
      />
    </>
  );
}
