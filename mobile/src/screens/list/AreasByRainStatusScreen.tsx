import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { StatusBar } from "expo-status-bar";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CameraListItem from "../../components/list/CameraListItem";
import useAppStore from "../../store/useAppStore";

export default function AreasByRainStatusScreen({ navigation, route }: any) {
  const { area } = route.params || {};
  const cameras = useAppStore((s) => s.cameras);

  const areaCameras = cameras.filter(
    (c: any) => c.area === area?.name || c.areaId === area?.id,
  );

  const handleCameraPress = (camera: any) => {
    navigation.navigate("MapStack", {
      screen: "CameraDetailMap",
      params: { camera },
    });
  };

  const getWeatherLabel = (status: string) => {
    switch (status) {
      case "heavy":
        return "HEAVY WEATHER";
      case "medium":
        return "MEDIUM WEATHER";
      case "light":
        return "LIGHT WEATHER";
      default:
        return "CLEAR";
    }
  };

  const getWeatherColor = (status: string) => {
    switch (status) {
      case "heavy":
        return "bg-red-600";
      case "medium":
        return "bg-yellow-500";
      case "light":
        return "bg-blue-400";
      default:
        return "bg-gray-400";
    }
  };

  const areaStatus = (area?.weatherStatus ||
    area?.rainStatus ||
    "none") as string;

  const EmptyComponent = () => (
    <Center className="flex-1 px-8 py-16">
      <Text className="text-6xl mb-6">📹</Text>
      <Heading size="xl" className="text-gray-900 font-bold mb-3 text-center">
        No Cameras
      </Heading>
      <Text className="text-base text-gray-600 text-center leading-6">
        No cameras in this area
      </Text>
    </Center>
  );

  if (!area) {
    return (
      <View className="flex-1 bg-gray-50">
        <StatusBar style="dark" />
        <SafeAreaView edges={["top"]}>
          <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
            <Heading size="lg" className="text-gray-900 font-bold">
              Area
            </Heading>
          </HStack>
        </SafeAreaView>
        <Center className="flex-1 px-8">
          <Text className="text-6xl mb-6">🗺️</Text>
          <Heading
            size="xl"
            className="text-gray-900 font-bold mb-3 text-center"
          >
            Area Not Found
          </Heading>
          <Text className="text-base text-gray-600 text-center leading-6">
            Please select an area
          </Text>
        </Center>
      </View>
    );
  }

  const HeaderComponent = () => (
    <Box className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
      <VStack className="gap-2">
        <Text className="text-lg font-semibold text-gray-900">
          {area.fullName || area.name}
        </Text>
        <Text className="text-sm text-gray-600">{area.description}</Text>
        <HStack className="items-center justify-between mt-2">
          <Badge className={`${getWeatherColor(areaStatus)} rounded-md`}>
            <BadgeText className="text-white font-semibold text-xs">
              {getWeatherLabel(areaStatus)}
            </BadgeText>
          </Badge>
          <Text className="text-sm text-gray-500">
            {areaCameras.length} cameras
          </Text>
        </HStack>
      </VStack>
    </Box>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]}>
        <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <Heading size="lg" className="text-gray-900 font-bold">
            {area.name}
          </Heading>
        </HStack>
      </SafeAreaView>

      <FlatList
        data={areaCameras}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CameraListItem camera={item} onPress={handleCameraPress} />
        )}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={<HeaderComponent />}
        ListEmptyComponent={<EmptyComponent />}
      />
    </View>
  );
}
