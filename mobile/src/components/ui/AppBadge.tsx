import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { colors } from "../../theme/colors";

type BadgeVariant =
  | "default"
  | "heavy"
  | "medium"
  | "light"
  | "none"
  | "high"
  | "low"
  | "info"
  | "warning"
  | "success";
type BadgeSize = "small" | "medium";

interface AppBadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  style?: ViewStyle;
}

export default function AppBadge({
  label,
  variant = "default",
  size = "medium",
  style,
}: AppBadgeProps) {
  const getBackgroundColor = (): string => {
    switch (variant) {
      case "heavy":
        return colors.badgeHeavy;
      case "medium":
        return colors.badgeMedium;
      case "light":
        return colors.badgeLight;
      case "none":
        return colors.badgeNoRain;
      case "high":
        return colors.badgeHigh;
      case "low":
        return colors.badgeInfo;
      case "info":
        return colors.badgeInfo;
      case "warning":
        return colors.warning;
      case "success":
        return colors.success;
      default:
        return colors.badgeMedium;
    }
  };

  const getTextColor = (): string => {
    if (["none", "light"].includes(variant)) {
      return colors.text;
    }
    return colors.white;
  };

  return (
    <View
      style={[
        styles.badge,
        size === "small" && styles.badgeSmall,
        { backgroundColor: getBackgroundColor() },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          size === "small" && styles.textSmall,
          { color: getTextColor() },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

type StatusType =
  | "online"
  | "offline"
  | "high"
  | "medium"
  | "low"
  | "heavy"
  | "light"
  | "none"
  | "info";

interface StatusDotProps {
  status: StatusType;
  style?: ViewStyle;
}

export function StatusDot({ status, style }: StatusDotProps) {
  const getColor = (): string => {
    switch (status) {
      case "online":
        return colors.online;
      case "offline":
        return colors.offline;
      case "high":
        return colors.error;
      case "medium":
        return colors.warning;
      case "low":
        return colors.info;
      case "heavy":
        return colors.badgeHeavy;
      case "light":
        return colors.badgeLight;
      case "none":
        return colors.badgeNoRain;
      case "info":
        return colors.info;
      default:
        return colors.gray;
    }
  };

  return <View style={[styles.dot, { backgroundColor: getColor() }, style]} />;
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  } as ViewStyle,
  badgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  } as ViewStyle,
  text: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  } as TextStyle,
  textSmall: {
    fontSize: 9,
  } as TextStyle,
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  } as ViewStyle,
});
