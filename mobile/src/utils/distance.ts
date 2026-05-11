// Distance calculation utilities

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // Distance in kilometers
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Format distance for display
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }

  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  }

  return `${Math.round(distanceKm)}km`;
}

// Sort items by distance from a point
export function sortByDistance<T extends Record<string, any>>(
  items: T[],
  userLat: number,
  userLon: number,
  latKey: string = "latitude",
  lonKey: string = "longitude",
): T[] {
  return items
    .map((item) => ({
      ...item,
      distance: calculateDistance(userLat, userLon, item[latKey], item[lonKey]),
    }))
    .sort((a, b) => a.distance - b.distance);
}

// Check if a point is within a certain radius
export function isWithinRadius(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  radiusKm: number,
): boolean {
  const distance = calculateDistance(lat1, lon1, lat2, lon2);
  return distance <= radiusKm;
}
