<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import Section from '$lib/components/Section.svelte';

  interface Guild {
    id: string;
    name: string;
    icon: string | null;
  }

  interface Settings {
    defaultAction: {
      react?: string | null;
      delete?: boolean;
      reply?: boolean;
    };
  }

  interface Subscription {
    blocklist: {
      name: string;
      description: string | null;
    };
  }

  interface Props {
    guild: Guild;
    settings: Settings | null;
    subscriptions: Subscription[];
    onBack?: () => void;
  }

  const { guild, settings, subscriptions, onBack }: Props = $props();
</script>

<div class="mb-8 flex items-center gap-4">
  {#if onBack}
    <button
      onclick={onBack}
      class="text-fg-secondary hover:text-fg-primary cursor-pointer"
      aria-label="Go back"
    >
      <Icon name="icon-chevron-right" class="h-6 w-6 rotate-180" />
    </button>
  {:else}
    <a href="/guilds" class="text-fg-secondary hover:text-fg-primary">
      <Icon name="icon-chevron-right" class="h-6 w-6 rotate-180" />
    </a>
  {/if}
  {#if guild.icon}
    <img
      src="https://cdn.discordapp.com/icons/{guild.id}/{guild.icon}.png?size=128"
      alt={guild.name}
      class="h-16 w-16 rounded-full ring-2 ring-sky-500 ring-offset-2"
    />
  {:else}
    <div
      class="bg-badge-primary-bg flex h-16 w-16 items-center justify-center rounded-full ring-2 ring-sky-500 ring-offset-2"
    >
      <span class="text-badge-primary-text text-2xl font-bold">
        {guild.name.charAt(0).toUpperCase()}
      </span>
    </div>
  {/if}
  <div>
    <h1 class="text-fg-primary text-3xl font-bold">{guild.name}</h1>
    <p class="text-fg-secondary text-sm font-semibold tracking-wider uppercase">Configuration</p>
  </div>
</div>

<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
  <!-- Main Settings -->
  <div class="space-y-8 lg:col-span-2">
    <Section title="Active Blocklists" icon="icon-filter" iconClass="text-sky-600">
      {#if subscriptions.length > 0}
        <ul class="divide-y divide-gray-100">
          {#each subscriptions as sub (sub.blocklist.name)}
            <li class="flex items-center justify-between py-4">
              <div>
                <h3 class="text-fg-primary font-semibold">{sub.blocklist.name}</h3>
                <p class="text-fg-secondary text-sm">{sub.blocklist.description}</p>
              </div>
              <span
                class="bg-badge-success-bg text-badge-success-text ring-badge-success-text/30 inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset"
              >
                Active
              </span>
            </li>
          {/each}
        </ul>
      {:else}
        <div class="py-12 text-center">
          <Icon name="icon-filter" class="text-fg-secondary mx-auto h-12 w-12" />
          <p class="text-fg-secondary mt-4">No blocklists active.</p>
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
            <div class="text-fg-secondary block text-sm font-medium">Default Action</div>
            <div class="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div
                class="border-tactical-border bg-badge-neutral-bg flex items-center gap-2 rounded-lg border p-3"
              >
                <span class="text-fg-secondary font-mono text-xs uppercase">React</span>
                <span class="font-bold">{settings.defaultAction.react || 'None'}</span>
              </div>
              <div
                class="border-tactical-border bg-badge-neutral-bg flex items-center gap-2 rounded-lg border p-3"
              >
                <span class="text-fg-secondary font-mono text-xs uppercase">Delete</span>
                <span class="font-bold">{settings.defaultAction.delete ? 'YES' : 'NO'}</span>
              </div>
              <div
                class="border-tactical-border bg-badge-neutral-bg flex items-center gap-2 rounded-lg border p-3"
              >
                <span class="text-fg-secondary font-mono text-xs uppercase">Reply</span>
                <span class="font-bold">{settings.defaultAction.reply ? 'YES' : 'NO'}</span>
              </div>
            </div>
          </div>
          <div class="flex justify-end pt-4">
            <Button variant="secondary">Modify Response</Button>
          </div>
        {:else}
          <div class="py-12 text-center">
            <p class="text-fg-secondary">GWS is not yet initialized.</p>
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
    <div class="tactical-card rounded-xl border p-6 shadow-lg">
      <h2 class="text-xs font-bold tracking-[0.2em] text-sky-600 uppercase">Status</h2>
      <div class="mt-4 flex items-center gap-4">
        <div class="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
        <span class="font-mono text-xl font-bold">NOMINAL</span>
      </div>
      <div class="mt-8 space-y-4">
        <div class="border-tactical-border flex justify-between border-b pb-2">
          <span class="text-fg-secondary text-sm">Bonks</span>
          <span class="font-mono font-semibold">0</span>
        </div>
        <div class="border-tactical-border flex justify-between border-b pb-2">
          <span class="text-fg-secondary text-sm">Lists</span>
          <span class="font-mono font-semibold">{subscriptions.length}</span>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .tactical-card {
    background-color: var(--color-tactical-bg);
    color: var(--color-tactical-text);
    border-color: var(--color-tactical-border);
  }
</style>
