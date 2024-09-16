import { getDistance } from "geolib";
import type { JsonObject, JsonValue } from "type-fest";
import type { LngLat } from ".";
import { geocode, reverseGeocode, search } from "./osm";
import { Address } from "./types/address";
import type { OSMSearchParams } from "./types/osm";

export class Geopoint {
  private _address: Address;
  private _coords: LngLat;

  /**
   * Create a new geopoint.
   * @param coords Coordinates of the geopoint.
   * @param address The address of the geopoint.
   */
  constructor(coords: LngLat, address?: Address) {
    this._coords = coords;
    this._address = address || new Address();
  }

  /**
   * Geocoode a set of coordinates and create a geopoint from them.
   * @param coords LngLat to geocode.
   * @returns Geopoint with an address if the coordinates could be geocoded, otherwise undefined.
   */
  static async fromCoords(coords: LngLat): Promise<Geopoint | undefined> {
    const osmResponse = await reverseGeocode(coords);
    if (!osmResponse?.address) return undefined;

    const address = Address.fromOSM(osmResponse.address);
    return new Geopoint(coords, address);
  }

  /**
   * Look up an address via OSM and create a geopoint from it.
   * @param address Address to look up.
   * @returns Geopoint if the address could be geocoded, otherwise undefined.
   */
  static async fromAddress(address: Address): Promise<Geopoint | undefined> {
    const coords = await geocode(address);
    if (!coords) return undefined;

    return new Geopoint(coords, address);
  }

  /**
   * Look up geopoints that match a search query via OSM.
   * @param query Search query to look up.
   * @param params Search parameters.
   * @see OSMSearchParams
   * @returns List of geopoints that match the search query.
   */
  static async search(query: string, params?: OSMSearchParams): Promise<Geopoint[]> {
    const results = await search(query, { ...params, addressDetails: true });
    return Promise.all(
      results.map(async (result) => {
        const coords = [parseFloat(result.lon), parseFloat(result.lat)] as LngLat;
        const address = result.address ? Address.fromOSM(result.address) : undefined;
        return new Geopoint(coords, address);
      })
    );
  }

  /**
   * Parse a geopoint from a JSON object.
   * @param json JSON object to parse.
   * @returns Geopoint if the JSON object could be parsed, otherwise undefined.
   */
  static fromJSON(json: JsonValue): Geopoint | undefined {
    json = json as JsonObject;

    const coords = tryParseCoords(json.coords);
    if (!coords) return undefined;

    if (json.address && typeof json.address === "object") {
      const address = Address.fromJSON(json.address as JsonObject);
      if (address) return new Geopoint(coords, address);
    }

    return new Geopoint(coords);
  }

  /**
   * Get the distance in meters between this geopoint and another geopoint or coordinates.
   * @param other Geopoint or raw coordinates to calculate the distance to.
   * @param accuracy Accuracy of the distance calculation in meters. Default is 1.
   * @returns Distance between the two geopoints in meters, or undefined if the distance could not be calculated.
   */
  distanceTo(other: Geopoint | LngLat, accuracy: number = 1): number | undefined {
    const otherCoords = other instanceof Geopoint ? other.coords : other;
    if (!this.coords || !otherCoords) return undefined;
    return getDistance(
      { latitude: this.coords[1], longitude: this.coords[0] },
      { latitude: otherCoords[1], longitude: otherCoords[0] },
      accuracy
    );
  }

  /**
   * Convert the geopoint to a JSON object.
   * @returns JSON object representing the geopoint.
   */
  toJSON(): JsonObject {
    return {
      coords: this._coords,
      address: this._address ? this._address.toJSON() : ""
    };
  }

  /**
   * Set the coordinates of the geopoint.
   * @param coords New coordinates for the geopoint.
   * @param resetAddress If true, reset the address to an empty address. Default is true.
   * @warning This method does not perform any geocoding to update the address. Use `updateCoords` for that.
   * @see updateCoords
   */
  setCoords(coords: LngLat, resetAddress: boolean = true) {
    this._coords = coords;
    if (resetAddress) this._address = new Address();
  }

  /**
   * Set the address of the geopoint.
   * @param address Address to set.
   * @warning This method does not perform any geocoding to update the coordinates. Use `updateAddress` for that.
   * @see updateAddress
   */
  setAddress(address: Address) {
    this._address = address;
  }

  /**
   * Update the coordinates of the geopoint, and try to pull the new address from OSM.
   * @param coords New coordinates for the geopoint.
   */
  async updateCoords(coords: LngLat) {
    this._coords = coords;

    const osmResponse = await reverseGeocode(coords);
    if (osmResponse?.address) this._address = Address.fromOSM(osmResponse.address);
  }

  /**
   * Update the address of the geopoint, and try to pull the new coordinates from OSM.
   * @param address New address for the geopoint.
   */
  async updateAddress(address: Address) {
    this._address = address;

    const coords = await geocode(address);
    if (coords) this._coords = coords;
  }

  /**
   * Get the coordinates of the geopoint.
   */
  get coords(): LngLat {
    return this._coords;
  }

  /**
   * Get the address of the geopoint.
   */
  get address(): Address {
    return this._address;
  }
}

/**
 * Try to parse coordinates from a JSON value.
 * @param json JSON value to parse.
 * @returns LngLat if the value could be parsed as coordinates, otherwise undefined.
 */
function tryParseCoords(json: JsonValue): LngLat | undefined {
  if (Array.isArray(json) && json.length === 2) {
    const coords = json.map(tryParseFloat);
    if (coords.every((c) => c !== undefined)) return coords as LngLat;
  }
  return undefined;
}

/**
 * Parse a value as a float if possible.
 * @param val Value to parse.
 * @returns Number if the value could be parsed as a float, otherwise undefined.
 */
function tryParseFloat(val: unknown): number | undefined {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const num = parseFloat(val);
    if (!isNaN(num)) return num;
  }
  return undefined;
}
