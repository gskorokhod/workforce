import type { JsonObject } from "type-fest";

/**
 * A structured address.
 */
interface AddressJSON extends JsonObject {
  /**
   * The identifier of a space within a building.
   * (E.g.: apartment, office, unit, floor, etc.)
   * @example "Apartment B, Floor 2", "Intensive Care Unit", "Dock 3"
   */
  space: string;
  /**
   * The house number, house name, or similar. Shis should identify a unique building on a street.
   * @example "123", "Baker House", "St. Paul's Cathedral"
   */
  building: string;
  /**
   * The name of the street or road.
   * @example "Abbey Road"
   */
  street: string;
  /**
   * The name of a city, town, village, etc.
   * @example "London", "St Andrews", "Boarhills"
   */
  settlement: string;
  /**
   * The name of a county, municipality, or similar.
   * @example "Fife", "Fulton County"
   */
  municipality: string;
  /**
   * The name of a state, province, or similar.
   * @example "Scotland", "California", "Bavaria", "Hokkaido Prefecture"
   */
  state: string;
  /**
   * The name of a country.
   * @example "United Kingdom", "United States", "Germany"
   */
  country: string;
  /**
   * The postal code.
   * @example "KY16 0XX", "90210"
   */
  postcode: string;
}

type AddressField = keyof Address;

/**
 * A structured address.
 *
 * Note: This is designed to be a simple, structured representation of an address that can be easily displayed in the UI, manipulated, parsed, etc.
 *       It is not intended to be comprehensive or 100% accurate to real-world administrative divisions / hierarchy.
 */
export class Address {
  /**
   * The identifier of a space within a building.
   * (E.g.: apartment, office, unit, floor, etc.)
   * @example "Apartment B, Floor 2", "Intensive Care Unit", "Dock 3"
   */
  space: string = "";
  /**
   * The house number, house name, or similar. Shis should identify a unique building on a street.
   * @example "123", "Baker House", "St. Paul's Cathedral"
   */
  building: string = "";
  /**
   * The name of the street or road.
   * @example "Abbey Road"
   */
  street: string = "";
  /**
   * The name of a city, town, village, etc.
   * @example "London", "St Andrews", "Boarhills"
   */
  settlement: string = "";
  /**
   * The name of a county, municipality, or similar.
   */
  municipality: string = "";
  /**
   * The name of a state, province, or similar.
   * @example "Scotland", "California", "Bavaria", "Hokkaido Prefecture"
   */
  state: string = "";
  /**
   * The name of a country.
   * @example "United Kingdom", "United States", "Germany"
   */
  country: string = "";
  /**
   * The postal code.
   * @example "KY16 0XX", "90210"
   */
  postcode: string = "";

  /**
   * Construct an Address object.
   * @param props An object containing the address fields.
   * @see AddressJSON
   */
  constructor(props: Partial<AddressJSON> = {}) {
    Object.assign(this, props);
  }

  /**
   * Format the address as a comma-separated string.
   * @param fields An array of fields to include in the formatted address.
   * @returns A formatted address string.
   */
  format(
    fields: AddressField[] = [
      "building",
      "street",
      "settlement",
      "municipality",
      "state",
      "postcode",
      "country"
    ],
    separator: string = ", "
  ): string {
    return fields
      .map((f) => this[f])
      .filter((f) => typeof f === "string")
      .filter((s) => s && s.length > 0)
      .join(separator);
  }

  /**
   * Convert the address to a JSON object.
   * (Note: no information is lost; the JSON object can be safely used to reconstruct the address.)
   * @returns a JSON object representing the address.
   * @see AddressJSON
   */
  toJSON(): AddressJSON {
    return {
      space: this.space,
      building: this.building,
      street: this.street,
      settlement: this.settlement,
      municipality: this.municipality,
      state: this.state,
      country: this.country,
      postcode: this.postcode
    };
  }

  /**
   * Create an Address object from a JSON object.
   * @param json A JSON object representing an address.
   * @returns an Address instance.
   * @see AddressJSON
   */
  static fromJSON(json: JsonObject): Address {
    return new Address(json);
  }

  /**
   * "Best-effort" conversion from an `addressdetails` object in an OSM Nominativ search result to an Address object.
   *
   * (Note: information will be lost since we need to map OSM tags to a smaller set of structured fields;
   *  The address also may not be 100% accurate to real-world administrative divisions / hierarchy.)
   *
   * See: https://nominatim.org/release-docs/develop/api/Output/#addressdetails
   *
   * @param osmJson - A JSON object representing an address.
   * @returns an Address instance.
   */
  static fromOSM(osmJson: Record<string, string>) {
    const props = {
      postcode: osmJson["postcode"] ?? "",
      country: osmJson["country"] ?? "",
      state: osmJson["state"] ?? osmJson["province"] ?? osmJson["region"] ?? "",
      municipality: osmJson["county"] ?? osmJson["state_district"] ?? osmJson["municipality"] ?? "",
      settlement:
        osmJson["city"] ??
        osmJson["town"] ??
        osmJson["village"] ??
        osmJson["hamlet"] ??
        osmJson["croft"] ??
        osmJson["isolated_dwelling"] ??
        "",
      street: osmJson["road"] ?? "",
      building:
        osmJson["house_number"] ??
        osmJson["house_name"] ??
        osmJson["building"] ??
        osmJson["amenity"] ??
        osmJson["shop"] ??
        osmJson["residential"] ??
        osmJson["industrial"] ??
        osmJson["commercial"] ??
        osmJson["religious"] ??
        osmJson["railway"] ??
        osmJson["public_building"] ??
        osmJson["park"] ??
        ""
    };
    return new Address(props);
  }

  /**
   * Check if the address is empty.
   */
  get empty(): boolean {
    return Object.values(this).every((v) => !v);
  }

  /**
   * Check if the address is complete
   * (i.e., all fields have a value).
   */
  get complete(): boolean {
    return Object.values(this).every((v) => v && v.length > 0);
  }

  /**
   * Get the street address.
   * (i.e., building number and street name)
   */
  get streetAddress(): string {
    return this.format(["building", "street"]);
  }
}
