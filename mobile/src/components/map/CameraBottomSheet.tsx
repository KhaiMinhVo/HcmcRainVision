import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "../../theme/colors";
import { Camera } from "../../types";
import AppBadge from "../ui/AppBadge";

interface CameraBottomSheetProps {
  camera?: Camera | null;
  onClose: () => void;
  onExpand: () => void;
}

export default function CameraBottomSheet({
  camera,
  onClose,
  onExpand,
}: CameraBottomSheetProps) {
  if (!camera) return null;

  const getTimeAgo = (date: string | Date): string => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (mins < 60) return `${mins} min ago`;
    return `${Math.floor(mins / 60)} hours ago`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.handle} />
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.district}>{camera.district}</Text>
        <Text style={styles.cameraId}>{camera.id}</Text>
        <AppBadge
          label={`${camera.rainStatus.toUpperCase()} RAIN`}
          variant={camera.rainStatus as any}
          style={styles.badge}
        />
        <Text style={styles.updated}>
          Last updated: {getTimeAgo(camera.lastUpdated)}
        </Text>
        <TouchableOpacity onPress={onExpand}>
          <Text style={styles.expand}>Tap to expand →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  } as ViewStyle,
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.lightGray,
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
  } as ViewStyle,
  closeButton: {
    position: "absolute",
    top: 12,
    right: 16,
    padding: 8,
  } as ViewStyle,
  closeText: { fontSize: 18, color: colors.gray },
  content: { padding: 20, paddingTop: 24 } as ViewStyle,
  district: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  cameraId: { fontSize: 14, color: colors.textSecondary, marginBottom: 12 },
  badge: { marginBottom: 12 } as ViewStyle,
  updated: { fontSize: 12, color: colors.textMuted, marginBottom: 8 },
  expand: { fontSize: 14, color: colors.textSecondary, fontWeight: "500" },
});
