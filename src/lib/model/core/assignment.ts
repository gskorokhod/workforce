import { getLocalTimeZone, now } from "@internationalized/date";
import type { JsonObject, JsonValue } from "type-fest";
import { TimeSlot } from "../temporal";
import { copied, has } from "../utils";
import { without } from "../utils";
import { Base } from "./base";
import { Location } from "./location";
import { revivedArr } from "./misc";
import { Person } from "./person";
import { State } from "./state";
import { Task } from "./task";

interface IAssignment {
  time: TimeSlot;
  people: Person[];
  location?: Location;
  task?: Task;
}

export class Assignment extends Base implements IAssignment {
  private _time: TimeSlot;
  private _people: Person[] = [];
  private _location?: Location;
  private _task?: Task;

  constructor(props: Partial<IAssignment>, state?: State, uuid?: string) {
    super(state, uuid);
    const dtNow = now(getLocalTimeZone());
    this._time = props.time || new TimeSlot(dtNow, dtNow.add({ hours: 1 }));
    this._people = props.people || [];
    this._location = props.location;
    this._task = props.task;
  }

  toJSON(): JsonValue {
    const ans: JsonObject = {
      uuid: this.uuid,
      time: this._time.toJSON(),
      people: this._people.map((person) => person.toJSON())
    };

    if (this._location) {
      ans.location = this._location.toJSON();
    }

    if (this._task) {
      ans.task = this._task.toJSON();
    }

    return ans;
  }

  static fromJSON(json: JsonValue, state?: State): Assignment {
    const { time, people, location, task, uuid } = json as JsonObject;

    return new Assignment(
      {
        time: TimeSlot.fromJSON(time as JsonObject),
        people: revivedArr(Person, people, state),
        location: location ? Location.fromJSON(location as JsonObject) : undefined,
        task: task ? Task.fromJSON(task as JsonObject) : undefined
      },
      state,
      typeof uuid === "string" ? uuid : undefined
    );
  }

  copy(): Assignment {
    return new Assignment(
      {
        time: this._time.copy(),
        people: copied(this._people),
        location: this._location ? this._location.copy() : undefined,
        task: this._task ? this._task.copy() : undefined
      },
      this.state
    );
  }

  dependencies(): Base[] {
    return [
      ...this._people,
      ...(this._location ? [this._location] : []),
      ...(this._task ? [this._task] : [])
    ];
  }

  removeDependency(dep: Base): void {
    if (dep instanceof Person) {
      this.removePerson(dep);
    } else if (dep instanceof Location) {
      this._location = undefined;
      this.touch();
    } else if (dep instanceof Task) {
      this._task = undefined;
      this.touch();
    }
  }

  update(force: boolean = false): boolean {
    if (super.update(force)) {
      const assignment = this.get() as Assignment;
      this._time = assignment._time;
      this._people = assignment._people;
      this._location = assignment._location;
      this._task = assignment._task;
      return true;
    }
    return false;
  }

  addPerson(person: Person): void {
    if (!has(this._people, person)) {
      this._people.push(person);
      this.touch();
    }
  }

  removePerson(person: Person): void {
    if (has(this._people, person)) {
      this._people = without(this._people, person);
      this.touch();
    }
  }

  get time(): TimeSlot {
    this.update();
    return this._time;
  }

  get people(): Person[] {
    this.update();
    return this._people;
  }

  get location(): Location | undefined {
    this.update();
    return this._location;
  }

  get task(): Task | undefined {
    this.update();
    return this._task;
  }

  set time(time: TimeSlot) {
    this._time = time.copy();
    this.touch();
  }

  set people(people: Person[]) {
    this._people = copied(people);
    this.touch();
  }

  set location(location: Location | undefined) {
    this._location = location?.copy();
    this.touch();
  }

  set task(task: Task | undefined) {
    this._task = task?.copy();
    this.touch();
  }
}
