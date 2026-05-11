import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "../../theme/colors";

type CardVariant = "default" | "bordered";

interface AppCardProps {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: CardVariant;
  noPadding?: boolean;
}

export default function AppCard({
  children,
  style,
  variant = "default",
  noPadding = false,
}: AppCardProps) {
  return (
    <View
      style={[
        styles.card,
        variant === "bordered" && styles.bordered,
        noPadding && styles.noPadding,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  } as ViewStyle,
  bordered: {
    borderColor: colors.black,
  } as ViewStyle,
  noPadding: {
    padding: 0,
  } as ViewStyle,
});
