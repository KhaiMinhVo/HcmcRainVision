import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "../../theme/colors";
import { Camera } from "../../types";
import AppBadge, { StatusDot } from "../ui/AppBadge";

interface CameraListItemProps {
  camera: Camera;
  onPress?: (camera: Camera) => void;
  showDistance?: boolean;
}

export default function CameraListItem({
  camera,
  onPress,
  showDistance = false,
}: CameraListItemProps) {
  const getTimeAgo = (date: string | Date): string => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  };

  const getWeatherLabel = (status: string): string => {
    switch (status) {
      case "heavy":
        return "HEAVY WEATHER";
      case "medium":
        return "MEDIUM WEATHER";
      case "light":
        return "LIGHT WEATHER";
      default:
        return "CLEAR";
    }
  };

  const status = (camera.weatherStatus ||
    camera.rainStatus ||
    "none") as string;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(camera)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.location}>
          <Text style={styles.district}>{camera.district}</Text>
          <Text style={styles.area}> - {camera.area}</Text>
        </View>
        <Text style={styles.time}>{getTimeAgo(camera.lastUpdated)}</Text>
      </View>
      <View style={styles.middle}>
        <Text style={styles.cameraId}>{camera.id}</Text>
        {showDistance && camera.distance && (
          <Text style={styles.distance}>{camera.distance} km</Text>
        )}
      </View>
      <View style={styles.footer}>
        <AppBadge label={getWeatherLabel(status)} variant={status as any} />
        {camera.isOnline !== undefined && (
          <View style={styles.status}>
            <StatusDot status={camera.isOnline ? "online" : "offline"} />
            <Text style={styles.statusText}>
              {camera.isOnline ? "Online" : "Offline"}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  } as ViewStyle,
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  } as ViewStyle,
  location: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  } as ViewStyle,
  district: { fontSize: 15, fontWeight: "600", color: colors.text },
  area: { fontSize: 15, color: colors.textSecondary },
  time: { fontSize: 12, color: colors.textMuted },
  middle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  } as ViewStyle,
  cameraId: { fontSize: 13, color: colors.textMuted },
  distance: { fontSize: 13, color: colors.textSecondary, fontWeight: "500" },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  } as ViewStyle,
  status: { flexDirection: "row", alignItems: "center", gap: 6 } as ViewStyle,
  statusText: { fontSize: 12, color: colors.textSecondary },
});
