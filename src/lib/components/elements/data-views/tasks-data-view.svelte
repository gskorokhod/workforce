<script lang="ts">
  import type { Task } from "$lib/types";
  import type { AnyPlugins } from "svelte-headless-table/plugins";

  import ColumnHideSelector from "$lib/components/elements/data-tables/lib/column-hide-selector.svelte";
  import TasksDataTable from "$lib/components/elements/data-tables/tasks-data-table.svelte";
  import TaskEditDialog from "$lib/components/elements/task/task-edit-dialog.svelte";
  import TopBar from "$lib/components/elements/top-bar/top_bar.svelte";
  import { Button } from "$lib/components/ui/button";
  import Search from "$lib/components/ui/search/search.svelte";
  import { deleteTask, tasks } from "$lib/stores.ts";
  import { createTask, defaultTaskProps, type TaskProps } from "$lib/types/task.ts";
  import { PlusIcon } from "lucide-svelte";
  import { type Writable, writable } from "svelte/store";
  import { FlatColumn } from "svelte-headless-table";
  import { createSortKeysStore, type WritableSortKeys } from "svelte-headless-table/plugins";

  let data: Writable<Task[]> = tasks;
  let filterValue: Writable<string> = writable("");
  let sortKeys: WritableSortKeys = createSortKeysStore([]);
  let flatColumns: FlatColumn<Task, AnyPlugins, string>[];
  let hideForId: { [key: string]: boolean } = {};
  let className: string = "";

  let open: boolean = false;
  let taskUUID: string | undefined = undefined;
  let taskProps: Writable<TaskProps> = writable(defaultTaskProps());

  function handleEdit(t: Task) {
    taskUUID = t.uuid;
    taskProps.set(t as TaskProps);
    open = true;
  }

  function handleDelete(t: Task) {
    deleteTask(t);
  }

  function onSubmit(props: TaskProps) {
    tasks.update((taskList) => {
      if (taskUUID !== undefined) {
        const index = taskList.findIndex((t) => t.uuid === taskUUID);
        if (index !== -1) {
          console.log("Updating index: ", index);
          const t = taskList[index];
          taskList[index] = {
            ...t,
            ...props
          };
          console.log(taskList[index]);
          return taskList;
        }
      }

      let newTask = createTask(props);
      taskList.push(newTask);
      return taskList;
    });

    taskProps.set(defaultTaskProps());
    taskUUID = undefined;
    open = false;
  }

  function handleAdd() {
    taskProps.set(defaultTaskProps());
    taskUUID = undefined;
    open = true;
  }

  const actions: Map<string, (t: Task) => void> = new Map([
    ["Delete", handleDelete],
    ["Edit", handleEdit]
  ]);

  export { className as class, data };
</script>

<div class="flex h-full w-full flex-col items-start justify-start overflow-y-scroll {className}">
  <TopBar sticky={true}>
    <svelte:fragment slot="start">
      <Button
        class="text-muted-foreground hover:text-accent-foreground"
        on:click={handleAdd}
        size="icon_xl"
        variant="ghost"
      >
        <PlusIcon />
      </Button>
      <slot name="start" />
    </svelte:fragment>

    <svelte:fragment slot="middle">
      <slot name="middle" />
    </svelte:fragment>

    <svelte:fragment slot="end">
      <ColumnHideSelector bind:hideForId {flatColumns} />
      <Search onInput={(s) => filterValue.set(s)} />
    </svelte:fragment>
  </TopBar>
  <TasksDataTable
    {actions}
    bind:filterValue
    bind:flatColumns
    bind:hideForId
    bind:sortKeys
    class="w-full"
    {data}
  />
</div>
<TaskEditDialog bind:open bind:taskProps {onSubmit} />
