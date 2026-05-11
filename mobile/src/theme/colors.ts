// Legacy color system for main app (grayscale monochrome)
export const colors = {
  // Primary colors
  primary: "#000000",
  secondary: "#666666",

  // Background colors
  background: "#FFFFFF",
  white: "#FFFFFF",
  mapBackground: "#E8E8E8",
  mapGrid: "#D0D0D0",

  // Text colors
  text: "#000000",
  textSecondary: "#666666",
  textMuted: "#999999",
  gray: "#888888",
  lightGray: "#F5F5F5",

  // Status colors
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
  info: "#3B82F6",

  // Rain intensity colors
  rainNone: "#E5E5E5",
  rainLight: "#B0B0B0",
  rainMedium: "#707070",
  rainHeavy: "#303030",

  // Badge colors
  badgeHeavy: "#000000",
  badgeMedium: "#666666",
  badgeLight: "#999999",
  badgeNoRain: "#CCCCCC",
  badgeHigh: "#EF4444",
  badgeInfo: "#3B82F6",

  // Other colors
  black: "#000000",
  border: "#E0E0E0",
  borderDark: "#000000",
  cardBg: "#FFFFFF",
  overlay: "rgba(0, 0, 0, 0.5)",

  // Online/Offline
  online: "#22C55E",
  offline: "#EF4444",

  // Route colors
  routeStart: "#22C55E",
  routeEnd: "#EF4444",
  routeLine: "#000000",

  // Transparent
  transparent: "transparent",
};

// Theme colors for light/dark mode (for Expo tabs/components)
const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

interface ColorScheme {
  text: string;
  background: string;
  tint: string;
  icon: string;
  tabIconDefault: string;
  tabIconSelected: string;
}

export const Colors: {
  light: ColorScheme;
  dark: ColorScheme;
} = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};
