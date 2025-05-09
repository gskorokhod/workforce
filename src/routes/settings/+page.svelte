<script lang="ts">
  import { DateRangePicker } from "$lib/components/date-picker";
  import { Button, buttonVariants } from "$lib/components/ui/button";
  import * as Card from "$lib/components/ui/card";
  import * as Dialog from "$lib/components/ui/dialog";
  import Input from "$lib/components/ui/input/input.svelte";
  import { Label } from "$lib/components/ui/label";
  import * as RadioGroup from "$lib/components/ui/radio-group";
  import { Switch } from "$lib/components/ui/switch";
  import { populateState } from "$lib/dummy-data";
  import { state } from "$lib/model";
  import { type Settings } from "$lib/model/core";
  import { thisWeekStart } from "$lib/model/core/misc";
  import type { PlanningHorizonSetting } from "$lib/model/core/settings";
  import { fmtDate } from "$lib/model/temporal/utils";
  import { toCalendarDate } from "@internationalized/date";
  import { FileDownIcon, FileUpIcon, RefreshCwIcon, RotateCcwIcon, TrashIcon } from "lucide-svelte";
  import { setMode, mode } from "mode-watcher";
  import { downloadJSON } from "$lib/utils/misc";

  const settings = state.settings;

  const assignmentOptions = new Map<
    Settings["assignmentMode"],
    { name: string; description: string }
  >([
    [
      "granular",
      {
        name: "Granular",
        description:
          "Shifts consist of multiple tasks which can be assigned to individual employees",
      },
    ],
    ["simple", { name: "Simple", description: "Employees are assigned to shifts as a whole" }],
  ]);

  let planningHorizonMode = $settings.planningHorizon?.mode ?? "floating";
  let importDialogOpen = false;
  let importSettings = false;
  let selectedFiles: FileList | null = null; // Add this line

  function setTheme(theme: string) {
    setMode(theme as "light" | "dark" | "system");
  }

  function getDurationWeeks(ph: PlanningHorizonSetting | null | undefined) {
    if (ph?.mode === "floating") {
      return ph?.durationWeeks;
    }
    return 4;
  }

  function getDates(ph: PlanningHorizonSetting | null | undefined) {
    if (ph?.mode === "fixed") {
      return {
        start: ph.startDate,
        end: ph.endDate,
      };
    }
    return {
      start: undefined,
      end: undefined,
    };
  }

  function setFloatingWeeks(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value ?? 4);
    if (isNaN(value) || value < 1 || value > 10) {
      return;
    }
    settings.update((s) => {
      s.planningHorizon = {
        mode: "floating",
        durationWeeks: value,
      };
      return s;
    });
  }

  function downloadState() {
    const fileName = `${state.stateID}_${new Date().toISOString()}.json`;
    downloadJSON(state.dump(true), fileName);
  }

  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      selectedFiles = input.files;
    } else {
      selectedFiles = null;
    }
  }

  async function importState() {
    if (!selectedFiles || selectedFiles.length === 0) {
      console.error("No file selected");
      return;
    }
    const file = selectedFiles[0];
    try {
      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);
      state.load(jsonData, importSettings);
      importDialogOpen = false;
      location.reload();
    } catch (error) {
      console.error("Failed to import data:", error);
    }
  }
</script>

