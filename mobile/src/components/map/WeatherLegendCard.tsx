import { StyleSheet, Text, View, ViewStyle } from "react-native";
import { colors } from "../../theme/colors";
import AppCard from "../ui/AppCard";

interface WeatherLegendCardProps {
  lastUpdated?: string;
  style?: ViewStyle | ViewStyle[];
}

export default function WeatherLegendCard({
  lastUpdated = "14:23",
  style,
}: WeatherLegendCardProps) {
  return (
    <AppCard style={style instanceof Array ? style : [styles.card, style]}>
      <Text style={styles.lastUpdated}>Last updated: {lastUpdated}</Text>
      <Text style={styles.title}>WEATHER INTENSITY</Text>
      <View style={styles.legend}>
        <View style={styles.item}>
          <View style={[styles.color, { backgroundColor: colors.rainLight }]} />
          <Text style={styles.label}>Light</Text>
        </View>
        <View style={styles.item}>
          <View
            style={[styles.color, { backgroundColor: colors.rainMedium }]}
          />
          <Text style={styles.label}>Medium</Text>
        </View>
        <View style={styles.item}>
          <View style={[styles.color, { backgroundColor: colors.rainHeavy }]} />
          <Text style={styles.label}>Heavy</Text>
        </View>
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: { padding: 12, minWidth: 160 } as ViewStyle,
  lastUpdated: { fontSize: 11, color: colors.textMuted, marginBottom: 4 },
  title: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  legend: { gap: 6 } as ViewStyle,
  item: { flexDirection: "row", alignItems: "center", gap: 8 } as ViewStyle,
  color: { width: 24, height: 16, borderRadius: 3 } as ViewStyle,
  label: { fontSize: 12, color: colors.textSecondary },
});
