/**
 * Admin – ingestion jobs list, detail, stats (with charts).
 */
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { getIngestionJobs, getIngestionJobDetail, getIngestionStats } from '../../services/adminApi';
import type { IngestionJobsResponseDto, IngestionJobDetailDto, IngestionStatsDto } from '../../types/api';
import { ADMIN_LOADING_TEXT, getApiErrorMessage } from './adminShared';
import AdminErrorMessage from './AdminErrorMessage';

export default function AdminIngestion() {
  const [stats, setStats] = useState<IngestionStatsDto | null>(null);
  const [jobs, setJobs] = useState<IngestionJobsResponseDto | null>(null);
  const [detail, setDetail] = useState<IngestionJobDetailDto | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      setError(null);
      setLoading(true);
      getIngestionStats(7)
        .then(setStats)
        .catch((e) => setError(getApiErrorMessage(e, 'Tải stats thất bại')))
        .finally(() => setLoading(false));
    }, 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    getIngestionJobs({ page, pageSize: 20 })
      .then(setJobs)
      .catch((e) => setError(getApiErrorMessage(e, 'Tải jobs thất bại')));
  }, [page]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!detailId) {
        setDetail(null);
        return;
      }
      getIngestionJobDetail(detailId)
        .then(setDetail)
        .catch(() => setDetail(null));
    }, 0);
    return () => clearTimeout(t);
  }, [detailId]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Ingestion jobs</h2>
      {error && <AdminErrorMessage message={error} />}

      {stats && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-medium text-gray-800 mb-4">Thống kê (7 ngày)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-4">
            <div>Jobs: {stats.Jobs?.Total ?? 0} (Success: {stats.Jobs?.SuccessRate ?? 0}%)</div>
            <div>Attempts: {stats.Attempts?.Total ?? 0} (Success: {stats.Attempts?.SuccessRate ?? 0}%)</div>
            <div>Avg latency: {stats.Attempts?.AvgLatency ?? 0} ms</div>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Jobs', success: stats.Jobs?.Completed ?? 0, failed: stats.Jobs?.Failed ?? 0 },
                  { name: 'Attempts', success: stats.Attempts?.Successful ?? 0, failed: stats.Attempts?.Failed ?? 0 },
                ]}
                margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="success" name="Thành công" fill="#22c55e" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="failed" name="Thất bại" fill="#ef4444" stackId="a" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <h3 className="p-4 font-medium text-gray-800 border-b border-gray-200">Danh sách jobs</h3>
        {loading && !jobs ? (
          <p className="p-6 text-gray-500">{ADMIN_LOADING_TEXT}</p>
        ) : jobs ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">JobId</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {(jobs.Jobs ?? []).map((j) => (
                    <tr key={j.JobId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900 font-mono">{String(j.JobId).slice(0, 8)}…</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{j.Status}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{new Date(j.StartedAt).toLocaleString('vi-VN')}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{j.Duration != null ? `${j.Duration.toFixed(1)}s` : '—'}</td>
                      <td className="px-4 py-3">
                        <button type="button" onClick={() => setDetailId(j.JobId)} className="text-blue-600 hover:underline text-sm focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 rounded">Chi tiết</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {jobs.TotalPages > 1 && (
              <div className="p-4 flex items-center gap-3 border-t border-gray-200">
                <button type="button" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1} className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-400 focus:ring-offset-1">Trước</button>
                <span className="text-sm text-gray-600">Trang {page} / {jobs.TotalPages}</span>
                <button type="button" onClick={() => setPage((p) => Math.min(jobs.TotalPages, p + 1))} disabled={page >= jobs.TotalPages} className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50 focus:ring-2 focus:ring-blue-400 focus:ring-offset-1">Sau</button>
              </div>
            )}
          </>
        ) : null}
      </div>

      {detail && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium text-gray-800">Chi tiết job {String(detail.JobId).slice(0, 8)}…</h3>
            <button type="button" onClick={() => setDetailId(null)} className="text-gray-500 hover:text-gray-700 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-400 focus:ring-offset-1">Đóng</button>
          </div>
          <p className="text-sm text-gray-600 mb-2">Status: {detail.Status}, Duration: {detail.Duration != null ? `${detail.Duration.toFixed(1)}s` : '—'}</p>
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 py-1 text-left">CameraId</th>
                <th className="px-2 py-1 text-left">Status</th>
                <th className="px-2 py-1 text-left">Latency</th>
                <th className="px-2 py-1 text-left">AttemptAt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(detail.Attempts ?? []).map((a) => (
                <tr key={a.AttemptId}>
                  <td className="px-2 py-1">{a.CameraId}</td>
                  <td className="px-2 py-1">{a.Status}</td>
                  <td className="px-2 py-1">{a.LatencyMs} ms</td>
                  <td className="px-2 py-1">{new Date(a.AttemptAt).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
