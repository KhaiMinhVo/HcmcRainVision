/**
 * Reset Password – token from query, form NewPassword, POST /api/auth/reset-password
 */
import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth, getAuthErrorMessage } from '../contexts/AuthContext';
import { validate } from '../lib/validation';
import AuthPageShell from '../components/AuthPageShell';
import { Button, Input } from '../components/ui';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();

  useEffect(() => {
    if (!token) setError('Link không hợp lệ (thiếu token).');
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    const result = validate('resetPassword', { Token: token, NewPassword: newPassword });
    if (!result.valid) {
      setError(result.firstMessage ?? 'Dữ liệu không hợp lệ.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(
        () =>
          navigate('/login', {
            replace: true,
            state: { message: 'Đổi mật khẩu thành công! Hãy đăng nhập lại.' },
          }),
        2000,
      );
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) return null;

  return (
    <AuthPageShell
      title="Đặt lại mật khẩu"
      subtitle="Nhập mật khẩu mới (ít nhất 6 ký tự)."
      footer={
        <p className="mt-4 text-center animate-fade-in">
          <Link to="/" className="text-sm text-gray-500 transition-colors hover:text-gray-800">
            ← Quay lại trang chủ
          </Link>
        </p>
      }
    >
      {success ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-center text-sm text-emerald-800 animate-fade-in">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden />
          <p>Đổi mật khẩu thành công! Đang chuyển đến trang đăng nhập...</p>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 animate-fade-in">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" aria-hidden />
              <span>{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
                Mật khẩu mới
              </label>
              <Input
                id="newPassword"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                showPasswordToggle
                placeholder="••••••••"
                className="py-2.5 pl-10 pr-10"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-gray-700">
                Xác nhận mật khẩu
              </label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                leftIcon={<Lock className="h-4 w-4" />}
                showPasswordToggle
                placeholder="••••••••"
                className="py-2.5 pl-10 pr-10"
              />
            </div>
            <Button type="submit" className="w-full py-2.5" loading={loading} disabled={!token}>
              Đặt lại mật khẩu
            </Button>
          </form>
        </>
      )}

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link to="/login" className="font-semibold text-sky-600 transition-colors hover:text-sky-700">
          Quay lại đăng nhập
        </Link>
      </p>
    </AuthPageShell>
  );
}
