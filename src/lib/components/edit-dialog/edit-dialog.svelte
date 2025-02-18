<script lang="ts" generics="T">
  import { Button } from "$lib/components/ui/button";
  import * as Dialog from "$lib/components/ui/dialog";
  import { state as GLOBAL_STATE } from "$lib/model";
  import { Base } from "$lib/model/core";
  import EditForm from "./edit-form.svelte";

  export let item: T | undefined;
  export let title = "Edit";
  export let open = false;
  export let state = GLOBAL_STATE;
  export let onSubmit: (item: T) => void = () => {};
  export let onOpenChange: (open: boolean) => void = () => {};

  function handleSubmit() {
    if (item) {
      if (item instanceof Base) item.push();
      onSubmit(item);
    }
    open = false;
  }
</script>

<Dialog.Root bind:open {onOpenChange}>
  <Dialog.Trigger>
    <slot />
  </Dialog.Trigger>
  <Dialog.Content class="max-w-2xl p-4">
    <Dialog.Header>
      <Dialog.Title class="text-xl font-semibold">{title}</Dialog.Title>
      <Dialog.Description>
        Click save to apply changes. Press ESC or close the dialog to cancel.
      </Dialog.Description>
    </Dialog.Header>
    {#if item}
      <EditForm bind:item {state}>
        <slot name="options" />
      </EditForm>
      <Dialog.Footer>
        <Button on:click={handleSubmit} type="submit">Save changes</Button>
      </Dialog.Footer>
    {:else}
      <div class="flex h-40 w-full items-center justify-center bg-muted">
        <p class="text-lg font-semibold text-muted-foreground">No item selected</p>
      </div>
    {/if}
  </Dialog.Content>
</Dialog.Root>
