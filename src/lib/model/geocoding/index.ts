import { Geopoint } from "./geopoint";
import { Address } from "./types/address";

export type LngLat = [number, number];

export function findBoundingBox(coords: LngLat[], padding = 0.01): [LngLat, LngLat] | undefined {
  if (coords.length === 0) return undefined;

  let minLng = coords[0][0];
  let maxLng = coords[0][0];
  let minLat = coords[0][1];
  let maxLat = coords[0][1];

  for (const [lng, lat] of coords) {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }

  const topLeft: LngLat = [minLng - padding, maxLat + padding];
  const bottomRight: LngLat = [maxLng + padding, minLat - padding];

  return [topLeft, bottomRight];
}

export function getCentrePoint(coords: LngLat[]): LngLat | undefined {
  if (coords.length === 0) return undefined;

  let sumLng = 0;
  let sumLat = 0;

  for (const [lng, lat] of coords) {
    sumLng += lng;
    sumLat += lat;
  }

  return [sumLng / coords.length, sumLat / coords.length];
}

export { Geopoint, Address };
