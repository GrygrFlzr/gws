<script lang="ts">
  import { resolve } from '$app/paths';

  const { data } = $props();
  const { guilds } = $derived(data);
</script>

<ul>
  {#each guilds as guild (guild.id)}
    <li>
      <a href={resolve(`/guilds/${guild.id}`)}>{guild.name}</a>
    </li>
  {/each}
</ul>
