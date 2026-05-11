/**
 * FavoritesContext
 *
 * Provides real-time favorite state to all screens.
 * Wrap the authenticated portion of the app with <FavoritesProvider>.
 *
 * Usage in any screen:
 *   const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { favoriteService } from "../services/favorites";
import useAppStore from "../store/useAppStore";
import { Camera } from "../types/camera";

// ─── Context Shape ─────────────────────────────────────────────────────────────

interface FavoritesContextValue {
  /** Full camera objects that are favorited */
  favorites: Camera[];
  /** Set of favorited camera IDs — O(1) lookup */
  favoriteIds: Set<string>;
  loading: boolean;
  error: string | null;
  /** Re-fetch from server */
  refresh: () => Promise<void>;
  /**
   * Toggle favorite status.
   * - If not favorited → calls POST /api/Favorite/{id}
   * - If already favorited → calls DELETE /api/Favorite/{id}
   * Returns an error string on failure, or null on success.
   */
  toggleFavorite: (cameraId: string) => Promise<string | null>;
  isFavorite: (cameraId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const token = useAppStore((s) => s.token);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  const [favorites, setFavorites] = useState<Camera[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setFavorites([]);
      setFavoriteIds(new Set());
      return;
    }

    setLoading(true);
    setError(null);

    const result = await favoriteService.getFavorites(token);

    if (result.success && result.data) {
      setFavorites(result.data);
      setFavoriteIds(new Set(result.data.map((c) => c.id)));
    } else {
      setError(result.error ?? "Failed to load favorites");
    }

    setLoading(false);
  }, [isAuthenticated, token]);

  // Fetch once on mount / when auth changes
  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleFavorite = useCallback(
    async (cameraId: string): Promise<string | null> => {
      if (!isAuthenticated || !token) {
        return "You must be logged in to manage favorites.";
      }

      const alreadyFavorited = favoriteIds.has(cameraId);

      // Optimistic UI update
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (alreadyFavorited) {
          next.delete(cameraId);
        } else {
          next.add(cameraId);
        }
        return next;
      });

      if (alreadyFavorited) {
        setFavorites((prev) => prev.filter((c) => c.id !== cameraId));
      }

      // Call API
      const result = alreadyFavorited
        ? await favoriteService.removeFavorite(cameraId, token)
        : await favoriteService.addFavorite(cameraId, token);

      if (!result.success) {
        // Revert optimistic update on failure
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (alreadyFavorited) {
            next.add(cameraId);
          } else {
            next.delete(cameraId);
          }
          return next;
        });
        if (alreadyFavorited) {
          await refresh(); // Restore full list
        }
        return result.error ?? "An error occurred";
      }

      // On success, re-fetch to stay in sync with server
      await refresh();
      return null;
    },
    [isAuthenticated, token, favoriteIds, refresh],
  );

  const isFavorite = useCallback(
    (cameraId: string) => favoriteIds.has(cameraId),
    [favoriteIds],
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteIds,
        loading,
        error,
        refresh,
        toggleFavorite,
        isFavorite,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useFavorites(): FavoritesContextValue {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites must be used inside <FavoritesProvider>");
  }
  return ctx;
}
