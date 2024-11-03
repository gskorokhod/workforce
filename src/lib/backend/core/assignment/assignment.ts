import type { JsonObject } from "type-fest";
import { Base, Person, State } from "..";
import { TimeSlot } from "../../temporal";
import type { Display, Icon } from "../../ui";

export interface IAssignment extends Display {
  person?: Person;
  timeslot?: TimeSlot;
}

export abstract class Assignment extends Base implements IAssignment {
  name: string;
  description: string;
  icon?: Icon;
  private _person?: Person;

  constructor(props: Partial<IAssignment>, state?: State, uuid?: string) {
    super(state, uuid);

    this.name = props.name || "";
    this.description = props.description || "";
    this.icon = props.icon;
    this._person = props.person?.copy();
  }

  abstract copy(): Assignment;

  abstract get timeslot(): TimeSlot | undefined;

  toJSON(): JsonObject {
    return {
      uuid: this.uuid,
      name: this.name,
      description: this.description || "",
      icon: this.icon?.toJSON() || null,
      person: this._person?.toJSON() || null,
    };
  }

  get person(): Person | undefined {
    return this._person?.get() as Person | undefined;
  }

  set person(person: Person | undefined) {
    this._person = person?.copy();
  }
}
