<script lang="ts">
  import { type ColumnInitializer, DataTableCore } from "$lib/components/data-table/core";
  import { TableHeader } from "$lib/components/data-table/lib";
  import { EditDialog } from "$lib/components/edit-dialog";
  import { ProfilePicture } from "$lib/components/profile";
  import { Search } from "$lib/components/search";
  import { Button } from "$lib/components/ui/button";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import * as Select from "$lib/components/ui/select";
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
  import type { Display } from "$lib/ui";
  import { ChevronDownIcon, PlusIcon, TagIcon, TagsIcon, TextIcon } from "lucide-svelte";
  import { createRender, FlatColumn, type ReadOrWritable } from "svelte-headless-table";
  import { createSortKeysStore, type WritableSortKeys } from "svelte-headless-table/plugins";
  import { type Writable, writable } from "svelte/store";
  import Label from "../ui/label/label.svelte";
  import Separator from "../ui/separator/separator.svelte";
  import OptionsTable from "./options-table.svelte";
  import PropertyOptions from "./property-options.svelte";

  export let data: ReadOrWritable<Property<unknown>[]>;
  export let state: State = GLOBAL_STATE;
  export let header = true;
  export let rowActions = new Map<string, (item: Property<unknown>) => void>();

  let filterValue: Writable<string> = writable("");
  let sortKeys: WritableSortKeys = createSortKeysStore([]);
  let hideForId: Record<string, boolean> = {};
  let flatColumns: FlatColumn<Property<unknown>, any, string>[]; // eslint-disable-line @typescript-eslint/no-explicit-any
  let className = "";

  let nextType: PropertyType = "multiple";
  let selected: Property<unknown> | undefined = undefined;
  let dialogOpen = false;
  let dialogTitle = "Edit Option";
  let oldProps: Partial<SelectPropertyProps> = {};
  let columnInitializers: ColumnInitializer<Property<unknown>>[] = [
    {
      accessor: (row) => row as Display,
      cell: (cell) => createRender(ProfilePicture, { item: cell.value }),
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
  ];

  let actions = new Map([...rowActions, ["Edit", rowClick], ["Delete", rowDelete]]);

  function rowClick(item: Property<unknown>) {
    dialogTitle = "Edit Property";
    selected = item;
    dialogOpen = true;
  }

  function rowDelete(item: Property<unknown>) {
    item.delete();
  }

  function newProperty(type: PropertyType, props?: Partial<SelectPropertyProps>) {
    dialogTitle = "Add Property";
    switch (type) {
      case "single": {
        selected = new SelectProperty(
          {
            name: "",
            options: [],
            ...props,
          },
          state,
        );
        break;
      }
      case "multiple": {
        selected = new MultiSelectProperty(
          {
            name: "",
            options: [],
            ...props,
          },
          state,
        );
        break;
      }
      case "text": {
        selected = new TextProperty(
          {
            name: "",
            ...props,
          },
          state,
        );
        break;
      }
      default: {
        throw new Error(`Unknown property type: ${type}`);
      }
    }
    nextType = type;
    dialogOpen = true;
  }

  function onOpenChange() {
    oldProps = {};
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
    newProperty(newType, oldProps);
    dialogTitle = "Edit Property";
  }

  function describeType(v: PropertyType) {
    switch (v) {
      case "single":
        return "Single-Select";
      case "multiple":
        return "Multi-Select";
      case "text":
        return "Text Field";
      default:
        return "Unknown";
    }
  }

  export { className as class };
</script>

<div class="flex flex-col items-start justify-start {className}">
  <div class="mt-4 flex h-max w-full flex-col items-start justify-start overflow-y-scroll">
    {#if header}
      <TableHeader sticky={true}>
        <div
          class="group flex flex-row items-center rounded-md transition-all hover:bg-muted hover:bg-opacity-20"
          slot="start"
        >
          <Button
            variant="ghost"
            size="icon-xl"
            class="text-muted-foreground hover:!bg-opacity-100 hover:text-primary group-hover:bg-muted group-hover:bg-opacity-20"
            on:click={() => newProperty(nextType)}
          >
            <PlusIcon />
          </Button>
          <Separator
            orientation="vertical"
            class="h-7 w-[1px] bg-muted-foreground bg-opacity-50 transition-all group-hover:bg-transparent"
          />
          <DropdownMenu.Root>
            <DropdownMenu.Trigger
              class="flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-all hover:bg-muted hover:!bg-opacity-100 hover:text-primary group-hover:bg-muted group-hover:bg-opacity-20"
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
      defaultAction={rowClick}
    />
  </div>
</div>
<EditDialog
  item={selected}
  bind:open={dialogOpen}
  title={dialogTitle}
  onSubmit={(opt) => opt.push()}
  {onOpenChange}
>
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
    {/if}
  </svelte:fragment>
</EditDialog>
