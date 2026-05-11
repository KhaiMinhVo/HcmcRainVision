import { StyleSheet, View, ViewStyle } from "react-native";
import { colors } from "../../theme/colors";

interface MapPinProps {
  size?: number;
  selected?: boolean;
  style?: ViewStyle;
}

export default function MapPin({
  size = 28,
  selected = false,
  style,
}: MapPinProps) {
  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.pin,
          { width: size, height: size, borderRadius: size / 2 },
          selected && styles.selected,
        ]}
      >
        <View
          style={[
            styles.inner,
            { width: size * 0.6, height: size * 0.6, borderRadius: size * 0.3 },
          ]}
        />
      </View>
      <View style={styles.pointer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center" } as ViewStyle,
  pin: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  } as ViewStyle,
  selected: { borderColor: colors.black, borderWidth: 3 } as ViewStyle,
  inner: { backgroundColor: colors.black } as ViewStyle,
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: colors.black,
    marginTop: -2,
  } as ViewStyle,
});
