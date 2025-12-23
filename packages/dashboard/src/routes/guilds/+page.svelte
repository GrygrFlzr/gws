<script lang="ts">
  import { invalidate } from '$app/navigation';
  import { resolve } from '$app/paths';
  import Button from '$lib/components/Button.svelte';
  import Icon from '$lib/components/Icon.svelte';

  const { data } = $props();
  const { guilds, error: loadError } = $derived(data);

  let isRefreshing = $state(false);

  async function handleRefresh() {
    isRefreshing = true;
    try {
      await invalidate('guilds:list');
    } finally {
      isRefreshing = false;
    }
  }

  function getErrorMessage(status: number): string {
    switch (status) {
      case 401:
        return 'Your Discord session has expired. Please sign in again.';
      case 403:
        return 'Access denied by Discord. Please check your permissions.';
      case 429:
        return 'Rate limited by Discord. Please try again in a moment.';
      case 503:
        return 'Discord API is temporarily unavailable. Please try again later.';
      default:
        return 'Failed to load servers. Please try again.';
    }
  }
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h1 class="text-2xl font-bold text-gray-900">Manageable Servers</h1>

    <Button variant="primary" loading={isRefreshing} onclick={handleRefresh}>
      {#if isRefreshing}
        Refreshing...
      {:else}
        Refresh Server List
      {/if}
    </Button>
  </div>

  {#if loadError}
    <div class="rounded-md bg-red-50 p-4">
      <div class="flex">
        <div class="shrink-0">
          <Icon name="icon-error" class="h-5 w-5 fill-current text-red-400" />
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Failed to load servers</h3>
          <p class="mt-2 text-sm text-red-700">
            {getErrorMessage(loadError.status)}
          </p>
          <div class="mt-4">
            <Button variant="danger" loading={isRefreshing} onclick={handleRefresh}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="overflow-hidden rounded-md bg-white shadow">
      <ul class="divide-y divide-gray-200">
        {#each guilds as guild (guild.id)}
          <li>
            <a
              href={resolve(`/guilds/${guild.id}`)}
              class="block cursor-pointer transition-colors hover:bg-gray-50"
            >
              <div class="px-4 py-4 sm:px-6">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    {#if guild.icon}
                      <img
                        src="https://cdn.discordapp.com/icons/{guild.id}/{guild.icon}.png?size=64"
                        alt={guild.name}
                        class="h-10 w-10 rounded-full"
                      />
                    {:else}
                      <div
                        class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100"
                      >
                        <span class="font-medium text-indigo-600">
                          {guild.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    {/if}
                    <div>
                      <p class="truncate text-sm font-medium text-indigo-600">
                        {guild.name}
                      </p>
                      {#if guild.owner}
                        <p class="text-xs text-gray-500">Owner</p>
                      {/if}
                    </div>
                  </div>
                  <Icon name="icon-chevron-right" class="h-5 w-5 fill-current text-gray-400" />
                </div>
              </div>
            </a>
          </li>
        {:else}
          <li class="px-4 py-12 text-center">
            <Icon name="icon-server" class="mx-auto h-12 w-12 text-gray-400" />
            <h3 class="mt-2 text-sm font-medium text-gray-900">No manageable servers</h3>
            <p class="mt-1 text-sm text-gray-500">
              You don't have permission to manage any servers with this bot.
            </p>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
