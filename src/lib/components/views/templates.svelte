<script lang="ts">
  import * as Tabs from "$lib/components/ui/tabs";
  import PropertiesTable from "$lib/components/property/properties-table.svelte";
  import { Button } from "$lib/components/ui/button";
  import * as Popover from "$lib/components/ui/popover";
  import * as Command from "$lib/components/ui/command";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { ChevronDownIcon, PlusIcon } from "lucide-svelte";
  import Separator from "$lib/components/ui/separator/separator.svelte";
  import ProfilePicture from "$lib/components/profile/profile-picture.svelte";
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

  export { className as class };
</script>

{#if Object.keys($templates).length > 0}
  <Tabs.Root value={$selectedTemplate} class={className} orientation="vertical">
    <Tabs.List class="min-h-80 w-44 bg-secondary p-4">
      {#each Object.keys($templates) as templateId}
        <Tabs.Trigger
          value={templateId}
          on:click={() => {
            selectedTemplate.set(templateId);
          }}
          class="w-full justify-start pl-4 text-base">{capitalize(templateId)}</Tabs.Trigger
        >
      {/each}
    </Tabs.List>
    {#each Object.keys($templates) as templateId}
      {@const templateProperties = $templates[templateId]}
      <Tabs.Content value={templateId} class="w-full p-4">
        <PropertiesTable data={templateProperties.rKeys}>
          <div
            slot="add"
            class="group flex flex-row items-center rounded-md transition-all hover:bg-accent hover:bg-opacity-20"
          >
            <Tooltip.Root openDelay={100} closeDelay={100} group="template-editor-add-property">
              <Tooltip.Trigger>
                <Button
                  variant="ghost"
                  size="icon-xl"
                  class="text-muted-foreground hover:text-primary"
                  on:click={() => {}}
                >
                  <PlusIcon />
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>Create a new property</Tooltip.Content>
            </Tooltip.Root>
            <Separator
              orientation="vertical"
              class="h-7 w-[1px] bg-muted-foreground bg-opacity-50 transition-all group-hover:bg-transparent"
            />
            <Tooltip.Root openDelay={100} closeDelay={100} group="template-editor-add-property">
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
                        {#each $allProperties.filter((p) => !templateProperties.has(p)) as option}
                          <Command.Item
                            value={option.uuid}
                            onSelect={(uuid) => {
                              templateProperties.put(uuid, null);
                              templates.update((t) => t);
                              propertySelectStates[templateId] = false;
                            }}
                          >
                            <ProfilePicture item={option} />
                            <span class="ml-3">{option.name}</span>
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
            <!-- <DropdownMenu.Root>
              <DropdownMenu.Trigger
                class="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-accent hover:text-primary"
              >
                <ChevronDownIcon />
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.Group>
                  <DropdownMenu.Label class="text-center">Select a Property</DropdownMenu.Label>
                  <DropdownMenu.Separator />
                </DropdownMenu.Group>
              </DropdownMenu.Content>
            </DropdownMenu.Root> -->
          </div>
        </PropertiesTable>
        <!-- <Table.Root class="w-full border">
          <Table.Header>
            <Table.Row>
              <Table.Head>Property</Table.Head>
              <Table.Head>Default Value</Table.Head>
              <Table.Head>Actions</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {#each properties.keys as property}
              <Table.Row>
                <Table.Cell>
                  <div class="flex flex-row items-center gap-3">
                    <ProfilePicture item={property} />
                    <span class="text-base">{property.name}</span>
                  </div>
                </Table.Cell>
                <Table.Cell>
                  <PropertyInput {property} {properties} placeholderText="Empty by default" />
                </Table.Cell>
                <Table.Cell>
                  <!-- <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild let:builder>
                      <Button
                        builders={[builder]}
                        class="relative h-8 w-8 p-0"
                        size="icon"
                        variant="ghost"
                      >
                        <span class="sr-only">Open menu</span>
                        <EllipsisIcon class="h-4 w-4" />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item on:click={() => {}} class="transition-all">
                        <EditIcon class="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        on:click={() => {}}
                        class="text-destructive transition-all hover:!bg-destructive hover:!text-destructive-foreground"
                      >
                        <ListXIcon class="mr-2 h-4 w-4" />
                        <span>Unlink</span>
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Table.Cell>
              </Table.Row>
            {/each}
          </Table.Body> -->
        <!-- <Table.Body>
          <Table.Row>
           <Table.Cell class="font-medium">INV001</Table.Cell>
           <Table.Cell>Paid</Table.Cell>
           <Table.Cell>Credit Card</Table.Cell>
           <Table.Cell class="text-right">$250.00</Table.Cell>
          </Table.Row>
         </Table.Body> -->
        <!-- </Table.Root> -->
      </Tabs.Content>
    {/each}
  </Tabs.Root>
{:else}
  <div class="flex h-full flex-col items-center justify-center">
    <p class="text-gray-500">No templates found.</p>
  </div>
{/if}
