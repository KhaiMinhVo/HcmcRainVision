/**
 * Forgot Password – submit email, call POST /api/auth/forgot-password
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth, getAuthErrorMessage } from '../contexts/AuthContext';
import { validate } from '../lib/validation';
import AuthPageShell from '../components/AuthPageShell';
import { Button, Input } from '../components/ui';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { forgotPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const result = validate('forgotPassword', { Email: email.trim() });
    if (!result.valid) {
      setError(result.firstMessage ?? 'Dữ liệu không hợp lệ.');
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSuccess(true);
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      title="Quên mật khẩu"
      subtitle="Nhập email đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu."
      footer={
        <p className="mt-4 text-center animate-fade-in">
          <Link to="/" className="text-sm text-gray-500 transition-colors hover:text-gray-800">
            ← Quay lại trang chủ
          </Link>
        </p>
      }
    >
      {success ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center text-sm text-emerald-800 animate-fade-in">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" aria-hidden />
          <p className="leading-relaxed">Vui lòng kiểm tra email để đặt lại mật khẩu.</p>
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
            <Button type="submit" className="w-full py-2.5" loading={loading}>
              Gửi link đặt lại mật khẩu
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
