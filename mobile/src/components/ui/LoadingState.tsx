import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "../../theme/colors";

interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({
  message = "Loading...",
}: LoadingStateProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.black} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: colors.background,
  } as ViewStyle,
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 16,
  } as TextStyle,
});
