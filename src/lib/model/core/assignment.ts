import { Icon, type Display } from "$lib/ui";
import { CalendarDate, isSameDay, parseDate } from "@internationalized/date";
import { type Writable, writable, get as _get, type Readable, derived } from "svelte/store";
import type { JsonObject } from "type-fest";
import { Person } from "./person";
import { Shift } from "./shift";
import { State, subsetOne } from "./state";
import { z } from "zod";
import { Displayable } from "./displayable";
import { uuidOf, type IdOr } from "./misc";

const assignmentType = z.enum(["simple", "granular", "day_off"]);
export type AssignmentType = z.infer<typeof assignmentType>;

interface AssignmentProps extends Partial<Display> {
  person: IdOr<Person>;
  date: CalendarDate;
}

export abstract class Assignment extends Displayable {
  abstract readonly type: AssignmentType;
  date: CalendarDate;
  protected _person_uuid: Writable<string>;

  constructor(props: AssignmentProps, state: State, uuid?: string) {
    super(
      {
        name: "Assignment",
        ...props,
      },
      state,
      uuid,
    );
    this._person_uuid = writable(uuidOf(props.person));
    this.date = props.date;
  }

  static rGetOn(state: State, date: CalendarDate): Readable<Assignment[]> {
    return derived(state.assignments, (assignments) => {
      assignments.filter((a) => isSameDay(a.date, date));
    });
  }

  static rGetForPerson(state: State, person: Person): Readable<Assignment[]> {
    return derived(state.assignments, (assignments) => {
      assignments.filter((a) => a.person?.eq(person));
    });
  }

  static fromJSON(json: JsonObject, state: State): Assignment {
    const type = assignmentType.parse(json.type);
    switch (type) {
      case "simple":
        return SimpleAssignment.fromJSON(json, state);
      case "day_off":
        return DayOff.fromJSON(json, state);
      case "granular":
        throw new Error("TODO: Granular assignments are not yet supported");
    }
  }

  static propsFromJSON(json: JsonObject, state: State): AssignmentProps {
    return {
      ...super.fromJSON(json, state),
      person: z.string().parse(json.person),
      date: z.string().transform(parseDate).parse(json.date),
    };
  }

  toJSON(): JsonObject {
    return {
      ...super.toJSON(),
      type: this.type,
      person: _get(this._person_uuid),
      date: this.date.toString(),
    };
  }

  copy(): Assignment {
    return Assignment.fromJSON(this.toJSON(), this.state);
  }

  get person(): Person | undefined {
    return _get(this.rPerson);
  }

  set person(person: Person) {
    this.rPerson.set(person);
  }

  get rPerson(): Writable<Person | undefined> {
    return subsetOne(this.state._people, this._person_uuid);
  }
}

export class DayOff extends Assignment {
  type: AssignmentType = "day_off";

  constructor(props: AssignmentProps, state: State, uuid?: string) {
    const person = _get(state._people).get(uuidOf(props.person));
    super(
      {
        name: "Day Off",
        description: `${person?.name || "This person"} is taking a day off on this date`,
        icon: Icon.fromString("lucide:calendar-off", "red"),
        ...props,
      },
      state,
      uuid,
    );
  }

  static rGetOn(state: State, date: CalendarDate): Readable<DayOff[]> {
    return derived(state.assignments, (assignments) => {
      assignments.filter((a) => a instanceof DayOff && isSameDay(a.date, date));
    });
  }

  static rGetForPerson(state: State, person: Person): Readable<DayOff[]> {
    return derived(state.assignments, (assignments) => {
      assignments.filter((a) => a instanceof DayOff && a.person?.eq(person));
    });
  }

  static fromJSON(json: JsonObject, state: State): DayOff {
    return new DayOff(
      {
        ...Assignment.propsFromJSON(json, state),
      },
      state,
      z.optional(z.string()).parse(json.uuid),
    );
  }
}

export interface SimpleAssignmentProps extends AssignmentProps {
  shift: IdOr<Shift>;
}

export class SimpleAssignment extends Assignment {
  type: AssignmentType = "simple";
  private _shift_uuid: Writable<string>;

  constructor(props: SimpleAssignmentProps, state: State, uuid?: string) {
    const shift = _get(state._shifts).get(uuidOf(props.shift));
    super(
      {
        ...shift,
        ...props,
      },
      state,
      uuid,
    );
    this._shift_uuid = writable(uuidOf(props.shift));
  }

  static rGetOn(state: State, date: CalendarDate): Readable<SimpleAssignment[]> {
    return derived(state.assignments, (assignments) => {
      assignments.filter((a) => a instanceof SimpleAssignment && isSameDay(a.date, date));
    });
  }

  static rGetForPerson(state: State, person: Person): Readable<SimpleAssignment[]> {
    return derived(state.assignments, (assignments) => {
      assignments.filter((a) => a instanceof SimpleAssignment && a.person?.eq(person));
    });
  }

  static rGetForShift(state: State, shift: Shift): Readable<SimpleAssignment[]> {
    return derived(state.assignments, (assignments) => {
      assignments.filter((a) => a instanceof SimpleAssignment && a.shift?.eq(shift));
    });
  }

  static fromJSON(json: JsonObject, state: State): SimpleAssignment {
    return new SimpleAssignment(
      {
        ...Assignment.propsFromJSON(json, state),
        shift: z.string().parse(json.shift),
      },
      state,
      z.optional(z.string()).parse(json.uuid),
    );
  }

  set shift(shift: Shift) {
    this.rShift.set(shift);
  }

  get shift(): Shift | undefined {
    return _get(this.rShift);
  }

  get rShift(): Writable<Shift | undefined> {
    return subsetOne(this.state._shifts, this._shift_uuid);
  }
}
