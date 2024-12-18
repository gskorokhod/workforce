<!--suppress ES6UnusedImports -->
<script lang="ts" generics="T">
  import { Button } from "$lib/components/button";
  import * as DropdownMenu from "$lib/components/dropdown-menu";
  import Ellipsis from "lucide-svelte/icons/ellipsis";
  import type { RowActions } from ".";

  let item: T;
  let actions: RowActions<T> = new Map();
  let open = false;

  export { actions, item };
</script>

<DropdownMenu.Root bind:open>
  <DropdownMenu.Trigger asChild let:builder>
    <Button builders={[builder]} class="relative h-8 w-8 p-0" size="icon" variant="ghost">
      <span class="sr-only">Open menu</span>
      <Ellipsis class="h-4 w-4" />
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    {#each Array.from(actions.entries()) as [key, fn]}
      <DropdownMenu.Item on:click={() => fn(item)}>{key}</DropdownMenu.Item>
    {/each}
  </DropdownMenu.Content>
</DropdownMenu.Root>
