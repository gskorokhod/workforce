import { Icon } from "$lib/ui";
import type { ProfileSize } from "../profile-picture";

export const BTN_SIZE: ProfileSize = {
  xs: "h-6 gap-1",
  sm: "h-9 gap-2",
  md: "h-11 gap-2",
  lg: "h-13 gap-2",
  xl: "h-16 gap-2",
};

export const PLUS = new Icon({
  pack: "lucide",
  name: "plus",
});

export const PLACEHOLDER = new Icon({
  pack: "lucide",
  name: "circle-help",
});

export const CLEAR = new Icon({
  pack: "lucide",
  name: "x",
});

export type TransitionFn<T> = (_old: T | undefined, _new: T | undefined) => T | undefined;
export type OnSelect<T> = (selected: T | undefined) => void;
export type OptionsCmp<T> = (a: T, b: T) => number;
export type OptionsFilter<T> = (a: T) => boolean;
