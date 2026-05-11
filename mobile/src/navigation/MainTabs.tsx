import { Badge, BadgeText } from "@/components/ui/badge";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useEffect } from "react";
import useAppStore from "../store/useAppStore";

import AlertsStack from "./AlertsStack";
import ListStack from "./ListStack";
import MapStack from "./MapStack";

const Tab = createBottomTabNavigator();

interface TabIconProps {
  icon: string;
  label: string;
  focused: boolean;
  badge?: number;
}

function TabIcon({ icon, label, focused, badge }: TabIconProps) {
  return (
    <VStack className="items-center justify-center relative">
      <Text
        className={`text-2xl mb-1 ${focused ? "opacity-100" : "opacity-50"}`}
      >
        {icon}
      </Text>
      {badge !== undefined && badge > 0 && (
        <Badge className="absolute -top-1 -right-10 bg-red-600 rounded-full">
          <BadgeText className="text-white text-xs font-bold">
            {badge > 9 ? "9+" : badge}
          </BadgeText>
        </Badge>
      )}
      <Text
        className={`text-xs ${
          focused ? "text-gray-900 font-semibold" : "text-gray-500"
        }`}
      >
        {label}
      </Text>
    </VStack>
  );
}

export default function MainTabs() {
  const alerts = useAppStore((s) => s.alerts);
  const token = useAppStore((s) => s.token);
  const syncWeatherData = useAppStore((s) => s.syncWeatherData);
  const unreadAlerts = alerts.filter((a: any) => !a.isRead).length;

  useEffect(() => {
    syncWeatherData();
  }, [token, syncWeatherData]);

  return (
    // @ts-ignore - React Navigation v7 type issue
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 1,
          borderTopColor: "#e5e7eb",
          height: 80,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="MapStack"
        component={MapStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🗺️" label="Map" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="ListStack"
        component={ListStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📋" label="List" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="AlertsStack"
        component={AlertsStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              icon="🔔"
              label="Alerts"
              focused={focused}
              badge={unreadAlerts}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
