import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT, UrlTile } from "react-native-maps";
import { SafeAreaView } from "react-native-safe-area-context";
import FilterButton from "../../components/map/FilterButton";
import FilterSheet from "../../components/map/FilterSheet";
import LocateButton from "../../components/map/LocateButton";
import { useFavorites } from "../../context/FavoritesContext";
import { cameraService } from "../../services/cameras";
import useAppStore from "../../store/useAppStore";
import { Camera } from "../../types/camera";

// TP.HCM coordinates
const HCMC_REGION = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.08,
  longitudeDelta: 0.08,
};

type RainStatusFilter = "HEAVY" | "MEDIUM" | "LIGHT" | "NONE" | null;

interface FilterState {
  rainStatus: RainStatusFilter;
  onlineOnly: boolean;
  favoritesOnly: boolean;
}

interface UserCoords {
  latitude: number;
  longitude: number;
}

const normalizePrediction = (value: unknown): string => {
  return typeof value === "string" ? value : "";
};

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export default function MapHomeScreen({ navigation }: any) {
  const mapRef = useRef<MapView>(null);
  const [mapReady, setMapReady] = useState(false);
  const [locating, setLocating] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<UserCoords | null>(
    null,
  );

  // API cameras
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [cameraLoading, setCameraLoading] = useState(true);

  const { favoriteIds } = useFavorites();
  const aiByCameraId = useAppStore((s: any) => s.aiByCameraId);
  const setAiForCamera = useAppStore((s: any) => s.setAiForCamera);
  const token = useAppStore((s) => s.token);

  // Filter states
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterState>({
    rainStatus: null,
    onlineOnly: false,
    favoritesOnly: false,
  });

  const handleMapReady = () => {
    setMapReady(true);
  };

  const runBulkAiCheck = useCallback(
    async (cameraList: Camera[]) => {
      try {
        const pending = cameraList.filter(
          (cam) => !aiByCameraId?.[String(cam.id)],
        );

        // Giới hạn số request đồng thời để giảm 502 từ backend/ngrok.
        const CONCURRENCY = 4;
        for (let i = 0; i < pending.length; i += CONCURRENCY) {
          const chunk = pending.slice(i, i + CONCURRENCY);
          await Promise.all(
            chunk.map(async (cam) => {
              const runOnce = async () => {
                const result = await cameraService.runAiTest(cam.id, {
                  saveWeatherLog: true,
                });
                const prediction = normalizePrediction(result.data?.prediction);
                if (result.success && prediction) {
                  setAiForCamera(cam.id, {
                    prediction,
                    confidenceScore:
                      typeof result.data?.confidenceScore === "string"
                        ? result.data.confidenceScore
                        : "",
                  });
                  return true;
                }
                return false;
              };

              try {
                const firstOk = await runOnce();
                if (firstOk) return;

                // Retry 1 lần cho lỗi 502 sau ~2.5 giây để tăng tỉ lệ thành công.
                await sleep(2500);
                await runOnce();
              } catch (error: any) {
                const status = error?.response?.status;
                if (status === 502) {
                  try {
                    await sleep(2500);
                    await runOnce();
                  } catch {
                    // bỏ qua lỗi sau retry
                  }
                }
                // bỏ qua lỗi từng camera, không chặn cả batch
              }
            }),
          );
        }
      } catch {
        // im lặng nếu bulk AI fail, map vẫn hoạt động bình thường
      }
    },
    [aiByCameraId, setAiForCamera],
  );

  // Fetch cameras from API
  const fetchCameras = useCallback(async () => {
    setCameraLoading(true);
    const result = await cameraService.getAllCameras();
    if (result.success && result.data) {
      setCameras(result.data);
    }
    setCameraLoading(false);
  }, []);

  // Khi đã có token (sau đăng nhập) và danh sách cameras, tự động chạy AI cho tất cả camera
  useEffect(() => {
    if (!token || cameras.length === 0) return;
    runBulkAiCheck(cameras);
  }, [token, cameras, runBulkAiCheck]);

  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

  // Filter cameras based on applied filters
  const filteredCameras = useMemo(() => {
    let filtered = [...cameras];

    if (appliedFilters.onlineOnly) {
      filtered = filtered.filter((cam) => cam.status === "Active");
    }

    if (appliedFilters.favoritesOnly) {
      filtered = filtered.filter((cam) => favoriteIds.has(cam.id));
    }

    return filtered;
  }, [cameras, appliedFilters, favoriteIds]);

  const handleFilterPress = () => {
    setFilterSheetVisible(true);
  };

  const handleFilterClose = () => {
    setFilterSheetVisible(false);
  };

  const handleFilterApply = (filters: FilterState) => {
    setAppliedFilters(filters);
  };

  const getMarkerColor = (status: string) => {
    return status === "Active" ? "#22c55e" : "#6b7280";
  };

  const handleLocateMe = async () => {
    try {
      setLocating(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Please enable location permission in your device settings to use this feature.",
          [{ text: "OK" }],
        );
        setLocating(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = location.coords;
      setCurrentLocation({ latitude, longitude });

      if (mapRef.current) {
        mapRef.current.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          },
          1000,
        );
      }

      setLocating(false);
    } catch (error) {
      console.error("Location error:", error);
      Alert.alert("Error", "Cannot get current location. Please try again.", [
        { text: "OK" },
      ]);
      setLocating(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      <MapView
        ref={mapRef}
        style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
        provider={PROVIDER_DEFAULT}
        initialRegion={HCMC_REGION}
        onMapReady={handleMapReady}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        toolbarEnabled={false}
        loadingEnabled={true}
        loadingIndicatorColor="#3b82f6"
        loadingBackgroundColor="#f9fafb"
      >
        <UrlTile
          urlTemplate="https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
          maximumZ={19}
        />

        {filteredCameras.map((camera) => {
          const ai = aiByCameraId?.[String(camera.id)];
          const prediction = normalizePrediction(ai?.prediction);
          const aiIcon = ai
            ? prediction.toUpperCase().includes("CO MUA")
              ? "☔"
              : "🌤"
            : null;

          return (
            <Marker
              key={camera.id}
              coordinate={{
                latitude: camera.latitude,
                longitude: camera.longitude,
              }}
              title={camera.name}
              description={
                camera.ward ? `${camera.ward.name}` : `ID: ${camera.id}`
              }
              pinColor={getMarkerColor(camera.status)}
              onCalloutPress={() =>
                navigation.navigate("CameraDetailMap", { camera })
              }
            >
              <View
                style={{
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: "white",
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    borderRadius: 12,
                    marginBottom: 2,
                    minHeight: 20,
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 12 }}>
                    {aiIcon ? aiIcon : "📷"}
                  </Text>
                </View>
              </View>
            </Marker>
          );
        })}
      </MapView>

      <View
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          justifyContent: "space-between",
        }}
        pointerEvents="box-none"
      >
        <SafeAreaView edges={["top"]} pointerEvents="box-none">
          <View className="mx-2">
            <View className="bg-white/95 rounded-2xl px-4 py-3">
              <HStack className="items-center justify-between">
                <VStack>
                  <Heading size="lg" className="text-gray-900 font-bold">
                    Rain Map
                  </Heading>
                  <Text className="text-sm text-gray-600 mt-0.5">HCM City</Text>
                </VStack>
                <HStack className="items-center gap-3">
                  {cameraLoading && <Spinner size="small" />}
                  {!cameraLoading && (
                    <Text className="text-xs text-gray-500">
                      {filteredCameras.length} cameras
                    </Text>
                  )}
                  <TouchableOpacity
                    onPress={() => navigation.navigate("Settings")}
                    className="w-10 h-10 items-center justify-center"
                  >
                    <Text className="text-2xl">⚙️</Text>
                  </TouchableOpacity>
                </HStack>
              </HStack>
            </View>
          </View>
        </SafeAreaView>

        <View
          className="absolute top-32 left-4"
          style={{ zIndex: 5 }}
          pointerEvents="box-none"
        >
          <FilterButton onPress={handleFilterPress} />
        </View>

        <View
          className="absolute bottom-24 right-4"
          style={{ zIndex: 5 }}
          pointerEvents="box-none"
        >
          <LocateButton onPress={handleLocateMe} loading={locating} />
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("Chatbot")}
          style={{
            position: "absolute",
            bottom: 90,
            left: 16,
            zIndex: 6,
          }}
          className="w-12 h-12 rounded-2xl bg-white/95 items-center justify-center border border-gray-200"
        >
          <Text className="text-2xl">💬</Text>
        </TouchableOpacity>
      </View>

      <FilterSheet
        visible={filterSheetVisible}
        onClose={handleFilterClose}
        onApply={handleFilterApply}
        initialFilters={appliedFilters}
      />
    </View>
  );
}
