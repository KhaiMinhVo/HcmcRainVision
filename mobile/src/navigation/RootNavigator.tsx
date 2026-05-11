import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { FavoritesProvider } from "../context/FavoritesContext";
import useAppStore from "../store/useAppStore";

import CameraFormScreen from "../screens/admin/CameraFormScreen";
import AlertSubscriptionsScreen from "../screens/system/AlertSubscriptionsScreen";
import ChangePasswordScreen from "../screens/system/ChangePasswordScreen";
import EditProfileScreen from "../screens/system/EditProfileScreen";
import ProfileScreen from "../screens/system/ProfileScreen";
import ChatbotScreen from "../screens/system/ChatbotScreen";
import SettingsScreen from "../screens/system/SettingsScreen";
import AdminStack from "./AdminStack";
import MainTabs from "./MainTabs";
import SystemStack from "./SystemStack";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const isAuthenticated = useAppStore((s: any) => s.isAuthenticated);
  const hasOnboarded = useAppStore((s: any) => s.hasOnboarded);

  return (
    <FavoritesProvider>
      <NavigationContainer>
        <Stack.Navigator id="RootStack" screenOptions={{ headerShown: true }}>
          {!isAuthenticated || !hasOnboarded ? (
            <Stack.Screen
              name="SystemStack"
              component={SystemStack}
              options={{ headerShown: false }}
            />
          ) : (
            <>
              <Stack.Screen
                name="MainTabs"
                component={MainTabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{
                  title: "Settings",
                  headerBackTitle: "Back",
                }}
              />
              <Stack.Screen
                name="Chatbot"
                component={ChatbotScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{
                  title: "Profile",
                  headerBackTitle: "Settings",
                }}
              />
              <Stack.Screen
                name="EditProfile"
                component={EditProfileScreen}
                options={{
                  title: "Edit Profile",
                  headerBackTitle: "Back",
                }}
              />
              <Stack.Screen
                name="ChangePassword"
                component={ChangePasswordScreen}
                options={{
                  title: "Change Password",
                  headerBackTitle: "Settings",
                }}
              />
              <Stack.Screen
                name="AlertSubscriptions"
                component={AlertSubscriptionsScreen}
                options={{
                  title: "Alert Subscriptions",
                  headerBackTitle: "Settings",
                }}
              />
              <Stack.Screen
                name="AdminStack"
                component={AdminStack}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="CameraForm"
                component={CameraFormScreen}
                options={{ headerShown: false }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </FavoritesProvider>
  );
}
