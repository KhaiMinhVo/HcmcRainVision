import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { StatusBar } from "expo-status-bar";
import { MapPin, Search } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { cameraService } from "../../services/cameras";
import { Camera } from "../../types/camera";

export default function AllCamerasMapScreen({ navigation }: any) {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [filteredCameras, setFilteredCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [total, setTotal] = useState(0);

  // Fetch all cameras
  const fetchCameras = useCallback(async () => {
    try {
      setError(null);
      const response = await cameraService.getAllCameras();

      if (response.success && response.data) {
        setCameras(response.data);
        setFilteredCameras(response.data);
        setTotal(response.data.length);
      } else {
        setError(response.error || "Failed to load cameras");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCameras(cameras);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = cameras.filter(
        (camera) =>
          camera.name.toLowerCase().includes(query) ||
          camera.id.toString().includes(query),
      );
      setFilteredCameras(filtered);
    }
  }, [searchQuery, cameras]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCameras();
  }, [fetchCameras]);

  const handleCameraPress = (camera: Camera) => {
    navigation.navigate("CameraDetailMap", { camera });
  };

  const renderCameraCard = ({ item }: { item: Camera }) => {
    const isOnline = item.status === "Active";

    return (
      <TouchableOpacity
        onPress={() => handleCameraPress(item)}
        activeOpacity={0.7}
      >
        <Box className="bg-white rounded-xl border border-gray-200 p-4 mb-3 mx-4">
          <HStack className="items-start justify-between mb-2">
            <VStack className="flex-1 mr-2">
              <Heading size="sm" className="text-gray-900 font-semibold mb-1">
                {item.name}
              </Heading>
              <Text className="text-xs text-gray-500 mb-1">ID: {item.id}</Text>
              <HStack className="items-center gap-1">
                <MapPin size={12} color="#6B7280" />
                <Text className="text-xs text-gray-600">
                  Lat: {item.latitude.toFixed(6)} • Lng:{" "}
                  {item.longitude.toFixed(6)}
                </Text>
              </HStack>
            </VStack>
            <Badge
              className={`${isOnline ? "bg-green-600" : "bg-gray-500"} rounded-md`}
            >
              <BadgeText className="text-white font-semibold text-xs">
                {isOnline ? "ACTIVE" : "OFFLINE"}
              </BadgeText>
            </Badge>
          </HStack>

          <HStack className="items-center gap-2 mt-2 pt-2 border-t border-gray-100">
            <Box
              className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
            />
            <Text className="text-xs text-gray-600">
              {isOnline ? "Online" : "Offline"}
            </Text>
          </HStack>
        </Box>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;

    return (
      <View className="flex-1 items-center justify-center px-8 py-16">
        <Text className="text-4xl mb-4">📷</Text>
        <Heading size="lg" className="text-gray-900 font-bold text-center mb-2">
          {searchQuery ? "No cameras found" : "No cameras available"}
        </Heading>
        <Text className="text-sm text-gray-600 text-center">
          {searchQuery
            ? "Try adjusting your search term"
            : "There are no cameras in the system yet"}
        </Text>
      </View>
    );
  };

  const renderErrorState = () => (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-4xl mb-4">⚠️</Text>
      <Heading size="lg" className="text-gray-900 font-bold text-center mb-2">
        Failed to load cameras
      </Heading>
      <Text className="text-sm text-gray-600 text-center mb-4">{error}</Text>
      <TouchableOpacity
        onPress={fetchCameras}
        className="bg-blue-600 px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-medium">Retry</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50">
        <StatusBar style="dark" />
        <SafeAreaView edges={["top"]}>
          <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
            <Heading size="lg" className="text-gray-900 font-bold">
              All Cameras
            </Heading>
          </HStack>
        </SafeAreaView>
        <View className="flex-1 items-center justify-center">
          <Spinner size="large" />
          <Text className="text-gray-600 mt-4">Loading cameras...</Text>
        </View>
      </View>
    );
  }

  if (error && cameras.length === 0) {
    return (
      <View className="flex-1 bg-gray-50">
        <StatusBar style="dark" />
        <SafeAreaView edges={["top"]}>
          <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
            <Heading size="lg" className="text-gray-900 font-bold">
              All Cameras
            </Heading>
          </HStack>
        </SafeAreaView>
        {renderErrorState()}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]}>
        <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <Heading size="lg" className="text-gray-900 font-bold">
            All Cameras
          </Heading>
          <Text className="text-sm text-gray-600">{total} total</Text>
        </HStack>

        {/* Search Bar */}
        <View className="px-4 py-3 bg-white border-b border-gray-200">
          <Input className="bg-gray-50 border-gray-200">
            <View className="pl-3">
              <Search size={16} color="#6B7280" />
            </View>
            <InputField
              placeholder="Search cameras..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              className="text-sm"
            />
          </Input>
        </View>
      </SafeAreaView>

      <FlatList
        data={filteredCameras}
        renderItem={renderCameraCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingVertical: 16 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563EB"
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}
