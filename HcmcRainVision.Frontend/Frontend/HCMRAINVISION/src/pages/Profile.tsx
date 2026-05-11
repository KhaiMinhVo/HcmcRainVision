/**
 * Profile – GET/PUT /api/auth/me, POST /api/auth/change-password (requires auth)
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, getAuthErrorMessage } from '../contexts/AuthContext';
import { validate } from '../lib/validation';

export default function Profile() {
  const { user, isAuthenticated, refreshUser, updateProfile, changePassword } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }
    setFullName(user?.fullName ?? user?.name ?? '');
    setPhoneNumber(user?.phoneNumber ?? '');
    setAvatarUrl(user?.avatar ?? '');
  }, [isAuthenticated, user, navigate]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    const payload = { FullName: fullName || null, PhoneNumber: phoneNumber || null, AvatarUrl: avatarUrl || null };
    const result = validate('updateProfile', payload);
    if (!result.valid) {
      setProfileError(result.firstMessage ?? 'Dữ liệu không hợp lệ.');
      return;
    }
    setLoadingProfile(true);
    try {
      await updateProfile(payload);
      await refreshUser();
      setProfileSuccess(true);
    } catch (err) {
      setProfileError(getAuthErrorMessage(err));
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Mật khẩu mới và xác nhận không khớp.');
      return;
    }
    const payload = { OldPassword: oldPassword, NewPassword: newPassword };
    const result = validate('changePassword', payload);
    if (!result.valid) {
      setPasswordError(result.firstMessage ?? 'Dữ liệu không hợp lệ.');
      return;
    }
    setLoadingPassword(true);
    try {
      await changePassword(payload);
      setPasswordSuccess(true);
      setOldPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordError(getAuthErrorMessage(err));
    } finally {
      setLoadingPassword(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md space-y-6">
        <div className="bg-white shadow-sm rounded-xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Hồ sơ cá nhân</h1>
          <p className="text-sm text-gray-600 mb-4">
            Đăng nhập: <strong>{user?.username}</strong> · {user?.email}
          </p>

          {profileError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{profileError}</div>
          )}
          {profileSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
              Cập nhật hồ sơ thành công!
            </div>
          )}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
              <input
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loadingProfile}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loadingProfile ? 'Đang lưu...' : 'Lưu hồ sơ'}
            </button>
          </form>
        </div>

        <div className="bg-white shadow-sm rounded-xl p-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Đổi mật khẩu</h2>
          {passwordError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{passwordError}</div>
          )}
          {passwordSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 text-green-700 text-sm">
              Đổi mật khẩu thành công!
            </div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={loadingPassword}
              className="w-full py-2 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
            >
              {loadingPassword ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>

        <p className="text-center">
          <Link to="/" className="text-sm text-blue-600 hover:text-blue-500">
            ← Quay lại trang chủ
          </Link>
        </p>
      </div>
    </div>
  );
}
