import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "../../theme/colors";
import { Alert } from "../../types";
import AppBadge, { StatusDot } from "../ui/AppBadge";

interface AlertListItemProps {
  alert: Alert;
  onPress?: (alert: Alert) => void;
}

export default function AlertListItem({ alert, onPress }: AlertListItemProps) {
  const getTimeAgo = (date: string | Date): string => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    return `${Math.floor(hours / 24)} day${Math.floor(hours / 24) > 1 ? "s" : ""} ago`;
  };

  const getSeverityLabel = (severity: string): string => {
    switch (severity) {
      case "high":
        return "HIGH";
      case "medium":
        return "MEDIUM";
      default:
        return "INFO";
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, !alert.isRead && styles.unread]}
      onPress={() => onPress?.(alert)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <StatusDot status={alert.severity as any} style={styles.dot} />
          <Text style={styles.title} numberOfLines={1}>
            {alert.title}
          </Text>
        </View>
        <AppBadge
          label={getSeverityLabel(alert.severity)}
          variant={alert.severity as any}
          size="small"
        />
      </View>
      <Text style={styles.message} numberOfLines={2}>
        {alert.message}
      </Text>
      <View style={styles.footer}>
        <Text style={styles.area}>{alert.area}</Text>
        <Text style={styles.time}>{getTimeAgo(alert.timestamp)}</Text>
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
  unread: { borderLeftWidth: 3, borderLeftColor: colors.error } as ViewStyle,
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  } as ViewStyle,
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  } as ViewStyle,
  dot: { marginRight: 8 } as ViewStyle,
  title: { fontSize: 15, fontWeight: "600", color: colors.text, flex: 1 },
  message: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  } as ViewStyle,
  area: { fontSize: 12, color: colors.textMuted },
  time: { fontSize: 12, color: colors.textMuted },
});
