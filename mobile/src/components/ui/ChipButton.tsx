import {
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { colors } from "../../theme/colors";

interface ChipButtonProps {
  label: string;
  selected?: boolean;
  onPress: () => void;
  style?: ViewStyle;
}

/**
 * ChipButton - Nút lựa chọn dạng chip/pill
 * Hỗ trợ cả single-select và multi-select
 */
export default function ChipButton({
  label,
  selected = false,
  onPress,
  style,
}: ChipButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected, style]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    marginRight: 8,
    marginBottom: 8,
  } as ViewStyle,
  chipSelected: {
    backgroundColor: colors.black,
    borderColor: colors.black,
  } as ViewStyle,
  chipText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  } as TextStyle,
  chipTextSelected: {
    color: colors.white,
  } as TextStyle,
});
