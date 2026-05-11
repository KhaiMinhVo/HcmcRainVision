import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import useAppStore from "../../store/useAppStore";

export default function EnableAlertsScreen({ navigation }: any) {
  const setNotificationEnabled = useAppStore((s) => s.setNotificationEnabled);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const handleEnable = () => {
    setNotificationEnabled(true);
    completeOnboarding();
  };

  const handleSkip = () => {
    setNotificationEnabled(false);
    completeOnboarding();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <VStack className="flex-1">
        <VStack className="flex-1 justify-center items-center px-8">
          <Center className="w-[100px] h-[100px] rounded-full bg-gray-100 mb-8">
            <Ionicons name="notifications" size={56} color="#2563eb" />
          </Center>

          <Text className="text-2xl font-bold text-gray-900 mb-3">
            Rain Alerts
          </Text>

          <Text className="text-[15px] text-gray-600 text-center leading-6 mb-8">
            Get notified when heavy rain is detected in your saved areas or
            along your routes.
          </Text>

          <VStack className="w-full gap-4 px-6">
            <Box className="flex-row items-center">
              <Box className="w-3 h-3 rounded-full bg-red-500 mr-3" />
              <Text className="text-[15px] text-gray-900">
                Heavy Rain Warning
              </Text>
            </Box>
            <Box className="flex-row items-center">
              <Box className="w-3 h-3 rounded-full bg-yellow-500 mr-3" />
              <Text className="text-[15px] text-gray-900">
                Medium Rain Alert
              </Text>
            </Box>
            <Box className="flex-row items-center">
              <Box className="w-3 h-3 rounded-full bg-blue-500 mr-3" />
              <Text className="text-[15px] text-gray-900">
                Camera Status Updates
              </Text>
            </Box>
          </VStack>
        </VStack>

        <Box className="p-6">
          <Button
            size="xl"
            className="bg-blue-600 rounded-xl mb-3"
            onPress={handleEnable}
          >
            <ButtonText className="font-semibold text-white text-base">
              Enable Notifications
            </ButtonText>
          </Button>
          <Button
            size="xl"
            variant="outline"
            className="border-0 bg-transparent"
            onPress={handleSkip}
          >
            <ButtonText className="text-gray-600 text-base">
              Maybe Later
            </ButtonText>
          </Button>
        </Box>
      </VStack>
    </SafeAreaView>
  );
}
