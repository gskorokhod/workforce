<!--suppress ES6UnusedImports -->
<script lang="ts">
  import type { Skill } from "$lib/types";

  import SkillBadge from "$lib/components/elements/skill/skill-badge.svelte";
   import { Button } from "$lib/components/ui/button";
  import { ChipVariant } from "$lib/components/ui/chip";
  import * as Command from "$lib/components/ui/command";
  import * as Popover from "$lib/components/ui/popover";
  import { getSkill, skills } from "$lib/stores.ts";
  import { capitalize, cn } from "$lib/utils/utils.js";
  import Check from "lucide-svelte/icons/check";
  import { tick } from "svelte";

  type Filter = (s: Skill | undefined) => boolean;
  type OnChange = (
    old_value: string | undefined,
    new_value: string | undefined
  ) => string | undefined;

  let skill_uuid: string | undefined = undefined;
  let options: Skill[] = $skills;
  let variant: ChipVariant = ChipVariant.default;
  let placeholder: string = "Choose a skill";
  let compact: boolean = true;
  let open: boolean = false;
  let className: string = "";

  let filter: Filter = () => true;
  let onChange: OnChange = (_, new_value) => new_value;

  $: filtered_options = options.filter(filter);

  // We want to refocus the trigger button when the user selects
  // an item from the list so users can continue navigating the
  // rest of the form with the keyboard.
  function closeAndFocusTrigger(triggerId: string) {
    open = false;
    tick().then(() => {
      document.getElementById(triggerId)?.focus();
    });
  }

  // noinspection ReservedWordAsName
  export {
    className as class,
    compact,
    filter,
    onChange,
    options,
    placeholder,
    skill_uuid,
    variant  };
</script>

<Popover.Root bind:open let:ids>
  <Popover.Trigger asChild class={className} let:builder>
    <Button
      aria-expanded={open}
      builders={[builder]}
      class="h-fit w-fit overflow-visible rounded-full !p-0"
      role="combobox"
      variant="ghost"
    >
      <SkillBadge {compact} {placeholder} skill={getSkill(skill_uuid)} {variant} />
    </Button>
  </Popover.Trigger>
  <Popover.Content class="w-[200px] p-0">
    <Command.Root>
      <Command.Input placeholder="Search" />
      <Command.Empty>No skills found</Command.Empty>
      <Command.Group class="max-h-[250px] overflow-y-scroll">
        {#each filtered_options as option}
          <Command.Item
            class="flex flex-row items-center justify-start gap-2"
            onSelect={() => {
              skill_uuid = onChange(skill_uuid, option.uuid);
              closeAndFocusTrigger(ids.trigger);
            }}
            value="{option.name};{option.uuid}"
          >
            <SkillBadge compact={true} skill={option} />
            {capitalize(option.name)}
            <Check
              class={cn("ml-auto h-6 w-6", skill_uuid !== option.uuid && "text-transparent")}
            />
          </Command.Item>
        {/each}
        <Command.Item
          class="flex flex-row items-center justify-start gap-2"
          onSelect={() => {
            skill_uuid = onChange(skill_uuid, undefined);
            closeAndFocusTrigger(ids.trigger);
          }}
          value="unassigned"
        >
          <SkillBadge popoverEnabled={false} skill={undefined} />
          Unassigned
          <Check class={cn("ml-auto h-6 w-6", skill_uuid !== undefined && "text-transparent")} />
        </Command.Item>
      </Command.Group>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
