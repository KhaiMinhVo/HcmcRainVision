/**
 * Login Page – username + password, Remember me, redirect after login
 */
import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth, getAuthErrorMessage } from '../contexts/AuthContext';
import { validate } from '../lib/validation';
import AuthPageShell from '../components/AuthPageShell';
import { Button, Input } from '../components/ui';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string }; message?: string })?.from?.pathname ?? '/';
  const message = (location.state as { message?: string })?.message;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = validate('login', { Username: username.trim(), Password: password });
    if (!result.valid) {
      setError(result.firstMessage ?? 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.');
      return;
    }
    setLoading(true);
    try {
      await login(username.trim(), password, rememberMe);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      title="Đăng nhập"
      subtitle="HCMC Rain Detection System"
      footer={
        <p className="mt-4 text-center animate-fade-in">
          <Link to="/" className="text-sm text-gray-500 transition-colors hover:text-gray-800">
            ← Quay lại trang chủ
          </Link>
        </p>
      }
    >
      {message && (
        <div className="mb-4 flex gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800 animate-fade-in">
          <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-600" aria-hidden />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800 animate-fade-in">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="mb-1.5 block text-sm font-medium text-gray-700">
            Tên đăng nhập
          </label>
          <Input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            leftIcon={<User className="h-4 w-4" />}
            placeholder="Tên đăng nhập"
            className="py-2.5 pl-10 pr-3"
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
            Mật khẩu
          </label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={<Lock className="h-4 w-4" />}
            showPasswordToggle
            placeholder="••••••••"
            className="py-2.5 pl-10 pr-10"
          />
        </div>
        <div className="flex items-center justify-between gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg transition-colors hover:bg-gray-50 px-0.5 py-0.5">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
            />
            <span className="text-sm text-gray-700">Ghi nhớ đăng nhập</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-sky-600 transition-colors hover:text-sky-700"
          >
            Quên mật khẩu?
          </Link>
        </div>
        <Button type="submit" className="w-full py-2.5" loading={loading}>
          Đăng nhập
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-3 text-gray-500">Hoặc</span>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          className="mt-4 w-full py-2.5"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Đăng nhập với Google
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-600">
        Chưa có tài khoản?{' '}
        <Link to="/signup" className="font-semibold text-sky-600 transition-colors hover:text-sky-700">
          Đăng ký
        </Link>
      </p>

    </AuthPageShell>
  );
}
