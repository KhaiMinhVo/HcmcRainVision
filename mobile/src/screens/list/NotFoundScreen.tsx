import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NotFoundScreen({ navigation }: any) {
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1" edges={["top"]}>
        <Center className="flex-1 px-8">
          <Text className="text-6xl mb-6">🔍</Text>
          <Heading
            size="2xl"
            className="text-gray-900 font-bold mb-3 text-center"
          >
            Not Found
          </Heading>
          <Text className="text-base text-gray-600 text-center mb-8 leading-6">
            The item you're looking for doesn't exist or has been removed.
          </Text>
          <Button
            size="lg"
            className="bg-blue-600 rounded-xl"
            onPress={() => navigation.goBack()}
          >
            <ButtonText className="text-white font-semibold">
              Go Back
            </ButtonText>
          </Button>
        </Center>
      </SafeAreaView>
    </View>
  );
}
