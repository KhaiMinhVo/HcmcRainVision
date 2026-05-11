import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ForgotPasswordScreen from "../screens/auth/ForgotPasswordScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";
import EnableAlertsScreen from "../screens/system/EnableAlertsScreen";
import LocationPermissionScreen from "../screens/system/LocationPermissionScreen";
import OfflineModeScreen from "../screens/system/OfflineModeScreen";
import WelcomeScreen from "../screens/system/WelcomeScreen";

const Stack = createNativeStackNavigator();

export default function SystemStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen
        name="LocationPermission"
        component={LocationPermissionScreen}
      />
      <Stack.Screen name="EnableAlerts" component={EnableAlertsScreen} />
      <Stack.Screen name="OfflineMode" component={OfflineModeScreen} />
    </Stack.Navigator>
  );
}
