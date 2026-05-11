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
import { spacing } from "../../theme/spacing";

interface AppRowItemProps {
  icon?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  rightElement?: ReactNode;
}

export default function AppRowItem({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  rightElement,
}: AppRowItemProps) {
  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.leftContent}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.rightContent}>
        {rightElement ? (
          rightElement
        ) : (
          <>
            {value && <Text style={styles.value}>{value}</Text>}
            {showChevron && onPress && <Text style={styles.chevron}>›</Text>}
          </>
        )}
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 56,
  } as ViewStyle,
  leftContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  } as ViewStyle,
  icon: {
    fontSize: 20,
    marginRight: spacing.sm,
  } as TextStyle,
  label: {
    fontSize: 16,
    color: colors.text,
  } as TextStyle,
  rightContent: {
    flexDirection: "row",
    alignItems: "center",
  } as ViewStyle,
  value: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  } as TextStyle,
  chevron: {
    fontSize: 24,
    color: colors.textMuted,
    fontWeight: "300",
  } as TextStyle,
});
