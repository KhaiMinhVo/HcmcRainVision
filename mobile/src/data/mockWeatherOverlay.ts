// Weather overlay data for map visualization

type WeatherIntensity = "light" | "medium" | "heavy";

interface WeatherOverlay {
  id: string;
  position: { top: string; left: string };
  size: { width: number; height: number };
  intensity: WeatherIntensity;
  opacity: number;
}

interface PinPosition {
  id: string;
  top: string;
  left: string;
  status: "heavy" | "medium" | "light";
}

interface RouteData {
  start: { name: string; position: { top: string; left: string } };
  end: { name: string; position: { top: string; left: string } };
  distance: string;
  duration: string;
  hasWeatherImpact: boolean;
  weatherWarning: string;
}

export const mockWeatherOverlays: WeatherOverlay[] = [
  {
    id: "overlay1",
    position: { top: "15%", left: "10%" },
    size: { width: 120, height: 80 },
    intensity: "light",
    opacity: 0.2,
  },
  {
    id: "overlay2",
    position: { top: "35%", left: "25%" },
    size: { width: 150, height: 100 },
    intensity: "medium",
    opacity: 0.3,
  },
  {
    id: "overlay3",
    position: { top: "55%", left: "40%" },
    size: { width: 130, height: 90 },
    intensity: "heavy",
    opacity: 0.35,
  },
];

// Pin positions for fake map
export const mockPinPositions: PinPosition[] = [
  { id: "pin1", top: "25%", left: "30%", status: "heavy" },
  { id: "pin2", top: "45%", left: "55%", status: "medium" },
  { id: "pin3", top: "65%", left: "25%", status: "light" },
];

// Route data for MAP_16
export const mockRouteData: RouteData = {
  start: { name: "District 1", position: { top: "30%", left: "20%" } },
  end: { name: "District 7", position: { top: "70%", left: "75%" } },
  distance: "12.5 km",
  duration: "25 min",
  hasWeatherImpact: true,
  weatherWarning: "Heavy weather expected along route",
};

export const getIntensityColor = (
  intensity: WeatherIntensity | number,
): string => {
  if (typeof intensity === "number") {
    if (intensity > 0.7) return "rgba(48, 48, 48, 0.35)";
    if (intensity > 0.4) return "rgba(112, 112, 112, 0.3)";
    return "rgba(176, 176, 176, 0.2)";
  }

  switch (intensity) {
    case "light":
      return "rgba(176, 176, 176, 0.2)";
    case "medium":
      return "rgba(112, 112, 112, 0.3)";
    case "heavy":
      return "rgba(48, 48, 48, 0.35)";
    default:
      return "transparent";
  }
};
