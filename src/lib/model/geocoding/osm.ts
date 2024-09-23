import type { LngLat } from ".";
import { Address } from "./types/address";
import type { OSMPlace, OSMReverseResponse, OSMSearchParams, OSMSearchResponse } from "./types/osm";

let navigator: Navigator | undefined = undefined;
if (typeof window !== "undefined") navigator = window.navigator;
const MIN_SEARCH_LENGTH = 3;
const DEFAULTS: Required<OSMSearchParams> = {
  limit: 10,
  min_rank: 16,
  focusPoint: null,
  countryCodes: [],
  boxSize: 0.1,
  bounded: false,
  addressDetails: false,
  acceptLanguage: navigator?.language || "en-GB, en-US;0.9, en;0.8"
};

/**
 * Get search suggestions for an address.
 * @param query Search string.
 * @param params Search parameters.
 * @see OSMSearchParams
 * @returns An array of search suggestions.
 */
export async function getAddressCompletions(
  query: string,
  params?: OSMSearchParams
): Promise<string[]> {
  if (query.length < MIN_SEARCH_LENGTH) return Promise.resolve([]);

  const data = await search(query, { ...DEFAULTS, ...params });
  return data.map((res) => res.display_name);
}

/**
 * Search for a location using OpenStreetMap's Nominatim API.
 * @param search Search string.
 * @param params Search parameters.
 * @see OSMSearchParams
 * @returns
 */
export async function search(search: string, params?: OSMSearchParams): Promise<OSMPlace[]> {
  // TODO: Implement caching to avoid unnecessary requests.
  const { limit, min_rank, focusPoint, countryCodes, boxSize, bounded, addressDetails } = {
    ...DEFAULTS,
    ...params
  };
  let query = `https://nominatim.openstreetmap.org/search?format=json&limit=${limit}&q=${encodeURI(search)}`;

  if (focusPoint) {
    query += `&viewbox=${focusPoint[0] - boxSize},${focusPoint[1] + boxSize},${focusPoint[0] + boxSize},${focusPoint[1] - boxSize}`;
    query += `&bounded=${bounded ? 1 : 0}`;
  }

  if (countryCodes.length > 0) query += `&countrycodes=${countryCodes.join(",")}`;
  query += `&addressdetails=${addressDetails ? 1 : 0}`;

  const response = await fetch(query);
  let data: OSMSearchResponse = await response.json();

  data = data.filter((res) => res.place_rank >= min_rank);
  data.sort((a, b) => a.importance - b.importance);

  return data;
}

/**
 * Geocode an address using OpenStreetMap's Nominatim API.
 * @param address Address to geocode or search string.
 * @returns Coordinates of the address.
 */
export async function geocode(address: string | Address): Promise<LngLat | undefined> {
  let data: OSMPlace[] = [];

  if (address instanceof Address) {
    let query = "https://nominatim.openstreetmap.org/search?format=json";
    if (address.postcode) query += `&postalcode=${encodeURI(address.postcode)}`;
    if (address.country) query += `&country=${encodeURI(address.country)}`;
    if (address.state) query += `&state=${encodeURI(address.state)}`;
    if (address.municipality) query += `&county=${encodeURI(address.municipality)}`;
    if (address.settlement) query += `&city=${encodeURI(address.settlement)}`;
    if (address.streetAddress) query += `&street=${encodeURI(address.streetAddress)}`;

    const response = await fetch(query);
    data = await response.json();

    if (!data || data.length === 0) {
      return geocode(address.format());
    }
  } else {
    data = await search(address);
  }

  if (data.length === 0) return undefined;
  return [parseFloat(data[0].lon), parseFloat(data[0].lat)];
}

/**
 * Look up an address by its coordinates using OpenStreetMap's Nominatim API.
 * @param coords Coordinates to look up.
 * @param lang Language to return the address in. By default, uses the user's locale (if available) or "en-GB".
 * @returns OSMPlace object representing the address, or undefined if the coordinates could not be resolved.
 */
export async function reverseGeocode(coords: LngLat, lang?: string): Promise<OSMPlace | undefined> {
  // TODO: Implement caching to avoid unnecessary requests.
  if (!lang) lang = navigator?.language || DEFAULTS.acceptLanguage;
  const query = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords[1]}&lon=${coords[0]}&accept-language=${lang}`;
  const response = await fetch(query);

  const data: OSMReverseResponse = await response.json();
  if ("error" in data) return undefined;
  return data;
}
