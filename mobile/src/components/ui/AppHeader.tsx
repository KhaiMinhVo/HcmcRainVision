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

interface AppHeaderProps {
  title: string;
  onBack?: () => void;
  rightComponent?: ReactNode;
  rightText?: string;
  onRightPress?: () => void;
  transparent?: boolean;
  borderBottom?: boolean;
}

export default function AppHeader({
  title,
  onBack,
  rightComponent,
  rightText,
  onRightPress,
  transparent = false,
  borderBottom = true,
}: AppHeaderProps) {
  return (
    <View
      style={[
        styles.header,
        transparent && styles.transparent,
        borderBottom && styles.borderBottom,
      ]}
    >
      <View style={styles.left}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.right}>
        {rightComponent}
        {rightText && (
          <TouchableOpacity onPress={onRightPress} style={styles.rightButton}>
            <Text style={styles.rightText}>{rightText}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.white,
  } as ViewStyle,
  transparent: {
    backgroundColor: "transparent",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  } as ViewStyle,
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  } as ViewStyle,
  left: { width: 60 } as ViewStyle,
  right: { width: 60, alignItems: "flex-end" } as ViewStyle,
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  } as TextStyle,
  backButton: { padding: 4 } as ViewStyle,
  backText: {
    fontSize: 28,
    color: colors.text,
    fontWeight: "300",
  } as TextStyle,
  rightButton: { padding: 4 } as ViewStyle,
  rightText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  } as TextStyle,
});
