import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { colors } from "../../theme/colors";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "small" | "medium" | "large";

interface AppButtonProps {
  title?: string;
  label?: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function AppButton({
  title,
  label,
  onPress,
  variant = "primary",
  size = "medium",
  disabled = false,
  loading = false,
  style,
  textStyle,
}: AppButtonProps) {
  const buttonText = label || title;

  const getButtonStyle = (): ViewStyle => {
    switch (variant) {
      case "primary":
        return styles.primary;
      case "secondary":
        return styles.secondary;
      case "outline":
        return styles.outline;
      case "ghost":
        return styles.ghost;
      default:
        return styles.primary;
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case "outline":
      case "ghost":
        return styles.textDark;
      default:
        return styles.textLight;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        size === "small" && styles.small,
        size === "large" && styles.large,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? colors.white : colors.black}
        />
      ) : (
        <Text
          style={[
            styles.text,
            getTextStyle(),
            disabled && styles.textDisabled,
            textStyle,
          ]}
        >
          {buttonText}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "transparent",
    paddingVertical: 14,
    paddingHorizontal: 24,
  } as ViewStyle,
  primary: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  } as ViewStyle,
  secondary: {
    backgroundColor: colors.lightGray,
    borderColor: colors.border,
  } as ViewStyle,
  outline: {
    backgroundColor: "transparent",
    borderColor: colors.black,
  } as ViewStyle,
  ghost: {
    backgroundColor: "transparent",
  } as ViewStyle,
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  } as ViewStyle,
  large: {
    paddingVertical: 18,
    paddingHorizontal: 32,
  } as ViewStyle,
  disabled: {
    backgroundColor: colors.lightGray,
    borderColor: colors.lightGray,
  } as ViewStyle,
  text: {
    fontSize: 15,
    fontWeight: "600",
  } as TextStyle,
  textLight: {
    color: colors.white,
  } as TextStyle,
  textDark: {
    color: colors.black,
  } as TextStyle,
  textDisabled: {
    color: colors.gray,
  } as TextStyle,
});
