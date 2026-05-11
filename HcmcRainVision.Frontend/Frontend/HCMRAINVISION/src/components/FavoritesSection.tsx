/**
 * FavoritesSection – list of favorite cameras from API (when logged in)
 */
import { useFavorites } from '../contexts/FavoritesContext';

interface FavoritesSectionProps {
  onCameraSelect: (cameraId: string) => void;
}

export default function FavoritesSection({ onCameraSelect }: FavoritesSectionProps) {
  const { favoriteCameras, favoritesCount, loading } = useFavorites();

  if (loading && favoriteCameras.length === 0) {
    return (
      <div className="p-4 border-b border-gray-200 bg-amber-50/50">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Cameras yêu thích</h3>
        <p className="text-xs text-gray-500">Đang tải...</p>
      </div>
    );
  }

  if (favoriteCameras.length === 0) {
    return (
      <div className="p-4 border-b border-gray-200 bg-amber-50/50">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">
          Cameras yêu thích ({favoritesCount})
        </h3>
        <p className="text-xs text-gray-500">Chưa có camera yêu thích. Nhấn ♥ ở danh sách hoặc chi tiết camera.</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-b border-gray-200 bg-amber-50/50">
      <h3 className="text-sm font-semibold text-gray-900 mb-2">
        Cameras yêu thích ({favoritesCount})
      </h3>
      <ul className="space-y-1">
        {favoriteCameras.map((cam) => (
          <li key={cam.id}>
            <button
              type="button"
              onClick={() => onCameraSelect(cam.id)}
              className="w-full text-left text-xs py-2 px-2 rounded-lg hover:bg-amber-100 truncate focus:ring-2 focus:ring-amber-400 focus:ring-offset-1"
            >
              {cam.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
