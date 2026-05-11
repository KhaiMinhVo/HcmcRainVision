import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, Heart } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFavorites } from "../../context/FavoritesContext";
import { cameraService } from "../../services/cameras";
import useAppStore from "../../store/useAppStore";
import { Camera } from "../../types/camera";

interface WeatherAiResult {
  prediction: string;
  confidenceScore: string;
}

const normalizePrediction = (value: unknown): string => {
  return typeof value === "string" ? value : "";
};

export default function CameraDetailMapScreen({ navigation, route }: any) {
  const { camera } = route.params || {};
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const user = useAppStore((s: any) => s.user);
  const isAdmin = user?.role === "Admin";
  const setAiForCamera = useAppStore((s: any) => s.setAiForCamera);
  const { isFavorite, toggleFavorite } = useFavorites();
  const [favLoading, setFavLoading] = useState(false);
  const [cameraData, setCameraData] = useState<Camera | null>(
    (camera as Camera) || null,
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<WeatherAiResult | null>(null);

  useEffect(() => {
    const loadDetail = async () => {
      if (!cameraData?.id) return;
      try {
        const result = await cameraService.getCameras({
          page: 1,
          pageSize: 10,
          search: String(cameraData.id),
        });
        if (result.success && result.data && result.data.data.length > 0) {
          // lấy bản ghi khớp id nhất
          const found =
            result.data.data.find((c) => c.id === cameraData.id) ||
            result.data.data[0];
          setCameraData(found);
        }
      } catch {
        // giữ nguyên cameraData hiện tại nếu lỗi
      }
    };

    loadDetail();
  }, [cameraData?.id]);

  if (!cameraData) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar style="dark" />
        <SafeAreaView edges={["top"]}>
          <HStack className="items-center px-4 py-3 bg-white border-b border-gray-200">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="mr-3"
            >
              <ChevronLeft size={24} color="#111827" />
            </TouchableOpacity>
            <Heading size="lg" className="text-gray-900 font-bold">
              Camera Detail
            </Heading>
          </HStack>
        </SafeAreaView>
        <View className="flex-1 items-center justify-center">
          <Text className="text-4xl mb-4">📷</Text>
          <Heading size="lg" className="text-gray-900 font-bold mb-2">
            Camera not found
          </Heading>
          <Text className="text-gray-600">
            The requested camera does not exist
          </Text>
        </View>
      </View>
    );
  }

  const typedCamera = cameraData as Camera;
  const isOnline = typedCamera.status === "Active";
  const favorited = isFavorite(typedCamera.id);

  // Ưu tiên dùng streamUrl (trả về trực tiếp từ /api/Camera).
  // Nếu không có, fallback sang stream đầu tiên trong mảng streams (nếu backend trả dạng đó).
  const previewUrl =
    (typedCamera as any).streamUrl ||
    (typedCamera.streams && typedCamera.streams[0]
      ? typedCamera.streams[0].streamUrl
      : null);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      Alert.alert("Login Required", "Please log in to manage favorites.");
      return;
    }
    setFavLoading(true);
    const err = await toggleFavorite(typedCamera.id);
    setFavLoading(false);
    if (err) {
      Alert.alert("Error", err);
    }
  };

  const handleDeleteCamera = () => {
    Alert.alert(
      "Delete Camera",
      "Are you sure you want to delete this camera? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const res = await cameraService.deleteCamera(typedCamera.id);
            if (res.success) {
              Alert.alert("Success", "Camera deleted successfully.");
              navigation.goBack();
            } else {
              Alert.alert("Error", res.error || "Failed to delete camera.");
            }
          }
        }
      ]
    );
  };

  const streamUrl = typedCamera.streamUrl;
  const streams = typedCamera.streams || [];
  const statusLogs = typedCamera.statusLogs || [];

  const handleCheckWeatherAI = async () => {
    setAiLoading(true);
    try {
      const result = await cameraService.runAiTest(typedCamera.id, {
        saveWeatherLog: true,
      });
      if (!result.success || !result.data) {
        Alert.alert(
          "AI Error",
          result.error || "Failed to check weather via AI.",
        );
      } else {
        const prediction = normalizePrediction(result.data.prediction);
        if (!prediction) {
          Alert.alert("AI Error", "AI response is missing prediction.");
          return;
        }
        const confidenceScore =
          typeof result.data.confidenceScore === "string"
            ? result.data.confidenceScore
            : "";
        setAiResult({ prediction, confidenceScore });
        setAiForCamera(typedCamera.id, { prediction, confidenceScore });
      }
    } catch (err: any) {
      Alert.alert(
        "AI Error",
        err?.message || "Failed to check weather via AI.",
      );
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]}>
        <HStack className="items-center px-4 py-3 bg-white border-b border-gray-200">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="mr-3"
          >
            <ChevronLeft size={24} color="#111827" />
          </TouchableOpacity>
          <Heading
            size="lg"
            className="text-gray-900 font-bold flex-1"
            numberOfLines={1}
          >
            {typedCamera.name}
          </Heading>
          {/* Favorite button */}
          <TouchableOpacity
            onPress={handleToggleFavorite}
            disabled={favLoading}
            className="ml-2 p-2"
          >
            {favLoading ? (
              <Spinner size="small" />
            ) : (
              <Heart
                size={22}
                color={favorited ? "#ef4444" : "#9ca3af"}
                fill={favorited ? "#ef4444" : "none"}
              />
            )}
          </TouchableOpacity>
        </HStack>
      </SafeAreaView>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Camera Preview */}
        <View className="h-60 bg-gray-200 items-center justify-center border-b border-gray-300 overflow-hidden">
          {previewUrl ? (
            <Image
              source={{ uri: previewUrl }}
              style={{ width: "100%", height: "100%", resizeMode: "cover" }}
            />
          ) : (
            <>
              <Text className="text-6xl mb-2">📷</Text>
              <Text className="text-sm text-gray-600">Camera Preview</Text>
              <Text className="text-xs text-gray-500 mt-1">
                {streams.length > 0
                  ? `${streams.length} stream(s) available`
                  : "No streams available"}
              </Text>
            </>
          )}
        </View>

        <VStack className="p-4 gap-3">
          {/* Status Card */}
          <Box className="bg-white rounded-xl border border-gray-200 p-4">
            <HStack className="items-center justify-between">
              <HStack className="items-center gap-2">
                <Box
                  className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-gray-400"}`}
                />
                <Text className="text-sm text-gray-900 font-medium">
                  {isOnline ? "Online" : "Offline"}
                </Text>
              </HStack>
              <Badge
                className={`${isOnline ? "bg-green-600" : "bg-gray-500"} rounded-md`}
              >
                <BadgeText className="text-white font-semibold text-xs">
                  {isOnline ? "ACTIVE" : "OFFLINE"}
                </BadgeText>
              </Badge>
            </HStack>
          </Box>

          {/* Camera Information */}
          <Box className="bg-white rounded-xl border border-gray-200">
            <VStack className="p-4">
              <Text className="text-xs font-semibold text-gray-500 uppercase mb-3">
                Camera Information
              </Text>

              <HStack className="items-center justify-between py-2.5 border-b border-gray-200">
                <Text className="text-sm text-gray-600">Camera ID</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {typedCamera.id}
                </Text>
              </HStack>

              <HStack className="items-center justify-between py-2.5 border-b border-gray-200">
                <Text className="text-sm text-gray-600">Status</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {typedCamera.status}
                </Text>
              </HStack>

              {/* <HStack className="items-center justify-between py-2.5 border-b border-gray-200">
                <Text className="text-sm text-gray-600">Latitude</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {typedCamera.latitude.toFixed(6)}
                </Text>
              </HStack>

              <HStack className="items-center justify-between py-2.5 border-b border-gray-200">
                <Text className="text-sm text-gray-600">Longitude</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {typedCamera.longitude.toFixed(6)}
                </Text>
              </HStack> */}

              {aiResult && (
                <HStack className="items-center justify-between py-2.5 border-b border-gray-200">
                  <HStack className="items-center gap-2">
                    <Text className="text-lg">
                      {normalizePrediction(aiResult.prediction)
                        .toUpperCase()
                        .includes("CO MUA")
                        ? "☔"
                        : "🌤"}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      AI Prediction
                    </Text>
                  </HStack>
                  <VStack className="items-end">
                    <Text className="text-sm font-medium text-gray-900">
                      {aiResult.prediction}
                    </Text>
                    {/* <Text className="text-xs text-gray-500">
                      Confidence: {aiResult.confidenceScore}
                    </Text> */}
                  </VStack>
                </HStack>
              )}

              <HStack className="items-center justify-between py-2.5 border-b border-gray-200">
                <Text className="text-sm text-gray-600">Ward ID</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {typedCamera.wardId}
                </Text>
              </HStack>

              {/* <HStack className="items-center justify-between py-2.5 border-b border-gray-200">
                <Text className="text-sm text-gray-600">Last Image Hash</Text>
                <Text
                  className="text-sm font-medium text-gray-900"
                  numberOfLines={1}
                >
                  {typedCamera.lastImageHash ?? "N/A"}
                </Text>
              </HStack> */}

              {/* <HStack className="items-center justify-between py-2.5 border-b border-gray-200">
                <Text className="text-sm text-gray-600">Streams count</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {streams.length}
                </Text>
              </HStack>

              <HStack className="items-center justify-between py-2.5">
                <Text className="text-sm text-gray-600">Status logs count</Text>
                <Text className="text-sm font-medium text-gray-900">
                  {statusLogs.length}
                </Text>
              </HStack> */}
            </VStack>
          </Box>

          {/* Ward Information (if available) */}
          {typedCamera.ward && (
            <Box className="bg-white rounded-xl border border-gray-200">
              <VStack className="p-4">
                <Text className="text-xs font-semibold text-gray-500 uppercase mb-3">
                  Location Details
                </Text>

                <HStack className="items-center justify-between py-2.5 border-b border-gray-200">
                  <Text className="text-sm text-gray-600">Ward</Text>
                  <Text className="text-sm font-medium text-gray-900">
                    {typedCamera.ward.name}
                  </Text>
                </HStack>

                {typedCamera.ward.district && (
                  <HStack className="items-center justify-between py-2.5 border-b border-gray-200">
                    <Text className="text-sm text-gray-600">District</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {typedCamera.ward.district.name}
                    </Text>
                  </HStack>
                )}

                {typedCamera.ward.district?.city && (
                  <HStack className="items-center justify-between py-2.5">
                    <Text className="text-sm text-gray-600">City</Text>
                    <Text className="text-sm font-medium text-gray-900">
                      {typedCamera.ward.district.city.name}
                    </Text>
                  </HStack>
                )}
              </VStack>
            </Box>
          )}

          {/* Action Buttons */}
          <VStack className="gap-3 mt-6">
            <Button
              variant="outline"
              onPress={handleCheckWeatherAI}
              disabled={aiLoading}
              className="border-blue-500"
            >
              {aiLoading ? (
                <Spinner size="small" />
              ) : (
                <ButtonText className="text-blue-600 font-medium">
                  Check Rain via AI
                </ButtonText>
              )}
            </Button>

            {/* <Button
              onPress={() => console.log("View camera feed:", typedCamera.id)}
              className="bg-blue-600"
            >
              <ButtonText className="text-white font-medium">
                View Camera Feed
              </ButtonText>
            </Button> */}

            <Button
              variant="outline"
              onPress={handleToggleFavorite}
              disabled={favLoading}
              className={`border-2 ${favorited ? "border-red-400" : "border-gray-300"
                }`}
            >
              {favLoading ? (
                <Spinner size="small" />
              ) : (
                <ButtonText
                  className={`font-medium ${favorited ? "text-red-500" : "text-gray-900"
                    }`}
                >
                  {favorited ? "Remove from Favorites" : "Add to Favorites"}
                </ButtonText>
              )}
            </Button>
            {statusLogs.length > 0 && (
              <Button
                variant="outline"
                onPress={() => console.log("View status logs:", statusLogs)}
                className="border-gray-300"
              >
                <ButtonText className="text-gray-900 font-medium">
                  View Status History ({statusLogs.length})
                </ButtonText>
              </Button>
            )}

            {isAdmin && (
              <VStack className="gap-3 mt-4 pt-4 border-t border-gray-200">
                <Button
                  onPress={() => navigation.navigate("CameraForm", { mode: "edit", camera: typedCamera })}
                  className="bg-orange-500"
                >
                  <ButtonText className="text-white font-medium">Edit Camera</ButtonText>
                </Button>
                <Button
                  onPress={handleDeleteCamera}
                  className="bg-red-600"
                >
                  <ButtonText className="text-white font-medium">Delete Camera</ButtonText>
                </Button>
              </VStack>
            )}
          </VStack>
        </VStack>
      </ScrollView>
    </View>
  );
}
