import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FakeMap from "../../components/map/FakeMap";
import { mockRouteData } from "../../data/mockWeatherOverlay";
import { weatherService } from "../../services/weather";
import useAppStore from "../../store/useAppStore";

export default function RouteImpactScreen({ navigation }: any) {
  const cameras = useAppStore((s) => s.cameras);
  const token = useAppStore((s) => s.token);
  const [routeResult, setRouteResult] = useState<any>(null);
  const [latestWeather, setLatestWeather] = useState<any>(null);

  useEffect(() => {
    const loadWeatherData = async () => {
      const latestRes = await weatherService.getLatest(token || undefined);
      if (latestRes.success) {
        setLatestWeather(latestRes.data || null);
      }

      if (cameras.length < 2) {
        setRouteResult(null);
        return;
      }

      const points = cameras.slice(0, 4).map((camera: any) => ({
        lat: Number(camera.latitude),
        lng: Number(camera.longitude),
      }));

      const validPoints = points.filter(
        (p) => Number.isFinite(p.lat) && Number.isFinite(p.lng),
      );

      if (validPoints.length < 2) {
        setRouteResult(null);
        return;
      }

      const routeRes = await weatherService.checkRoute(
        validPoints,
        token || undefined,
      );

      if (routeRes.success) {
        setRouteResult(routeRes.data || null);
      } else {
        setRouteResult({ error: routeRes.error });
      }
    };

    loadWeatherData();
  }, [token, cameras]);

  const routeMessage = useMemo(() => {
    if (!routeResult) return null;
    if (typeof routeResult === "string") return routeResult;
    return (
      routeResult.message ||
      routeResult.summary ||
      routeResult.warning ||
      routeResult.error ||
      null
    );
  }, [routeResult]);

  const latestMessage = useMemo(() => {
    if (!latestWeather) return null;
    if (typeof latestWeather === "string") return latestWeather;
    return latestWeather.message || latestWeather.note || null;
  }, [latestWeather]);

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]}>
        <HStack className="items-center px-4 py-3 bg-white border-b border-gray-200">
          <Heading size="lg" className="text-gray-900 font-bold">
            Route Impact
          </Heading>
        </HStack>
      </SafeAreaView>

      <View className="h-64">
        {/* @ts-ignore - FakeMap component accepts flexible props */}
        <FakeMap {...({ cameras, showRoute: true, height: 250 } as any)} />
      </View>

      <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
        <Box className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <Text className="text-base font-semibold text-gray-900 mb-4">
            Route Summary
          </Text>
          <VStack>
            <HStack className="items-center justify-between py-2 border-b border-gray-200">
              <Text className="text-sm text-gray-600">Total Distance</Text>
              <Text className="text-sm font-medium text-gray-900">
                {mockRouteData.distance}
              </Text>
            </HStack>
            <HStack className="items-center justify-between py-2 border-b border-gray-200">
              <Text className="text-sm text-gray-600">Estimated Time</Text>
              <Text className="text-sm font-medium text-gray-900">
                {mockRouteData.duration}
              </Text>
            </HStack>
            <HStack className="items-center justify-between py-2">
              <Text className="text-sm text-gray-600">Weather Risk</Text>
              <Text className="text-sm font-medium text-gray-900">
                {routeResult ? "Detected" : "N/A"}
              </Text>
            </HStack>
          </VStack>
        </Box>

        <Text className="text-base font-semibold text-gray-900 mb-3">
          Weather Impact
        </Text>

        <Box className="bg-white rounded-xl border border-gray-200 p-4 mb-3">
          <HStack className="items-center justify-between mb-2">
            <Badge className="bg-blue-600 rounded-md">
              <BadgeText className="text-white font-semibold text-xs">
                LATEST WEATHER
              </BadgeText>
            </Badge>
          </HStack>
          <Text className="text-sm text-gray-600 leading-5">
            {latestMessage || "No latest weather message available."}
          </Text>
        </Box>

        <Box className="bg-white rounded-xl border border-gray-200 p-4">
          <HStack className="items-center justify-between mb-2">
            <Badge className="bg-orange-500 rounded-md">
              <BadgeText className="text-white font-semibold text-xs">
                ROUTE CHECK
              </BadgeText>
            </Badge>
          </HStack>
          <Text className="text-sm text-gray-600 leading-5">
            {routeMessage ||
              "No route weather analysis yet. Need at least 2 valid route points."}
          </Text>
        </Box>
      </ScrollView>
    </View>
  );
}
