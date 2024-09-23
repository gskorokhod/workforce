<script lang="ts">
  import { Icon as TIcon } from "$lib/model/ui";
  import Icon from "@iconify/svelte";
  import type Color from "color";

  let icon: TIcon;
  let inline: boolean = false;
  let width: string | number = "1em";
  let height: string | number = "1em";
  let color: Color | undefined = undefined;
  let className: string = "";

  // noinspection ReservedWordAsName
  export { icon, inline, width, height, color, className as class };
</script>

<Icon color={color?.hex()} icon={icon.name} {inline} {width} {height} class={className} />
