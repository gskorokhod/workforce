import type { Copy } from "$lib/utils";
import Color from "color";
import type { JsonObject, JsonValue } from "type-fest";
import { z } from "zod";

const DEFAULT_PACK = "lucide";

interface IconName extends JsonObject {
  pack: string;
  name: string;
}

export class Icon implements Copy<Icon> {
  static schema = z.union([
    z
      .object({
        name: z.object({
          pack: z.string(),
          name: z.string(),
        }),
        color: z.string().nullish(),
      })
      .transform((val) => new Icon(val.name, val.color ? new Color(val.color) : undefined)),
    z.instanceof(Icon),
  ]);
  color?: Color;
  icon: IconName;

  constructor(name: IconName, color?: Color) {
    this.icon = name;
    this.color = color;
  }

  static fromString(str: string, aColor?: Color | string): Icon {
    let color = undefined;
    if (aColor) {
      color = typeof aColor === "string" ? new Color(aColor) : aColor;
    }

    if (!str.includes(":")) {
      return new Icon({ pack: DEFAULT_PACK, name: str }, color);
    }
    const [pack, name] = str.split(":");
    return new Icon({ pack, name }, color);
  }

  static fromJSON(json: JsonValue): Icon {
    return Icon.schema.parse(json);
  }

  toJSON(): JsonObject {
    return {
      name: this.icon,
      color: this.color?.hex() ?? null,
    };
  }

  with(props: { color?: Color | string | null; icon?: IconName }): Icon {
    let clr = undefined;
    if (props.color !== null) {
      if (props.color) {
        clr = new Color(props.color);
      } else {
        clr = this.color;
      }
    }
    return new Icon(props.icon || this.icon, clr);
  }

  copy(): Icon {
    return new Icon(this.icon, this.color);
  }

  get name(): string {
    return `${this.icon.pack}:${this.icon.name}`;
  }
}