<div class="flex flex-col gap-8 px-6 pt-4">
  <h1 class="text-2xl font-semibold">Settings</h1>

  <Card.Root>
    <Card.Header>
      <Card.Title>Planning Horizon</Card.Title>
      <Card.Description>Set the dates for which solutions are generated</Card.Description>
    </Card.Header>
    <Card.Content>
      {@const planningHorizon = $settings.planningHorizon}
      {@const durationWeeks = getDurationWeeks(planningHorizon)}
      {@const dates = getDates(planningHorizon)}
      <RadioGroup.Root bind:value={planningHorizonMode}>
        <div class="mb-4 flex flex-col gap-2">
          <div class="flex flex-row space-x-2">
            <RadioGroup.Item
              value="floating"
              id="floating"
              on:click={() => {
                settings.update((s) => {
                  s.planningHorizon = {
                    mode: "floating",
                    durationWeeks: 4,
                  };
                  return s;
                });
              }}
            />
            <Label for="floating">Floating</Label>
          </div>
          {#key planningHorizonMode}
            <div
              class="mt-1 flex flex-row items-center space-x-2 {planningHorizonMode != 'floating' &&
                'text-muted-foreground'}"
            >
              <Input
                class="w-18"
                type="number"
                min={1}
                max={10}
                id="phFloatingWeeks"
                on:change={setFloatingWeeks}
                disabled={planningHorizonMode != "floating"}
                value={durationWeeks}
              />
              <span>Weeks from {fmtDate(thisWeekStart(), { month: "short" })}</span>
            </div>
          {/key}
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex flex-row space-x-2">
            <RadioGroup.Item
              value="fixed"
              id="fixed"
              on:click={() => {
                const startDate = dates.start ?? thisWeekStart();
                const endDate = dates.end ?? startDate.add({ weeks: 4 });
                settings.update((s) => {
                  s.planningHorizon = {
                    mode: "fixed",
                    startDate,
                    endDate,
                  };
                  return s;
                });
              }}
            />
            <Label for="fixed">Fixed</Label>
          </div>
          {#key planningHorizonMode}
            <div
              class="mt-1 flex flex-row items-center space-x-2 {planningHorizonMode != 'fixed' &&
                'text-muted-foreground'}"
            >
              <DateRangePicker
                value={dates}
                disabled={planningHorizonMode != "fixed"}
                onChange={(rng) => {
                  settings.update((s) => {
                    const startDate = rng.start ? toCalendarDate(rng.start) : thisWeekStart();
                    const endDate = rng.end ? toCalendarDate(rng.end) : startDate.add({ weeks: 4 });
                    s.planningHorizon = {
                      mode: "fixed",
                      startDate,
                      endDate,
                    };
                    return s;
                  });
                }}
              />
            </div>
          {/key}
        </div>
      </RadioGroup.Root>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title>Data</Card.Title>
      <Card.Description>Save or import the data you have entered.</Card.Description>
    </Card.Header>
    <Card.Content class="flex flex-wrap gap-4">
      <Button
        variant="secondary"
        on:click={() => {
          downloadState();
        }}
      >
        <FileDownIcon />
        Export Data
      </Button>
      <Dialog.Root bind:open={importDialogOpen}>
        <Dialog.Trigger class={buttonVariants({ variant: "default" })}>
          <FileUpIcon /> Import Data...
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Import Data</Dialog.Title>
            <Dialog.Description>
              Discard all current data and load new data from a file. This action cannot be undone.
            </Dialog.Description>
          </Dialog.Header>
          <div class="mb-4 mt-4 flex flex-col gap-6">
            <div class="flex flex-col gap-2">
              <Label for="importFile">Select a JSON file to import</Label>
              <Input type="file" accept=".json" id="importFile" on:change={handleFileChange} />
            </div>
            <div class="flex flex-col gap-2">
              <div class="flex flex-row items-center gap-2">
                <Switch
                  id="importSettings"
                  checked={importSettings}
                  onCheckedChange={(val) => (importSettings = val)}
                />
                <Label for="importSettings">Import settings</Label>
              </div>
              <p class="h-10 text-sm text-muted-foreground">
                {#if importSettings}
                  Your current settings will be replaced with the settings from the file.
                {:else}
                  Only the data will be imported. Your current settings will remain unchanged.
                {/if}
              </p>
            </div>
          </div>

          <Dialog.Footer>
            <Button variant="secondary" on:click={() => (importDialogOpen = false)}>Cancel</Button>
            <Button type="submit" on:click={importState}>Apply</Button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title>Appearance</Card.Title>
      <Card.Description>Tweak the appearance of the app</Card.Description>
    </Card.Header>
    <Card.Content>
      <div class="flex flex-col gap-2">
        <Label class="text-md mb-1 font-semibold" for="theme">Theme</Label>
        <RadioGroup.Root
          value={$mode || "system"}
          id="theme"
          onValueChange={(val) => setTheme(val)}
        >
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="light" id="light" />
            <Label for="light">Light</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="dark" id="dark" />
            <Label for="dark">Dark</Label>
          </div>
          <div class="flex items-center space-x-2">
            <RadioGroup.Item value="system" id="system" />
            <Label for="system">System</Label>
          </div>
        </RadioGroup.Root>
      </div>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title>Behaviour</Card.Title>
      <Card.Description>Customize the app's behaviour</Card.Description>
    </Card.Header>
    <Card.Content>
      {#if assignmentOptions.size > 0}
        <div class="flex flex-col gap-2">
          <Label class="text-md mb-1 font-semibold" for="assignmentMode">Assignment Mode</Label>
          <RadioGroup.Root value={$settings.assignmentMode} id="assignmentMode">
            {#each assignmentOptions.entries() as [option, { name, description }]}
              <div class="flex items-center space-x-2">
                <RadioGroup.Item
                  value={option}
                  id={option}
                  on:click={() => {
                    $settings.assignmentMode = option;
                  }}
                />
                <div class="flex flex-col">
                  <Label for={option}>{name}</Label>
                  <p class="text-sm text-muted-foreground">{description}</p>
                </div>
              </div>
            {/each}
          </RadioGroup.Root>
        </div>
      {/if}
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title>Miscelaneous</Card.Title>
      <Card.Description>Other settings for the application</Card.Description>
    </Card.Header>
    <Card.Content>
      <div class="flex items-center space-x-2">
        <Switch id="askDeleteConfirmation" bind:checked={$settings.askDeleteConfirmation} />
        <Label for="askDeleteConfirmation">Always ask me to confirm destructive operations</Label>
      </div>
      <div class="mt-4 flex items-center space-x-2">
        <Switch id="development" bind:checked={$settings.development} />
        <Label for="development">Development Mode</Label>
      </div>
    </Card.Content>
  </Card.Root>

  <Card.Root>
    <Card.Header>
      <Card.Title>Reset</Card.Title>
      <Card.Description
        >Restore all settings to default values. This will not affect your data.</Card.Description
      >
    </Card.Header>
    <Card.Content>
      <Button
        variant="destructive"
        on:click={() => {
          state.resetSettings();
        }}
      >
        <RotateCcwIcon />
        Reset Settings
      </Button>
    </Card.Content>
  </Card.Root>

  {#if $settings.development}
    <Card.Root class="bg-destructive bg-opacity-10">
      <Card.Header>
        <Card.Title>Developer Zone</Card.Title>
        <Card.Description
          >This section contains developer utilities and settings. Don't change them unless you know
          what you are doing!</Card.Description
        >
      </Card.Header>
      <Card.Content>
        <h3 class="mb-2 font-semibold">State Management</h3>
        <div class="flex flex-row flex-wrap gap-4">
          <Button
            on:click={() => {
              state.clear();
              populateState(state);
            }}
          >
            <RefreshCwIcon />
            Generate Dummy Data
          </Button>
          <Button
            variant="destructive"
            on:click={() => {
              state.clear();
            }}
          >
            <TrashIcon />
            Clear state
          </Button>
        </div>
      </Card.Content>
    </Card.Root>
  {/if}
</div>
