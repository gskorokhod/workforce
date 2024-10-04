import type Color from "color";
import { type VariantProps, tv } from "tailwind-variants";
import Root from "./chip.svelte";

type ChipProps = {
  color?: Color;
  class?: string;
};

const chipVariants = tv({
  base: "w-max h-fit inline-flex flex-row items-center justify-center gap-2 rounded-full outline-none outline-offset-0 transition-all",
  variants: {
    variant: {
      none: "",
      default: "bg-primary text-primary-foreground hover:bg-primary/90 hover:outline-primary/90",
      outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/90 hover:outline-secondary/90",
      muted: "bg-muted text-muted-foreground hover:bg-muted/90 hover:outline-muted-foreground/90",
      destructive:
        "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:outline-destructive/90",
      ghost: "hover:bg-accent hover:text-accent-foreground"
    },
    size: {
      xs: "h-5 min-w-5 text-sm p-0.5",
      sm: "h-6 min-w-6 text-md p-0.5",
      md: "h-8 min-w-8 text-lg p-1",
      lg: "h-10 min-w-10 text-xl p-2",
      xl: "h-12 min-w-12 text-2xl p-3"
    }
  },
  defaultVariants: {
    variant: "default",
    size: "md"
  }
});

type Variant = VariantProps<typeof chipVariants>["variant"];
type Size = VariantProps<typeof chipVariants>["size"];

type Props = ChipProps & {
  variant?: Variant;
  size?: Size;
};

export { Root as Chip, Root, chipVariants, type Props };
