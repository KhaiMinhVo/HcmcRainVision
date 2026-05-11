import { StyleSheet, View, ViewStyle } from "react-native";
import { getIntensityColor } from "../../data/mockWeatherOverlay";

interface WeatherOverlay {
  id: string;
  position: {
    top: number;
    left: number;
  };
  size: {
    width: number;
    height: number;
  };
  intensity: number;
}

interface WeatherOverlayLayerProps {
  overlays?: WeatherOverlay[];
}

export default function WeatherOverlayLayer({
  overlays = [],
}: WeatherOverlayLayerProps) {
  return (
    <>
      {overlays.map((overlay) => (
        <View
          key={overlay.id}
          style={[
            styles.overlay,
            {
              top: overlay.position.top,
              left: overlay.position.left,
              width: overlay.size.width,
              height: overlay.size.height,
              backgroundColor: getIntensityColor(overlay.intensity),
            },
          ]}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { position: "absolute", borderRadius: 8 } as ViewStyle,
});
