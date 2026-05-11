import * as Location from "expo-location";
import * as Notifications from "expo-notifications";

interface LocationCoords {
  latitude: number;
  longitude: number;
}

// Location Permission
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error requesting location permission:", error);
    return false;
  }
}

export async function checkLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error checking location permission:", error);
    return false;
  }
}

export async function getCurrentLocation(): Promise<LocationCoords | null> {
  try {
    const hasPermission = await checkLocationPermission();
    if (!hasPermission) {
      const granted = await requestLocationPermission();
      if (!granted) return null;
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error("Error getting current location:", error);
    return null;
  }
}

// Notifications Permission
export async function requestNotificationPermission(): Promise<boolean> {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return false;
  }
}

export async function checkNotificationPermission(): Promise<boolean> {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error checking notification permission:", error);
    return false;
  }
}

// Configure notification handler
export function configureNotifications(): void {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export async function schedulePushNotification(
  title: string,
  body: string,
  data: any = {},
): Promise<void> {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
    },
    trigger: null, // immediately
  });
}
