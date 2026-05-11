/**
 * Admin – Test AI: upload image, call POST api/Weather/test-ai, show result.
 */
import { useState } from 'react';
import * as weatherApi from '../../services/weatherApi';

export default function AdminTestAi() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Vui lòng chọn một ảnh.');
      return;
    }
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const data = await weatherApi.testAi(file);
      setResult(data);
    } catch (e) {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Gửi thất bại.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold text-gray-900">Test AI (upload ảnh)</h2>
      <p className="text-sm text-gray-600">
        Chọn ảnh và gửi để test model dự đoán mưa. API: POST api/Weather/test-ai.
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-md">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              setFile(f ?? null);
              setError(null);
            }}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
          />
        </div>
        {error && (
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        )}
        <button
          type="submit"
          disabled={loading || !file}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Đang gửi...' : 'Gửi và test'}
        </button>
      </form>
      {result !== null && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Kết quả:</p>
          <pre className="text-xs overflow-auto max-h-64 whitespace-pre-wrap break-words">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}