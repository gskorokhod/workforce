import type {
  OSMSearchResponse,
  OSMReverseResponse,
  OSMReverseResult,
  OSMSearchResult
} from "./osm";

import { Address } from "./address";

export type LngLat = [number, number];

export {
  Address,
  type OSMSearchResponse,
  type OSMReverseResponse,
  type OSMReverseResult,
  type OSMSearchResult
};
