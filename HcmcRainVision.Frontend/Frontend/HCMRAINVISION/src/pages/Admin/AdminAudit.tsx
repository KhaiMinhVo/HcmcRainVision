/**
 * Admin – audit data (user reports to review).
 */
import { useState, useEffect } from 'react';
import { getAuditData } from '../../services/adminApi';
import type { AuditDataItemDto } from '../../types/api';
import { getApiErrorMessage } from './adminShared';
import AdminLoadingBlock from './AdminLoadingBlock';
import AdminErrorMessage from './AdminErrorMessage';

export default function AdminAudit() {
  const [items, setItems] = useState<AuditDataItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAuditData()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch((e) => setError(getApiErrorMessage(e, 'Tải dữ liệu thất bại')))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLoadingBlock />;
  if (error) return <AdminErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Báo cáo cần duyệt</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ReportId</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CameraId</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AI</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ảnh</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {(items ?? []).map((a) => (
                <tr key={a.ReportId} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{a.ReportId}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{a.CameraId}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{a.UserSaid}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{a.AISaid} ({a.AIConfidence?.toFixed(2)})</td>
                  <td className="px-4 py-3 text-sm">
                    {a.ImageUrl ? (
                      <a href={a.ImageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Xem
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{a.Note ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(items ?? []).length === 0 && <p className="p-6 text-gray-500 text-center">Chưa có báo cáo nào.</p>}
      </div>
    </div>
  );
}
