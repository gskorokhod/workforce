import { persisted, type Serializer } from "svelte-persisted-store";
import { get as _get, type Writable } from "svelte/store";
import type { JsonValue } from "type-fest";
import { v4 as uuidv4 } from "uuid";
import { Assignment } from "../assignment";
import { Base } from "../base";
import { Location } from "../location";
import { Person } from "../person";
import { Skill } from "../skill";
import { Task } from "../task";

type Stored<T extends Base> = Map<string, T>;
type Storage<T extends Base> = Writable<Stored<T>>;

export class State {
  private readonly stateID: string;
  readonly skills: Storage<Skill>;
  readonly tasks: Storage<Task>;
  readonly people: Storage<Person>;
  readonly locations: Storage<Location>;
  readonly assignments: Storage<Assignment>;

  constructor() {
    this.stateID = uuidv4();
    this.skills = persisted("skills_" + this.stateID, new Map(), {
      serializer: this.mkSerializer(Skill.fromJSON)
    });
    this.tasks = persisted("tasks_" + this.stateID, new Map(), {
      serializer: this.mkSerializer(Task.fromJSON)
    });
    this.people = persisted("people_" + this.stateID, new Map(), {
      serializer: this.mkSerializer(Person.fromJSON)
    });
    this.locations = persisted("locations_" + this.stateID, new Map(), {
      serializer: this.mkSerializer(Location.fromJSON)
    });
    this.assignments = persisted("assignments_" + this.stateID, new Map(), {
      serializer: this.mkSerializer(Assignment.fromJSON)
    });
  }

  clear(): void {
    for (const storage of this.stores) {
      storage.update((map) => {
        map.clear();
        return map;
      });
    }
  }

  get(obj: Base | string): Base | undefined {
    const uuid = typeof obj === "string" ? obj : obj.uuid;
    for (const storage of this.stores) {
      const val = _get(storage).get(uuid);
      if (val !== undefined) {
        return val.copy();
      }
    }
    return undefined;
  }

  has(obj: Base | string): boolean {
    return this.get(obj) !== undefined;
  }

  delete(obj: Base | string): void {
    const target = this.get(obj);
    if (target === undefined) {
      return;
    }

    for (const storage of this.stores) {
      storage.update((map) => {
        map.delete(target.uuid);
        for (const val of map.values()) {
          val.removeDependency(target);
        }
        return map;
      });
    }
  }

  put(obj: Base): void {
    if (obj instanceof Skill) {
      this.skills.update((map) => {
        map.set(obj.uuid, obj.copy());
        return map;
      });
    } else if (obj instanceof Task) {
      this.tasks.update((map) => {
        map.set(obj.uuid, obj.copy());
        return map;
      });
    } else if (obj instanceof Person) {
      this.people.update((map) => {
        map.set(obj.uuid, obj.copy());
        return map;
      });
    } else if (obj instanceof Location) {
      this.locations.update((map) => {
        map.set(obj.uuid, obj.copy());
        return map;
      });
    } else if (obj instanceof Assignment) {
      this.assignments.update((map) => {
        map.set(obj.uuid, obj.copy());
        return map;
      });
    }
  }

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

  get stores(): Storage<Base>[] {
    return [this.skills, this.tasks, this.people, this.locations, this.assignments];
  }
}
