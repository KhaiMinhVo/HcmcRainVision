import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFavorites } from "../../context/FavoritesContext";
import { cameraService } from "../../services/cameras";
import { locationService } from "../../services/location";
import { weatherService } from "../../services/weather";
import useAppStore from "../../store/useAppStore";
import { Camera } from "../../types/camera";

interface MenuItem {
  icon: string;
  label: string;
  subtitle?: string;
  badge?: number | string;
  badgeColor?: string;
  onPress: () => void;
}

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
}

function MenuSection({ title, items }: MenuSectionProps) {
  return (
    <VStack className="mb-6">
      <Text className="text-xs font-semibold text-gray-500 mb-2 tracking-wide uppercase">
        {title}
      </Text>
      <Box className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {items.map((item, index) => (
          <View key={item.label}>
            <TouchableOpacity onPress={item.onPress}>
              <HStack className="items-center py-3.5 px-4">
                <Text className="text-xl w-8">{item.icon}</Text>
                <VStack className="flex-1">
                  <Text className="text-base text-gray-900 font-medium">
                    {item.label}
                  </Text>
                  {item.subtitle && (
                    <Text className="text-xs text-gray-500 mt-0.5">
                      {item.subtitle}
                    </Text>
                  )}
                </VStack>
                {item.badge !== undefined && (
                  <Badge
                    className={`${item.badgeColor || "bg-gray-500"} rounded-full mr-2`}
                  >
                    <BadgeText className="text-white text-xs font-semibold">
                      {item.badge}
                    </BadgeText>
                  </Badge>
                )}
                <Text className="text-xl text-gray-400">›</Text>
              </HStack>
            </TouchableOpacity>
            {index < items.length - 1 && (
              <Divider className="border-gray-200" />
            )}
          </View>
        ))}
      </Box>
    </VStack>
  );
}

