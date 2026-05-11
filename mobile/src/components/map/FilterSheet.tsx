import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import { colors } from "../../theme/colors";
import ChipButton from "../ui/ChipButton";

const SCREEN_HEIGHT = Dimensions.get("window").height;
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.6; // 60% màn hình

type RainStatus = "HEAVY" | "MEDIUM" | "LIGHT" | "NONE" | null;

interface FilterOptions {
  rainStatus: RainStatus;
  onlineOnly: boolean;
  favoritesOnly: boolean;
}

interface FilterSheetProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: Partial<FilterOptions>;
}

/**
 * FilterSheet - Bottom sheet cho filter options
 * Slide up animation không dùng thư viện bên ngoài
 */
export default function FilterSheet({
  visible,
  onClose,
  onApply,
  initialFilters,
}: FilterSheetProps) {
  // Local state cho filters
  const [rainStatus, setRainStatus] = useState<RainStatus>(
    initialFilters?.rainStatus || null,
  );
  const [onlineOnly, setOnlineOnly] = useState(
    initialFilters?.onlineOnly || false,
  );
  const [favoritesOnly, setFavoritesOnly] = useState(
    initialFilters?.favoritesOnly || false,
  );

  // Animation value
  const slideAnim = useRef(new Animated.Value(SHEET_HEIGHT)).current;

  // Reset filters khi mở sheet
  useEffect(() => {
    if (visible) {
      setRainStatus(initialFilters?.rainStatus || null);
      setOnlineOnly(initialFilters?.onlineOnly || false);
      setFavoritesOnly(initialFilters?.favoritesOnly || false);
      // Slide up
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      // Slide down
      Animated.timing(slideAnim, {
        toValue: SHEET_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, initialFilters]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: SHEET_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleClearAll = () => {
    setRainStatus(null);
    setOnlineOnly(false);
    setFavoritesOnly(false);
  };

  const handleApply = () => {
    onApply({
      rainStatus,
      onlineOnly,
      favoritesOnly,
    });
    handleClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* Bottom Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Handle */}
        <View style={styles.handle} />

        {/* Title */}
        <Text style={styles.title}>Filters</Text>

        {/* Rain Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>RAIN STATUS</Text>
          <View style={styles.chipContainer}>
            <ChipButton
              label="Heavy Rain"
              selected={rainStatus === "HEAVY"}
              onPress={() =>
                setRainStatus(rainStatus === "HEAVY" ? null : "HEAVY")
              }
            />
            <ChipButton
              label="Medium Rain"
              selected={rainStatus === "MEDIUM"}
              onPress={() =>
                setRainStatus(rainStatus === "MEDIUM" ? null : "MEDIUM")
              }
            />
            <ChipButton
              label="Light Rain"
              selected={rainStatus === "LIGHT"}
              onPress={() =>
                setRainStatus(rainStatus === "LIGHT" ? null : "LIGHT")
              }
            />
            <ChipButton
              label="No Rain"
              selected={rainStatus === "NONE"}
              onPress={() =>
                setRainStatus(rainStatus === "NONE" ? null : "NONE")
              }
            />
          </View>
        </View>

        {/* Camera Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CAMERA STATUS</Text>
          <View style={styles.chipContainer}>
            <ChipButton
              label="Online Only"
              selected={onlineOnly}
              onPress={() => setOnlineOnly(!onlineOnly)}
            />
            <ChipButton
              label="Favorites"
              selected={favoritesOnly}
              onPress={() => setFavoritesOnly(!favoritesOnly)}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.buttonClear]}
            onPress={handleClearAll}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonTextClear}>Clear All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonApply]}
            onPress={handleApply}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonTextApply}>Apply</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
  } as ViewStyle,
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 10,
  } as ViewStyle,
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  } as ViewStyle,
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 28,
  } as ViewStyle,
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  } as ViewStyle,
  actions: {
    flexDirection: "row",
    marginTop: "auto",
    gap: 12,
  } as ViewStyle,
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  } as ViewStyle,
  buttonClear: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
  } as ViewStyle,
  buttonApply: {
    backgroundColor: colors.black,
  } as ViewStyle,
  buttonTextClear: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  buttonTextApply: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.white,
  },
});
