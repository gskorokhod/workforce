<!--suppress ES6UnusedImports -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Input } from "$lib/components/ui/input";
  import * as Popover from "$lib/components/ui/popover";
  import { debounce } from "$lib/utils/utils.ts";
  import { SearchIcon } from "lucide-svelte";
  import { type Writable, writable } from "svelte/store";

  let suggestions: string[] = [];
  let value: string = "";
  let placeholder: string = "Search";
  let submitOnSelect: boolean = true;
  let className: string = "";
  let debounceDelay: number = 300;
  let useSuggestionOnSubmit: boolean = true;
  let selectedSuggestion: number = 0;
  let formElement: HTMLFormElement;
  let open: boolean = false;
  let id: string | undefined = undefined;
  let onInput: (value: string) => void = () => {};
  let onSubmit: (value: string) => void = () => {};
  let getSuggestions: (value: string) => Promise<string[]> = () => Promise.resolve([]);

  function updateSuggestions(value: string) {
    getSuggestions(value).then((s) => {
      suggestions = s;
      open = true;
    });
  }

  const handleInputChange = debounce(() => {
    updateSuggestions(value);
    onInput(value);
  }, debounceDelay);

  function handleSubmit() {
    open = false;

    if (useSuggestionOnSubmit && suggestions.length > selectedSuggestion) {
      value = suggestions[selectedSuggestion];
    }

    onSubmit(value);

    const focusedElement = document.activeElement as HTMLElement;
    focusedElement.blur();
  }

  function handleFocusIn() {
    updateSuggestions(value);
  }

  function handleSelect(suggestion: string) {
    value = suggestion;
    suggestions = [suggestion];

    if (submitOnSelect) {
      handleSubmit();
    } else {
      onInput(suggestion);
      formElement.querySelector("input")?.focus();
    }
  }

  export {
    id,
    value,
    placeholder,
    submitOnSelect,
    useSuggestionOnSubmit,
    onInput,
    onSubmit,
    getSuggestions,
    className as class
  };
</script>

<form
  class="group/search relative h-10 overflow-visible rounded-md bg-white shadow {className}"
  on:submit|preventDefault={handleSubmit}
  bind:this={formElement}
>
  <Input
    {id}
    type="text"
    {placeholder}
    bind:value
    on:input={handleInputChange}
    on:focus={handleFocusIn}
    class="overflow-ellipsis pr-12 outline-none focus:outline-accent-foreground {className}"
  />
  <Button
    type="submit"
    variant="ghost"
    size="icon"
    class="absolute right-0 top-1/2 -translate-y-1/2 transform text-muted-foreground transition-all group-hover/search:text-accent-foreground group-focus/search:text-accent-foreground"
  >
    <SearchIcon />
  </Button>
  <Popover.Root bind:open disableFocusTrap>
    <Popover.Trigger class="absolute -bottom-2 left-0 right-0" disabled />
    {#if suggestions.length > 0}
      <Popover.Content class="w-full p-0 {className}">
        <div class="group/suggestions flex max-h-[300px] w-full flex-col overflow-y-scroll p-0">
          {#each suggestions as suggestion, i}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="!h-fit w-full justify-start !whitespace-normal text-left {selectedSuggestion ===
                i && 'bg-muted'}"
              on:click={() => handleSelect(suggestion)}
              on:mouseenter={() => (selectedSuggestion = i)}
              on:mouseleave={() => (selectedSuggestion = 0)}
            >
              {suggestion}
            </Button>
          {/each}
        </div>
      </Popover.Content>
    {/if}
  </Popover.Root>
</form>
