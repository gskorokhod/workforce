import { get } from "svelte/store";
import type { JsonObject, JsonValue, PartialDeep } from "type-fest";
import { Geopoint } from "../geocoding";
import type { Assignment } from "./assignment";
import { Base } from "./base";
import type { State } from "./state";

interface LocationMinMax {
  people: number;
  tasks: number;
}

interface ILocation {
  name: string;
  min: LocationMinMax;
  max: LocationMinMax;
  point?: Geopoint;
}

export class Location extends Base implements ILocation {
  private _name: string;
  private _min: LocationMinMax;
  private _max: LocationMinMax;
  private _point?: Geopoint;

  constructor(props: PartialDeep<ILocation>, state?: State, uuid?: string) {
    super(state, uuid);
    this._name = props.name || "";
    this._point = props.point instanceof Geopoint ? props.point : undefined;
    this._min = mkMin(props.min || {});
    this._max = mkMax(props.max || {});
  }

  static fromJSON(json: JsonValue, state?: State): Location {
    const { name, min, max, point, uuid } = json as JsonObject;

    return new Location(
      {
        name: typeof name === "string" ? name : undefined,
        point: point ? Geopoint.fromJSON(point as JsonObject) : undefined,
        min: mkMin(min as Partial<LocationMinMax>),
        max: mkMax(max as Partial<LocationMinMax>)
      },
      state,
      typeof uuid === "string" ? uuid : undefined
    );
  }

  toJSON(): JsonValue {
    const ans: JsonObject = {
      uuid: this.uuid,
      name: this._name,
      min: this._min as unknown as JsonObject,
      max: this._max as unknown as JsonObject
    };

    if (this._point) {
      ans.point = this._point.toJSON();
    }

    return ans;
  }

  copy(): Location {
    return new Location(
      {
        name: this._name,
        point: this._point,
        min: this._min,
        max: this._max
      },
      this.state,
      this.uuid
    );
  }

  update(force: boolean = false): boolean {
    if (super.update(force)) {
      const location = this.get() as Location;
      this._name = location._name;
      this._point = location._point;
      this._min = location._min;
      this._max = location._max;
      return true;
    }
    return false;
  }

  dependencies(): Base[] {
    return [];
  }

  removeDependency(): void {}

  getAssignments(): Assignment[] {
    if (!this.state) {
      return [];
    }

    const assignments = [];
    for (const assignment of get(this.state.assignments).values()) {
      if (assignment.location?.eq(this)) {
        assignments.push(assignment.copy());
      }
    }
    return assignments;
  }

  get name(): string {
    this.update();
    return this._name;
  }

  get point(): Geopoint | undefined {
    this.update();
    return this._point;
  }

  get min(): LocationMinMax {
    this.update();
    return this._min;
  }

  get max(): LocationMinMax {
    this.update();
    return this._max;
  }

  set name(name: string) {
    this._name = name;
    this.touch();
  }

  set point(point: Geopoint | undefined) {
    this._point = point;
    this.touch();
  }

  set min(min: Partial<LocationMinMax>) {
    this._min = mkMin(min);
    this.touch();
  }

  set max(max: Partial<LocationMinMax>) {
    this._max = mkMax(max);
    this.touch();
  }
}

function mkMin(val: Partial<LocationMinMax>): LocationMinMax {
  return {
    people: val.people || 0,
    tasks: val.tasks || 0
  };
}

function mkMax(val: Partial<LocationMinMax>): LocationMinMax {
  return {
    people: val.people || Infinity,
    tasks: val.tasks || Infinity
  };
}
