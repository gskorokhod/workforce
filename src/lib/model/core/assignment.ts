import { CalendarDate, parseDate, type DateValue } from "@internationalized/date";
import { Shift } from "./shift";
import { Person } from "./person";
import type { JsonArray, JsonObject } from "type-fest";
import { uuidOf, type IdOr } from "./misc";
import { derived, get as _get, type Writable } from "svelte/store";
import { z } from "zod";
import type { State } from "./state";
import { Base } from "./base";
import { HashMap } from "$lib/utils";
import { Recurrence } from "../temporal";

// ---- Assignment type ----

export type Assignment = {
  person: Person;
  date: CalendarDate;
  preference: AssignmentPreference;
} & (
  | {
      type: "DAY_OFF";
      shift?: never;
      reason?: string;
    }
  | {
      type: "SHIFT";
      shift: Shift;
      reason?: string;
    }
);

// ---- Map of one-off Assignments ----

export class Assignments {
  protected _state: State;
  data = new Map<string, HashMap<CalendarDate, AssignmentEntry>>();

  constructor(state: State, assignments?: Iterable<Assignment | RawAssignment>) {
    this._state = state;
    if (assignments) {
      for (const assignment of assignments) {
        this.put(assignment.person, assignment.date, assignment as AssignmentEntry);
      }
    }
  }

  static fromJSON(json: unknown, state: State): Assignments {
    const res: RawAssignment[] = z.array(assignmentSchema).parse(json);
    return new Assignments(state, res);
  }

  toJSON(): JsonArray {
    const ans = [];
    for (const [person, assignments] of this.data.entries()) {
      for (const [date, entry] of assignments.entries()) {
        ans.push(
          assignmentJSON({
            ...entry,
            person,
            date,
          }),
        );
      }
    }
    return ans;
  }

