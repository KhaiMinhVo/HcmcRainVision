import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { colors } from "../../theme/colors";
import { spacing } from "../../theme/spacing";

interface AppSectionTitleProps {
  title: string;
  style?: ViewStyle;
}

export default function AppSectionTitle({
  title,
  style,
}: AppSectionTitleProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  } as ViewStyle,
  title: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  } as TextStyle,
});