export default function ListHomeScreen({ navigation }: any) {
  const token = useAppStore((s) => s.token);
  const getCamerasByWeatherStatus = useAppStore(
    (s) => s.getCamerasByWeatherStatus,
  );

  // Location API (wards)
  const [wardCount, setWardCount] = useState<number>(0);
  const [wardNameById, setWardNameById] = useState<Record<string, string>>({});

  // Weather latest by cameraId (from /api/Weather/latest)
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [latestWeatherByCameraId, setLatestWeatherByCameraId] = useState<
    Record<string, { isRaining: boolean; confidence: number; timestamp: string }>
  >({});

  // Real API camera data
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [totalCameras, setTotalCameras] = useState(0);
  const [loadingCameras, setLoadingCameras] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Real API favorites data
  const {
    favorites,
    loading: loadingFavorites,
    refresh: refreshFavorites,
  } = useFavorites();

  const fetchCameras = useCallback(async () => {
    try {
      const result = await cameraService.getAllCameras();
      if (result.success && result.data) {
        setCameras(result.data);
        setTotalCameras(result.data.length);
      }
    } catch {
      // Keep previous data on error, do not crash
    } finally {
      setLoadingCameras(false);
      setRefreshing(false);
    }
  }, []);

  const fetchWards = useCallback(async () => {
    if (!token) return;
    const result = await locationService.getWards(token || undefined);
    if (result.success && result.data) {
      const map: Record<string, string> = {};
      result.data.forEach((w: any) => {
        if (w?.wardId) map[String(w.wardId)] = String(w.wardName || w.wardId);
      });
      setWardCount(result.data.length);
      setWardNameById(map);
    }
  }, [token]);

  const fetchWeatherLatest = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingWeather(true);
      const result = await weatherService.getLatest(token || undefined);
      if (!result.success || !Array.isArray(result.data)) return;

      // pick the latest record per cameraId by timestamp
      const map: Record<
        string,
        { isRaining: boolean; confidence: number; timestamp: string }
      > = {};

      result.data.forEach((item: any) => {
        const cameraId = String(item?.cameraId || "");
        const timestamp = String(item?.timestamp || "");
        if (!cameraId || !timestamp) return;

        const current = map[cameraId];
        if (!current || timestamp > current.timestamp) {
          map[cameraId] = {
            isRaining: Boolean(item?.isRaining),
            confidence: Number(item?.confidence ?? 0),
            timestamp,
          };
        }
      });

      setLatestWeatherByCameraId(map);
    } finally {
      setLoadingWeather(false);
    }
  }, [token]);

  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

  useEffect(() => {
    fetchWards();
  }, [fetchWards]);

  useEffect(() => {
    fetchWeatherLatest();
  }, [fetchWeatherLatest]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchCameras(),
      refreshFavorites(),
      fetchWards(),
      fetchWeatherLatest(),
    ]);
  }, [fetchCameras, refreshFavorites, fetchWards, fetchWeatherLatest]);

  // Derive counts from real data
  const onlineCount = cameras.filter((c) => c.status === "Active").length;
  const offlineCount = cameras.filter((c) => c.status === "Offline").length;
  const favoriteCount = favorites.length;
  const favoriteRainingCount = favorites.filter((c: any) => {
    const camId = String(c?.id || "");
    return Boolean(latestWeatherByCameraId[camId]?.isRaining);
  }).length;

  const favoriteWardStats = (() => {
    const byWard: Record<string, { total: number; raining: number }> = {};
    favorites.forEach((c: any) => {
      const wardId = String(c?.wardId || "");
      if (!wardId) return;
      if (!byWard[wardId]) byWard[wardId] = { total: 0, raining: 0 };
      byWard[wardId].total += 1;
      const camId = String(c?.id || "");
      if (camId && latestWeatherByCameraId[camId]?.isRaining) {
        byWard[wardId].raining += 1;
      }
    });

    const wards = Object.entries(byWard).map(([wardId, s]) => ({
      wardId,
      wardName: wardNameById[wardId] || wardId,
      total: s.total,
      raining: s.raining,
      isRaining: s.raining > 0,
    }));

    return {
      totalWards: wards.length,
      rainingWards: wards.filter((w) => w.isRaining).length,
      topRainingWard: wards
        .filter((w) => w.isRaining)
        .sort((a, b) => b.raining - a.raining)[0],
    };
  })();

  const badgeOrDash = (count: number, loading: boolean): number | string =>
    loading ? "…" : count;

  // These still come from mock store (rain status isn't in Camera API)
  const heavyCount = getCamerasByWeatherStatus("heavy").length;
  const mediumCount = getCamerasByWeatherStatus("medium").length;
  const lightCount = getCamerasByWeatherStatus("light").length;

  const cameraItems: MenuItem[] = [
    {
      icon: "📹",
      label: "All Cameras",
      subtitle: loadingCameras ? "Loading..." : `${totalCameras} cameras`,
      onPress: () => navigation.navigate("AllCamerasList"),
    },
    {
      icon: "🟢",
      label: "Online",
      badge: badgeOrDash(onlineCount, loadingCameras),
      badgeColor: "bg-green-500",
      onPress: () => navigation.navigate("OnlineCameras"),
    },
    {
      icon: "⚫",
      label: "Offline",
      badge: badgeOrDash(offlineCount, loadingCameras),
      badgeColor: "bg-gray-500",
      onPress: () => navigation.navigate("OfflineCameras"),
    },
    {
      icon: "⭐",
      label: "Favorites",
      subtitle: loadingWeather
        ? "Checking rain status..."
        : favoriteCount === 0
          ? "No favorites"
          : favoriteWardStats.totalWards === 0
            ? "No ward data"
            : favoriteWardStats.rainingWards > 0
              ? `☔ Raining in ${favoriteWardStats.rainingWards}/${favoriteWardStats.totalWards} wards`
              : `🌤 No rain in ${favoriteWardStats.totalWards} wards`,
      badge: badgeOrDash(favoriteCount, loadingFavorites),
      badgeColor: favoriteRainingCount > 0 ? "bg-red-600" : "bg-yellow-500",
      onPress: () => navigation.navigate("FavoriteCameras"),
    },
    {
      icon: "🧭",
      label: "Rain by ward (Favorites)",
      subtitle: loadingWeather
        ? "Loading..."
        : favoriteWardStats.rainingWards > 0
          ? `Top: ${favoriteWardStats.topRainingWard?.wardName ?? "—"}`
          : "No raining wards",
      onPress: () => navigation.navigate("FavoriteRainByWard"),
    },
    {
      icon: "💬",
      label: "Chatbot",
      subtitle: "Hỏi nhanh tình trạng mưa theo khu vực",
      onPress: () => navigation.navigate("Chatbot"),
    },
  ];

  const areaItems: MenuItem[] = [
    {
      icon: "🗺️",
      label: "All Areas",
      subtitle: token ? `${wardCount} wards` : "Login required",
      onPress: () => navigation.navigate("AllAreas"),
    },

  ];

  const weatherItems: MenuItem[] = [
    {
      icon: "⛈️",
      label: "Heavy Weather",
      badge: heavyCount,
      badgeColor: "bg-red-600",
      onPress: () => navigation.navigate("HeavyWeatherList"),
    },
    {
      icon: "🌧️",
      label: "Medium Weather",
      badge: mediumCount,
      badgeColor: "bg-yellow-500",
      onPress: () => navigation.navigate("MediumWeatherList"),
    },
    {
      icon: "🌦️",
      label: "Light Weather",
      badge: lightCount,
      badgeColor: "bg-blue-400",
      onPress: () => navigation.navigate("LightWeatherList"),
    },
  ];

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]}>
        <HStack className="items-center justify-between px-4 py-3 bg-white">
          <Heading size="xl" className="text-gray-900 font-bold">
            List
          </Heading>
          {(loadingCameras || loadingFavorites) && !refreshing && (
            <Spinner size="small" />
          )}
        </HStack>
      </SafeAreaView>

      <ScrollView
        className="flex-1 px-4 pt-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <MenuSection title="CAMERAS" items={cameraItems} />
        <MenuSection title="AREAS" items={areaItems} />
        {/* <MenuSection title="BY WEATHER STATUS" items={weatherItems} /> */}
        <View className="h-8" />
      </ScrollView>
    </View>
  );
}
