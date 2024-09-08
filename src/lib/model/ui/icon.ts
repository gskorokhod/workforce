import Color from "color";
import type { JsonObject } from "type-fest";
import type { Copy } from "../utils";

interface IconName extends JsonObject {
  pack: string;
  name: string;
}

export class Icon implements Copy<Icon> {
  color?: Color;
  icon: IconName;

  constructor(name: IconName, color?: Color) {
    this.icon = name;
    this.color = color;
  }

  toJSON(): JsonObject {
    const ans: JsonObject = {
      name: this.icon
    };

    if (this.color) {
      ans.color = this.color.hex();
    }

    return ans;
  }

  static fromJSON(json: JsonObject): Icon | undefined {
    const color = typeof json.color === "string" ? Color(json.color) : undefined;
    const name = typeof json.name === "object" ? (json.name as IconName) : undefined;
    if (!name) return undefined;
    return new Icon(name, color);
  }

  copy(): Icon {
    return new Icon(this.icon, this.color);
  }

  get name(): string {
    return `${this.icon.pack}:${this.icon.name}`;
  }
}
