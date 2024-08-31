type BoundingBox = [string, string, string, string];

type OSMAddress = Record<string, string>;

export type OSMSearchResponse = OSMSearchResult[];

export type OSMReverseResponse = { error: string } | OSMReverseResult;

export interface OSMSearchResult {
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

export interface OSMReverseResult {
  address: OSMAddress;
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
