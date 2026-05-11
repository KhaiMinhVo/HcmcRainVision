import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { locationService } from "../../services/location";
import { subscriptionsService } from "../../services/subscriptions";
import useAppStore from "../../store/useAppStore";
import type { AlertSubscription, Ward } from "../../types";

export default function AlertSubscriptionsScreen() {
  const token = useAppStore((s) => s.token);
  const setNotificationEnabled = useAppStore((s) => s.setNotificationEnabled);

  const [subscriptions, setSubscriptions] = useState<AlertSubscription[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState<Ward | null>(null);
  const [thresholdProbability, setThresholdProbability] = useState("0.7");
  const [isLoading, setIsLoading] = useState(false);
  const [districtModalVisible, setDistrictModalVisible] = useState(false);
  const [wardModalVisible, setWardModalVisible] = useState(false);

  const parsedThreshold = useMemo(() => {
    const val = Number(thresholdProbability);
    if (Number.isNaN(val)) return null;
    return val;
  }, [thresholdProbability]);

  const loadSubscriptions = async () => {
    const result = await subscriptionsService.getAll(token || undefined);
    if (result.success) {
      const items = result.data || [];
      setSubscriptions(items);
      setNotificationEnabled(items.some((item) => item.isEnabled));
    } else {
      Alert.alert("Error", result.error || "Failed to load subscriptions");
    }
  };

  const loadDistricts = async () => {
    const result = await locationService.getDistricts(token || undefined);
    if (result.success && result.data) {
      setDistricts(result.data);
      if (!selectedDistrict && result.data.length > 0) {
        setSelectedDistrict(result.data[0]);
      }
    }
  };

  const loadWardsByDistrict = async (districtName: string) => {
    if (!districtName) return;
    const result = await locationService.getWardsByDistrict(
      districtName,
      token || undefined,
    );
    if (result.success && result.data) {
      setWards(result.data);
      const stillValid = result.data.some(
        (ward) => ward.wardId === selectedWard?.wardId,
      );
      if (!stillValid) {
        setSelectedWard(result.data[0] || null);
      }
    }
  };

  useEffect(() => {
    if (!token) return;

    const init = async () => {
      setIsLoading(true);
      await Promise.all([loadSubscriptions(), loadDistricts()]);
      setIsLoading(false);
    };

    init();
  }, [token]);

  useEffect(() => {
    if (selectedDistrict) {
      loadWardsByDistrict(selectedDistrict);
    }
  }, [selectedDistrict, token]);

  const handleCreateSubscription = async () => {
    if (!selectedWard?.wardId) {
      Alert.alert("Validation", "Please select ward");
      return;
    }

    if (
      parsedThreshold === null ||
      parsedThreshold < 0 ||
      parsedThreshold > 1
    ) {
      Alert.alert("Validation", "Threshold must be a number between 0 and 1");
      return;
    }

    const result = await subscriptionsService.create(
      {
        wardId: selectedWard.wardId,
        thresholdProbability: parsedThreshold,
      },
      token || undefined,
    );

    if (result.success) {
      setThresholdProbability("0.7");
      await loadSubscriptions();
      Alert.alert("Success", "Subscription created successfully");
    } else {
      Alert.alert("Error", result.error || "Failed to create subscription");
    }
  };

  const handleToggleEnabled = async (item: AlertSubscription) => {
    const result = await subscriptionsService.update(
      item.subscriptionId,
      {
        thresholdProbability: item.thresholdProbability,
        isEnabled: !item.isEnabled,
      },
      token || undefined,
    );

    if (result.success) {
      setSubscriptions((prev) =>
        prev.map((sub) =>
          sub.subscriptionId === item.subscriptionId
            ? { ...sub, isEnabled: !sub.isEnabled }
            : sub,
        ),
      );
      await loadSubscriptions();
    } else {
      Alert.alert("Error", result.error || "Failed to update subscription");
    }
  };

  const handleDeleteSubscription = async (item: AlertSubscription) => {
    Alert.alert(
      "Delete Subscription",
      `Remove subscription for ${item.wardName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const result = await subscriptionsService.remove(
              item.subscriptionId,
              token || undefined,
            );
            if (result.success) {
              setSubscriptions((prev) =>
                prev.filter(
                  (sub) => sub.subscriptionId !== item.subscriptionId,
                ),
              );
              await loadSubscriptions();
            } else {
              Alert.alert("Error", result.error || "Failed to delete");
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["bottom"]}>
      <StatusBar style="dark" />
      <ScrollView className="flex-1 px-4 pt-4">
        <Heading size="lg" className="text-gray-900 font-bold mb-4">
          Alert Subscriptions
        </Heading>

        <Box className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
          <Text className="text-base font-semibold text-gray-900 mb-3">
            Create Subscription
          </Text>

          <VStack className="gap-3">
            <VStack>
              <Text className="text-sm text-gray-700 mb-1">District</Text>
              <TouchableOpacity
                onPress={() => setDistrictModalVisible(true)}
                className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
              >
                <Text className="text-base text-gray-800">
                  {selectedDistrict || "Select district"}
                </Text>
              </TouchableOpacity>
            </VStack>

            <VStack>
              <Text className="text-sm text-gray-700 mb-1">Ward</Text>
              <TouchableOpacity
                onPress={() => setWardModalVisible(true)}
                disabled={!selectedDistrict || wards.length === 0}
                className="border border-gray-300 rounded-lg px-4 py-3 bg-white"
              >
                <Text className="text-base text-gray-800">
                  {selectedWard?.wardName || "Select ward"}
                </Text>
              </TouchableOpacity>
            </VStack>

            <VStack>
              <Text className="text-sm text-gray-700 mb-1">
                Threshold (0-1)
              </Text>
              <Input
                variant="outline"
                size="lg"
                className="border-gray-300 rounded-lg"
              >
                <InputField
                  value={thresholdProbability}
                  onChangeText={setThresholdProbability}
                  keyboardType="numeric"
                  placeholder="0.7"
                />
              </Input>
            </VStack>

            <Button
              className="bg-blue-600 mt-1"
              onPress={handleCreateSubscription}
            >
              <ButtonText className="text-white">Add Subscription</ButtonText>
            </Button>
          </VStack>
        </Box>

        <Text className="text-base font-semibold text-gray-900 mb-2">
          Active Subscriptions ({subscriptions.length})
        </Text>

        {isLoading ? (
          <Text className="text-sm text-gray-600">
            Loading subscriptions...
          </Text>
        ) : subscriptions.length === 0 ? (
          <Box className="bg-white rounded-xl p-4 border border-gray-200">
            <Text className="text-sm text-gray-600">No subscriptions yet.</Text>
          </Box>
        ) : (
          <VStack className="gap-3 pb-8">
            {subscriptions.map((item) => (
              <Box
                key={item.subscriptionId}
                className="bg-white rounded-xl p-4 border border-gray-200"
              >
                <HStack className="items-start justify-between">
                  <VStack className="flex-1 mr-3">
                    <Text className="text-base font-semibold text-gray-900">
                      {item.wardName}
                    </Text>
                    <Text className="text-sm text-gray-600">
                      {item.districtName}
                    </Text>
                    <Text className="text-xs text-gray-500 mt-1">
                      Threshold: {item.thresholdProbability}
                    </Text>
                  </VStack>

                  <VStack className="items-end gap-2">
                    <Switch
                      value={item.isEnabled}
                      onValueChange={() => handleToggleEnabled(item)}
                      trackColor={{ false: "#d1d5db", true: "#1f2937" }}
                      thumbColor="#fff"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-300"
                      onPress={() => handleDeleteSubscription(item)}
                    >
                      <ButtonText className="text-red-600">Delete</ButtonText>
                    </Button>
                  </VStack>
                </HStack>
              </Box>
            ))}
          </VStack>
        )}
      </ScrollView>

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
                  <Text className="text-base text-gray-800">{district}</Text>
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
                  <Text className="text-base text-gray-800">
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
