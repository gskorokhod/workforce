import { type Display } from "$lib/ui";
import type { JsonObject } from "type-fest";
import { z } from "zod";
import { Geopoint } from "../geocoding";
import type { InitialValues } from "./property_values";
// import type { State } from "./state";
import { WithProperties } from "./with-properties";

/**
 * Represents the minimum and maximum number of people and tasks that can be assigned to a location.
 */
// interface LocationMinMax {
//   people: number;
//   tasks: number;
// }

const minSchema = z.object({
  people: z.number().int().nonnegative().default(0),
  tasks: z.number().int().nonnegative().default(0),
});

const maxSchema = z.object({
  people: z.number().int().nonnegative().default(Infinity),
  tasks: z.number().int().nonnegative().default(Infinity),
});

interface LocationProps extends Display {
  min?: Partial<z.infer<typeof minSchema>>;
  max?: Partial<z.infer<typeof maxSchema>>;
  point?: Geopoint;
  properties?: InitialValues;
}

/**
 * Represents a location where tasks can be performed.
 */
export class Location extends WithProperties {
  min: z.infer<typeof minSchema>;
  max: z.infer<typeof maxSchema>;
  point?: Geopoint;

  /**
   * Creates a new location.
   * @param props Properties of the location.
   * @param state State to bind the location to.
   * @param uuid UUID of the location. If not provided, a new UUID is generated.
   */
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(props: LocationProps, state: any, uuid?: string) {
    super(
      {
        ...props,
        template: "location",
      },
      state,
      uuid,
    );
    this.point = props.point instanceof Geopoint ? props.point : undefined;
    this.min = minSchema.parse(props.min || {});
    this.max = maxSchema.parse(props.max || {});
  }

  // /**
  //  * Get a location by UUID from a state or array of locations.
  //  * @param from State or array of locations to search.
  //  * @param uuid UUID of the location to get.
  //  * @returns Location with the specified UUID, or undefined if not found.
  //  */
  // static get(from: State | Location[], uuid: string): Location | undefined {
  //   if (from instanceof State) {
  //     return get(from._locations).get(uuid)?.copy();
  //   }
  //   return from.find((location) => location.uuid === uuid)?.copy();
  // }

  // /**
  //  * Get all locations from a state
  //  * @param from State to get all locations from.
  //  * @returns Array of locations.
  //  */
  // static getAll(from: State | Location[]): Location[] {
  //   if (from instanceof State) {
  //     return copyArr(Array.from(get(from._locations).values()));
  //   }
  //   return copyArr(from);
  // }

  // /**
  //  * Get locations within a certain radius of a point.
  //  * @param from State or array of locations to search.
  //  * @param point The point to search around. One of: `Location`, `Geopoint`, or `[longitude, latitude]`.
  //  * @param radius Search radius in meters.
  //  * @param accuracy Accuracy of the distance calculation in meters. Default is 1.
  //  * @returns Array of locations within the search radius. If `point` is not a valid location, an empty array is returned.
  //  * Note: `Location` objects without a valid point are also excluded from the result.
  //  */
  // static getAround(
  //   from: State | Location[],
  //   point: Location | Geopoint | LngLat,
  //   radius: number,
  //   accuracy = 1,
  // ): Location[] {
  //   let coords: LngLat | undefined;
  //   if (point instanceof Location) {
  //     coords = point.point?.coords;
  //   } else if (point instanceof Geopoint) {
  //     coords = point.coords;
  //   } else {
  //     coords = point;
  //   }

  //   if (!coords) {
  //     return [];
  //   }

  //   const locations = Location.getAll(from);
  //   return locations.filter((location) => {
  //     const dst = location.point?.distanceTo(coords, accuracy);
  //     return dst !== undefined && dst <= radius;
  //   });
  // }

  // /**
  //  * Get locations that can accommodate a certain number of people and tasks.
  //  * @param from State or array of locations to search.
  //  * @param people Number of people to accommodate. If not provided, the number of people is not considered.
  //  * @param tasks Number of tasks to accommodate. If not provided, the number of tasks is not considered.
  //  * @returns Array of locations that can accommodate the specified number of people and tasks.
  //  */
  // static getByCapacity(from: State | Location[], people?: number, tasks?: number): Location[] {
  //   const locations = Location.getAll(from);
  //   return locations.filter((location) => {
  //     const { min, max } = location;
  //     return (
  //       (!people || (people >= min.people && people <= max.people)) &&
  //       (!tasks || (tasks >= min.tasks && tasks <= max.tasks))
  //     );
  //   });
  // }

  // /**
  //  * Get locations that meet a predicate.
  //  * @param from State or array of locations to search.
  //  * @param filter Predicate function to filter locations.
  //  * @returns Array of locations that meet the predicate.
  //  */
  // static getBy(from: State | Location[], filter: (location: Location) => boolean): Location[] {
  //   const locations = Location.getAll(from);
  //   return locations.filter(filter);
  // }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromJSON(json: JsonObject, state: any): Location {
    console.log("Location.fromJSON");
    return new Location(
      {
        ...super.fromJSON(json, state),
        point: Geopoint.fromJSON(json.point as JsonObject),
        min: minSchema.parse(json.min),
        max: maxSchema.parse(json.max),
      },
      state,
      json.uuid as string,
    );
  }

  toJSON(): JsonObject {
    console.log("Location.toJSON");
    return {
      ...super.toJSON(),
      point: this.point?.toJSON() || null,
      min: this.min,
      max: this.max,
    };
  }

  /**
   * Create a copy of the location.
   * @returns new Location with the same properties as the original.
   */
  copy(): Location {
    return new Location(
      {
        ...super.copy(),
        point: this.point?.copy(),
        min: { ...this.min },
        max: { ...this.max },
      },
      this.state,
      this.uuid,
    );
  }

  // /**
  //  * Get assignments at this location.
  //  * @returns Array of assignments at the location.
  //  */
  // getAssignments(): Assignment[] {
  //   if (!this.state) {
  //     return [];
  //   }
  //   return Assignment.getByLocation(this.state, this);
  // }

  get address(): string {
    return this.point?.address.format() || "";
  }
}
