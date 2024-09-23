<script lang="ts" generics="T extends Display">
  import IconPickerContent from "./icon-picker-content.svelte";

  import { Button } from "$lib/components/ui/button";
  import * as Popover from "$lib/components/ui/popover";
  import { Icon, type Display } from "$lib/model/ui";
  import { tick } from "svelte";
  import type { Size } from "../profile-picture";
  import ProfilePicture from "../profile-picture/profile-picture.svelte";

  const defaultIcon: Icon = Icon.fromString("lucide:image-plus");

  export let item: T;
  export let size: Size = "md";
  let className: string = "";
  let open: boolean = false;

  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  function closeAndFocusTrigger(triggerId: string) {
    open = false;
    tick().then(() => {
      document.getElementById(triggerId)?.focus();
    });
  }

  export { className as class };
</script>

<Popover.Root bind:open let:ids>
  <Popover.Trigger asChild class={className} let:builder>
    <Button
      aria-expanded={open}
      builders={[builder]}
      class="aspect-square h-fit w-fit rounded-full p-0 outline-none"
      role="combobox"
      variant="ghost"
    >
      <ProfilePicture {item} {size} {defaultIcon} />
    </Button>
  </Popover.Trigger>
  <Popover.Content class="w-[310px] p-0">
    <div class="rounded bg-destructive p-3 text-destructive-foreground">
      File upload is not supported yet.
    </div>
    <IconPickerContent bind:icon={item.icon} onClose={() => closeAndFocusTrigger(ids.trigger)} />
  </Popover.Content>
</Popover.Root>
