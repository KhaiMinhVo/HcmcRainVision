import { StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "../../theme/colors";

interface AppDividerProps {
  style?: ViewStyle;
}

export default function AppDivider({ style }: AppDividerProps) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 8,
  } as ViewStyle,
});
