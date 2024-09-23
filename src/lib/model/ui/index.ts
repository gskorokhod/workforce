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

export { Icon };
