<script lang="ts">
  import { Base } from "$lib/model/core";
  import { state as GLOBAL_STATE } from "$lib/model";
  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Checkbox } from "$lib/components/ui/checkbox";
  import { Label } from "$lib/components/ui/label";
  import { isDisplay } from "$lib/ui";

  export let selected: Base | undefined;
  export let open = false;
  export let extraDescription = "";
  export let state = GLOBAL_STATE;
  export let onDelete: () => void = () => {};

  const settings = state.settings;
</script>

<AlertDialog.Root {open}>
  {#if selected}
    <AlertDialog.Content>
      <AlertDialog.Header>
        <AlertDialog.Title>Are you sure?</AlertDialog.Title>
        <AlertDialog.Description>
          <p>
            You are about to delete {isDisplay(selected) ? '"' + selected.name + '"' : "this item"}.
            <br />
            {#if extraDescription}
              {extraDescription}
              <br />
            {/if}
            <span class="font-semibold">This action cannot be undone.</span>
          </p>
          <div class="mb-4 mt-4 flex items-center space-x-2 text-foreground">
            <Checkbox
              id="terms"
              bind:checked={$settings.askDeleteConfirmation}
              aria-labelledby="terms-label"
            />
            <Label
              id="terms-label"
              for="terms"
              class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Always ask me to confirm destructive operations
            </Label>
          </div>
        </AlertDialog.Description>
      </AlertDialog.Header>
      <AlertDialog.Footer>
        <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
        <AlertDialog.Action
          class="bg-destructive text-destructive-foreground"
          on:click={() => {
            if (selected) {
              selected.delete();
              selected = undefined;
            }
            onDelete();
            open = false;
          }}>Delete</AlertDialog.Action
        >
      </AlertDialog.Footer>
    </AlertDialog.Content>
  {/if}
</AlertDialog.Root>
