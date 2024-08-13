<!--suppress ES6UnusedImports -->
<script lang="ts">
  import { type Writable, writable } from "svelte/store";
  import { onMount } from "svelte";
  import { Button } from "$lib/components/ui/button";
  import { SearchIcon } from "lucide-svelte";
  import { Input } from "$lib/components/ui/input";
  import * as Popover from "$lib/components/ui/popover";

  let searchInput: Writable<string> = writable("");
  let placeholder: string = "Search";
  let debounceTimeout: number;
  let className: string = "";
  let suggestions: string[] = [];
  let debounceDelay: number = 300;
  let open: boolean = false;
  let onInput: (value: string) => void = () => {
  };
  let onSubmit: (value: string) => void = () => {
  };
  let getSuggestions: (value: string) => string[] = () => [];

  function handleInputChange() {
    clearTimeout(debounceTimeout);
    suggestions = getSuggestions($searchInput);
    debounceTimeout = setTimeout(() => {
      onInput($searchInput);
    }, debounceDelay);
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    onSubmit($searchInput);
  }

  function handleFocusIn() {
    suggestions = getSuggestions($searchInput);
  }

  function handleSelect(suggestion: string) {
    searchInput.set(suggestion);
    open = false;
  }

  onMount(() => {
    return () => clearTimeout(debounceTimeout);
  });

  export { searchInput, placeholder, debounceDelay, onInput, onSubmit, getSuggestions, className as class };
</script>

<form class="group/search relative h-10 rounded-md bg-white shadow overflow-clip {className}"
      on:submit|preventDefault={handleSubmit}>
  <Popover.Root bind:open openFocus="search_input" closeFocus="search_input" disableFocusTrap>
    <Popover.Trigger>
      <Input type="text" id="search_input" placeholder={placeholder} bind:value={$searchInput}
             on:input={handleInputChange} class={className} on:focusin={handleFocusIn} />
      <Button type="submit" variant="ghost" size="icon"
              class="absolute right-0 top-1/2 transform -translate-y-1/2 transition-all text-muted-foreground group-hover/search:text-accent-foreground group-focus/search:text-accent-foreground">
        <SearchIcon />
      </Button>
    </Popover.Trigger>
    <Popover.Content class="p-0 py-1 w-fit">
      <div class="flex flex-col p-0 w-fit min-w-[200px] max-h-[300px] overflow-y-scroll">
        {#each suggestions as suggestion}
          <Button type="button" variant="ghost" size="sm" class="w-full justify-start"
                  on:click={() => handleSelect(suggestion)}>
            {suggestion}
          </Button>
        {/each}
      </div>
    </Popover.Content>
  </Popover.Root>
</form>