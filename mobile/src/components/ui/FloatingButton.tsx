import { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "../../theme/colors";

type IconType = "settings" | "locate" | "filter" | "close" | "back" | "refresh";

interface FloatingButtonProps {
  icon: IconType | string;
  onPress: () => void;
  size?: number;
  style?: ViewStyle;
}

export function FloatingButton({
  icon,
  onPress,
  size = 48,
  style,
}: FloatingButtonProps) {
  const iconMap: Record<IconType, string> = {
    settings: "⚙️",
    locate: "📍",
    filter: "⊞",
    close: "✕",
    back: "←",
    refresh: "↻",
  };

  const displayIcon = iconMap[icon as IconType] || icon;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.icon}>{displayIcon}</Text>
    </TouchableOpacity>
  );
}

type PositionType = "right" | "left";

interface FloatingButtonGroupProps {
  children: ReactNode;
  position?: PositionType;
  style?: ViewStyle;
}

export function FloatingButtonGroup({
  children,
  position = "right",
  style,
}: FloatingButtonGroupProps) {
  return (
    <View
      style={[
        styles.group,
        position === "right" && styles.groupRight,
        position === "left" && styles.groupLeft,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,
  icon: { fontSize: 20 } as TextStyle,
  group: { position: "absolute", gap: 12 } as ViewStyle,
  groupRight: { right: 16, bottom: 100 } as ViewStyle,
  groupLeft: { left: 16, bottom: 100 } as ViewStyle,
});
