import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft } from "lucide-react-native";
import { useEffect, useState } from "react";
import { FlatList, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CameraListItem from "../../components/list/CameraListItem";
import { cameraService } from "../../services/cameras";
import useAppStore from "../../store/useAppStore";
import type { Camera } from "../../types/camera";

const toRad = (deg: number) => (deg * Math.PI) / 180;
const distanceKm = (
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number },
) => {
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const x =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLng / 2) * Math.sin(dLng / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  return R * c;
};

export default function NearbyCamerasScreen({ navigation }: any) {
  const token = useAppStore((s) => s.token);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const handleCameraPress = (camera: any) => {
    navigation.navigate("MapStack", {
      screen: "CameraDetailMap",
      params: { camera },
    });
  };

  const loadNearby = async () => {
    try {
      setLoading(true);
      setError(null);
      setPermissionDenied(false);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setPermissionDenied(true);
        setCameras([]);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const result = await cameraService.getAllCameras();

      if (!result.success || !result.data) {
        setError(result.error || "Failed to load nearby cameras");
        setCameras([]);
        return;
      }

      const userPos = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };

      const nearby = result.data
        .map((cam: any) => {
          const km = distanceKm(userPos, {
            latitude: cam.latitude,
            longitude: cam.longitude,
          });
          return { ...cam, distance: Number(km.toFixed(2)) };
        })
        .sort((a: any, b: any) => Number(a.distance) - Number(b.distance))
        .slice(0, 50); // giới hạn để list mượt

      setCameras(nearby);
    } catch (e: any) {
      setError(e?.message || "Failed to load nearby cameras");
      setCameras([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNearby();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const EmptyComponent = () => (
    <Center className="flex-1 px-8 py-16">
      <Text className="text-6xl mb-6">📍</Text>
      <Heading size="xl" className="text-gray-900 font-bold mb-3 text-center">
        {permissionDenied ? "Location Required" : "No Nearby Cameras"}
      </Heading>
      <Text className="text-base text-gray-600 text-center mb-8 leading-6">
        {permissionDenied
          ? "Enable location to see nearby cameras"
          : "No cameras found near your current location"}
      </Text>
      <Button
        size="lg"
        className="bg-blue-600 rounded-xl"
        onPress={loadNearby}
      >
        <ButtonText className="text-white font-semibold">
          {permissionDenied ? "Try Again" : "Refresh"}
        </ButtonText>
      </Button>
    </Center>
  );

  const HeaderComponent = () => (
    <Text className="text-sm text-gray-500 mb-4">
      Sorted by distance from your location
    </Text>
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
            Nearby Cameras
          </Heading>
          {loading && <Spinner size="small" />}
        </HStack>
      </SafeAreaView>

      <FlatList
        data={cameras}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CameraListItem
            camera={item as any}
            onPress={handleCameraPress}
            showDistance
          />
        )}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<HeaderComponent />}
        ListEmptyComponent={
          loading ? (
            <Center className="flex-1 px-8 py-16">
              <Text className="text-sm text-gray-600">Loading...</Text>
            </Center>
          ) : error ? (
            <Center className="flex-1 px-8 py-16">
              <Text className="text-sm text-gray-600">{error}</Text>
              <Button
                size="lg"
                className="bg-blue-600 rounded-xl mt-4"
                onPress={loadNearby}
              >
                <ButtonText className="text-white font-semibold">Retry</ButtonText>
              </Button>
            </Center>
          ) : (
            <EmptyComponent />
          )
        }
      />
    </View>
  );
}
