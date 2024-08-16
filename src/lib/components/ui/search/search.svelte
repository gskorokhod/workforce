<!--suppress ES6UnusedImports -->
<script lang="ts">
  import { type Writable, writable } from "svelte/store";
  import { Button } from "$lib/components/ui/button";
  import { SearchIcon } from "lucide-svelte";
  import { Input } from "$lib/components/ui/input";
  import * as Popover from "$lib/components/ui/popover";
  import { debounce } from "$lib/utils/utils.ts";

  let suggestions: Writable<string[]> = writable([]);
  let searchInput: Writable<string> = writable("");
  let placeholder: string = "Search";
  let submitOnSelect: boolean = true;
  let className: string = "";
  let debounceDelay: number = 300;
  let useSuggestionOnSubmit: boolean = true;
  let selectedSuggestion: number = 0;
  let formElement: HTMLFormElement;
  let open: boolean = false;
  let onInput: (value: string) => void = () => {
  };
  let onSubmit: (value: string) => void = () => {
  };
  let getSuggestions: (value: string) => Promise<string[]> = () => Promise.resolve([]);

  function updateSuggestions(value: string) {
    getSuggestions(value)
      .then((s) => {
        suggestions.set(s);
        open = true;
      });
  }

  const handleInputChange = debounce(() => {
    updateSuggestions($searchInput);
    onInput($searchInput);
  }, debounceDelay);

  function handleSubmit() {
    open = false;

    if (useSuggestionOnSubmit && $suggestions.length > selectedSuggestion) {
      searchInput.set($suggestions[selectedSuggestion]);
    }

    onSubmit($searchInput);

    const focusedElement = document.activeElement as HTMLElement;
    focusedElement.blur();
  }

  function handleFocusIn() {
    updateSuggestions($searchInput);
  }

  function handleSelect(suggestion: string) {
    searchInput.set(suggestion);
    suggestions.set([suggestion]);

    if (submitOnSelect) {
      handleSubmit();
    } else {
      onInput(suggestion);
      formElement.querySelector("input")?.focus();
    }
  }

  export {
    searchInput,
    placeholder,
    submitOnSelect,
    useSuggestionOnSubmit,
    onInput,
    onSubmit,
    getSuggestions,
    className as class
  };
</script>

<form class="group/search relative h-10 rounded-md bg-white shadow overflow-visible {className}"
      on:submit|preventDefault={handleSubmit}
      bind:this={formElement}
>
  <Input type="text"
         placeholder={placeholder} bind:value={$searchInput}
         on:input={handleInputChange} on:focus={handleFocusIn}
         class="outline-none focus:outline-accent-foreground pr-12 overflow-ellipsis {className}"
  />
  <Button type="submit" variant="ghost" size="icon"
          class="absolute right-0 top-1/2 transform -translate-y-1/2 transition-all text-muted-foreground group-hover/search:text-accent-foreground group-focus/search:text-accent-foreground">
    <SearchIcon />
  </Button>
  <Popover.Root bind:open disableFocusTrap>
    <Popover.Trigger class="absolute left-0 right-0 -bottom-2" disabled />
    {#if $suggestions.length > 0}
      <Popover.Content class="p-0 {className}">
        <div class="group/suggestions flex flex-col p-0 w-full max-h-[300px] overflow-y-scroll">
          {#each $suggestions as suggestion, i}
            <Button type="button" variant="ghost" size="sm"
                    class="w-full justify-start !h-fit !whitespace-normal text-left {selectedSuggestion === i && 'bg-muted'}"
                    on:click={() => handleSelect(suggestion)}
                    on:mouseenter={() => selectedSuggestion = i}
                    on:mouseleave={() => selectedSuggestion = 0}
            >
              {suggestion}
            </Button>
          {/each}
        </div>
      </Popover.Content>
    {/if}
  </Popover.Root>
</form>