import ProfilePicture from "./profile-picture.svelte";
import ProfileTooltip from "./profile-tooltip.svelte";
import Profile from "./profile.svelte";
import ProfilesList from "./profiles-list.svelte";

export type ProfileSize = {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
};

export const PFP_HEIGHT: ProfileSize = {
  xs: "h-5 py-0.5",
  sm: "h-7 py-0.5",
  md: "h-10 py-1",
  lg: "h-12 py-1.5",
  xl: "h-16 py-2"
};

export const PFP_WIDTH: ProfileSize = {
  xs: "w-5 px-0.5",
  sm: "w-7 px-0.5",
  md: "w-10 px-1",
  lg: "w-12 px-1.5",
  xl: "w-16 px-2"
};

type Size = keyof ProfileSize;

export { Profile, ProfilesList, ProfilePicture, ProfileTooltip, type Size };