  put(person: IdOr<Person>, date: CalendarDate, entry: AssignmentEntry) {
    // console.log("put", person, date, to);
    const personId = uuidOf(person);
    if (!this.data.has(personId)) {
      this.data.set(personId, new HashMap());
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.data.get(personId)!.set(date, entry);
  }

  delete(person: IdOr<Person>, date: CalendarDate) {
    const personId = uuidOf(person);
    if (!this.data.has(personId)) {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    this.data.get(personId)!.delete(date);
  }

  clear() {
    this.data.clear();
  }

  get(aPerson: IdOr<Person>, date: CalendarDate): Assignment | undefined {
    const res = this.data.get(uuidOf(aPerson))?.get(date);
    if (!res) {
      return undefined;
    }

    const person = _get(this._state._people).get(uuidOf(aPerson));
    if (!person) {
      return undefined;
    }

    const shift = res.shift ? _get(this._state._shifts).get(uuidOf(res.shift)) : undefined;
    return {
      ...res,
      person,
      date,
      shift,
    } as Assignment;
  }

  getFor(aPerson: IdOr<Person>): HashMap<CalendarDate, Assignment> {
    const res = new HashMap<CalendarDate, Assignment>();
    const person = _get(this._state._people).get(uuidOf(aPerson));
    if (!person) {
      return res;
    }

    for (const [date, to] of this.data.get(uuidOf(aPerson)) || new HashMap()) {
      const shift = to.shift ? _get(this._state._shifts).get(uuidOf(to.shift)) : undefined;
      res.set(date, {
        ...to,
        person,
        date,
        shift,
      } as Assignment);
    }
    return res;
  }

  get byDate(): HashMap<CalendarDate, Assignment[]> {
    const map = new HashMap<CalendarDate, Assignment[]>();
    for (const [personID, dates] of this.data) {
      for (const [date, to] of dates) {
        const person = _get(this._state._people).get(personID);
        if (!person) {
          continue;
        }

        if (!map.has(date)) {
          map.set(date, []);
        }

        const shift = to.shift ? _get(this._state._shifts).get(uuidOf(to.shift)) : undefined;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        map.get(date)!.push({
          ...to,
          person,
          date,
          shift,
        } as Assignment);
      }
    }
    return map;
  }

  get entries(): Assignment[] {
    return _get(this.rEntries);
  }

  get rEntries(): Writable<Assignment[]> {
    const readable = derived([this._state._people, this._state._shifts], ([people, shifts]) => {
      const ans: Assignment[] = [];
      for (const [personID, dates] of this.data) {
        for (const [date, entry] of dates) {
          const person = people.get(personID);
          if (!person) {
            continue;
          }

          switch (entry.type) {
            case "DAY_OFF": {
              ans.push({
                ...entry,
                person,
                date,
              });
              break;
            }
            case "SHIFT": {
              const shift = shifts.get(uuidOf(entry.shift));
              if (!shift) {
                continue;
              }
              ans.push({
                ...entry,
                person,
                date,
                shift,
              });
              break;
            }
          }
        }
      }
      return ans;
    });

    const set = (entries: Assignment[]) => {
      this.data.clear();
      for (const entry of entries) {
        this._state.put(entry.person);
        if (entry.shift) {
          this._state.put(entry.shift);
        }
        this.put(entry.person, entry.date, entry);
      }
    };

    const update = (updater: (entries: Assignment[]) => Assignment[]) => {
      set(updater(_get(readable)));
    };

    return {
      subscribe: readable.subscribe,
      set,
      update,
    };
  }
}

// ---- Assignment Pattern ----

export interface AssignmentPatternProps {
  pattern: Recurrence;
  person: IdOr<Person>;
  params: AssignmentEntry;
}

export class AssignmentPattern extends Base {
  pattern: Recurrence;
  _person: string;
  params: AssignmentEntry;

  constructor(props: AssignmentPatternProps, state: State, uuid?: string) {
    super(state, uuid);
    this.pattern = props.pattern;
    this._person = uuidOf(props.person);
    this.params = props.params;
  }

  static fromJSON(json: JsonObject, state: State): AssignmentPattern {
    return new AssignmentPattern(
      {
        pattern: Recurrence.fromJSON(json.pattern),
        person: z.string().parse(json.person),
        params: assignmentEntrySchema.parse(json.params),
      },
      state,
    );
  }

  toJSON(): JsonObject {
    return {
      ...super.toJSON(),
      pattern: this.pattern.toJSON(),
      person: this._person,
      params: assignmentEntryJSON(this.params),
    };
  }

  copy(): AssignmentPattern {
    return new AssignmentPattern(
      {
        params: { ...this.params },
        pattern: this.pattern.copy(),
        person: this._person,
      },
      state,
      uuid,
    );
    this._person_uuid = writable(uuidOf(props.person));
    this.date = props.date;
  }

  expand(after?: DateValue, before?: DateValue, inclusive = true, limit = -1): Assignments {
    const ans = new Assignments(this.state);
    const occurrences = this.pattern.occurrences(after, before, inclusive, limit);
    for (const occurrence of occurrences) {
      for (const date of occurrence.getDates()) {
        ans.put(this._person, date, this.params);
      }
    }
    return ans;
  }

  set shift(shift: Shift | undefined) {
    this.params.shift = shift ? uuidOf(shift) : undefined;
  }

  get shift(): Shift | undefined {
    const uuid = this.params.shift ? uuidOf(this.params.shift) : undefined;
    if (uuid) {
      return _get(this.state._shifts).get(uuid);
    }
    return undefined;
  }

  set person(person: Person | undefined) {
    if (person) {
      this._person = uuidOf(person);
    }
  }

  get person(): Person | undefined {
    return _get(this.state._people).get(this._person);
  }
}

// ---- Resolving Assignments ----

export type ResolvedAssignment = Assignment & {
  source: Assignments | AssignmentPattern;
};

export function resolveAssignments(
  oneOff: Assignments,
  patterns: AssignmentPattern[],
  after?: DateValue,
  before?: DateValue,
  inclusive = true,
  limit = -1,
): HashMap<Person, HashMap<CalendarDate, ResolvedAssignment>> {
  const ans = new HashMap<Person, HashMap<CalendarDate, ResolvedAssignment>>();

  for (const entry of oneOff.entries) {
    const { person, date } = entry;
    if (!ans.has(person)) {
      ans.set(person, new HashMap<CalendarDate, ResolvedAssignment>());
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ans.get(person)!.set(date, {
      ...entry,
      source: oneOff,
    });
  }

  for (const pattern of patterns) {
    for (const entry of pattern.expand(after, before, inclusive, limit).entries) {
      const { person, date } = entry;
      if (!ans.has(person)) {
        ans.set(person, new HashMap<CalendarDate, ResolvedAssignment>());
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      ans.get(person)!.set(date, {
        ...entry,
        source: pattern,
      });
    }
  }

  return ans;
}

// ---- Shorthands for constructing AssignmentEntry ----

export function toShift(
  shift: IdOr<Shift>,
  preference: AssignmentPreference = "preferred",
): AssignmentEntry {
  return {
    type: "SHIFT",
    shift,
    preference,
  };
}

export function dayOff(
  preference: AssignmentPreference = "preferred",
  reason?: string,
): AssignmentEntry {
  return {
    type: "DAY_OFF",
    preference,
    reason,
  };
}

// ---- Serialization ----

export function assignmentsSerializer(state: State) {
  return {
    stringify: (assignments: Assignments) => JSON.stringify(assignments.toJSON()),
    parse: (json: string) => Assignments.fromJSON(JSON.parse(json), state),
  };
}

function assignmentEntryJSON(entry: AssignmentEntry): JsonObject {
  return {
    type: entry.type,
    preference: entry.preference,
    shift: entry.shift ? uuidOf(entry.shift) : null,
    reason: entry.reason || null,
  };
}

export function assignmentJSON(assignment: Assignment | RawAssignment): JsonObject {
  return {
    person: uuidOf(assignment.person),
    date: assignment.date.toString(),
    ...assignmentEntryJSON(assignment),
  };
}

// ---- Zod Schemas ----

export type AssignmentEntry = z.infer<typeof assignmentEntrySchema>;
export type AssignmentPreference = z.infer<typeof preferenceSchema>;
type RawAssignment = z.infer<typeof assignmentSchema>;

const preferenceSchema = z.enum(["preferred", "required"]);

const assignmentEntrySchema = z
  .object({
    preference: preferenceSchema,
    reason: z
      .string()
      .nullish()
      .transform((x) => x ?? undefined),
  })
  .and(
    z.discriminatedUnion("type", [
      z.object({
        type: z.literal("DAY_OFF"),
        shift: z
          .never()
          .nullish()
          .transform((x) => x ?? undefined),
      }),
      z.object({
        type: z.literal("SHIFT"),
        shift: z.string().or(z.any().refine((val) => val instanceof Shift)),
      }),
    ]),
  );

const assignmentSchema = z
  .object({
    person: z.string().or(z.any().refine((val) => val instanceof Person)),
    date: z.string().transform(parseDate),
  })
  .and(assignmentEntrySchema);
