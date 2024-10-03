import { persisted, type Serializer } from "svelte-persisted-store";
import { get as _get, derived, type Writable } from "svelte/store";
import type { JsonValue } from "type-fest";
import { v4 as uuidv4 } from "uuid";
import { copyArr, type Copy } from "../../utils";
import { Assignment } from "../assignment";
import { Base } from "../base";
import { Location } from "../location";
import { Person } from "../person";
import { SETTINGS_DEFAULTS, type Settings } from "../settings";
import { Shift } from "../shift";
import { Skill } from "../skill";
import { Task } from "../task";

// A map of UUIDs to objects of type T
type Stored<T extends Base> = Map<string, T>;
// A writable store of type Stored<T>
type Storage<T extends Base> = Writable<Stored<T>>;

export class State {
  private readonly stateID: string;
  readonly settings: Writable<Settings>;
  readonly _skills: Storage<Skill>;
  readonly _tasks: Storage<Task>;
  readonly _people: Storage<Person>;
  readonly _locations: Storage<Location>;
  readonly _assignments: Storage<Assignment>;
  readonly _shifts: Storage<Shift>;

  constructor(stateID?: string) {
    this.stateID = stateID || uuidv4();
    this.settings = persisted("settings_" + this.stateID, {...SETTINGS_DEFAULTS});
    this._skills = persisted("skills_" + this.stateID, new Map(), {
      serializer: this.mkSerializer(Skill.fromJSON)
    });
    this._tasks = persisted("tasks_" + this.stateID, new Map(), {
      serializer: this.mkSerializer(Task.fromJSON)
    });
    this._people = persisted("people_" + this.stateID, new Map(), {
      serializer: this.mkSerializer(Person.fromJSON)
    });
    this._locations = persisted("locations_" + this.stateID, new Map(), {
      serializer: this.mkSerializer(Location.fromJSON)
    });
    this._assignments = persisted("assignments_" + this.stateID, new Map(), {
      serializer: this.mkSerializer(Assignment.fromJSON)
    });
    this._shifts = persisted("shifts_" + this.stateID, new Map(), {
      serializer: this.mkSerializer(Shift.fromJSON)
    });
  }

  /**
   * Clear all objects from the state.
   */
  clear(): void {
    for (const storage of this._stores) {
      storage.update((map) => {
        map.clear();
        return map;
      });
    }
  }

  /**
   * Get an object by UUID.
   * @param obj Object or UUID
   * @returns Copy of the object, or undefined if not found
   */
  get(obj: Base | string): Base | undefined {
    const uuid = typeof obj === "string" ? obj : obj.uuid;
    for (const storage of this._stores) {
      const val = _get(storage).get(uuid);
      if (val !== undefined) {
        return val.copy();
      }
    }
    return undefined;
  }

  /**
   * Check if an object exists in the state.
   * @param obj Object or UUID
   * @returns True if the object exists
   */
  has(obj: Base | string): boolean {
    return this.get(obj) !== undefined;
  }

  /**
   * Delete an object from the state, and let its dependencies know that it has been removed.
   * @param obj Object or UUID to delete
   * @returns True if the object was deleted, false if it was not found
   */
  delete(obj: Base | string): boolean {
    const target = this.get(obj);
    if (target === undefined) {
      return false;
    }

    for (const storage of this._stores) {
      storage.update((map) => {
        map.delete(target.uuid);
        return map;
      });
    }
    return true;
  }

  /**
   * Add an object to the state.
   * @param obj Object to add
   * @returns UUID of the object
   * @throws Error if the object type is unknown
   */
  put<T extends Base>(obj: T): string {
    if (obj instanceof Skill) {
      this._skills.update((map) => {
        map.set(obj.uuid, obj as Skill);
        return map;
      });
    } else if (obj instanceof Task) {
      this._tasks.update((map) => {
        map.set(obj.uuid, obj as Task);
        return map;
      });
    } else if (obj instanceof Person) {
      this._people.update((map) => {
        map.set(obj.uuid, obj as Person);
        return map;
      });
    } else if (obj instanceof Location) {
      this._locations.update((map) => {
        map.set(obj.uuid, obj as Location);
        return map;
      });
    } else if (obj instanceof Assignment) {
      this._assignments.update((map) => {
        map.set(obj.uuid, obj as Assignment);
        return map;
      });
    } else if (obj instanceof Shift) {
      this._shifts.update((map) => {
        map.set(obj.uuid, obj as Shift);
        return map;
      });
    } else {
      throw new Error("Unknown object type");
    }
    return obj.uuid;
  }

  /**
   * Put multiple objects into the state.
   * @param objs Objects to add
   * @throws Error if any object type is unknown
   */
  putAll(objs: Base[]): void {
    for (const obj of objs) {
      this.put(obj);
    }
  }

  get skills(): Writable<Skill[]> {
    return this.createWritable(this._skills);
  }

  get tasks(): Writable<Task[]> {
    return this.createWritable(this._tasks);
  }

  get people(): Writable<Person[]> {
    return this.createWritable(this._people);
  }

  get locations(): Writable<Location[]> {
    return this.createWritable(this._locations);
  }

  get assignments(): Writable<Assignment[]> {
    return this.createWritable(this._assignments);
  }

  get shifts(): Writable<Shift[]> {
    return this.createWritable(this._shifts);
  }

  /**
   * Helper function to create a serializer for a given object type.
   * @param fromJSON Object's deserialization function
   * @returns Serializer for the object type
   */
  private mkSerializer<T extends Base>(
    fromJSON: (json: JsonValue, state?: State) => T
  ): Serializer<Stored<T>> {
    return {
      stringify: (map: Stored<T>) => {
        const arr = [];
        for (const val of map.values()) {
          arr.push(val.toJSON());
        }
        return JSON.stringify(arr);
      },
      parse: (str: string) => {
        const arr = JSON.parse(str);
        const map = new Map<string, T>();
        for (const json of arr) {
          const obj = fromJSON(json, this);
          map.set(obj.uuid, obj);
        }
        return map;
      }
    };
  }

  /**
   * Get all the stores in the state.
   */
  private get _stores(): Storage<Base>[] {
    return [
      this._skills,
      this._tasks,
      this._people,
      this._locations,
      this._assignments,
      this._shifts
    ];
  }

  private createWritable<T extends Base & Copy<T>>(storage: Storage<T>): Writable<T[]> {
    const readable = derived(storage, (map) => copyArr(Array.from(map.values())));
    const set = (items: T[]) => {
      const copied = copyArr(items);
      storage.set(new Map(copied.map((item) => [item.uuid, item])));
    };
    const update = (fn: (items: T[]) => T[]) => {
      const current = Array.from(_get(storage).values());
      set(fn(current));
    };
    return { subscribe: readable.subscribe, set, update };
  }
}
