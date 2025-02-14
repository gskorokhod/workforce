import type { Display } from "$lib/ui";
import { Icon } from "$lib/ui";
import type { JsonObject } from "type-fest";
import { z } from "zod";
import { Base } from "./base";
import { displayFromJSON, displayToJSON } from "./misc";
// import type { State } from "./state";

export class Displayable extends Base implements Display {
  name: string;
  description?: string;
  icon?: Icon;
  avatar?: URL;

  /**
   * Creates a new qualification.
   * @param props Properties of the qualification.
   * @param state State to bind the qualification to.
   * @param uuid UUID of the qualification. If not provided, a new UUID is generated
   * @see LabelProps
   */
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(props: Display, state: any, uuid?: string) {
    super(state, uuid);
    this.name = props.name || "";
    this.description = props.description;
    this.icon = props.icon;
    this.avatar = props.avatar;
  }

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  static fromJSON(json: JsonObject, state: any): Displayable {
    console.log("Displayable fromJSON");
    return new Displayable(
      {
        ...displayFromJSON(json),
      },
      state,
      z.optional(z.string()).parse(json.uuid),
    );
  }

  toJSON(): JsonObject {
    console.log("Displayable toJSON");
    return {
      ...super.toJSON(),
      ...displayToJSON(this),
    };
  }

  copy(): Displayable {
    return new Displayable(
      {
        ...this,
        icon: this.icon?.copy(),
      },
      this.state,
      this.uuid,
    );
  }
}
