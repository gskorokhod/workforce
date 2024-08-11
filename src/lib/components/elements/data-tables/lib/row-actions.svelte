<!--suppress ES6UnusedImports -->
<script lang="ts">
  import Ellipsis from "lucide-svelte/icons/ellipsis";
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu";
  import { Button } from "$lib/components/ui/button";

  let item: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let actions: Map<string, (item: any) => void>;
  let open: boolean = false;

  export { item, actions };
</script>

<DropdownMenu.Root bind:open>
  <DropdownMenu.Trigger asChild let:builder>
    <Button
      variant="ghost"
      builders={[builder]}
      size="icon"
      class="relative h-8 w-8 p-0"
    >
      <span class="sr-only">Open menu</span>
      <Ellipsis class="h-4 w-4" />
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    {#each Array.from(actions.entries()) as [key, value]}
      <DropdownMenu.Item on:click={() => value(item)}>{key}</DropdownMenu.Item>
    {/each}
  </DropdownMenu.Content>
</DropdownMenu.Root>