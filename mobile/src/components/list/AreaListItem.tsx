import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "../../theme/colors";
import { Area } from "../../types";
import AppBadge from "../ui/AppBadge";

interface AreaListItemProps {
  area: Area;
  onPress?: (area: Area) => void;
}

export default function AreaListItem({ area, onPress }: AreaListItemProps) {
  const getWeatherLabel = (status: string): string => {
    switch (status) {
      case "heavy":
        return "HEAVY";
      case "medium":
        return "MEDIUM";
      case "light":
        return "LIGHT";
      default:
        return "CLEAR";
    }
  };

  const status = (area.weatherStatus || area.rainStatus || "none") as string;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(area)}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <Text style={styles.name}>{area.name}</Text>
        <Text style={styles.description}>{area.description}</Text>
        <Text style={styles.cameras}>{area.cameraCount} cameras</Text>
      </View>
      <View style={styles.right}>
        <AppBadge label={getWeatherLabel(status)} variant={status as any} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  } as ViewStyle,
  left: { flex: 1 } as ViewStyle,
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 4,
  },
  description: { fontSize: 13, color: colors.textSecondary, marginBottom: 4 },
  cameras: { fontSize: 12, color: colors.textMuted },
  right: { marginLeft: 12 } as ViewStyle,
});
