/**
 * Admin dashboard – stats, rain frequency (chart), failed cameras, camera health (chart).
 */
import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  getAdminStats,
  getRainFrequency,
  getFailedCameras,
  checkCameraHealth,
} from '../../services/adminApi';
import type {
  AdminStatsDto,
  RainFrequencyItemDto,
  FailedCamerasDto,
  CameraHealthDto,
} from '../../types/api';
import { getApiErrorMessage } from './adminShared';
import AdminLoadingBlock from './AdminLoadingBlock';
import AdminErrorMessage from './AdminErrorMessage';

const HEALTH_COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#6b7280'];

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStatsDto | null>(null);
  const [rainFreq, setRainFreq] = useState<RainFrequencyItemDto[]>([]);
  const [failed, setFailed] = useState<FailedCamerasDto | null>(null);
  const [health, setHealth] = useState<CameraHealthDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(() => {
      setError(null);
      setLoading(true);
      Promise.all([
        getAdminStats(),
        getRainFrequency(),
        getFailedCameras(),
        checkCameraHealth(),
      ])
        .then(([s, rf, f, h]) => {
          if (!cancelled) {
            setStats(s);
            setRainFreq(rf);
            setFailed(f);
            setHealth(h);
          }
        })
        .catch((e) => {
          if (!cancelled) {
            setError(getApiErrorMessage(e, 'Tải thống kê thất bại'));
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  if (loading) {
    return <AdminLoadingBlock />;
  }

  if (error) {
    return <AdminErrorMessage message={error} />;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Tổng quan</h2>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Tổng camera</div>
            <div className="text-2xl font-semibold text-gray-900">{stats.TotalCameras}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Weather logs</div>
            <div className="text-2xl font-semibold text-gray-900">{stats.TotalWeatherLogs}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Báo cáo user</div>
            <div className="text-2xl font-semibold text-gray-900">{stats.TotalUserReports}</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <div className="text-sm text-gray-500 mb-1">Lần quét cuối</div>
            <div className="text-lg font-medium text-gray-800">
              {stats.LastSystemScan ? new Date(stats.LastSystemScan).toLocaleString('vi-VN') : '—'}
            </div>
          </div>
        </div>
      )}

      {/* Rain frequency – Bar chart */}
      {Array.isArray(rainFreq) && rainFreq.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Tần suất mưa theo giờ (7 ngày)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rainFreq.map((item) => ({ hour: `${item.Hour}h`, count: item.Count }))} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value: number) => [value, 'Số lần']} labelFormatter={(label) => `Giờ: ${label}`} />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Số lần" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Failed cameras */}
      {failed && (() => {
        const cameras = failed.Cameras ?? [];
        return (
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Camera lỗi (không có dữ liệu 1h) — {failed.TotalFailed ?? cameras.length}
            </h3>
            {cameras.length === 0 ? (
              <p className="text-gray-500">Không có camera lỗi.</p>
            ) : (
              <ul className="space-y-2">
                {cameras.slice(0, 10).map((c) => (
                  <li key={c.Id} className="text-sm text-gray-700">
                    {c.Name} ({c.Id}) — {c.Status}
                  </li>
                ))}
                {cameras.length > 10 && (
                  <li className="text-gray-500">... và {cameras.length - 10} camera khác</li>
                )}
              </ul>
            )}
          </div>
        );
      })()}

      {/* Camera health – Pie chart */}
      {health?.Summary && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Tình trạng camera</h3>
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="h-52 w-full sm:w-52 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Active', value: health.Summary.Active ?? 0, color: HEALTH_COLORS[0] },
                      { name: 'Offline', value: health.Summary.Offline ?? 0, color: HEALTH_COLORS[1] },
                      { name: 'Maintenance', value: health.Summary.Maintenance ?? 0, color: HEALTH_COLORS[2] },
                      { name: 'Test', value: health.Summary.TestMode ?? 0, color: HEALTH_COLORS[3] },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, value }) => (value > 0 ? `${name}: ${value}` : '')}
                  >
                    {[
                      { name: 'Active', value: health.Summary.Active ?? 0, color: HEALTH_COLORS[0] },
                      { name: 'Offline', value: health.Summary.Offline ?? 0, color: HEALTH_COLORS[1] },
                      { name: 'Maintenance', value: health.Summary.Maintenance ?? 0, color: HEALTH_COLORS[2] },
                      { name: 'Test', value: health.Summary.TestMode ?? 0, color: HEALTH_COLORS[3] },
                    ].map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [value, 'Số camera']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="text-green-700">Active: {health.Summary.Active ?? 0}</span>
              <span className="text-red-600">Offline: {health.Summary.Offline ?? 0}</span>
              <span className="text-amber-600">Maintenance: {health.Summary.Maintenance ?? 0}</span>
              <span className="text-gray-600">Test: {health.Summary.TestMode ?? 0}</span>
            </div>
          </div>
          {health.Summary.Note && <p className="text-xs text-gray-500 mt-3">{health.Summary.Note}</p>}
        </div>
      )}
    </div>
  );
}
