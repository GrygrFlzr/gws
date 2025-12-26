<script lang="ts">
  import { resolve } from '$app/paths';
  import Button from '$lib/components/Button.svelte';
  import Icon from '$lib/components/Icon.svelte';

  interface Guild {
    id: string;
    name: string;
    icon: string | null;
    isConfigured: boolean;
    owner?: boolean;
  }

  interface LoadError {
    status: number;
    message: string;
  }

  interface Props {
    guilds: Guild[];
    error?: LoadError;
    isRefreshing?: boolean;
    onSelect?: (id: string) => void;
    onRefresh?: () => void;
  }

  const { guilds, error: loadError, isRefreshing = false, onSelect, onRefresh }: Props = $props();

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
    <h1 class="text-gradient text-3xl font-black tracking-tight">Manageable Servers</h1>

    {#if onRefresh}
      <Button variant="primary" loading={isRefreshing} onclick={onRefresh}>
        {#if isRefreshing}
          Refreshing...
        {:else}
          Refresh Server List
        {/if}
      </Button>
    {:else}
      <Button
        variant="primary"
        loading={isRefreshing}
        href="/guilds?refresh=true"
        data-sveltekit-replacestate
      >
        {#if isRefreshing}
          Refreshing...
        {:else}
          Refresh Server List
        {/if}
      </Button>
    {/if}
  </div>

  {#if loadError}
    <div class="bg-error-bg ring-error-border rounded-md p-4 ring-1 ring-inset">
      <div class="flex">
        <div class="shrink-0">
          <Icon name="icon-error" class="text-error-text h-5 w-5 fill-current" />
        </div>
        <div class="ml-3">
          <h3 class="text-error-text text-sm font-bold">Failed to load servers</h3>
          <p class="text-error-text mt-2 text-sm">
            {getErrorMessage(loadError.status)}
          </p>
          <div class="mt-4">
            {#if onRefresh}
              <Button variant="danger" loading={isRefreshing} onclick={onRefresh}>Try Again</Button>
            {:else}
              <Button
                variant="danger"
                loading={isRefreshing}
                href="/guilds?refresh=true"
                data-sveltekit-replacestate
              >
                Try Again
              </Button>
            {/if}
          </div>
        </div>
      </div>
    </div>
  {:else}
    <div class="bg-card ring-border-main overflow-hidden rounded-xl shadow-lg ring-1">
      <ul class="divide-border-main divide-y">
        {#each guilds as guild (guild.id)}
          <li>
            {#if onSelect}
              <button
                type="button"
                onclick={() => onSelect(guild.id)}
                class="hover:bg-card-hover group block w-full cursor-pointer text-left transition-all"
              >
                <div class="px-4 py-5 sm:px-6">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                      <div class="relative">
                        {#if guild.icon}
                          <img
                            src="https://cdn.discordapp.com/icons/{guild.id}/{guild.icon}.png?size=64"
                            alt={guild.name}
                            class="h-12 w-12 rounded-xl transition-transform group-hover:scale-110"
                          />
                        {:else}
                          <div
                            class="bg-badge-primary-bg ring-badge-primary-text/30 flex h-12 w-12 items-center justify-center rounded-xl ring-1 transition-transform ring-inset group-hover:scale-110"
                          >
                            <span class="text-badge-primary-text text-lg font-bold">
                              {guild.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        {/if}
                        {#if guild.isConfigured}
                          <div
                            class="absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500 dark:border-gray-900"
                          ></div>
                        {/if}
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <p class="text-fg-primary group-hover:text-glow-primary font-bold">
                            {guild.name}
                          </p>
                          {#if !guild.isConfigured}
                            <span
                              class="bg-badge-primary-bg text-badge-primary-text ring-badge-primary-text/30 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black tracking-wider uppercase ring-1 ring-inset"
                            >
                              Setup
                            </span>
                          {/if}
                        </div>
                        {#if guild.owner}
                          <p class="text-fg-secondary text-xs font-medium italic">Owner</p>
                        {/if}
                      </div>
                    </div>
                    <Icon
                      name="icon-chevron-right"
                      class="text-fg-secondary group-hover:text-glow-primary h-5 w-5 fill-current transition-all group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </button>
            {:else}
              <a
                href={resolve(`/guilds/${guild.id}`)}
                class="hover:bg-card-hover group block cursor-pointer transition-all"
              >
                <div class="px-4 py-5 sm:px-6">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-4">
                      <div class="relative">
                        {#if guild.icon}
                          <img
                            src="https://cdn.discordapp.com/icons/{guild.id}/{guild.icon}.png?size=64"
                            alt={guild.name}
                            class="h-12 w-12 rounded-xl transition-transform group-hover:scale-110"
                          />
                        {:else}
                          <div
                            class="bg-badge-primary-bg ring-badge-primary-text/30 flex h-12 w-12 items-center justify-center rounded-xl ring-1 transition-transform ring-inset group-hover:scale-110"
                          >
                            <span class="text-badge-primary-text text-lg font-bold">
                              {guild.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        {/if}
                        {#if guild.isConfigured}
                          <div
                            class="absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500 dark:border-gray-900"
                          ></div>
                        {/if}
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <p class="text-fg-primary group-hover:text-glow-primary font-bold">
                            {guild.name}
                          </p>
                          {#if !guild.isConfigured}
                            <span
                              class="bg-badge-primary-bg text-badge-primary-text ring-badge-primary-text/30 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-black tracking-wider uppercase ring-1 ring-inset"
                            >
                              Setup
                            </span>
                          {/if}
                        </div>
                        {#if guild.owner}
                          <p class="text-fg-secondary text-xs font-medium italic">Owner</p>
                        {/if}
                      </div>
                    </div>
                    <Icon
                      name="icon-chevron-right"
                      class="text-fg-secondary group-hover:text-glow-primary h-5 w-5 fill-current transition-all group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </a>
            {/if}
          </li>
        {:else}
          <li class="px-4 py-12 text-center">
            <Icon name="icon-server" class="mx-auto h-12 w-12 text-fg-secondary" />
            <h3 class="mt-2 text-sm font-medium text-fg-primary">No manageable servers</h3>
            <p class="mt-1 text-sm text-fg-secondary">
              You don't have permission to manage any servers with this bot.
            </p>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
