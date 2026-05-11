import { useCallback, useEffect, useRef, useState } from "react";
import { cameraService } from "../services/cameras";
import { Camera } from "../types/camera";

type StatusFilter = "all" | "Active" | "Offline";

interface UseCamerasOptions {
  statusFilter?: StatusFilter;
  pageSize?: number;
  initialLoad?: boolean;
}

interface UseCamerasResult {
  cameras: Camera[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  total: number;
  hasMore: boolean;
  onRefresh: () => void;
  onLoadMore: () => void;
}

export function useCameras({
  statusFilter = "all",
  pageSize = 50,
  initialLoad = true,
}: UseCamerasOptions = {}): UseCamerasResult {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const loadingMore = useRef(false);

  const fetchPage = useCallback(
    async (pageNum: number, refresh = false) => {
      if (loadingMore.current && !refresh) return;
      loadingMore.current = true;
      try {
        setError(null);
        const result = await cameraService.getCameras({
          page: pageNum,
          pageSize,
        });
        if (!result.success || !result.data) {
          setError(result.error ?? "Failed to load cameras");
          return;
        }
        const allData = result.data.data;
        const filtered =
          statusFilter === "all"
            ? allData
            : allData.filter((c) => c.status === statusFilter);

        if (refresh || pageNum === 1) {
          setCameras(filtered);
        } else {
          setCameras((prev) => [...prev, ...filtered]);
        }
        setTotal(result.data.total);
        setHasMore(pageNum * pageSize < result.data.total);
        setPage(pageNum);
      } catch (err: any) {
        setError(err.message ?? "An unexpected error occurred");
      } finally {
        if (pageNum === 1) {
          setLoading(false);
          setRefreshing(false);
        } else {
          setLoading(false);
        }
        loadingMore.current = false;
      }
    },
    [statusFilter, pageSize],
  );

  useEffect(() => {
    if (!initialLoad) return;
    setLoading(true);
    setCameras([]);
    setPage(1);
    setHasMore(true);
    fetchPage(1, true);
  }, [fetchPage, initialLoad]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPage(1, true);
  }, [fetchPage]);

  const onLoadMore = useCallback(() => {
    if (!loading && !refreshing && hasMore) {
      fetchPage(page + 1);
    }
  }, [loading, refreshing, hasMore, page, fetchPage]);

  return {
    cameras,
    loading,
    refreshing,
    error,
    total,
    hasMore,
    onRefresh,
    onLoadMore,
  };
}
