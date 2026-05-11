/**
 * FavoritesContext – favorites from API (GET/POST/DELETE /api/favorite)
 * When not authenticated, favorites are empty and toggle prompts sign-in.
 */
/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { CameraInfo } from '../types';
import { useAuth } from './AuthContext';
import * as favoriteApi from '../services/favoriteApi';

interface FavoritesContextValue {
  favoriteCameras: CameraInfo[];
  favoriteIds: Set<string>;
  isFavorite: (cameraId: string) => boolean;
  toggleFavorite: (cameraId: string) => Promise<void>;
  favoritesCount: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

interface FavoritesProviderProps {
  children: ReactNode;
}

export function FavoritesProvider({ children }: FavoritesProviderProps) {
  const { isAuthenticated } = useAuth();
  const [favoriteCameras, setFavoriteCameras] = useState<CameraInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoriteCameras([]);
      setError(null);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const list = await favoriteApi.getFavorites();
      setFavoriteCameras(list);
    } catch (e) {
      const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Không tải được danh sách yêu thích.';
      setError(msg);
      setFavoriteCameras([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const favoriteIds = useMemo(() => new Set(favoriteCameras.map((c) => c.id)), [favoriteCameras]);

  const isFavorite = useCallback(
    (cameraId: string) => favoriteIds.has(cameraId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback(
    async (cameraId: string) => {
      if (!isAuthenticated) {
        throw new Error('Vui lòng đăng nhập để thêm vào yêu thích.');
      }
      const currentlyFavorite = favoriteIds.has(cameraId);
      try {
        if (currentlyFavorite) {
          await favoriteApi.removeFavorite(cameraId);
          setFavoriteCameras((prev) => prev.filter((c) => c.id !== cameraId));
        } else {
          await favoriteApi.addFavorite(cameraId);
          await refetch();
        }
      } catch (e) {
        const msg = e && typeof e === 'object' && 'message' in e ? String((e as { message: string }).message) : 'Thao tác thất bại.';
        throw new Error(msg);
      }
    },
    [isAuthenticated, favoriteIds, refetch]
  );

  const value = useMemo<FavoritesContextValue>(
    () => ({
      favoriteCameras,
      favoriteIds,
      isFavorite,
      toggleFavorite,
      favoritesCount: favoriteCameras.length,
      loading,
      error,
      refetch,
    }),
    [favoriteCameras, favoriteIds, isFavorite, toggleFavorite, loading, error, refetch]
  );

  return (
    <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return ctx;
}
