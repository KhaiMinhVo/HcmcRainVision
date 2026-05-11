import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AlertsHomeScreen from "../screens/alerts/AlertsHomeScreen";

const Stack = createNativeStackNavigator();

export default function AlertsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AlertsHome" component={AlertsHomeScreen} />
    </Stack.Navigator>
  );
}
