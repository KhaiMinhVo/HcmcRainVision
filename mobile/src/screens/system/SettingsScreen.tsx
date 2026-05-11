import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Divider } from "@/components/ui/divider";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { subscriptionsService } from "../../services/subscriptions";
import useAppStore from "../../store/useAppStore";

export default function SettingsScreen({ navigation }: any) {
  const user = useAppStore((s) => s.user);
  const token = useAppStore((s) => s.token);
  const notificationEnabled = useAppStore((s) => s.notificationEnabled);
  const offlineMode = useAppStore((s) => s.offlineMode);
  const units = useAppStore((s) => s.units);
  const setNotificationEnabled = useAppStore((s) => s.setNotificationEnabled);
  const setOfflineMode = useAppStore((s) => s.setOfflineMode);
  const setUnits = useAppStore((s) => s.setUnits);
  const clearCache = useAppStore((s) => s.clearCache);
  const logout = useAppStore((s) => s.logout);
  const [isUpdatingNotificationToggle, setIsUpdatingNotificationToggle] =
    useState(false);
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const syncNotificationSwitchFromSubscriptions = async () => {
    if (!token) return;
    const result = await subscriptionsService.getAll(token);
    if (!result.success) return;
    const hasEnabled = (result.data || []).some((sub) => sub.isEnabled);
    setNotificationEnabled(hasEnabled);
  };

  useEffect(() => {
    syncNotificationSwitchFromSubscriptions();
  }, [token]);

  useEffect(() => {
    setAvatarLoadError(false);
  }, [user?.avatarUrl]);

  const handleNotificationToggle = async (value: boolean) => {
    if (!token) {
      setNotificationEnabled(value);
      return;
    }

    if (value) {
      setNotificationEnabled(true);
      return;
    }

    setIsUpdatingNotificationToggle(true);

    try {
      const subscriptionsRes = await subscriptionsService.getAll(token);
      if (!subscriptionsRes.success || !subscriptionsRes.data) {
        Alert.alert(
          "Error",
          subscriptionsRes.error || "Failed to load subscriptions",
        );
        return;
      }

      const enabledSubscriptions = subscriptionsRes.data.filter(
        (item) => item.isEnabled,
      );

      const updateResults = await Promise.all(
        enabledSubscriptions.map((item) =>
          subscriptionsService.update(
            item.subscriptionId,
            {
              thresholdProbability: item.thresholdProbability,
              isEnabled: false,
            },
            token,
          ),
        ),
      );

      const failed = updateResults.find((item) => !item.success);
      if (failed) {
        Alert.alert(
          "Error",
          failed.error || "Failed to disable some subscriptions",
        );
        return;
      }

      setNotificationEnabled(false);
    } finally {
      setIsUpdatingNotificationToggle(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            logout();
            // RootNavigator will automatically navigate to SystemStack
            // when isAuthenticated becomes false
          },
        },
      ],
      { cancelable: true },
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      "Clear Cache",
      "This will remove all cached data. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearCache();
            Alert.alert("Success", "Cache cleared successfully");
          },
        },
      ],
      { cancelable: true },
    );
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
      <ScrollView className="flex-1">
        {/* Profile Card */}
        <Box className="px-4 pt-4">
          <Box className="bg-white rounded-xl p-5 shadow-sm">
            <HStack className="items-center mb-4">
              <Center className="w-16 h-16 rounded-full bg-gray-900 overflow-hidden">
                {user?.avatarUrl && !avatarLoadError ? (
                  <Image
                    source={{ uri: user.avatarUrl }}
                    className="w-full h-full"
                    onError={() => setAvatarLoadError(true)}
                  />
                ) : (
                  <Text className="text-2xl font-bold text-white">
                    {user ? getInitials(user.name) : "U"}
                  </Text>
                )}
              </Center>
              <VStack className="flex-1 ml-4">
                <Text className="text-xl font-bold text-gray-900">
                  {user?.name || "User"}
                </Text>
                <Text className="text-sm text-gray-600 mb-2">
                  {user?.email || "email@example.com"}
                </Text>
                <Box className="bg-gray-200 px-2 py-1 rounded self-start">
                  <Text className="text-xs font-semibold text-gray-700">
                    {user?.role || "User"}
                  </Text>
                </Box>
              </VStack>
            </HStack>
            <Divider className="my-4" />
            <HStack className="gap-2">
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-gray-300"
                onPress={() => navigation.navigate("Profile")}
              >
                <ButtonText className="text-gray-900">View Profile</ButtonText>
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-blue-600"
                onPress={() => navigation.navigate("EditProfile")}
              >
                <ButtonText className="text-white">Edit</ButtonText>
              </Button>
            </HStack>
          </Box>
        </Box>

        {/* Admin Tools */}
        {user?.role === "Admin" && (
          <VStack className="px-4 mt-6 mb-2">
            <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
              Admin Platform
            </Text>
            <Box className="bg-white rounded-xl overflow-hidden shadow-sm">
              <Box
                className="flex-row items-center justify-between px-4 py-4 bg-purple-50"
                onTouchEnd={() => navigation.navigate("AdminStack")}
              >
                <HStack className="items-center flex-1">
                  <Text className="text-2xl mr-3">🛡️</Text>
                  <Text className="text-base font-bold text-purple-900">Admin Dashboard</Text>
                </HStack>
                <Text className="text-purple-400">›</Text>
              </Box>
            </Box>
          </VStack>
        )}

        {/* Account & Security */}
        <VStack className="px-4 mt-6 mb-2">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
            Account & Security
          </Text>
          <Box className="bg-white rounded-xl overflow-hidden shadow-sm">
            <Box
              className="flex-row items-center justify-between px-4 py-4"
              onTouchEnd={() => navigation.navigate("ChangePassword")}
            >
              <HStack className="items-center flex-1">
                <Text className="text-2xl mr-3">🔑</Text>
                <Text className="text-base text-gray-900">Change Password</Text>
              </HStack>
              <Text className="text-gray-400">›</Text>
            </Box>
            <Divider />
            <Box
              className="flex-row items-center justify-between px-4 py-4"
              onTouchEnd={handleLogout}
            >
              <HStack className="items-center flex-1">
                <Text className="text-2xl mr-3">🚪</Text>
                <Text className="text-base text-red-600">Logout</Text>
              </HStack>
            </Box>
          </Box>
        </VStack>

        {/* Preferences */}
        <VStack className="px-4 mb-2">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
            Preferences
          </Text>
          <Box className="bg-white rounded-xl overflow-hidden shadow-sm">
            <HStack className="items-center justify-between px-4 py-4">
              <HStack className="items-center flex-1">
                <Text className="text-2xl mr-3">🔔</Text>
                <Text className="text-base text-gray-900">Notifications</Text>
              </HStack>
              <Switch
                value={notificationEnabled}
                onValueChange={handleNotificationToggle}
                disabled={isUpdatingNotificationToggle}
                trackColor={{ false: "#d1d5db", true: "#1f2937" }}
                thumbColor="#fff"
              />
            </HStack>
            <Divider />
            <Box
              className="flex-row items-center justify-between px-4 py-4"
              onTouchEnd={() => navigation.navigate("AlertSubscriptions")}
            >
              <HStack className="items-center flex-1">
                <Text className="text-2xl mr-3">📬</Text>
                <Text className="text-base text-gray-900">
                  Alert Subscriptions
                </Text>
              </HStack>
              <Text className="text-gray-400">›</Text>
            </Box>
            <Divider />
            <Box className="flex-row items-center justify-between px-4 py-4">
              <HStack className="items-center flex-1">
                <Text className="text-2xl mr-3">📍</Text>
                <Text className="text-base text-gray-900">Location Access</Text>
              </HStack>
              <Text className="text-sm text-gray-600">Enabled</Text>
            </Box>
            <Divider />
            <Box
              className="flex-row items-center justify-between px-4 py-4"
              onTouchEnd={() =>
                setUnits(units === "metric" ? "imperial" : "metric")
              }
            >
              <HStack className="items-center flex-1">
                <Text className="text-2xl mr-3">📏</Text>
                <Text className="text-base text-gray-900">Units</Text>
              </HStack>
              <Text className="text-sm text-gray-600">
                {units === "metric" ? "Metric (km)" : "Imperial (mi)"}
              </Text>
              <Text className="text-gray-400 ml-2">›</Text>
            </Box>
          </Box>
        </VStack>

        {/* System */}
        <VStack className="px-4 mb-2">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
            System
          </Text>
          <Box className="bg-white rounded-xl overflow-hidden shadow-sm">


            <Box
              className="flex-row items-center justify-between px-4 py-4"
              onTouchEnd={handleClearCache}
            >
              <HStack className="items-center flex-1">
                <Text className="text-2xl mr-3">🗑️</Text>
                <Text className="text-base text-gray-900">Clear Cache</Text>
              </HStack>
              <Text className="text-gray-400">›</Text>
            </Box>
            <Divider />
            <Box
              className="flex-row items-center justify-between px-4 py-4"
              onTouchEnd={() =>
                Alert.alert(
                  "Diagnostics",
                  "System diagnostics will be shown here.",
                )
              }
            >
              <HStack className="items-center flex-1">
                <Text className="text-2xl mr-3">🔧</Text>
                <Text className="text-base text-gray-900">Diagnostics</Text>
              </HStack>
              <Text className="text-gray-400">›</Text>
            </Box>
          </Box>
        </VStack>

        {/* About */}
        <VStack className="px-4 mb-6">
          <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">
            About
          </Text>
          <Box className="bg-white rounded-xl overflow-hidden shadow-sm">
            <HStack className="items-center justify-between px-4 py-4">
              <HStack className="items-center flex-1">
                <Text className="text-2xl mr-3">ℹ️</Text>
                <Text className="text-base text-gray-900">Version</Text>
              </HStack>
              <Text className="text-sm text-gray-600">1.0.0</Text>
            </HStack>
            <Divider />
            <Box
              className="flex-row items-center justify-between px-4 py-4"
              onTouchEnd={() =>
                Alert.alert("Terms of Service", "Terms will be displayed here.")
              }
            >
              <HStack className="items-center flex-1">
                <Text className="text-2xl mr-3">📄</Text>
                <Text className="text-base text-gray-900">
                  Terms of Service
                </Text>
              </HStack>
              <Text className="text-gray-400">›</Text>
            </Box>
            <Divider />
            <Box
              className="flex-row items-center justify-between px-4 py-4"
              onTouchEnd={() =>
                Alert.alert(
                  "Privacy Policy",
                  "Privacy policy will be displayed here.",
                )
              }
            >
              <HStack className="items-center flex-1">
                <Text className="text-2xl mr-3">🔒</Text>
                <Text className="text-base text-gray-900">Privacy Policy</Text>
              </HStack>
              <Text className="text-gray-400">›</Text>
            </Box>
          </Box>
        </VStack>

        <Box className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
