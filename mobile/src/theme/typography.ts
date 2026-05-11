import { Platform } from "react-native";

const fontFamily = Platform.select({
  ios: "System",
  android: "Roboto",
});

interface TextStyleProps {
  fontSize: number;
  fontWeight: string;
  lineHeight: number;
}

interface FontSet {
  sans: string;
  serif: string;
  rounded: string;
  mono: string;
}

interface Typography {
  fontFamily: string | undefined;
  fontSize: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  fontWeight: {
    regular: string;
    medium: string;
    semibold: string;
    bold: string;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
  heading1: TextStyleProps;
  heading2: TextStyleProps;
  heading3: TextStyleProps;
  body: TextStyleProps;
  bodySmall: TextStyleProps;
  caption: TextStyleProps;
  button: TextStyleProps;
}

// Font families for Expo template components
export const Fonts: FontSet = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
}) as FontSet;

export const typography: Typography = {
  // Font families
  fontFamily,

  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
  },

  // Font weights
  fontWeight: {
    regular: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Predefined text styles
  heading1: {
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 40,
  },
  heading2: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 32,
  },
  heading3: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 24,
  },
  body: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: "400",
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 24,
  },
};
