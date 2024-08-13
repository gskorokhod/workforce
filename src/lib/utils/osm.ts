import type { LngLat } from "$lib/types/location.ts";

export function getAddressCompletions(address: string): string[] {
  return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`)
    .then((response) => response.json())
    .then((data) => data.map((result: object) => result.display_name));
}

export function geocode(address: string): Promise<LngLat | undefined> {
  return fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${address}`)
    .then((response) => response.json())
    .then((data) => {
      if (data.length === 0) return undefined;
      return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
    });
}

export function reverseGeocode(coords: LngLat): Promise<string | undefined> {
  return fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[1]}&lon=${coords[0]}`
  )
    .then((response) => response.json())
    .then((data) => {
      if (data.error) return undefined;
      return data.display_name;
    });
}
