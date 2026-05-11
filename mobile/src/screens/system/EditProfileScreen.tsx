import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Input, InputField } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authService } from "../../services/auth";
import { locationService } from "../../services/location";
import useAppStore from "../../store/useAppStore";
import type { Ward } from "../../types";

export default function EditProfileScreen({ navigation }: any) {
  const user = useAppStore((s) => s.user);
  const token = useAppStore((s) => s.token);
  const updateUser = useAppStore((s) => s.updateUser);

  const [name, setName] = useState(user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [isSaving, setIsSaving] = useState(false);
  const [districts, setDistricts] = useState<string[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState(
    user?.districtName || "",
  );
  const [selectedWard, setSelectedWard] = useState<Ward | null>(
    user?.wardId || user?.wardName
      ? {
          wardId: user?.wardId || "",
          wardName: user?.wardName || "",
          districtName: user?.districtName || "",
        }
      : null,
  );
  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(false);
  const [districtModalVisible, setDistrictModalVisible] = useState(false);
  const [wardModalVisible, setWardModalVisible] = useState(false);
  const [isPickingAvatar, setIsPickingAvatar] = useState(false);

  const isLocationDisabled = useMemo(() => !token, [token]);

  const loadDistricts = async () => {
    if (!token) return;
    setIsLoadingDistricts(true);
    const result = await locationService.getDistricts(token);
    setIsLoadingDistricts(false);

    if (!result.success || !result.data) {
      Alert.alert("Location Error", result.error || "Failed to load districts");
      return;
    }

    setDistricts(result.data);

    if (result.data.length > 0 && !selectedDistrict) {
      setSelectedDistrict(result.data[0]);
      return;
    }

    if (selectedDistrict && !result.data.includes(selectedDistrict)) {
      setSelectedDistrict(result.data[0] || "");
    }
  };

  const loadWardsByDistrict = async (districtName: string) => {
    if (!token || !districtName) return;
    setIsLoadingWards(true);
    const result = await locationService.getWardsByDistrict(
      districtName,
      token,
    );
    setIsLoadingWards(false);

    if (!result.success || !result.data) {
      Alert.alert("Location Error", result.error || "Failed to load wards");
      return;
    }

    setWards(result.data);

    const stillValid = result.data.some(
      (w) => w.wardId === selectedWard?.wardId,
    );
    if (!stillValid) {
      setSelectedWard(result.data[0] || null);
    }
  };

  useEffect(() => {
    loadDistricts();
  }, [token]);

  useEffect(() => {
    if (selectedDistrict) {
      loadWardsByDistrict(selectedDistrict);
    }
  }, [selectedDistrict, token]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter your full name");
      return;
    }

    if (!token) {
      Alert.alert(
        "Error",
        "No authentication token found. Please login again.",
      );
      return;
    }

    setIsSaving(true);

    try {
      const result = await authService.updateProfile(
        {
          fullName: name.trim(),
          phoneNumber: phoneNumber.trim() || undefined,
          avatarUrl: avatarUrl.trim() || undefined,
          districtName: selectedDistrict || undefined,
          wardId: selectedWard?.wardId || undefined,
          wardName: selectedWard?.wardName || undefined,
        },
        token,
      );

      if (result.success) {
        // Update store with new data
        if (result.data) {
          updateUser(result.data);
        }
        Alert.alert(
          "Success",
          result.message || "Profile updated successfully",
          [{ text: "OK", onPress: () => navigation.goBack() }],
        );
      } else {
        Alert.alert("Error", result.error || "Failed to update profile");
      }
    } catch (error: any) {
      console.error("Update profile error:", error);
      Alert.alert("Error", "Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (
      name !== user?.name ||
      phoneNumber !== (user?.phoneNumber || "") ||
      avatarUrl !== (user?.avatarUrl || "") ||
      selectedDistrict !== (user?.districtName || "") ||
      selectedWard?.wardId !== (user?.wardId || "")
    ) {
      Alert.alert(
        "Discard Changes",
        "Are you sure you want to discard your changes?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } else {
      navigation.goBack();
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

  const handlePickAvatarImage = async () => {
    try {
      setIsPickingAvatar(true);
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permission Required",
          "Please allow photo library access to pick an avatar.",
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (result.canceled || !result.assets?.[0]) {
        return;
      }

      const asset = result.assets[0];

      if (asset.base64) {
        const mime = asset.mimeType || "image/jpeg";
        const dataUrl = `data:${mime};base64,${asset.base64}`;
        setAvatarUrl(dataUrl);
      } else {
        Alert.alert(
          "Cannot Convert Image",
          "Selected image could not be converted to URL format. Please try another image.",
        );
      }
    } catch (error) {
      console.error("Pick avatar error:", error);
      Alert.alert("Error", "Unable to select image. Please try again.");
    } finally {
      setIsPickingAvatar(false);
    }
  };

  const handleClearAvatar = () => {
    setAvatarUrl("");
  };

  const avatarPreviewSource = avatarUrl.trim();

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView className="flex-1">
          <VStack className="items-center py-8 px-4">
            <Center className="w-20 h-20 rounded-full bg-gray-900 mb-4 overflow-hidden">
              {avatarPreviewSource ? (
                <Image
                  source={{ uri: avatarPreviewSource }}
                  className="w-full h-full"
                />
              ) : (
                <Text className="text-3xl font-bold text-white">
                  {getInitials(name)}
                </Text>
              )}
            </Center>
            <Text className="text-sm text-gray-600 text-center">
              Update your profile information
            </Text>
          </VStack>

          <Box className="mx-4 bg-white rounded-xl p-5 shadow-sm">
            <VStack className="gap-5">
              {/* Full Name */}
              <VStack>
                <Text className="text-sm font-semibold text-gray-900 mb-2">
                  Full Name *
                </Text>
                <Input
                  variant="outline"
                  size="lg"
                  className="border-gray-300 rounded-lg"
                >
                  <InputField
                    value={name}
                    onChangeText={setName}
                    placeholder="Enter your full name"
                    autoCapitalize="words"
                  />
                </Input>
              </VStack>

              {/* Phone Number */}
              <VStack>
                <Text className="text-sm font-semibold text-gray-900 mb-2">
                  Phone Number
                </Text>
                <Input
                  variant="outline"
                  size="lg"
                  className="border-gray-300 rounded-lg"
                >
                  <InputField
                    value={phoneNumber}
                    onChangeText={setPhoneNumber}
                    placeholder="Enter your phone number"
                    keyboardType="phone-pad"
                  />
                </Input>
              </VStack>

              {/* District */}
              <VStack>
                <Text className="text-sm font-semibold text-gray-900 mb-2">
                  District
                </Text>
                <TouchableOpacity
                  disabled={isLocationDisabled || isLoadingDistricts}
                  onPress={() => setDistrictModalVisible(true)}
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                >
                  <Text className="text-base text-gray-800">
                    {isLoadingDistricts
                      ? "Loading districts..."
                      : selectedDistrict || "Select district"}
                  </Text>
                </TouchableOpacity>
                {isLocationDisabled && (
                  <Text className="text-xs text-gray-500 mt-1">
                    Login required to load location data
                  </Text>
                )}
              </VStack>

              {/* Ward */}
              <VStack>
                <Text className="text-sm font-semibold text-gray-900 mb-2">
                  Ward
                </Text>
                <TouchableOpacity
                  disabled={
                    isLocationDisabled ||
                    isLoadingWards ||
                    !selectedDistrict ||
                    wards.length === 0
                  }
                  onPress={() => setWardModalVisible(true)}
                  className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
                >
                  <Text className="text-base text-gray-800">
                    {isLoadingWards
                      ? "Loading wards..."
                      : selectedWard?.wardName || "Select ward"}
                  </Text>
                </TouchableOpacity>
                <Text className="text-xs text-gray-500 mt-1">
                  Wards are filtered by selected district
                </Text>
              </VStack>

              {/* Avatar URL */}
              <VStack>
                <Text className="text-sm font-semibold text-gray-900 mb-2">
                  Avatar URL
                </Text>
                <Input
                  variant="outline"
                  size="lg"
                  className="border-gray-300 rounded-lg"
                >
                  <InputField
                    value={avatarUrl}
                    onChangeText={setAvatarUrl}
                    placeholder="Enter avatar image URL"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </Input>
                <Text className="text-xs text-gray-500 mt-1">
                  Paste image URL or pick image from your device
                </Text>
                <VStack className="flex-row gap-2 mt-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-gray-300"
                    onPress={handlePickAvatarImage}
                    isDisabled={isSaving || isPickingAvatar}
                  >
                    <ButtonText>
                      {isPickingAvatar ? "Picking..." : "Choose Image"}
                    </ButtonText>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-gray-300"
                    onPress={handleClearAvatar}
                    isDisabled={isSaving || !avatarUrl.trim()}
                  >
                    <ButtonText>Clear</ButtonText>
                  </Button>
                </VStack>
              </VStack>

              {/* Email (Read-only) */}
              <VStack>
                <Text className="text-sm font-semibold text-gray-900 mb-2">
                  Email
                </Text>
                <Box className="bg-gray-100 rounded-lg px-4 py-3">
                  <Text className="text-base text-gray-600">
                    {user?.email || "N/A"}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    Contact admin to change email
                  </Text>
                </Box>
              </VStack>

              {/* Role (Read-only) */}
              <VStack>
                <Text className="text-sm font-semibold text-gray-900 mb-2">
                  Role
                </Text>
                <Box className="bg-gray-100 rounded-lg px-4 py-3">
                  <Text className="text-base text-gray-600">
                    {user?.role || "User"}
                  </Text>
                  <Text className="text-xs text-gray-500 mt-1">
                    Contact admin to change role
                  </Text>
                </Box>
              </VStack>
            </VStack>
          </Box>

          <VStack className="flex-row gap-2 mx-4 mt-6">
            <Button
              size="lg"
              variant="outline"
              className="flex-1 border-gray-300 rounded-xl"
              onPress={handleCancel}
              isDisabled={isSaving}
            >
              <ButtonText className="text-gray-900">Cancel</ButtonText>
            </Button>
            <Button
              size="lg"
              className="flex-1 bg-blue-600 rounded-xl"
              onPress={handleSave}
              isDisabled={isSaving}
            >
              {isSaving ? (
                <Spinner color="white" size="small" />
              ) : (
                <ButtonText className="text-white font-semibold">
                  Save Changes
                </ButtonText>
              )}
            </Button>
          </VStack>

          <Box className="h-8" />
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        animationType="slide"
        transparent
        visible={districtModalVisible}
        onRequestClose={() => setDistrictModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <Box className="bg-white rounded-t-2xl p-4 max-h-[70%]">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Select District
            </Text>
            <ScrollView>
              {districts.map((district) => (
                <TouchableOpacity
                  key={district}
                  onPress={() => {
                    setSelectedDistrict(district);
                    setSelectedWard(null);
                    setDistrictModalVisible(false);
                  }}
                  className="py-3 border-b border-gray-100"
                >
                  <Text
                    className={`text-base ${
                      district === selectedDistrict
                        ? "text-blue-600 font-semibold"
                        : "text-gray-800"
                    }`}
                  >
                    {district}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button
              variant="outline"
              className="mt-3 border-gray-300"
              onPress={() => setDistrictModalVisible(false)}
            >
              <ButtonText>Close</ButtonText>
            </Button>
          </Box>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent
        visible={wardModalVisible}
        onRequestClose={() => setWardModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/40">
          <Box className="bg-white rounded-t-2xl p-4 max-h-[70%]">
            <Text className="text-base font-semibold text-gray-900 mb-3">
              Select Ward
            </Text>
            <ScrollView>
              {wards.map((ward) => (
                <TouchableOpacity
                  key={ward.wardId}
                  onPress={() => {
                    setSelectedWard(ward);
                    setWardModalVisible(false);
                  }}
                  className="py-3 border-b border-gray-100"
                >
                  <Text
                    className={`text-base ${
                      ward.wardId === selectedWard?.wardId
                        ? "text-blue-600 font-semibold"
                        : "text-gray-800"
                    }`}
                  >
                    {ward.wardName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Button
              variant="outline"
              className="mt-3 border-gray-300"
              onPress={() => setWardModalVisible(false)}
            >
              <ButtonText>Close</ButtonText>
            </Button>
          </Box>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
