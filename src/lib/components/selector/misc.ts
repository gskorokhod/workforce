import { Icon } from "$lib/ui";
import type { ProfileSize } from "$lib/components/profile";

export const BTN_SIZE: ProfileSize = {
  xs: "h-6 gap-1",
  sm: "h-9 gap-2",
  md: "h-11 gap-2",
  lg: "h-13 gap-2",
  xl: "h-16 gap-2",
};

export const PLUS = Icon.fromString("lucide:plus");
export const PLACEHOLDER = Icon.fromString("lucide:circle-help");
export const CLEAR = Icon.fromString("lucide:x");

export type TransitionFn<T> = (_old: T | undefined, _new: T | undefined) => T | undefined;
export type OnSelect<T> = (selected: T | undefined) => void;
export type OptionsCmp<T> = (a: T, b: T) => number;
export type OptionsFilter<T> = (a: T) => boolean;
