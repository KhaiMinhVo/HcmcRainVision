import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft } from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import { FlatList, RefreshControl, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFavorites } from "../../context/FavoritesContext";
import { locationService } from "../../services/location";
import { weatherService } from "../../services/weather";
import useAppStore from "../../store/useAppStore";

type WardRow = {
  wardId: string;
  wardName: string;
  districtName: string;
  favoriteCameras: number;
  rainingCameras: number;
  isRaining: boolean;
};

const normalizeStr = (v: unknown) => (typeof v === "string" ? v : "");

export default function FavoriteRainByWardScreen({ navigation }: any) {
  const token = useAppStore((s) => s.token);
  const { favorites, loading: loadingFavorites, refresh: refreshFavorites } =
    useFavorites();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [wardMetaById, setWardMetaById] = useState<
    Record<string, { wardName: string; districtName: string }>
  >({});

  const [latestWeatherByCameraId, setLatestWeatherByCameraId] = useState<
    Record<string, { isRaining: boolean; timestamp: string }>
  >({});

  const loadAll = async () => {
    if (!token) return;
    try {
      setError(null);
      setLoading(true);

      const [wardsRes, weatherRes] = await Promise.all([
        locationService.getWards(token || undefined),
        weatherService.getLatest(token || undefined),
        refreshFavorites(),
      ]);

      if (wardsRes.success && wardsRes.data) {
        const map: Record<string, { wardName: string; districtName: string }> =
          {};
        wardsRes.data.forEach((w: any) => {
          const wardId = normalizeStr(w?.wardId);
          if (!wardId) return;
          map[wardId] = {
            wardName: normalizeStr(w?.wardName) || wardId,
            districtName: normalizeStr(w?.districtName),
          };
        });
        setWardMetaById(map);
      }

      if (weatherRes.success && Array.isArray(weatherRes.data)) {
        const map: Record<string, { isRaining: boolean; timestamp: string }> =
          {};
        weatherRes.data.forEach((item: any) => {
          const cameraId = normalizeStr(item?.cameraId);
          const timestamp = normalizeStr(item?.timestamp);
          if (!cameraId || !timestamp) return;
          const cur = map[cameraId];
          if (!cur || timestamp > cur.timestamp) {
            map[cameraId] = { isRaining: Boolean(item?.isRaining), timestamp };
          }
        });
        setLatestWeatherByCameraId(map);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load ward rain status");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const rows: WardRow[] = useMemo(() => {
    const byWard: Record<
      string,
      {
        wardId: string;
        favoriteCameras: number;
        rainingCameras: number;
      }
    > = {};

    favorites.forEach((cam: any) => {
      const wardId = normalizeStr(cam?.wardId);
      if (!wardId) return;
      if (!byWard[wardId]) {
        byWard[wardId] = { wardId, favoriteCameras: 0, rainingCameras: 0 };
      }
      byWard[wardId].favoriteCameras += 1;
      const camId = normalizeStr(cam?.id);
      if (camId && latestWeatherByCameraId[camId]?.isRaining) {
        byWard[wardId].rainingCameras += 1;
      }
    });

    return Object.values(byWard)
      .map((x) => {
        const meta = wardMetaById[x.wardId];
        const wardName = meta?.wardName || x.wardId;
        const districtName = meta?.districtName || "";
        const isRaining = x.rainingCameras > 0;
        return {
          wardId: x.wardId,
          wardName,
          districtName,
          favoriteCameras: x.favoriteCameras,
          rainingCameras: x.rainingCameras,
          isRaining,
        };
      })
      .sort((a, b) => {
        // raining wards first, then by raining count desc
        if (a.isRaining !== b.isRaining) return a.isRaining ? -1 : 1;
        return b.rainingCameras - a.rainingCameras;
      });
  }, [favorites, latestWeatherByCameraId, wardMetaById]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAll();
  };

  const Empty = () => (
    <Center className="flex-1 px-8 py-16">
      <Text className="text-6xl mb-6">⭐</Text>
      <Heading size="xl" className="text-gray-900 font-bold mb-3 text-center">
        No Favorites
      </Heading>
      <Text className="text-base text-gray-600 text-center leading-6">
        Add favorite cameras to see rain status by ward.
      </Text>
    </Center>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]}>
        <HStack className="items-center px-4 py-3 bg-white border-b border-gray-200">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3 p-1"
          >
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Heading size="lg" className="text-gray-900 font-bold flex-1">
            Favorite rain by ward
          </Heading>
          {(loading || loadingFavorites) && <Spinner size="small" />}
        </HStack>
      </SafeAreaView>

      <FlatList
        data={rows}
        keyExtractor={(item) => item.wardId}
        contentContainerStyle={{ padding: 16, paddingTop: 12 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <Box className="bg-white rounded-xl p-4 border border-gray-200 mb-3">
            <HStack className="items-start justify-between">
              <VStack className="flex-1 mr-3">
                <Text className="text-base font-semibold text-gray-900">
                  {item.wardName}
                </Text>
                {!!item.districtName && (
                  <Text className="text-sm text-gray-600 mt-0.5">
                    {item.districtName}
                  </Text>
                )}
                <Text className="text-xs text-gray-500 mt-1">
                  {item.wardId}
                </Text>
              </VStack>
              <VStack className="items-end">
                <Text className="text-lg">{item.isRaining ? "☔" : "🌤"}</Text>
                <Text className="text-xs text-gray-600 mt-1">
                  {item.rainingCameras}/{item.favoriteCameras} raining
                </Text>
              </VStack>
            </HStack>
          </Box>
        )}
        ListEmptyComponent={
          loading ? (
            <Center className="flex-1 px-8 py-16">
              <Text className="text-sm text-gray-600">Loading...</Text>
            </Center>
          ) : error ? (
            <Center className="flex-1 px-8 py-16">
              <Text className="text-sm text-gray-600">{error}</Text>
              <TouchableOpacity
                onPress={loadAll}
                className="mt-4 bg-blue-600 px-5 py-2.5 rounded-lg"
              >
                <Text className="text-white font-medium">Retry</Text>
              </TouchableOpacity>
            </Center>
          ) : (
            <Empty />
          )
        }
      />
    </View>
  );
}

