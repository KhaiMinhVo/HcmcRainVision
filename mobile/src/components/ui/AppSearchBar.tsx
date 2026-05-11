import {
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "../../theme/colors";

interface AppSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: ViewStyle;
}

export default function AppSearchBar({
  value,
  onChangeText,
  placeholder = "Search...",
  onClear,
  style,
}: AppSearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>🔍</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
      />
      {value && value.length > 0 && (
        <TouchableOpacity onPress={onClear} style={styles.clearButton}>
          <Text style={styles.clearText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.lightGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
  } as ViewStyle,
  icon: { fontSize: 16, marginRight: 8 } as TextStyle,
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
    padding: 0,
  } as TextStyle,
  clearButton: { padding: 4 } as ViewStyle,
  clearText: { fontSize: 14, color: colors.gray } as TextStyle,
});
