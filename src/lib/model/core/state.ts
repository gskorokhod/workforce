import { copyArr, type Copy } from "$lib/utils";
import { persisted, type Serializer } from "svelte-persisted-store";
import { get as _get, derived, type Readable, type Writable } from "svelte/store";
import type { JsonObject } from "type-fest";
import { v4 as uuidv4 } from "uuid";
import { Assignments, AssignmentPattern, assignmentsSerializer } from "./assignment";
import { Base } from "./base";
import { Location } from "./location";
import { Person } from "./person";
import { Property } from "./property";
import { DefaultSettings, SettingsSerializer, type Settings } from "./settings";
import { Shift } from "./shift";
import { Task } from "./task";
import { defaultTemplates, templatesSerializer, type Templates } from "./templates";

// A map of UUIDs to objects of type T
type Stored<T extends Base> = Map<string, T>;
// A writable store of type Stored<T>
type Storage<T extends Base> = Writable<Stored<T>>;

export class State {
  private readonly stateID: string;
  readonly settings: Writable<Settings>;
  readonly templates: Writable<Templates>;
  readonly assignments: Writable<Assignments>;
  readonly _assignmentPatterns: Storage<AssignmentPattern>;
  readonly _properties: Storage<Property<unknown>>;
  readonly _people: Storage<Person>;
  readonly _locations: Storage<Location>;
  readonly _tasks: Storage<Task>;
  readonly _shifts: Storage<Shift>;

  constructor(stateID?: string) {
    this.stateID = stateID || uuidv4();
    this.settings = persisted(
      "settings_" + this.stateID,
      { ...DefaultSettings },
      {
        serializer: SettingsSerializer,
      },
    );
    this._properties = persisted("properties_" + this.stateID, new Map(), {
      serializer: this.mkSerializer(Property.fromJSON),
    });
    this.templates = persisted("templates_" + this.stateID, defaultTemplates(this), {
      serializer: templatesSerializer(this),
    });
    this.assignments = persisted("assignments_" + this.stateID, new Assignments(this), {
      serializer: assignmentsSerializer(this),
    });
    this._assignmentPatterns = persisted("assignment_patterns_" + this.stateID, new Map(), {
      serializer: this.mkSerializer(AssignmentPattern.fromJSON),
    });
    this._tasks = persisted("tasks_" + this.stateID, new Map(), {
      serializer: this.mkSerializer(Task.fromJSON),
    });
    this._people = persisted("people_" + this.stateID, new Map(), {
      serializer: this.mkSerializer(Person.fromJSON),
    });
    this._locations = persisted("locations_" + this.stateID, new Map(), {
      serializer: this.mkSerializer(Location.fromJSON),
    });
    this._shifts = persisted("shifts_" + this.stateID, new Map(), {
      serializer: this.mkSerializer(Shift.fromJSON),
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
    this.templates.set(defaultTemplates(this));
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
    if (obj instanceof Property) {
      this._properties.update((map) => {
        map.set(obj.uuid, obj as Property<unknown>);
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
    } else if (obj instanceof Shift) {
      this._shifts.update((map) => {
        map.set(obj.uuid, obj as Shift);
        return map;
      });
    } else if (obj instanceof AssignmentPattern) {
      this._assignmentPatterns.update((map) => {
        map.set(obj.uuid, obj as AssignmentPattern);
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

  get assignmentPatterns(): Writable<AssignmentPattern[]> {
    return this.createWritable(this._assignmentPatterns);
  }

  get properties(): Writable<Property<unknown>[]> {
    return this.createWritable(this._properties);
  }

  get people(): Writable<Person[]> {
    return this.createWritable(this._people);
  }

  get tasks(): Writable<Task[]> {
    return this.createWritable(this._tasks);
  }

  get locations(): Writable<Location[]> {
    return this.createWritable(this._locations);
  }

  get shifts(): Writable<Shift[]> {
    return this.createWritable(this._shifts);
  }

  get everything(): Readable<Base[]> {
    return derived(this._stores, (stores) => {
      const ans = [];
      for (const store of stores) {
        for (const val of store.values()) {
          ans.push(val);
        }
      }
      return ans;
    });
  }

  /**
   * Helper function to create a serializer for a given object type.
   * @param fromJSON Object's deserialization function
   * @returns Serializer for the object type
   */
  private mkSerializer<T extends Base>(
    fromJSON: (json: JsonObject, state: State) => T,
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
      },
    };
  }

  /**
   * Get all the stores in the state.
   */
  private get _stores(): Storage<Base>[] {
    return [
      this._properties,
      this._people,
      this._tasks,
      this._locations,
      this._shifts,
      this._assignmentPatterns,
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

export function subset<T extends Base>(
  source: Storage<T>,
  uuids: Writable<string[]>,
): Writable<T[]> {
  const readable = derived([source, uuids], ([source, uuids]) => {
    const ans = [];
    for (const uuid of uuids) {
      const val = source.get(uuid);
      if (val) {
        ans.push(val.copy() as T);
      }
    }
    return ans;
  });
  const set = (items: T[]) => {
    uuids.set(items.map((item) => item.uuid));
    for (const item of items) {
      source.update((map) => {
        map.set(item.uuid, item.copy() as T);
        return map;
      });
    }
  };
  const update: (fn: (items: T[]) => T[]) => void = (fn) => {
    const current = _get(readable);
    set(fn(current));
  };
  return { subscribe: readable.subscribe, set, update };
}

export function subsetOne<T extends Base>(
  source: Storage<T>,
  uuid: Writable<string | undefined>,
): Writable<T | undefined> {
  const readable = derived([source, uuid], ([source, uuid]) => {
    if (uuid === undefined) {
      return undefined;
    }
    const val = source.get(uuid);
    return val ? (val.copy() as T) : undefined;
  });
  const set = (item: T | undefined) => {
    uuid.set(item?.uuid);
    if (item) {
      source.update((map) => {
        map.set(item.uuid, item.copy() as T);
        return map;
      });
    }
  };
  const update: (fn: (item: T | undefined) => T | undefined) => void = (fn) => {
    const current = _get(readable);
    set(fn(current));
  };
  return { subscribe: readable.subscribe, set, update };
}
