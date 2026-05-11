/**
 * Modal showing ward detail from GET /api/location/wards/{id}.
 */
import { useState, useEffect } from 'react';
import { getWardById } from '../services/locationApi';
import type { WardDetailDto } from '../types/api';

interface WardDetailModalProps {
  wardId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function WardDetailModal({ wardId, isOpen, onClose }: WardDetailModalProps) {
  const [ward, setWard] = useState<WardDetailDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!isOpen || !wardId) {
        setWard(null);
        setError(null);
        return;
      }
      setLoading(true);
      setError(null);
      getWardById(wardId)
        .then(setWard)
        .catch((e) => {
          setWard(null);
          setError(e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Không tải được thông tin phường.');
        })
        .finally(() => setLoading(false));
    }, 0);
    return () => clearTimeout(t);
  }, [isOpen, wardId]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[2000]" onClick={onClose} aria-hidden />
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white rounded-lg shadow-xl z-[2001] p-6"
        role="dialog"
        aria-labelledby="ward-detail-title"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 id="ward-detail-title" className="text-lg font-semibold text-gray-900">
            Chi tiết phường
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Đóng"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {loading && <p className="text-gray-600 text-sm">Đang tải...</p>}
        {error && (
          <p className="text-red-600 text-sm" role="alert">
            {error}
          </p>
        )}
        {!loading && !error && ward && (
          <dl className="space-y-2 text-sm">
            <div>
              <dt className="text-gray-500">Tên phường</dt>
              <dd className="font-medium text-gray-900">{ward.WardName}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Quận</dt>
              <dd className="text-gray-800">{ward.DistrictName ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Mã phường</dt>
              <dd className="text-gray-800 font-mono">{ward.WardId}</dd>
            </div>
            {ward.CreatedAt && (
              <div>
                <dt className="text-gray-500">Ngày tạo</dt>
                <dd className="text-gray-800">{new Date(ward.CreatedAt).toLocaleString('vi-VN')}</dd>
              </div>
            )}
            {ward.UpdatedAt && (
              <div>
                <dt className="text-gray-500">Cập nhật</dt>
                <dd className="text-gray-800">{new Date(ward.UpdatedAt).toLocaleString('vi-VN')}</dd>
              </div>
            )}
          </dl>
        )}
      </div>
    </>
  );
}
