<!--suppress ES6UnusedImports -->
<script lang="ts">
  import type { Person } from "$lib/types";

  import PersonAvatar from "$lib/components/elements/person/person-avatar.svelte";
  import { Button } from "$lib/components/ui/button";
  import { ChipVariant } from "$lib/components/ui/chip";
  import * as Command from "$lib/components/ui/command";
  import * as Popover from "$lib/components/ui/popover";
  import { employees, getPerson } from "$lib/stores.ts";
  import { cn } from "$lib/utils/utils.js";
  import Check from "lucide-svelte/icons/check";
  import { tick } from "svelte";

  type Filter = (s: Person | undefined) => boolean;
  type OnChange = (
    old_value: string | undefined,
    new_value: string | undefined
  ) => string | undefined;

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
  export { className as class, filter, onChange, options, person_uuid, placeholder, variant };
</script>

<Popover.Root bind:open let:ids>
  <Popover.Trigger asChild class={className} let:builder>
    <Button
      aria-expanded={open}
      builders={[builder]}
      class="h-10 w-10 overflow-visible rounded-full"
      role="combobox"
      variant="ghost"
    >
      <PersonAvatar person={getPerson(person_uuid)} {placeholder} {variant} />
    </Button>
  </Popover.Trigger>
  <Popover.Content class="w-[250px] p-0">
    <Command.Root>
      <Command.Input placeholder="Search" />
      <Command.Empty>No people found</Command.Empty>
      <Command.Group class="max-h-[250px] overflow-y-scroll">
        {#each filtered_options as option}
          <Command.Item
            class="flex flex-row items-center justify-start gap-2"
            onSelect={() => {
              person_uuid = onChange(person_uuid, option.uuid);
              closeAndFocusTrigger(ids.trigger);
            }}
            value="{option.name};{option.job_title};{option.uuid}"
          >
            <PersonAvatar person={option} />
            {option.name}
            <Check
              class={cn("ml-auto h-6 w-6", person_uuid !== option.uuid && "text-transparent")}
            />
          </Command.Item>
        {/each}
        <Command.Item
          class="flex flex-row items-center justify-start gap-2"
          onSelect={() => {
            person_uuid = onChange(person_uuid, undefined);
            closeAndFocusTrigger(ids.trigger);
          }}
          value="unassigned"
        >
          <PersonAvatar person={undefined} popoverEnabled={false} />
          Unassigned
          <Check class={cn("ml-auto h-6 w-6", person_uuid !== undefined && "text-transparent")} />
        </Command.Item>
      </Command.Group>
    </Command.Root>
  </Popover.Content>
</Popover.Root>
