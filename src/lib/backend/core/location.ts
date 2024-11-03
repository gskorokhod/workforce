import { get } from "svelte/store";
import type { JsonObject, JsonValue } from "type-fest";
import { Geopoint, type LngLat } from "../geocoding";
import { type Display } from "../ui";
import { copyArr } from "../utils";
import { Assignment } from "./assignment/assignment";
import { Base } from "./base";
import { State } from "./state";

/**
 * Represents the minimum and maximum number of people and tasks that can be assigned to a location.
 */
interface LocationMinMax {
  people: number;
  tasks: number;
}

/**
 * Represents a location where tasks can be performed.
 * @interface
 * @property {string} name - The name of the location.
 * @property {LocationMinMax} min - The minimum number of people and tasks that can be assigned to the location.
 * @property {LocationMinMax} max - The maximum number of people and tasks that can be assigned to the location.
 * @property {Geopoint} point - The geographical coordinates of the location.
 * @see LocationMinMax
 * @see Geopoint
 */
interface ILocation extends Display {
  name: string;
  description?: string;
  min: Partial<LocationMinMax>;
  max: Partial<LocationMinMax>;
  avatar?: URL;
  point?: Geopoint;
}

/**
 * Represents a location where tasks can be performed.
 */
export class Location extends Base implements ILocation {
  name: string;
  description?: string;
  min: LocationMinMax;
  max: LocationMinMax;
  point?: Geopoint;
  avatar?: URL;

  /**
   * Creates a new location.
   * @param props Properties of the location.
   * @param state State to bind the location to.
   * @param uuid UUID of the location. If not provided, a new UUID is generated.
   */
  constructor(props: Partial<ILocation>, state?: State, uuid?: string) {
    super(state, uuid);
    this.name = props.name || "";
    this.description = props.description || "";
    this.avatar = props.avatar;
    this.point = props.point instanceof Geopoint ? props.point : undefined;
    this.min = mkMin(props.min || {});
    this.max = mkMax(props.max || {});
  }

  /**
   * Get a location by UUID from a state or array of locations.
   * @param from State or array of locations to search.
   * @param uuid UUID of the location to get.
   * @returns Location with the specified UUID, or undefined if not found.
   */
  static get(from: State | Location[], uuid: string): Location | undefined {
    if (from instanceof State) {
      return get(from._locations).get(uuid)?.copy();
    }
    return from.find((location) => location.uuid === uuid)?.copy();
  }

  /**
   * Get all locations from a state
   * @param from State to get all locations from.
   * @returns Array of locations.
   */
  static getAll(from: State | Location[]): Location[] {
    if (from instanceof State) {
      return copyArr(Array.from(get(from._locations).values()));
    }
    return copyArr(from);
  }

  /**
   * Get locations within a certain radius of a point.
   * @param from State or array of locations to search.
   * @param point The point to search around. One of: `Location`, `Geopoint`, or `[longitude, latitude]`.
   * @param radius Search radius in meters.
   * @param accuracy Accuracy of the distance calculation in meters. Default is 1.
   * @returns Array of locations within the search radius. If `point` is not a valid location, an empty array is returned.
   * Note: `Location` objects without a valid point are also excluded from the result.
   */
  static getAround(
    from: State | Location[],
    point: Location | Geopoint | LngLat,
    radius: number,
    accuracy: number = 1
  ): Location[] {
    let coords: LngLat | undefined;
    if (point instanceof Location) {
      coords = point.point?.coords;
    } else if (point instanceof Geopoint) {
      coords = point.coords;
    } else {
      coords = point;
    }

    if (!coords) {
      return [];
    }

    const locations = Location.getAll(from);
    return locations.filter((location) => {
      const dst = location.point?.distanceTo(coords, accuracy);
      return dst !== undefined && dst <= radius;
    });
  }

  /**
   * Get locations that can accommodate a certain number of people and tasks.
   * @param from State or array of locations to search.
   * @param people Number of people to accommodate. If not provided, the number of people is not considered.
   * @param tasks Number of tasks to accommodate. If not provided, the number of tasks is not considered.
   * @returns Array of locations that can accommodate the specified number of people and tasks.
   */
  static getByCapacity(from: State | Location[], people?: number, tasks?: number): Location[] {
    const locations = Location.getAll(from);
    return locations.filter((location) => {
      const { min, max } = location;
      return (
        (!people || (people >= min.people && people <= max.people)) &&
        (!tasks || (tasks >= min.tasks && tasks <= max.tasks))
      );
    });
  }

  /**
   * Get locations that meet a predicate.
   * @param from State or array of locations to search.
   * @param filter Predicate function to filter locations.
   * @returns Array of locations that meet the predicate.
   */
  static getBy(from: State | Location[], filter: (location: Location) => boolean): Location[] {
    const locations = Location.getAll(from);
    return locations.filter(filter);
  }

  /**
   * Creates a new location from a JSON object.
   * @param json JSON object representing a location.
   * @param state State to bind the location to.
   * @returns new Location
   */
  static fromJSON(json: JsonValue, state?: State): Location {
    const { name, description, avatar, min, max, point, uuid } = json as JsonObject;

    return new Location(
      {
        name: name as string,
        description: description as string,
        avatar: avatar ? new URL(avatar as string) : undefined,
        point: point ? Geopoint.fromJSON(point as JsonObject) : undefined,
        min: mkMin(min as Partial<LocationMinMax>),
        max: mkMax(max as Partial<LocationMinMax>)
      },
      state,
      typeof uuid === "string" ? uuid : undefined
    );
  }

  /**
   * Serialize the location to a JSON object.
   * @returns JSON object representing the location.
   */
  toJSON(): JsonObject {
    const ans: JsonObject = {
      uuid: this.uuid,
      name: this.name,
      description: this.description || "",
      avatar: this.avatar?.href || null,
      min: this.min as unknown as JsonObject,
      max: this.max as unknown as JsonObject
    };

    if (this.point) {
      ans.point = this.point.toJSON();
    }

    return ans;
  }

  /**
   * Create a copy of the location.
   * @returns new Location with the same properties as the original.
   */
  copy(): Location {
    return new Location(
      {
        name: this.name,
        description: this.description,
        avatar: this.avatar ? new URL(this.avatar.href) : undefined,
        point: this.point?.copy(),
        min: this.min,
        max: this.max
      },
      this.state,
      this.uuid
    );
  }

  /**
   * Get assignments at this location.
   * @returns Array of assignments at the location.
   */
  getAssignments(): Assignment[] {
    if (!this.state) {
      return [];
    }
    return Assignment.getWith(this.state, this);
  }

  get address(): string {
    return this.point?.address.format() || "";
  }
}

/**
 * Helper function to create a `LocationMinMax` object for the minimum number of people and tasks.
 */
function mkMin(val: Partial<LocationMinMax>): LocationMinMax {
  return {
    people: val.people || 0,
    tasks: val.tasks || 0
  };
}

/**
 * Helper function to create a `LocationMinMax` object for the maximum number of people and tasks.
 */
function mkMax(val: Partial<LocationMinMax>): LocationMinMax {
  return {
    people: val.people || Infinity,
    tasks: val.tasks || Infinity
  };
}
