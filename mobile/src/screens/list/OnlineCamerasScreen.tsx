import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, MapPin } from "lucide-react-native";
import { FlatList, RefreshControl, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CameraStreamPreview from "../../components/map/CameraStreamPreview";
import { useCameras } from "../../hooks/useCameras";
import { Camera } from "../../types/camera";

export default function OnlineCamerasScreen({ navigation }: any) {
  const { cameras, loading, refreshing, error, onRefresh, onLoadMore } =
    useCameras({ statusFilter: "Active", pageSize: 50 });

  const handleCameraPress = (camera: Camera) => {
    navigation.navigate("MapStack", {
      screen: "CameraDetailMap",
      params: { camera },
    });
  };

  const renderCamera = ({ item }: { item: Camera }) => (
    <TouchableOpacity
      onPress={() => handleCameraPress(item)}
      activeOpacity={0.7}
    >
      <Box className="bg-white rounded-xl border border-gray-200 mb-3 mx-4 overflow-hidden">
        {/* Stream preview thumbnail */}
        <View style={{ height: 130 }}>
          <CameraStreamPreview
            streamUrl={item.streamUrl}
            status={item.status}
            name={item.name}
          />
        </View>
        <View className="p-4">
          <HStack className="items-start justify-between mb-2">
            <VStack className="flex-1 mr-2">
              <Heading size="sm" className="text-gray-900 font-semibold mb-1">
                {item.name}
              </Heading>
              <Text className="text-xs text-gray-500 mb-1">ID: {item.id}</Text>
              <HStack className="items-center gap-1">
                <MapPin size={12} color="#6B7280" />
                <Text className="text-xs text-gray-600">
                  {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                </Text>
              </HStack>
            </VStack>
            <Badge className="bg-green-600 rounded-md">
              <BadgeText className="text-white font-semibold text-xs">
                ACTIVE
              </BadgeText>
            </Badge>
          </HStack>
          <HStack className="items-center gap-2 pt-2 border-t border-gray-100">
            <Box className="w-2 h-2 rounded-full bg-green-500" />
            <Text className="text-xs text-gray-600">Online — streaming</Text>
          </HStack>
        </View>
      </Box>
    </TouchableOpacity>
  );

  if (loading && cameras.length === 0) {
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
              Online Cameras
            </Heading>
          </HStack>
        </SafeAreaView>
        <View className="flex-1 items-center justify-center">
          <Spinner size="large" />
          <Text className="text-gray-600 mt-4">Loading...</Text>
        </View>
      </View>
    );
  }

  if (error && cameras.length === 0) {
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
              Online Cameras
            </Heading>
          </HStack>
        </SafeAreaView>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-4">⚠️</Text>
          <Heading
            size="lg"
            className="text-gray-900 font-bold text-center mb-2"
          >
            Failed to load
          </Heading>
          <Text className="text-sm text-gray-600 text-center mb-4">
            {error}
          </Text>
          <TouchableOpacity
            onPress={onRefresh}
            className="bg-blue-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-medium">Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
            Online Cameras
          </Heading>
          <Text className="text-sm text-gray-600">{cameras.length} online</Text>
        </HStack>
      </SafeAreaView>

      <FlatList
        data={cameras}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCamera}
        contentContainerStyle={{ paddingVertical: 12 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <Center className="flex-1 px-8 py-16">
            <Text className="text-6xl mb-6">🟢</Text>
            <Heading
              size="xl"
              className="text-gray-900 font-bold mb-3 text-center"
            >
              No Online Cameras
            </Heading>
            <Text className="text-base text-gray-600 text-center leading-6">
              All cameras are currently offline
            </Text>
          </Center>
        }
      />
    </View>
  );
}
