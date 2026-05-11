import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AllCamerasMapScreen from "../screens/map/AllCamerasMapScreen";
import CameraDetailMapScreen from "../screens/map/CameraDetailMapScreen";
import ConnectionErrorScreen from "../screens/map/ConnectionErrorScreen";
import HeatmapScreen from "../screens/map/HeatmapScreen";
import LoadingScreen from "../screens/map/LoadingScreen";
import MapHomeScreen from "../screens/map/MapHomeScreen";
import NoDataScreen from "../screens/map/NoDataScreen";
import RouteImpactScreen from "../screens/map/RouteImpactScreen";

const Stack = createNativeStackNavigator();

export default function MapStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MapHome" component={MapHomeScreen} />
      <Stack.Screen name="Heatmap" component={HeatmapScreen} />
      <Stack.Screen name="AllCamerasMap" component={AllCamerasMapScreen} />
      <Stack.Screen name="CameraDetailMap" component={CameraDetailMapScreen} />
      <Stack.Screen name="NoData" component={NoDataScreen} />
      <Stack.Screen name="Loading" component={LoadingScreen} />
      <Stack.Screen name="ConnectionError" component={ConnectionErrorScreen} />
      <Stack.Screen name="RouteImpact" component={RouteImpactScreen} />
    </Stack.Navigator>
  );
}
