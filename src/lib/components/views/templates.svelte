<script lang="ts">
  import * as Tabs from "$lib/components/ui/tabs";
  import PropertiesTable from "$lib/components/property/properties-table.svelte";
  // import PropertyValue from "$lib/components/property/property-value.svelte";
  import * as Popover from "$lib/components/ui/popover";
  import * as Command from "$lib/components/ui/command";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { CheckIcon, ChevronDownIcon } from "lucide-svelte";
  import ProfilePicture from "$lib/components/profile/profile-picture.svelte";
  import { type ColumnInitializer } from "$lib/components/data-table/core";
  // import { createRender } from "svelte-headless-table";
  import { Property, type Templates } from "$lib/model/core";
  import { persisted } from "svelte-persisted-store";

  import { state as GLOBAL_STATE } from "$lib/model";
  import { capitalize } from "$lib/utils/misc";
  import { get } from "svelte/store";

  export let state = GLOBAL_STATE;
  let className = "";
  let propertySelectStates: Record<string, boolean> = {};

  const allProperties = state.properties;
  const templates = state.templates;
  const selectedTemplate = persisted("templateEditorTab", Object.keys(get(templates))[0]);

  function forceUpdate() {
    templates.update((t) => t);
    allProperties.update((p) => p);
  }

  function mkRowActions(templateId: keyof Templates) {
    const unlink = (item: Property<unknown>) => {
      const template = $templates[templateId];
      if (!template) return;
      template.delete(item);
      forceUpdate();
    };
    return new Map<string, (item: Property<unknown>) => void>([["Unlink", unlink]]);
  }

  function mkExtraColumns(templateId: keyof Templates): ColumnInitializer<Property<unknown>>[] {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const propValues = $templates[templateId];
    return [
      // {
      //   accessor: (row: Property<unknown>) => row,
      //   cell: (cell) =>
      //     createRender(PropertyValue, { property: cell.value, value: propValues.get(cell.value) }),
      //   header: "Default Value",
      //   id: "default",
      // },
    ];
  }

  $: extraColumnsAll = [
    {
      accessor: (row: Property<unknown>) => {
        const entries = Object.entries($templates);
        const filtered = entries.filter(([_, template]) => template.has(row));
        const count = filtered.length;
        if (count === entries.length) return "All existing templates";
        else if (count > 1) {
          return `${count} templates`;
        } else if (count === 1) {
          return `1 template (${capitalize(filtered[0][0])})`;
        }
        return "No templates";
      },
      header: "Used By",
      id: "usedCount",
    },
  ];

  export { className as class };
</script>

{#if Object.keys($templates).length > 0}
  <Tabs.Root value={$selectedTemplate} class={className} orientation="vertical">
    <Tabs.List class="min-h-[40rem] w-44 bg-secondary p-4">
      {#each Object.keys($templates) as templateId}
        <Tabs.Trigger
          value={templateId}
          on:click={() => {
            selectedTemplate.set(templateId);
          }}
          class="w-full justify-start pl-4 text-base">{capitalize(templateId)}</Tabs.Trigger
        >
      {/each}
      <Tabs.Trigger
        value="all"
        on:click={() => {
          selectedTemplate.set("all");
        }}
        class="mt-auto w-full justify-start pl-4 text-base"
      >
        All Properties
      </Tabs.Trigger>
    </Tabs.List>
    {#each Object.keys($templates) as templateId}
      {@const templateProperties = $templates[templateId]}
      <Tabs.Content value={templateId} class="w-full p-4">
        <PropertiesTable
          data={templateProperties.rKeys}
          hiddenColumns={[]}
          extraColumns={mkExtraColumns(templateId)}
          rowActions={mkRowActions(templateId)}
          onEditSubmit={(prop) => {
            prop.push();
            templates.update((templates) => {
              templates[templateId].put(prop, null);
              return templates;
            });
          }}
        >
          <Tooltip.Root
            openDelay={100}
            closeDelay={100}
            group="template-editor-add-property"
            slot="add-dropdown"
          >
            <Tooltip.Trigger>
              <Popover.Root bind:open={propertySelectStates[templateId]}>
                <Popover.Trigger
                  class="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-accent hover:text-primary"
                >
                  <ChevronDownIcon />
                </Popover.Trigger>
                <Popover.Content class="p-2">
                  <Command.Root>
                    <Command.Input placeholder="Search properties..." />
                    <Command.List class="mt-2">
                      <Command.Empty>No results found.</Command.Empty>
                      <!-- {#each $allProperties.filter((p) => !templateProperties.has(p)) as option} -->
                      {#each $allProperties as option}
                        {@const selected = templateProperties.has(option.uuid)}
                        <Command.Item
                          value={option.uuid}
                          onSelect={(uuid) => {
                            if (selected) {
                              templateProperties.delete(uuid);
                            } else {
                              templateProperties.put(uuid, null);
                            }
                            forceUpdate();
                            // propertySelectStates[templateId] = false;
                          }}
                        >
                          <ProfilePicture item={option} />
                          <span class="ml-3">{option.name}</span>
                          <CheckIcon class="ml-auto {selected ? 'opacity-100' : 'opacity-0'}" />
                        </Command.Item>
                      {/each}
                    </Command.List>
                  </Command.Root>
                </Popover.Content>
              </Popover.Root>
            </Tooltip.Trigger>
            <Tooltip.Content>
              <span> Link existing property to this template </span>
            </Tooltip.Content>
          </Tooltip.Root>
        </PropertiesTable>
      </Tabs.Content>
    {/each}
    <Tabs.Content value="all" class="w-full p-4">
      <PropertiesTable data={allProperties} extraColumns={extraColumnsAll} />
    </Tabs.Content>
  </Tabs.Root>
{:else}
  <div class="flex h-full flex-col items-center justify-center">
    <p class="text-gray-500">No templates found.</p>
  </div>
{/if}
