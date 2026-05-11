/**
 * Admin – user list + ban toggle.
 */
import { useState, useEffect } from 'react';
import { getAdminUsers, toggleBanUser } from '../../services/adminApi';
import type { UserAdminViewDto } from '../../types/api';
import { getApiErrorMessage } from './adminShared';
import AdminLoadingBlock from './AdminLoadingBlock';
import AdminErrorMessage from './AdminErrorMessage';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserAdminViewDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const load = () => {
    setError(null);
    getAdminUsers()
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((e) => setError(getApiErrorMessage(e, 'Tải danh sách thất bại')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(() => load(), 0);
    return () => clearTimeout(t);
  }, []);

  const handleToggleBan = (id: number) => {
    if (togglingId != null) return;
    setTogglingId(id);
    toggleBanUser(id)
      .then(() => load())
      .catch((e) => setError(getApiErrorMessage(e, 'Thao tác thất bại')))
      .finally(() => setTogglingId(null));
  };

  if (loading) return <AdminLoadingBlock />;
  if (error) return <AdminErrorMessage message={error} />;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Quản lý người dùng</h2>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {(users ?? []).map((u) => (
              <tr key={u.Id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-900">{u.Id}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{u.Username}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{u.Email}</td>
                <td className="px-4 py-3 text-sm text-gray-700">{u.Role}</td>
                <td className="px-4 py-3 text-sm">{u.IsActive ? <span className="text-green-600">Hoạt động</span> : <span className="text-red-600">Đã khóa</span>}</td>
                <td className="px-4 py-3">
                  {u.Role === 'Admin' ? (
                    <span className="text-gray-400">—</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleBan(u.Id)}
                      disabled={togglingId === u.Id}
                      className="text-sm text-blue-600 hover:underline focus:ring-2 focus:ring-blue-400 focus:ring-offset-1 rounded disabled:opacity-50"
                    >
                      {togglingId === u.Id ? '...' : u.IsActive ? 'Khóa' : 'Mở khóa'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
