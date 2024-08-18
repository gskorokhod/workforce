<script lang="ts">
  import type { Person } from "$lib/types";

  import { getAgeForPerson } from "$lib/types/person.ts";
  import { CakeIcon } from "lucide-svelte";

  let person: Person;

  export { person };
</script>

<div class="flex flex-row items-center justify-between">
  <h3 class="font-semibold">{person.name}</h3>
  <div class="ml-2 flex flex-row items-center gap-1">
    <CakeIcon />
    {getAgeForPerson(person)}
  </div>
</div>
<p class="text-muted-foreground">
  {person.job_title}
</p>
