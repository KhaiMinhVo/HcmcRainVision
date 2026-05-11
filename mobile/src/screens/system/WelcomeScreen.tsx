import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { SafeAreaView } from "react-native-safe-area-context";

export default function WelcomeScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar style="dark" />
      <VStack className="flex-1">
        <VStack className="flex-1 justify-center items-center px-8">
          <Center className="w-[120px] h-[120px] rounded-full bg-gray-100 mb-8">
            <Ionicons name="rainy" size={64} color="#2563eb" />
          </Center>

          <Heading size="3xl" className="text-gray-900 mb-3 font-bold">
            HCM Rain Map
          </Heading>

          <Text className="text-base text-gray-600 text-center mb-10 leading-6">
            Real-time rain monitoring for Ho Chi Minh City
          </Text>

          <VStack className="w-full gap-3">
            <Text className="text-[15px] text-gray-900 pl-4">
              • Live camera rain detection
            </Text>
            <Text className="text-[15px] text-gray-900 pl-4">
              • District-level rain status
            </Text>
            <Text className="text-[15px] text-gray-900 pl-4">
              • Rain alerts & notifications
            </Text>
            <Text className="text-[15px] text-gray-900 pl-4">
              • Route impact analysis
            </Text>
          </VStack>
        </VStack>

        <Box className="p-6">
          <Button
            size="xl"
            className="bg-blue-600 rounded-xl"
            onPress={() => navigation.navigate("LocationPermission")}
          >
            <ButtonText className="font-semibold text-white text-base">
              Get Started
            </ButtonText>
          </Button>
        </Box>
      </VStack>
    </SafeAreaView>
  );
}
