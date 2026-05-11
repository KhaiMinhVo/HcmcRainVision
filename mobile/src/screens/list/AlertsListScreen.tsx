import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { StatusBar } from "expo-status-bar";
import { FlatList, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AlertListItem from "../../components/alerts/AlertListItem";
import useAppStore from "../../store/useAppStore";

export default function AlertsListScreen({ navigation }: any) {
  const alerts = useAppStore((s) => s.alerts);
  const markAlertRead = useAppStore((s) => s.markAlertRead);

  const handleAlertPress = (alert: any) => {
    markAlertRead(alert.id);
    // Navigate to related screen based on alert type
    if (alert.area) {
      const areas = useAppStore.getState().areas;
      const area = areas.find((a: any) => a.name === alert.area);
      if (area) {
        navigation.navigate("AreasByWeatherStatus", { area });
      }
    }
  };

  const EmptyComponent = () => (
    <Center className="flex-1 px-8 py-16">
      <Text className="text-6xl mb-6">🔔</Text>
      <Heading size="xl" className="text-gray-900 font-bold mb-3 text-center">
        No Alerts
      </Heading>
      <Text className="text-base text-gray-600 text-center leading-6">
        You're all caught up!
      </Text>
    </Center>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]}>
        <HStack className="items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
          <Heading size="lg" className="text-gray-900 font-bold">
            All Alerts
          </Heading>
          <Text className="text-sm text-gray-600">{alerts.length} total</Text>
        </HStack>
      </SafeAreaView>

      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AlertListItem alert={item} onPress={handleAlertPress} />
        )}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<EmptyComponent />}
      />
    </View>
  );
}
