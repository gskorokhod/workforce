import type { Copy } from "$lib/utils";
import Color from "color";
import type { JsonObject } from "type-fest";

const DEFAULT_PACK = "lucide";

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

  static fromString(str: string, color?: Color): Icon {
    if (!str.includes(":")) {
      return new Icon({ pack: DEFAULT_PACK, name: str }, color);
    }
    const [pack, name] = str.split(":");
    return new Icon({ pack, name }, color);
  }

  static fromJSON(json: JsonObject): Icon | undefined {
    const color = typeof json.color === "string" ? Color(json.color) : undefined;
    const name = typeof json.name === "object" ? (json.name as IconName) : undefined;
    if (!name) return undefined;
    return new Icon(name, color);
  }

  toJSON(): JsonObject {
    const ans: JsonObject = {
      name: this.icon,
    };

    if (this.color) {
      ans.color = this.color.hex();
    }

    return ans;
  }

  with(props: { color?: Color; icon?: IconName }): Icon {
    return new Icon(props.icon || this.icon, props.color || this.color);
  }

  copy(): Icon {
    return new Icon(this.icon, this.color);
  }

  get name(): string {
    return `${this.icon.pack}:${this.icon.name}`;
  }
}
