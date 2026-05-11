import { ReactNode } from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface FakeMapProps {
  children?: ReactNode;
  style?: ViewStyle;
}

export default function FakeMap({ children, style }: FakeMapProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.gridContainer}>
        {Array.from({ length: 25 }).map((_, rowIndex) => (
          <View key={rowIndex} style={styles.row}>
            {Array.from({ length: 15 }).map((_, colIndex) => (
              <View
                key={colIndex}
                style={[
                  styles.cell,
                  (rowIndex + colIndex) % 2 === 0
                    ? styles.cellLight
                    : styles.cellDark,
                ]}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.overlay}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8E8E8",
    overflow: "hidden",
  } as ViewStyle,
  gridContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  } as ViewStyle,
  row: { flexDirection: "row" } as ViewStyle,
  cell: {
    width: 30,
    height: 30,
    borderWidth: 0.5,
    borderColor: "#D0D0D0",
  } as ViewStyle,
  cellLight: { backgroundColor: "#F8F9FA" } as ViewStyle,
  cellDark: { backgroundColor: "#F0F1F3" } as ViewStyle,
  overlay: { ...StyleSheet.absoluteFillObject } as ViewStyle,
});
