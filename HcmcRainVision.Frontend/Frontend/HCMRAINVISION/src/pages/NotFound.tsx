/**
 * NotFound – 404 page for unknown routes or API resource not found
 */
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 gap-2">
      <h1 className="text-6xl font-bold text-gray-300">404</h1>
      <p className="text-lg text-gray-600">Trang không tồn tại.</p>
      <Link
        to="/"
        className="mt-4 px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Quay lại trang chủ
      </Link>
    </div>
  );
}
