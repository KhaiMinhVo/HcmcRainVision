import { Badge, BadgeText } from "@/components/ui/badge";
import { Center } from "@/components/ui/center";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { Text } from "@/components/ui/text";
import { StatusBar } from "expo-status-bar";
import { FlatList, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AlertListItem from "../../components/alerts/AlertListItem";
import useAppStore from "../../store/useAppStore";

export default function AlertsHomeScreen({ navigation }: any) {
  const alerts = useAppStore((s) => s.alerts);
  const markAlertRead = useAppStore((s) => s.markAlertRead);
  const unreadCount = alerts.filter((a: any) => !a.isRead).length;

  const handleAlertPress = (alert: any) => {
    markAlertRead(alert.id);
    if (alert.area) {
      const areas = useAppStore.getState().areas;
      const area = areas.find((a: any) => a.name === alert.area);
      if (area) {
        navigation.navigate("ListStack", {
          screen: "AreasByWeatherStatus",
          params: { area },
        });
      }
    }
  };

  const handleMarkAllRead = () => {
    alerts.forEach((a: any) => markAlertRead(a.id));
  };

  const EmptyComponent = () => (
    <Center className="flex-1 px-8 py-16">
      <Text className="text-6xl mb-6">🔔</Text>
      <Heading size="xl" className="text-gray-900 font-bold mb-3 text-center">
        No Alerts
      </Heading>
      <Text className="text-base text-gray-600 text-center leading-6">
        You'll receive notifications when severe weather is detected in your
        areas
      </Text>
    </Center>
  );

  const HeaderComponent = () =>
    unreadCount > 0 ? (
      <TouchableOpacity onPress={handleMarkAllRead} className="mb-4">
        <Text className="text-sm text-blue-600 font-medium">
          Mark all as read
        </Text>
      </TouchableOpacity>
    ) : null;

  return (
    <View className="flex-1 bg-gray-50">
      <StatusBar style="dark" />
      <SafeAreaView edges={["top"]}>
        <HStack className="items-center px-4 py-3 bg-white">
          <Heading size="lg" className="text-gray-900 font-bold">
            Alerts
          </Heading>
          {unreadCount > 0 && (
            <Badge className="bg-red-600 rounded-full ml-3">
              <BadgeText className="text-white text-xs font-semibold">
                {unreadCount}
              </BadgeText>
            </Badge>
          )}
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
        ListHeaderComponent={<HeaderComponent />}
        ListEmptyComponent={<EmptyComponent />}
      />
    </View>
  );
}
