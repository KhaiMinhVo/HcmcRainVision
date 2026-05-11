import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";
import useAppStore from "../../store/useAppStore";

export default function OfflineModeScreen({ navigation }: any) {
  const setOffline = useAppStore((s) => s.setOffline);

  const handleRetry = () => {
    setOffline(false);
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <VStack className="flex-1">
        <VStack className="flex-1 justify-center items-center px-8">
          <Center className="w-[100px] h-[100px] rounded-full bg-gray-100 mb-8">
            <Text className="text-5xl">📡</Text>
          </Center>

          <Text className="text-2xl font-bold text-gray-900 mb-3">
            You're Offline
          </Text>

          <Text className="text-[15px] text-gray-600 text-center leading-6 mb-8">
            No internet connection detected. Some features may be limited.
          </Text>

          <VStack className="w-full px-4">
            <Text className="text-sm text-gray-500 mb-2">
              • Cached data will be displayed
            </Text>
            <Text className="text-sm text-gray-500 mb-2">
              • Live camera feeds unavailable
            </Text>
            <Text className="text-sm text-gray-500 mb-2">
              • Alerts won't update
            </Text>
          </VStack>
        </VStack>

        <Box className="p-6">
          <Button
            size="xl"
            className="bg-blue-600 rounded-xl mb-3"
            onPress={handleRetry}
          >
            <ButtonText className="font-semibold text-white text-base">
              Retry Connection
            </ButtonText>
          </Button>
          <Button
            size="xl"
            variant="outline"
            className="border-gray-300 rounded-xl"
            onPress={() => navigation.goBack()}
          >
            <ButtonText className="text-gray-900 text-base">
              Continue Offline
            </ButtonText>
          </Button>
        </Box>
      </VStack>
    </SafeAreaView>
  );
}
