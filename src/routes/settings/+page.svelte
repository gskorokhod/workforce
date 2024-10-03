<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Label } from "$lib/components/ui/label";
  import * as RadioGroup from "$lib/components/ui/radio-group";
  import { Switch } from "$lib/components/ui/switch";
  import { populateState } from "$lib/dummy-data";
  import { state } from "$lib/model";

  const settings = state.settings;
</script>

<div class="flex flex-col gap-4 pl-6 pt-4">
  <section>
    <h2>Workflow</h2>
    <p>Customize the app to reflect your organisation's workflow</p>
    <RadioGroup.Root value="option-one">
    </RadioGroup.Root>
  </section>
  <section>
    <h2>Miscelaneous</h2>
    <p>Other settings for the application</p>
    <div class="flex items-center space-x-2">
      <Switch id="development" bind:checked={$settings.development} />
      <Label for="development">Development Mode</Label>
    </div>
  </section>
  {#if $settings.development}
  <section class="flex flex-col gap-2">
    <h2>Developer Zone</h2>
    <p>This section contains developer utilities and settings. Don't touch it unless you know what you are doing!</p>
      <Button on:click={() => {
        state.clear();
        populateState(state);
      }}>
        Generate Dummy Data
      </Button>
  </section>
  {/if}
</div>
