import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FakeMap from "../../components/map/FakeMap";
import HeatLegendCard from "../../components/map/HeatLegendCard";
import { weatherService } from "../../services/weather";
import useAppStore from "../../store/useAppStore";

export default function HeatmapScreen({ navigation }: any) {
  const areas = useAppStore((s) => s.areas);
  const token = useAppStore((s) => s.token);
  const [heatmapPoints, setHeatmapPoints] = useState<any[]>([]);
  const [heatmapError, setHeatmapError] = useState<string | null>(null);

  useEffect(() => {
    const loadHeatmap = async () => {
      const result = await weatherService.getHeatmap(token || undefined);
      if (result.success) {
        setHeatmapPoints(result.data || []);
        setHeatmapError(null);
      } else {
        setHeatmapError(result.error || "Failed to load weather heatmap");
      }
    };

    loadHeatmap();
  }, [token]);

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]}>
        <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <Heading size="lg" className="text-gray-900 font-bold">
            Heatmap View
          </Heading>
        </HStack>
      </SafeAreaView>

      <View className="flex-1">
        {/* @ts-ignore - FakeMap component accepts flexible props */}
        <FakeMap {...({ areas, showHeatmap: true } as any)} />
      </View>

      <View className="absolute right-4 top-32 bottom-32">
        <HeatLegendCard {...({} as any)} />
      </View>

      <Box className="absolute bottom-6 left-4 right-4 bg-white rounded-xl p-4 border border-gray-200">
        <Text className="text-base font-semibold text-gray-900 mb-2">
          Weather Intensity Overview
        </Text>
        <Text className="text-sm text-gray-600 leading-5">
          Weather heatmap points: {heatmapPoints.length}
          {heatmapError ? ` (${heatmapError})` : ""}
        </Text>
      </Box>
    </View>
  );
}
