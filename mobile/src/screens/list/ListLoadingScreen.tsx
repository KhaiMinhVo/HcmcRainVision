import { Center } from "@/components/ui/center";
import { Spinner } from "@/components/ui/spinner";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ListLoadingScreen() {
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1">
        <Center className="flex-1">
          <VStack className="items-center gap-4">
            <Spinner size="large" color="#3b82f6" />
            <Text className="text-base text-gray-600">Loading list...</Text>
          </VStack>
        </Center>
      </SafeAreaView>
    </View>
  );
}
