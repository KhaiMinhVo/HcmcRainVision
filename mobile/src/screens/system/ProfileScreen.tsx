import { Box } from "@/components/ui/box";
import { Center } from "@/components/ui/center";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert, Image, RefreshControl, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authService } from "../../services/auth";
import useAppStore from "../../store/useAppStore";

export default function ProfileScreen({ navigation }: any) {
  const user = useAppStore((s) => s.user);
  const token = useAppStore((s) => s.token);
  const updateUser = useAppStore((s) => s.updateUser);
  const notificationEnabled = useAppStore((s) => s.notificationEnabled);
  const locationPermissionChoice = useAppStore(
    (s) => s.locationPermissionChoice,
  );

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const fetchProfile = async (isRefresh: boolean = false) => {
    if (!token) {
      Alert.alert(
        "Error",
        "No authentication token found. Please login again.",
      );
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await authService.getProfile(token);

      if (result.success && result.data) {
        // Update user data in store
        updateUser(result.data);
      } else {
        Alert.alert(
          "Error",
          result.error || "Failed to load profile. Please try again.",
        );
      }
    } catch (error: any) {
      console.error("Profile fetch error:", error);
      Alert.alert("Error", "Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Fetch profile on mount
    fetchProfile();
  }, []);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [user?.avatarUrl]);

  const onRefresh = () => {
    fetchProfile(true);
  };

  const getLocationPermissionText = () => {
    switch (locationPermissionChoice) {
      case "while_using":
        return "While Using App";
      case "only_once":
        return "Only Once";
      case "denied":
        return "Denied";
      default:
        return "Not Set";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <StatusBar style="dark" />
      {loading && !user ? (
        <Center className="flex-1">
          <Spinner size="large" />
          <Text className="text-gray-600 mt-4">Loading profile...</Text>
        </Center>
      ) : (
        <ScrollView
          className="flex-1"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Profile Header */}
          <VStack className="items-center py-8 px-4">
            <Center className="w-24 h-24 rounded-full bg-gray-900 mb-4 overflow-hidden">
              {user?.avatarUrl && !avatarLoadError ? (
                <Image
                  source={{ uri: user.avatarUrl }}
                  className="w-full h-full"
                  onError={() => setAvatarLoadError(true)}
                />
              ) : (
                <Text className="text-4xl font-bold text-white">
                  {user ? getInitials(user.name) : "U"}
                </Text>
              )}
            </Center>
            <Heading size="2xl" className="text-gray-900 font-bold mb-1">
              {user?.name || "User"}
            </Heading>
            <Text className="text-base text-gray-600 mb-3">
              {user?.email || "email@example.com"}
            </Text>
            <Box className="bg-gray-900 px-4 py-2 rounded-lg">
              <Text className="text-sm font-semibold text-white">
                {user?.role || "User"}
              </Text>
            </Box>
          </VStack>

          {/* Personal Information */}
          <VStack className="px-4 mb-2">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
              Personal Information
            </Text>
            <Box className="bg-white rounded-xl overflow-hidden shadow-sm">
              <VStack>
                {/* Full Name */}
                <Box className="flex-row items-center px-4 py-4">
                  <Ionicons
                    name="person"
                    size={24}
                    color="#374151"
                    style={{ marginRight: 12 }}
                  />
                  <VStack className="flex-1">
                    <Text className="text-sm text-gray-600">Full Name</Text>
                    <Text className="text-base text-gray-900 font-medium">
                      {user?.name || "N/A"}
                    </Text>
                  </VStack>
                </Box>
                <Divider />
                {/* Email */}
                <Box className="flex-row items-center px-4 py-4">
                  <Ionicons
                    name="mail"
                    size={24}
                    color="#374151"
                    style={{ marginRight: 12 }}
                  />
                  <VStack className="flex-1">
                    <Text className="text-sm text-gray-600">Email</Text>
                    <Text className="text-base text-gray-900 font-medium">
                      {user?.email || "N/A"}
                    </Text>
                  </VStack>
                </Box>
                <Divider />
                {/* Phone Number */}
                <Box className="flex-row items-center px-4 py-4">
                  <Ionicons
                    name="phone-portrait"
                    size={24}
                    color="#374151"
                    style={{ marginRight: 12 }}
                  />
                  <VStack className="flex-1">
                    <Text className="text-sm text-gray-600">Phone Number</Text>
                    <Text className="text-base text-gray-900 font-medium">
                      {user?.phoneNumber || "N/A"}
                    </Text>
                  </VStack>
                </Box>
                <Divider />
                {/* Role */}
                <Box className="flex-row items-center px-4 py-4">
                  <Ionicons
                    name="briefcase"
                    size={24}
                    color="#374151"
                    style={{ marginRight: 12 }}
                  />
                  <VStack className="flex-1">
                    <Text className="text-sm text-gray-600">Role</Text>
                    <Text className="text-base text-gray-900 font-medium">
                      {user?.role || "N/A"}
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </VStack>

          {/* Account Settings */}
          <VStack className="px-4 mb-2">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
              Account Settings
            </Text>
            <Box className="bg-white rounded-xl overflow-hidden shadow-sm">
              <VStack>
                {/* Notifications */}
                <Box className="flex-row items-center px-4 py-4">
                  <Ionicons
                    name="notifications"
                    size={24}
                    color="#374151"
                    style={{ marginRight: 12 }}
                  />
                  <VStack className="flex-1">
                    <Text className="text-sm text-gray-600">Notifications</Text>
                    <Text className="text-base text-gray-900 font-medium">
                      {notificationEnabled ? "Enabled" : "Disabled"}
                    </Text>
                  </VStack>
                </Box>
                <Divider />
                {/* Location Permission */}
                <Box className="flex-row items-center px-4 py-4">
                  <Ionicons
                    name="location"
                    size={24}
                    color="#374151"
                    style={{ marginRight: 12 }}
                  />
                  <VStack className="flex-1">
                    <Text className="text-sm text-gray-600">
                      Location Permission
                    </Text>
                    <Text className="text-base text-gray-900 font-medium">
                      {getLocationPermissionText()}
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </VStack>

          {/* Account Stats */}
          <VStack className="px-4 mb-6">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
              Account Statistics
            </Text>
            <Box className="bg-white rounded-xl overflow-hidden shadow-sm">
              <VStack>
                {/* Member Since */}
                <Box className="flex-row items-center px-4 py-4">
                  <Ionicons
                    name="calendar"
                    size={24}
                    color="#374151"
                    style={{ marginRight: 12 }}
                  />
                  <VStack className="flex-1">
                    <Text className="text-sm text-gray-600">Member Since</Text>
                    <Text className="text-base text-gray-900 font-medium">
                      Jan 2025
                    </Text>
                  </VStack>
                </Box>
                <Divider />
                {/* Cameras Viewed */}
                <Box className="flex-row items-center px-4 py-4">
                  <Ionicons
                    name="videocam"
                    size={24}
                    color="#374151"
                    style={{ marginRight: 12 }}
                  />
                  <VStack className="flex-1">
                    <Text className="text-sm text-gray-600">
                      Cameras Viewed
                    </Text>
                    <Text className="text-base text-gray-900 font-medium">
                      245
                    </Text>
                  </VStack>
                </Box>
                <Divider />
                {/* Favorite Locations */}
                <Box className="flex-row items-center px-4 py-4">
                  <Ionicons
                    name="star"
                    size={24}
                    color="#374151"
                    style={{ marginRight: 12 }}
                  />
                  <VStack className="flex-1">
                    <Text className="text-sm text-gray-600">
                      Favorite Locations
                    </Text>
                    <Text className="text-base text-gray-900 font-medium">
                      12
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            </Box>
          </VStack>

          <Box className="h-8" />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
