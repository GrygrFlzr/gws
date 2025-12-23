<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import PageContainer from '$lib/components/PageContainer.svelte';
  import Section from '$lib/components/Section.svelte';

  const { data } = $props();
  const { guild, settings, subscriptions } = $derived(data);
</script>

<PageContainer>
  <div class="mb-8 flex items-center gap-4">
    <a href="/guilds" class="text-gray-500 hover:text-gray-700">
      <Icon name="icon-chevron-right" class="h-6 w-6 rotate-180" />
    </a>
    {#if guild.icon}
      <img
        src="https://cdn.discordapp.com/icons/{guild.id}/{guild.icon}.png?size=128"
        alt={guild.name}
        class="h-16 w-16 rounded-full ring-2 ring-sky-500 ring-offset-2"
      />
    {:else}
      <div
        class="flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 ring-2 ring-sky-500 ring-offset-2"
      >
        <span class="text-2xl font-bold text-sky-600">
          {guild.name.charAt(0).toUpperCase()}
        </span>
      </div>
    {/if}
    <div>
      <h1 class="text-3xl font-bold text-gray-900">{guild.name}</h1>
      <p class="text-sm font-semibold tracking-wider text-gray-500 uppercase">Configuration</p>
    </div>
  </div>

  <div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
    <!-- Main Settings -->
    <div class="space-y-8 lg:col-span-2">
      <Section title="Active Blocklists" icon="icon-filter" iconClass="text-sky-600">
        {#if subscriptions.length > 0}
          <ul class="divide-y divide-gray-100">
            {#each subscriptions as sub}
              <li class="flex items-center justify-between py-4">
                <div>
                  <h3 class="font-semibold text-gray-900">{sub.blocklist.name}</h3>
                  <p class="text-sm text-gray-500">{sub.blocklist.description}</p>
                </div>
                <span
                  class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset"
                >
                  Active
                </span>
              </li>
            {/each}
          </ul>
        {:else}
          <div class="py-12 text-center">
            <Icon name="icon-filter" class="mx-auto h-12 w-12 text-gray-300" />
            <p class="mt-4 text-gray-500">No blocklists active.</p>
            <div class="mt-6">
              <Button variant="primary">Deploy List</Button>
            </div>
          </div>
        {/if}
      </Section>

      <Section title="Response" icon="icon-check-circle" iconClass="text-sky-600">
        <div class="space-y-6">
          {#if settings}
            <div>
              <div class="block text-sm font-medium text-gray-700">Default Action</div>
              <div class="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div
                  class="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <span class="font-mono text-xs text-gray-500 uppercase">React</span>
                  <span class="font-bold">{settings.defaultAction.react || 'None'}</span>
                </div>
                <div
                  class="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <span class="font-mono text-xs text-gray-500 uppercase">Delete</span>
                  <span class="font-bold">{settings.defaultAction.delete ? 'YES' : 'NO'}</span>
                </div>
                <div
                  class="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  <span class="font-mono text-xs text-gray-500 uppercase">Reply</span>
                  <span class="font-bold">{settings.defaultAction.reply ? 'YES' : 'NO'}</span>
                </div>
              </div>
            </div>
            <div class="flex justify-end pt-4">
              <Button variant="secondary">Modify Response</Button>
            </div>
          {:else}
            <div class="py-12 text-center">
              <p class="text-gray-500">GWS is not yet initialized.</p>
              <div class="mt-6">
                <Button variant="primary">Initialize</Button>
              </div>
            </div>
          {/if}
        </div>
      </Section>
    </div>

    <!-- Side Stats/Info -->
    <div class="space-y-8">
      <div class="tactical-card rounded-xl border border-gray-200 p-6 shadow-lg">
        <h2 class="text-xs font-bold tracking-[0.2em] text-sky-600 uppercase">Status</h2>
        <div class="mt-4 flex items-center gap-4">
          <div class="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
          <span class="font-mono text-xl font-bold">NOMINAL</span>
        </div>
        <div class="mt-8 space-y-4">
          <div class="flex justify-between border-b border-gray-200 pb-2">
            <span class="text-sm text-gray-500">Bonks</span>
            <span class="font-mono font-semibold">0</span>
          </div>
          <div class="flex justify-between border-b border-gray-200 pb-2">
            <span class="text-sm text-gray-500">Lists</span>
            <span class="font-mono font-semibold">{subscriptions.length}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</PageContainer>

<style>
  .tactical-card {
    background-color: var(--color-tactical-bg);
    color: var(--color-tactical-text);
    border-color: var(--color-tactical-border);
  }
</style>
