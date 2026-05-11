import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { StatusBar } from "expo-status-bar";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CameraListItem from "../../components/list/CameraListItem";
import useAppStore from "../../store/useAppStore";

export default function HeavyRainListScreen({ navigation }: any) {
  const getCamerasByWeatherStatus = useAppStore(
    (s) => s.getCamerasByWeatherStatus,
  );
  const heavyRainCameras = getCamerasByWeatherStatus("heavy");

  const handleCameraPress = (camera: any) => {
    navigation.navigate("MapStack", {
      screen: "CameraDetailMap",
      params: { camera },
    });
  };

  const EmptyComponent = () => (
    <Center className="flex-1 px-8 py-16">
      <Text className="text-6xl mb-6">⛈️</Text>
      <Heading size="xl" className="text-gray-900 font-bold mb-3 text-center">
        No Heavy Weather
      </Heading>
      <Text className="text-base text-gray-600 text-center leading-6">
        No cameras detecting heavy weather
      </Text>
    </Center>
  );

  const HeaderComponent = () => (
    <HStack className="items-center mb-4">
      <Box className="w-3 h-3 rounded-full bg-red-600 mr-2" />
      <Text className="text-sm text-gray-600">
        Heavy weather detected - Use caution
      </Text>
    </HStack>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]}>
        <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <Heading size="lg" className="text-gray-900 font-bold">
            Heavy Weather Areas
          </Heading>
          <Text className="text-sm text-gray-600">
            {heavyRainCameras.length} cameras
          </Text>
        </HStack>
      </SafeAreaView>

      <FlatList
        data={heavyRainCameras}
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
