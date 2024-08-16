import type { LngLat } from "$lib/types/location.ts";

const MIN_SEARCH_LENGTH = 3;

type BoundingBox = [string, string, string, string];
type OSMSearchResponse = OSMSearchResult[];
type OSMReverseResponse = OSMReverseResult | { error: string };

interface Address {
  country_code?: string;
  country?: string;
  state?: string;
  county?: string;
  municipality?: string;
  postcode?: string;
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  suburb?: string;
  neighbourhood?: string;
  city_district?: string;
  quarter?: string;
  road?: string;
  house_number?: string;
  office?: string;
  amenity?: string;
  shop?: string;
  tourism?: string;
}

interface OSMSearchResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  name: string;
  display_name: string;
  boundingbox: BoundingBox;
}

interface OSMReverseResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  lat: string;
  lon: string;
  name: string;
  display_name: string;
  address: Address;
  boundingbox: BoundingBox;
}

export async function getAddressCompletions(
  address: string,
  focusPoint: LngLat | undefined = undefined,
  countryCodes: string[] = [],
  boxSize: number = 0.1,
  bounded: boolean = false
): Promise<string[]> {
  if (address.length < MIN_SEARCH_LENGTH) return Promise.resolve([]);

  let query = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURI(address)}`;

  if (focusPoint) {
    query += `&viewbox=${focusPoint[0] - boxSize},${focusPoint[1] + boxSize},${focusPoint[0] + boxSize},${focusPoint[1] - boxSize}`;
    query += `&bounded=${bounded ? 1 : 0}`;
    if (countryCodes.length > 0) query += `&countrycodes=${countryCodes.join(",")}`;
  }

  console.log(query);

  const response = await fetch(query);
  const data: OSMSearchResponse = await response.json();
  return data.map((res) => res.display_name);
}

export async function geocode(address: string): Promise<LngLat | undefined> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${address}`
  );
  const data: OSMSearchResponse = await response.json();
  if (data.length === 0) return undefined;
  return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
}

export async function reverseGeocode(coords: LngLat): Promise<OSMReverseResult | undefined> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[1]}&lon=${coords[0]}`
  );
  const data: OSMReverseResponse = await response.json();
  if ("error" in data) return undefined;
  return data;
}
