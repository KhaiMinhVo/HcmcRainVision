import { Button, ButtonText } from "@/components/ui/button";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function NoDataScreen({ navigation }: any) {
  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <SafeAreaView className="flex-1">
        <Center className="flex-1 px-8">
          <VStack className="items-center gap-4">
            <Text className="text-6xl mb-2">📊</Text>
            <Heading size="xl" className="text-gray-900 font-bold text-center">
              No Data Available
            </Heading>
            <Text className="text-base text-gray-600 text-center leading-6 mb-4">
              There's no rain data available at the moment. Please check back
              later.
            </Text>
            <Button onPress={() => navigation.goBack()} className="bg-blue-600">
              <ButtonText className="text-white font-medium">
                Go Back
              </ButtonText>
            </Button>
          </VStack>
        </Center>
      </SafeAreaView>
    </View>
  );
}
