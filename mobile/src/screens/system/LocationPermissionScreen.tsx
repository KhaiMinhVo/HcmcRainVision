import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import useAppStore from "../../store/useAppStore";

export default function LocationPermissionScreen({ navigation }: any) {
  const setLocationPermission = useAppStore((s) => s.setLocationPermission);

  const handleAllow = () => {
    setLocationPermission("while_using");
    navigation.navigate("EnableAlerts");
  };

  const handleSkip = () => {
    setLocationPermission("denied");
    navigation.navigate("EnableAlerts");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <VStack className="flex-1">
        <VStack className="flex-1 justify-center items-center px-8">
          <Center className="w-[100px] h-[100px] rounded-full bg-gray-100 mb-8">
            <Ionicons name="location" size={56} color="#2563eb" />
          </Center>

          <Text className="text-2xl font-bold text-gray-900 mb-3">
            Location Access
          </Text>

          <Text className="text-[15px] text-gray-600 text-center leading-6 mb-8">
            Allow location access to see nearby cameras and get alerts for your
            area.
          </Text>

          <VStack className="w-full gap-4 px-6">
            <Box className="flex-row items-center">
              <Ionicons
                name="checkmark-circle"
                size={22}
                color="#16a34a"
                style={{ marginRight: 12 }}
              />
              <Text className="text-[15px] text-gray-900">
                See cameras near you
              </Text>
            </Box>
            <Box className="flex-row items-center">
              <Ionicons
                name="checkmark-circle"
                size={22}
                color="#16a34a"
                style={{ marginRight: 12 }}
              />
              <Text className="text-[15px] text-gray-900">
                Get local rain alerts
              </Text>
            </Box>
            <Box className="flex-row items-center">
              <Ionicons
                name="checkmark-circle"
                size={22}
                color="#16a34a"
                style={{ marginRight: 12 }}
              />
              <Text className="text-[15px] text-gray-900">
                Route impact analysis
              </Text>
            </Box>
          </VStack>
        </VStack>

        <Box className="p-6">
          <Button
            size="xl"
            className="bg-blue-600 rounded-xl mb-3"
            onPress={handleAllow}
          >
            <ButtonText className="font-semibold text-white text-base">
              Allow Location
            </ButtonText>
          </Button>
          <Button
            size="xl"
            variant="outline"
            className="border-0 bg-transparent"
            onPress={handleSkip}
          >
            <ButtonText className="text-gray-600 text-base">
              Skip for Now
            </ButtonText>
          </Button>
        </Box>
      </VStack>
    </SafeAreaView>
  );
}
