<script lang="ts">
  import type { AnyPlugins } from "svelte-headless-table/plugins";

  import EmployeesDataTable from "$lib/components/elements/data-tables/employees-data-table.svelte";
  import ColumnHideSelector from "$lib/components/elements/data-tables/lib/column-hide-selector.svelte";
  import PersonEditDialog from "$lib/components/elements/person/person-edit-dialog.svelte";
  import TopBar from "$lib/components/elements/top-bar/top_bar.svelte";
  import { Button } from "$lib/components/ui/button";
  import Search from "$lib/components/ui/search/search.svelte";
  import { deleteEmployee, employees } from "$lib/stores.ts";
  import { type Person, type PersonProps } from "$lib/types";
  import { createPerson, defaultPersonProps } from "$lib/types/person.ts";
  import { PlusIcon } from "lucide-svelte";
  import { type Writable, writable } from "svelte/store";
  import { FlatColumn } from "svelte-headless-table";
  import { createSortKeysStore, type WritableSortKeys } from "svelte-headless-table/plugins";

  let data: Writable<Person[]> = employees;
  let filterValue: Writable<string> = writable("");
  let sortKeys: WritableSortKeys = createSortKeysStore([]);
  let flatColumns: FlatColumn<Person, AnyPlugins, string>[];
  let hideForId: { [key: string]: boolean } = {};
  let className: string = "";

  let open: boolean = false;
  let personUUID: string | undefined = undefined;
  let personProps: Writable<PersonProps> = writable(defaultPersonProps());

  function handleEdit(p: Person) {
    personUUID = p.uuid;
    personProps.set(p as PersonProps);
    open = true;
  }

  function handleDelete(p: Person) {
    deleteEmployee(p);
  }

  function onSubmit(props: PersonProps) {
    employees.update((people) => {
      if (personUUID !== undefined) {
        const index = people.findIndex((p) => p.uuid === personUUID);
        if (index !== -1) {
          console.log("Updating index: ", index);
          const p = people[index];
          people[index] = {
            ...p,
            ...props
          };
          console.log(people[index]);
          return people;
        }
      }

      let newPerson = createPerson(props);
      console.log("Created person: ", newPerson);
      people.push(newPerson);

      return people;
    });

    personProps.set(defaultPersonProps());
    personUUID = undefined;
    open = false;
  }

  function handleAdd() {
    personProps.set(defaultPersonProps());
    personUUID = undefined;
    open = true;
  }

  const actions: Map<string, (p: Person) => void> = new Map([
    ["Delete", handleDelete],
    ["Edit", handleEdit]
  ]);

  export { className as class, data };
</script>

<div class="flex h-full w-full flex-col items-start justify-start overflow-y-scroll {className}">
  <TopBar sticky={true}>
    <svelte:fragment slot="start">
      <slot name="start" />
      <Button
        class="text-muted-foreground hover:text-accent-foreground"
        on:click={handleAdd}
        size="icon_xl"
        variant="ghost"
      >
        <PlusIcon />
      </Button>
    </svelte:fragment>

    <svelte:fragment slot="middle">
      <slot name="middle" />
    </svelte:fragment>

    <svelte:fragment slot="end">
      <slot name="end" />
      <ColumnHideSelector bind:hideForId {flatColumns} />
      <Search onInput={(s) => filterValue.set(s)} />
    </svelte:fragment>
  </TopBar>
  <EmployeesDataTable
    {actions}
    bind:filterValue
    bind:flatColumns
    bind:hideForId
    bind:sortKeys
    class="w-full"
    {data}
  />
</div>
<PersonEditDialog bind:open bind:personProps {onSubmit} />
