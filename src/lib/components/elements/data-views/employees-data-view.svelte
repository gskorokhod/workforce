<script lang="ts">
  import TopBar from "$lib/components/elements/top-bar/top_bar.svelte";
  import Search from "$lib/components/ui/search/search.svelte";
  import ColumnHideSelector from "$lib/components/elements/data-tables/lib/column-hide-selector.svelte";
  import EmployeesDataTable from "$lib/components/elements/data-tables/employees-data-table.svelte";
  import PersonEditDialog from "$lib/components/elements/person/person-edit-dialog.svelte";

  import { FlatColumn, type ReadOrWritable } from "svelte-headless-table";
  import { type Person, type PersonProps } from "$lib/types";
  import { deleteEmployee, employees } from "$lib/stores.ts";
  import { writable, type Writable } from "svelte/store";
  import { createSortKeysStore, type WritableSortKeys } from "svelte-headless-table/plugins";
  import type { AnyPlugins } from "svelte-headless-table/plugins";
  import { Button } from "$lib/components/ui/button";
  import { UserPlusIcon } from "lucide-svelte";
  import { createPerson, defaultPersonProps } from "$lib/types/person.ts";

  let data: ReadOrWritable<Person[]> = employees;
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
    console.log("onSubmit");

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
    ["Edit", handleEdit],
    ["Delete", handleDelete]
  ]);

  export { data, className as class };
</script>

<PersonEditDialog bind:personProps bind:open {onSubmit} />
<div class="h-full w-full flex flex-col items-start justify-start overflow-y-scroll {className}">
  <TopBar sticky={true}>
    <svelte:fragment slot="start">
      <slot name="start" />
      <Button size="icon_xl" variant="ghost" on:click={handleAdd}
              class="text-muted-foreground hover:text-accent-foreground">
        <UserPlusIcon />
      </Button>
    </svelte:fragment>

    <svelte:fragment slot="middle">
      <slot name="middle" />
    </svelte:fragment>

    <svelte:fragment slot="end">
      <slot name="end" />
      <ColumnHideSelector {flatColumns} bind:hideForId />
      <Search onInput={(s) => filterValue.set(s)} />
    </svelte:fragment>
  </TopBar>
  <EmployeesDataTable {data} {actions} bind:filterValue bind:sortKeys bind:hideForId bind:flatColumns class="w-full" />
</div>