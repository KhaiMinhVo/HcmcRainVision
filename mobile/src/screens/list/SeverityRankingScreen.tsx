import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft } from "lucide-react-native";
import { FlatList, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AreaListItem from "../../components/list/AreaListItem";
import useAppStore from "../../store/useAppStore";

export default function SeverityRankingScreen({ navigation }: any) {
  const areas = useAppStore((s) => s.areas);

  // Sort by severity (heavy > medium > light > none)
  const sortedAreas = [...areas].sort((a: any, b: any) => {
    const order: Record<string, number> = {
      heavy: 0,
      medium: 1,
      light: 2,
      none: 3,
    };
    const aStatus = a.weatherStatus || a.rainStatus || "none";
    const bStatus = b.weatherStatus || b.rainStatus || "none";
    return (order[aStatus] || 3) - (order[bStatus] || 3);
  });

  const handleAreaPress = (area: any) => {
    navigation.navigate("AreasByWeatherStatus", { area });
  };

  const HeaderComponent = () => (
    <Text className="text-sm text-gray-500 mb-4">
      Areas ranked by weather intensity
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
            Severity Ranking
          </Heading>
        </HStack>
      </SafeAreaView>

      <FlatList
        data={sortedAreas}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <HStack className="items-start">
            <Text className="text-lg font-bold text-gray-900 w-10 pt-4">
              #{index + 1}
            </Text>
            <Box className="flex-1">
              <AreaListItem area={item} onPress={handleAreaPress} />
            </Box>
          </HStack>
        )}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<HeaderComponent />}
      />
    </View>
  );
}
