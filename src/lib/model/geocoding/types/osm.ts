import type { LngLat } from "$lib/types/location";

type BoundingBox = [string, string, string, string];

type OSMAddress = Record<string, string>;

export type OSMSearchResponse = OSMPlace[];

export type OSMReverseResponse = { error: string } | OSMPlace;

export interface OSMPlace {
  licence: string;
  osm_id: number;
  osm_type: string;
  place_id: number;
  importance: number;
  place_rank: number;
  name: string;
  display_name: string;
  lat: string;
  lon: string;
  boundingbox: BoundingBox;
  address?: OSMAddress;
}

/**
 * Search parameters for the OpenStreetMap Nominatim API.
 * @property limit The maximum number of results to return. Can be 1 to 40. (Default: 10)
 * @property min_rank The minimum rank of results to return. (E.g.: 16 for cities)
 * @property focusPoint The center point of the search.
 * @property countryCodes An array of country codes to restrict the search to.
 * @property boxSize The size of the bounding box around the focus point.
 * @property bounded Whether to restrict results to the bounding box.
 * @property addressDetails Whether to include address details in the results.
 */
export interface OSMSearchParams {
  limit?: number;
  min_rank?: number;
  focusPoint?: LngLat | null;
  countryCodes?: string[];
  boxSize?: number;
  bounded?: boolean;
  addressDetails?: boolean;
  acceptLanguage?: string;
}
