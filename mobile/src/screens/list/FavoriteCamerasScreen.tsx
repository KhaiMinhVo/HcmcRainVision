import { Badge, BadgeText } from "@/components/ui/badge";
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { StatusBar } from "expo-status-bar";
import { ChevronLeft, Heart, MapPin, Trash2 } from "lucide-react-native";
import {
  Alert,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFavorites } from "../../context/FavoritesContext";
import { Camera } from "../../types/camera";

export default function FavoriteCamerasScreen({ navigation }: any) {
  const { favorites, loading, error, refresh, toggleFavorite } = useFavorites();

  const handleCameraPress = (camera: Camera) => {
    navigation.navigate("MapStack", {
      screen: "CameraDetailMap",
      params: { camera },
    });
  };

  const handleRemoveFavorite = async (camera: Camera) => {
    Alert.alert("Remove Favorite", `Remove "${camera.name}" from favorites?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          const err = await toggleFavorite(camera.id);
          if (err) {
            Alert.alert("Error", err);
          }
        },
      },
    ]);
  };

  const renderCamera = ({ item }: { item: Camera }) => {
    const isOnline = item.status === "Active";
    return (
      <TouchableOpacity
        onPress={() => handleCameraPress(item)}
        activeOpacity={0.7}
      >
        <Box className="bg-white rounded-xl border border-gray-200 p-4 mb-3 mx-4">
          <HStack className="items-start justify-between mb-2">
            <VStack className="flex-1 mr-2">
              <HStack className="items-center gap-2 mb-1">
                <Heart size={14} color="#ef4444" fill="#ef4444" />
                <Heading
                  size="sm"
                  className="text-gray-900 font-semibold flex-1"
                  numberOfLines={1}
                >
                  {item.name}
                </Heading>
              </HStack>
              <Text className="text-xs text-gray-500 mb-1">ID: {item.id}</Text>
              {item.ward && (
                <Text className="text-xs text-gray-500 mb-1">
                  {[item.ward.name, item.ward.district?.name]
                    .filter(Boolean)
                    .join(", ")}
                </Text>
              )}
              <HStack className="items-center gap-1">
                <MapPin size={12} color="#6B7280" />
                <Text className="text-xs text-gray-600">
                  {item.latitude.toFixed(5)}, {item.longitude.toFixed(5)}
                </Text>
              </HStack>
            </VStack>
            <VStack className="items-end gap-2">
              <Badge
                className={`${isOnline ? "bg-green-600" : "bg-gray-500"} rounded-md`}
              >
                <BadgeText className="text-white font-semibold text-xs">
                  {item.status ?? "UNKNOWN"}
                </BadgeText>
              </Badge>
              <TouchableOpacity
                onPress={() => handleRemoveFavorite(item)}
                className="p-1"
              >
                <Trash2 size={16} color="#ef4444" />
              </TouchableOpacity>
            </VStack>
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

  if (loading && favorites.length === 0) {
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
              Favorite Cameras
            </Heading>
          </HStack>
        </SafeAreaView>
        <View className="flex-1 items-center justify-center">
          <Spinner size="large" />
          <Text className="text-gray-600 mt-4">Loading favorites...</Text>
        </View>
      </View>
    );
  }

  if (error && favorites.length === 0) {
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
              Favorite Cameras
            </Heading>
          </HStack>
        </SafeAreaView>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-4xl mb-4">⚠️</Text>
          <Heading
            size="lg"
            className="text-gray-900 font-bold text-center mb-2"
          >
            Failed to load favorites
          </Heading>
          <Text className="text-sm text-gray-600 text-center mb-4">
            {error}
          </Text>
          <TouchableOpacity
            onPress={refresh}
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
            Favorite Cameras
          </Heading>
          <Text className="text-sm text-gray-600">
            {favorites.length} saved
          </Text>
        </HStack>
      </SafeAreaView>

      <FlatList
        data={favorites}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderCamera}
        contentContainerStyle={{ paddingVertical: 12 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        ListEmptyComponent={
          <View className="items-center justify-center px-8 py-16">
            <Text className="text-6xl mb-6">⭐</Text>
            <Heading
              size="xl"
              className="text-gray-900 font-bold mb-3 text-center"
            >
              No Favorites Yet
            </Heading>
            <Text className="text-base text-gray-600 text-center mb-8 leading-6">
              Tap the heart icon on any camera to save it here
            </Text>
            <Button
              size="lg"
              className="bg-blue-600 rounded-xl"
              onPress={() => navigation.navigate("AllCamerasList")}
            >
              <ButtonText className="text-white font-semibold">
                Browse Cameras
              </ButtonText>
            </Button>
          </View>
        }
      />
    </View>
  );
}
