<!--suppress ES6UnusedImports -->
<script lang="ts">
  import Check from "lucide-svelte/icons/check";
  import * as Command from "$lib/components/ui/command";
  import * as Popover from "$lib/components/ui/popover";
  import { Button } from "$lib/components/ui/button";
  import PersonAvatar from "$lib/components/elements/person/person-avatar.svelte";
  import { cn } from "$lib/utils/utils.js";
  import { tick } from "svelte";
  import { employees, getPerson } from "$lib/stores.ts";
  import type { Person } from "$lib/types";
  import { ChipVariant } from "$lib/components/ui/chip";

  type Filter = (s: Person | undefined) => boolean;
  type OnChange = (old_value: string | undefined, new_value: string | undefined) => string | undefined;

  let open = false;
  let person_uuid: string | undefined = undefined;
  let options: Person[] = $employees;
  let variant: ChipVariant = ChipVariant.default;
  let placeholder: string = "Assign person";
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
  export { person_uuid, options, variant, placeholder, onChange, filter, className as class };
</script>

<Popover.Root bind:open let:ids>
  <Popover.Trigger asChild let:builder class={className}>
    <Button
      builders={[builder]}
      variant="ghost"
      role="combobox"
      aria-expanded={open}
      class="w-10 h-10 rounded-full overflow-visible"
    >
      <PersonAvatar person={getPerson(person_uuid)} {variant} {placeholder} />
    </Button>
  </Popover.Trigger>
  <Popover.Content class="w-[250px] p-0">
    <Command.Root>
      <Command.Input placeholder="Search" />
      <Command.Empty>No people found</Command.Empty>
      <Command.Group class="max-h-[250px] overflow-y-scroll">
        {#each filtered_options as option}
          <Command.Item
            value="{option.name};{option.job_title};{option.uuid}"
            onSelect={() => {
              person_uuid = onChange(person_uuid, option.uuid);
              closeAndFocusTrigger(ids.trigger);
            }}
            class="flex flex-row items-center justify-start gap-2"
          >
            <PersonAvatar person={option} />
            {option.name}
            <Check
              class={cn(
                "ml-auto h-6 w-6",
                person_uuid !== option.uuid && "text-transparent"
              )}
            />
          </Command.Item>
        {/each}
        <Command.Item
          value="unassigned"
          onSelect={() => {
              person_uuid = onChange(person_uuid, undefined);
              closeAndFocusTrigger(ids.trigger);
            }}
          class="flex flex-row items-center justify-start gap-2"
        >
          <PersonAvatar person={undefined} popoverEnabled={false} />
          Unassigned
          <Check
            class={cn(
                "ml-auto h-6 w-6",
                person_uuid !== undefined && "text-transparent"
              )}
          />
        </Command.Item>
      </Command.Group>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
