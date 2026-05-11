import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors } from "../../theme/colors";
import AppCard from "../ui/AppCard";

interface HeatLegendCardProps {
  style?: ViewStyle | ViewStyle[];
}

export default function HeatLegendCard({ style }: HeatLegendCardProps) {
  return (
    <AppCard style={style instanceof Array ? style : [styles.card, style]}>
      <Text style={styles.title}>INTENSITY</Text>
      <View style={styles.legend}>
        <Text style={styles.label}>High</Text>
        <View style={styles.gradient}>
          <View style={[styles.bar, { backgroundColor: colors.rainHeavy }]} />
          <View style={[styles.bar, { backgroundColor: colors.rainMedium }]} />
          <View style={[styles.bar, { backgroundColor: colors.rainLight }]} />
          <View style={[styles.bar, { backgroundColor: colors.rainNone }]} />
        </View>
        <Text style={styles.label}>Low</Text>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, minWidth: 80 } as ViewStyle,
  title: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: "center",
  },
  legend: { alignItems: "center", gap: 4 } as ViewStyle,
  gradient: { width: 20, gap: 2 } as ViewStyle,
  bar: { height: 20, borderRadius: 2 } as ViewStyle,
  label: { fontSize: 10, color: colors.textMuted },
});
