/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "../src/theme/colors";

interface ThemeProps {
  light?: string;
  dark?: string;
}

export function useThemeColor(
  props: ThemeProps,
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
): string {
  const theme = useColorScheme() ?? "light";
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}
