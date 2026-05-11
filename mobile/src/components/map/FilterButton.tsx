import { StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import { colors } from "../../theme/colors";

interface FilterButtonProps {
  onPress: () => void;
}

/**
 * FilterButton - Icon filter button ở góc trái trên
 * Sử dụng emoji/unicode character cho icon
 */
export default function FilterButton({ onPress }: FilterButtonProps) {
  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Filter Icon - Using funnel emoji */}
      <Text style={styles.icon}>🔍</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  } as ViewStyle,
  icon: {
    fontSize: 20,
    color: colors.text,
  },
});
