<script lang="ts">
  import { type ColumnInitializer, DataTableCore } from "$lib/components/data-table/core";
  import { TableHeader } from "$lib/components/data-table/lib";
  import { EditDialog } from "$lib/components/edit-dialog";
  import { ProfilePicture } from "$lib/components/profile";
  import { Search } from "$lib/components/search";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import * as Select from "$lib/components/ui/select";
  import * as Tooltip from "$lib/components/ui/tooltip";
  import { state as GLOBAL_STATE, State } from "$lib/model";
  import {
    ASelectProperty,
    MultiSelectProperty,
    Property,
    type PropertyType,
    SelectProperty,
    type SelectPropertyProps,
    TextProperty,
  } from "$lib/model/core/property";
  import { Icon, type Display } from "$lib/ui";
  import { ChevronDownIcon, PlusIcon, TagIcon, TagsIcon, TextIcon } from "lucide-svelte";
  import { createRender, FlatColumn, type ReadOrWritable } from "svelte-headless-table";
  import { createSortKeysStore, type WritableSortKeys } from "svelte-headless-table/plugins";
  import { type Writable, writable, get as _get } from "svelte/store";
  import { v4 as uuidv4 } from "uuid";
  import Label from "../ui/label/label.svelte";
  import Separator from "../ui/separator/separator.svelte";
  import OptionsTable from "./options-table.svelte";
  import PropertyOptions from "./property-options.svelte";
  import { describeType } from "./misc";
  import DeleteDialog from "../data-table/lib/delete-dialog.svelte";

  export let data: ReadOrWritable<Property<unknown>[]>;
  export let state: State = GLOBAL_STATE;
  export let header = true;
  export let rowActions = new Map<string, (item: Property<unknown>) => void>();
  export let extraColumns: ColumnInitializer<Property<unknown>>[] = [];
  export let hiddenColumns: string[] = [];
  export let onEditSubmit: (item: Property<unknown>) => void = () => {};

  let filterValue: Writable<string> = writable("");
  let sortKeys: WritableSortKeys = createSortKeysStore([]);
  let hideForId: Record<string, boolean> = {};
  let flatColumns: FlatColumn<Property<unknown>, any, string>[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  let className = "";

  let nextType: PropertyType = "multiple";
  let selected: Property<unknown> | undefined = undefined;
  let alertOpen = false;
  let dialogOpen = false;
  let dialogTitle = "Edit Option";
  let oldProps: Partial<SelectPropertyProps> = {};
  let columnInitializers: ColumnInitializer<Property<unknown>>[] = [
    {
      accessor: (row) => row as Display,
      cell: (cell) =>
        createRender(ProfilePicture, {
          item: cell.value,
          defaultIcon: Icon.fromString("lucide:tag"),
        }),
      header: "Picture",
      id: "picture",
      plugins: {
        sort: {
          disable: true,
        },
        tableFilter: {
          disable: true,
        },
      },
    },
    {
      accessor: (row: Property<unknown>) => row.name,
      header: "Name",
      id: "name",
    },
    {
      accessor: (row: Property<unknown>) => describeType(row.type),
      header: "Type",
      id: "type",
    },
    {
      accessor: (row: Property<unknown>) => row,
      cell: (cell) => createRender(PropertyOptions, { property: cell.value }),
      header: "Options",
      id: "options",
    },
    {
      accessor: (row: Property<unknown>) => row.description || "No Description",
      header: "Description",
      id: "description",
    },
    ...extraColumns,
  ];

  hiddenColumns.forEach((id) => (hideForId[id] = true));
  let actions = new Map([["Edit", rowClick], ...rowActions, ["Delete", rowDelete]]);

  function rowClick(item: Property<unknown>) {
    dialogTitle = "Edit Property";
    selected = item;
    dialogOpen = true;
  }

  function rowDelete(item: Property<unknown>) {
    if (_get(state.settings).askDeleteConfirmation) {
      selected = item;
      alertOpen = true;
    } else {
      item.delete();
    }
  }

  function newProperty(type: PropertyType, aProps?: Partial<SelectPropertyProps>, uuid?: string) {
    dialogTitle = "Add Property";
    uuid = uuid || uuidv4();
    const props = {
      name: "",
      ...aProps,
    };
    switch (type) {
      case "single": {
        selected = new SelectProperty(
          {
            options: [],
            ...props,
          },
          state,
          uuid,
        );
        break;
      }
      case "multiple": {
        selected = new MultiSelectProperty(
          {
            options: [],
            ...props,
          },
          state,
          uuid,
        );
        break;
      }
      case "text": {
        selected = new TextProperty(props, state, uuid);
        break;
      }
      default: {
        throw new Error(`Unknown property type: ${type}`);
      }
    }
    nextType = type;
    dialogOpen = true;
  }

  function changePropType(v: unknown) {
    if (!v) return;
    console.log("Old Props", oldProps);
    if (selected) {
      oldProps = {
        ...oldProps,
        name: selected.name,
        description: selected.description,
        icon: selected.icon,
        avatar: selected.avatar,
      };
      if (selected instanceof ASelectProperty) {
        oldProps.options = selected.options;
      }
    }
    console.log("New Props", oldProps);
    const newType = v as PropertyType;
    newProperty(newType, oldProps, selected?.uuid);
    dialogTitle = "Edit Property";
  }

  function onOpenChange() {
    oldProps = {};
  }

  function onSubmit(prop: Property<unknown>) {
    onEditSubmit(prop);
    prop.push();
    oldProps = {};
  }

  export { className as class };
</script>

<div class="flex flex-col items-start justify-start {className}">
  <div class="flex h-max w-full flex-col items-start justify-start overflow-y-scroll">
    {#if header}
      <TableHeader sticky={true}>
        <div
          class="group flex flex-row items-center rounded-md transition-all hover:bg-accent hover:bg-opacity-20"
          slot="start"
        >
          <slot name="add">
            <slot name="add-default">
              <Tooltip.Root openDelay={100} closeDelay={100} group="template-editor-add-property">
                <Tooltip.Trigger>
                  <Button
                    variant="ghost"
                    size="icon-xl"
                    class="text-muted-foreground hover:text-primary"
                    on:click={() => newProperty(nextType)}
                  >
                    <PlusIcon />
                  </Button>
                </Tooltip.Trigger>
                <Tooltip.Content>Create a new property</Tooltip.Content>
              </Tooltip.Root>
            </slot>
            <Separator
              orientation="vertical"
              class="h-7 w-[1px] bg-muted-foreground bg-opacity-50 transition-all group-hover:bg-transparent"
            />
            <slot name="add-dropdown">
              <DropdownMenu.Root>
                <DropdownMenu.Trigger
                  class="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-accent hover:text-primary"
                >
                  <ChevronDownIcon />
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Group>
                    <DropdownMenu.Label class="text-center">Choose a Type</DropdownMenu.Label>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item on:click={() => newProperty("single")}>
                      <TagIcon class="mr-2 w-8 text-muted-foreground" />
                      {describeType("single")}
                    </DropdownMenu.Item>
                    <DropdownMenu.Item on:click={() => newProperty("multiple")}>
                      <TagsIcon class="mr-2 w-8 text-muted-foreground" />
                      {describeType("multiple")}
                    </DropdownMenu.Item>
                    <DropdownMenu.Item on:click={() => newProperty("text")}>
                      <TextIcon class="mr-2 w-8 text-muted-foreground" />
                      {describeType("text")}
                    </DropdownMenu.Item>
                  </DropdownMenu.Group>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </slot>
          </slot>
          <slot name="start" />
        </div>

        <svelte:fragment slot="middle">
          <slot name="middle" />
        </svelte:fragment>

        <svelte:fragment slot="end">
          <Search onInput={(s) => filterValue.set(s)} />
        </svelte:fragment>
      </TableHeader>
    {/if}
    <DataTableCore
      bind:filterValue
      bind:flatColumns
      bind:hideForId
      bind:sortKeys
      class="w-full"
      {columnInitializers}
      {data}
      {actions}
      {header}
      defaultAction={rowClick}
    />
  </div>
</div>

<EditDialog {selected} bind:open={dialogOpen} title={dialogTitle} {onSubmit} {onOpenChange}>
  <svelte:fragment slot="options">
    {#if selected}
      <div class="flex w-full flex-col gap-1.5">
        <Label class="font-semibold" for="type">Type</Label>
        <Select.Root
          onSelectedChange={(v) => changePropType(v?.value)}
          selected={{ value: selected.type, label: describeType(selected.type) }}
        >
          <Select.Trigger id="type">
            <Select.Value placeholder="Select a type" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="single">Single-Select</Select.Item>
            <Select.Item value="multiple">Multi-Select</Select.Item>
            <Select.Item value="text">Text Field</Select.Item>
          </Select.Content>
        </Select.Root>
      </div>
      {#if selected instanceof ASelectProperty}
        <div class="flex w-full flex-col gap-1.5">
          <span class="font-semibold">Options</span>
          <OptionsTable property={selected} />
        </div>
      {/if}
      <slot name="editForm" />
    {/if}
  </svelte:fragment>
</EditDialog>

<DeleteDialog
  {selected}
  open={alertOpen}
  extraDescription="This will remove all references to this property in all items."
/>
