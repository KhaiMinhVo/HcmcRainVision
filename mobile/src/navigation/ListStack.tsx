import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AlertsListScreen from "../screens/list/AlertsListScreen";
import AllAreasScreen from "../screens/list/AllAreasScreen";
import AllCamerasListScreen from "../screens/list/AllCamerasListScreen";
import AreasByWeatherStatusScreen from "../screens/list/AreasByWeatherStatusScreen";
import FavoriteCamerasScreen from "../screens/list/FavoriteCamerasScreen";
import FavoriteRainByWardScreen from "../screens/list/FavoriteRainByWardScreen";
import HeavyWeatherListScreen from "../screens/list/HeavyWeatherListScreen";
import LightWeatherListScreen from "../screens/list/LightWeatherListScreen";
import ListHomeScreen from "../screens/list/ListHomeScreen";
import ListLoadingScreen from "../screens/list/ListLoadingScreen";
import MediumWeatherListScreen from "../screens/list/MediumWeatherListScreen";
import NearbyCamerasScreen from "../screens/list/NearbyCamerasScreen";
import NotFoundScreen from "../screens/list/NotFoundScreen";
import OfflineCamerasScreen from "../screens/list/OfflineCamerasScreen";
import OnlineCamerasScreen from "../screens/list/OnlineCamerasScreen";
import SeverityRankingScreen from "../screens/list/SeverityRankingScreen";

const Stack = createNativeStackNavigator();

export default function ListStack() {
  return (
    // @ts-ignore - React Navigation v7 type issue
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ListHome" component={ListHomeScreen} />
      <Stack.Screen name="AllCamerasList" component={AllCamerasListScreen} />
      <Stack.Screen name="NearbyCameras" component={NearbyCamerasScreen} />
      <Stack.Screen name="OnlineCameras" component={OnlineCamerasScreen} />
      <Stack.Screen name="OfflineCameras" component={OfflineCamerasScreen} />
      <Stack.Screen name="FavoriteCameras" component={FavoriteCamerasScreen} />
      <Stack.Screen
        name="FavoriteRainByWard"
        component={FavoriteRainByWardScreen}
      />
      <Stack.Screen name="AllAreas" component={AllAreasScreen} />
      <Stack.Screen
        name="AreasByWeatherStatus"
        component={AreasByWeatherStatusScreen}
      />
      <Stack.Screen name="SeverityRanking" component={SeverityRankingScreen} />
      <Stack.Screen
        name="LightWeatherList"
        component={LightWeatherListScreen}
      />
      <Stack.Screen
        name="MediumWeatherList"
        component={MediumWeatherListScreen}
      />
      <Stack.Screen
        name="HeavyWeatherList"
        component={HeavyWeatherListScreen}
      />
      <Stack.Screen name="AlertsList" component={AlertsListScreen} />
      <Stack.Screen name="NotFound" component={NotFoundScreen} />
      <Stack.Screen name="ListLoading" component={ListLoadingScreen} />
    </Stack.Navigator>
  );
}
