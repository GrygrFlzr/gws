<script lang="ts">
  import { resolve } from '$app/paths';
  import { getManageableGuilds } from './guilds.remote';

  const query = getManageableGuilds();
</script>

<h1>Manageable Servers</h1>
{#if query.error}
  <p>Failed to get your server list.</p>
  <pre><code>{query.error}</code></pre>
{:else if query.loading}
  <p>Loading...</p>
{:else}
  <button
    class="cursor-pointer rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
    onclick={async () => {
      await query.refresh();
    }}>Refresh Server List</button
  >
  <ul>
    {#each query.current as guild (guild.id)}
      <li>
        <a href={resolve(`/guilds/${guild.id}`)}>{guild.name}</a>
      </li>
    {:else}
      <li>You don't have any servers where you have permission to configure this bot.</li>
    {/each}
  </ul>
{/if}
