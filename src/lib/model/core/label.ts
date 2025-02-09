import { Icon, type Display } from "$lib/ui";
import type { JsonObject, JsonValue } from "type-fest";
import { Base } from "./base";
import { displayFromJSON, displayToJSON, revivedArr } from "./misc";
import { State } from "./state";

/**
 * Represents a possible option for a label.
 */
type ILabelOption = Display & {
  value: string;
};

type ILabel = Display & {
  type: "text" | "select" | "multi";
  key: string;
  options?: ILabelOption[];
};

export class Label extends Base implements ILabel {
  type: "text" | "select" | "multi";
  name: string;
  description?: string;
  icon?: Icon;
  private _options: Map<string, ILabelOption>;

  constructor(props: ILabel, state?: State) {
    super(state, props.key);
    this.type = props.type;
    this.name = props.name;
    this.description = props.description;
    this.icon = props.icon;
    this._options = new Map(props.options?.map((option) => [option.value, option]));
  }

  get options(): ILabelOption[] | undefined {
    if (this.type === "text") {
      return undefined;
    }
    return Array.from(this._options.values());
  }

  get key(): string {
    return this.uuid;
  }

  static fromJSON(json: JsonObject, state?: State): Label {
    const { type, key, options } = json as JsonObject;
    return new Label(
      {
        ...displayFromJSON(json),
        type: type as "text" | "select" | "multi",
        key: key as string,
        options: options ? revivedArr(optionFromJSON, options) : undefined,
      },
      state,
    );
  }

  toJSON(): JsonObject {
    return {
      ...displayToJSON(this),
      type: this.type,
      key: this.key,
      options: this.options?.map(optionToJSON) ?? null,
    };
  }

  copy(): Base {
    return new Label(
      {
        key: this.key,
        type: this.type,
        name: this.name,
        description: this.description,
        icon: this.icon,
        options: this.options?.map((option) => ({ ...option })),
      },
      this.state,
    );
  }
}

function optionFromJSON(json: JsonValue): ILabelOption {
  const { value } = json as JsonObject;
  return {
    ...displayFromJSON(json),
    value: value as string,
  };
}

function optionToJSON(option: ILabelOption): JsonObject {
  return {
    ...displayToJSON(option),
    value: option.value,
  };
}
