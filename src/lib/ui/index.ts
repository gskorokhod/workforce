import { Icon } from "./icon";

export interface HasName {
  name: string;
  description?: string;
}

export interface HasIcon extends HasName {
  icon: Icon;
}

export interface HasAvatar extends HasName {
  avatar: URL;
}

export type Display = HasName & Partial<HasIcon> & Partial<HasAvatar>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isDisplay(obj: any): obj is Display {
  return typeof obj === "object" && obj !== null && typeof obj.name === "string";
}

export { Icon };
