import type { LngLat } from "$lib/types/location.ts";

const MIN_SEARCH_LENGTH = 3;

type BoundingBox = [string, string, string, string];
type OSMSearchResponse = OSMSearchResult[];
type OSMReverseResponse = { error: string } | OSMReverseResult;

interface Address {
  amenity?: string;
  city?: string;
  city_district?: string;
  country?: string;
  country_code?: string;
  county?: string;
  hamlet?: string;
  house_number?: string;
  municipality?: string;
  neighbourhood?: string;
  office?: string;
  postcode?: string;
  quarter?: string;
  road?: string;
  shop?: string;
  state?: string;
  suburb?: string;
  tourism?: string;
  town?: string;
  village?: string;
}

interface OSMSearchResult {
  boundingbox: BoundingBox;
  display_name: string;
  lat: string;
  licence: string;
  lon: string;
  name: string;
  osm_id: number;
  osm_type: string;
  place_id: number;
}

interface OSMReverseResult {
  address: Address;
  boundingbox: BoundingBox;
  display_name: string;
  lat: string;
  licence: string;
  lon: string;
  name: string;
  osm_id: number;
  osm_type: string;
  place_id: number;
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
