/**
 * Signup Page – username, email, password, confirm password; POST /api/auth/register
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth, getAuthErrorMessage } from '../contexts/AuthContext';
import { validate } from '../lib/validation';
import AuthPageShell from '../components/AuthPageShell';
import { Button, Input } from '../components/ui';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    const result = validate('register', {
      Username: username.trim(),
      Email: email.trim(),
      Password: password,
    });
    if (!result.valid) {
      setError(result.firstMessage ?? 'Dữ liệu không hợp lệ. Mật khẩu cần ít nhất 6 ký tự.');
      return;
    }
    setLoading(true);
    try {
      await signup(username.trim(), email.trim(), password);
      navigate('/login', { replace: true, state: { message: 'Đăng ký thành công! Vui lòng đăng nhập.' } });
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      title="Đăng ký"
      subtitle="HCMC Rain Detection System"
      footer={
        <p className="mt-4 text-center animate-fade-in">
          <Link to="/" className="text-sm text-gray-500 transition-colors hover:text-gray-800">
            ← Quay lại trang chủ
          </Link>
        </p>
      }
    >
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
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="h-4 w-4" />}
            placeholder="email@example.com"
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
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
        <Button type="submit" className="w-full py-2.5" loading={loading}>
          Đăng ký
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Đã có tài khoản?{' '}
        <Link to="/login" className="font-semibold text-sky-600 transition-colors hover:text-sky-700">
          Đăng nhập
        </Link>
      </p>
    </AuthPageShell>
  );
}
