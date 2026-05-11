import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import { colors } from "../../theme/colors";
import AppButton from "./AppButton";

interface EmptyStateProps {
  icon?: string;
  title: string;
  message?: string;
  buttonText?: string;
  onButtonPress?: () => void;
}

export default function EmptyState({
  icon = "📭",
  title,
  message,
  buttonText,
  onButtonPress,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
      {buttonText && onButtonPress && (
        <AppButton
          title={buttonText}
          onPress={onButtonPress}
          variant="outline"
          style={styles.button}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  } as ViewStyle,
  icon: { fontSize: 64, marginBottom: 16 } as TextStyle,
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
    marginBottom: 8,
  } as TextStyle,
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  } as TextStyle,
  button: { marginTop: 8 } as ViewStyle,
});
