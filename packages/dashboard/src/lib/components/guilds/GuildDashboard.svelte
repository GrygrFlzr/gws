<script lang="ts">
  import type { ActionConfigOverride } from '@gws/core';
  import Button from '$lib/components/Button.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import Section from '$lib/components/Section.svelte';

  interface Guild {
    id: string;
    name: string;
    icon: string | null;
  }

  interface Settings {
    defaultAction: ActionConfigOverride;
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
    <h1 class="text-gradient text-4xl font-black tracking-tighter">{guild.name}</h1>
    <p class="text-fg-secondary text-xs font-black tracking-[0.3em] uppercase opacity-70">
      Tactical Command
    </p>
  </div>
</div>

<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
  <!-- Main Settings -->
  <div class="space-y-8 lg:col-span-2">
    <Section title="Active Blocklists" icon="icon-filter" iconClass="text-sky-500">
      {#if subscriptions.length > 0}
        <ul class="divide-border-main divide-y">
          {#each subscriptions as sub (sub.blocklist.name)}
            <li class="group flex items-center justify-between py-4 transition-all">
              <div>
                <h3 class="text-fg-primary font-bold group-hover:text-sky-500">
                  {sub.blocklist.name}
                </h3>
                <p class="text-fg-secondary text-sm">{sub.blocklist.description}</p>
              </div>
              <span
                class="bg-badge-success-bg text-badge-success-text ring-badge-success-text/30 inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-black tracking-widest uppercase ring-1 ring-inset"
              >
                Active
              </span>
            </li>
          {/each}
        </ul>
      {:else}
        <div class="py-12 text-center">
          <div class="relative mx-auto h-16 w-16">
            <Icon name="icon-filter" class="text-fg-secondary h-16 w-16 opacity-20" />
            <div
              class="absolute inset-0 flex items-center justify-center font-mono text-2xl font-black opacity-40"
            >
              ?
            </div>
          </div>
          <p class="text-fg-secondary mt-4 font-medium italic">No tactical data feeds active.</p>
          <div class="mt-6">
            <Button variant="primary">Deploy Intelligence List</Button>
          </div>
        </div>
      {/if}
    </Section>

    <Section title="Response Protocol" icon="icon-check-circle" iconClass="text-sky-500">
      <div class="space-y-6">
        {#if settings}
          <div>
            <div
              class="text-fg-secondary mb-3 text-xs font-black tracking-widest uppercase opacity-70"
            >
              Default Interception Action
            </div>
            <div class="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div
                class="bg-badge-neutral-bg border-tactical-border group flex flex-col items-center gap-1 rounded-xl border p-4 transition-all hover:border-sky-500/50"
              >
                <span
                  class="text-fg-secondary text-[10px] font-black tracking-tighter uppercase opacity-50"
                >
                  React
                </span>
                <span class="text-2xl font-black transition-transform group-hover:scale-125">
                  {settings.defaultAction.react || '—'}
                </span>
              </div>
              <div
                class="bg-badge-neutral-bg border-tactical-border group flex flex-col items-center gap-1 rounded-xl border p-4 transition-all hover:border-sky-500/50"
              >
                <span
                  class="text-fg-secondary text-[10px] font-black tracking-tighter uppercase opacity-50"
                >
                  Delete
                </span>
                <span
                  class="text-xl font-black group-hover:text-red-500 {settings.defaultAction.delete
                    ? 'text-green-500'
                    : 'opacity-30'}"
                >
                  {settings.defaultAction.delete ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
              <div
                class="bg-badge-neutral-bg border-tactical-border group flex flex-col items-center gap-1 rounded-xl border p-4 transition-all hover:border-sky-500/50"
              >
                <span
                  class="text-fg-secondary text-[10px] font-black tracking-tighter uppercase opacity-50"
                >
                  Reply
                </span>
                <span
                  class="text-xl font-black group-hover:text-sky-500 {settings.defaultAction.reply
                    ? 'text-green-500'
                    : 'opacity-30'}"
                >
                  {settings.defaultAction.reply ? 'ENABLED' : 'DISABLED'}
                </span>
              </div>
            </div>
          </div>
          <div class="flex justify-end pt-4">
            <Button variant="secondary">Reconfigure Protocols</Button>
          </div>
        {:else}
          <div class="py-12 text-center">
            <p class="text-fg-secondary font-medium">GWS System is offline for this server.</p>
            <div class="mt-6">
              <Button variant="primary">Initialize Core</Button>
            </div>
          </div>
        {/if}
      </div>
    </Section>
  </div>

  <!-- Side Stats/Info -->
  <div class="space-y-8">
    <div
      class="bg-tactical-bg text-tactical-text border-tactical-border relative overflow-hidden rounded-2xl border p-8 shadow-2xl transition-all hover:shadow-sky-500/10"
    >
      <div
        class="pulse-glow absolute -top-4 -right-4 h-24 w-24 rounded-full bg-sky-500/10 blur-2xl"
      ></div>
      <h2 class="text-[10px] font-black tracking-[0.3em] text-sky-500 uppercase">System Status</h2>
      <div class="mt-4 flex items-center gap-4">
        <div
          class="h-3 w-3 animate-pulse rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]"
        ></div>
        <span class="font-mono text-2xl font-black tracking-tighter">OPERATIONAL</span>
      </div>
      <div class="mt-8 space-y-5">
        <div class="border-tactical-border flex justify-between border-b border-dashed pb-3">
          <span class="text-fg-secondary text-xs font-bold uppercase opacity-70">Total Bonks</span>
          <span class="font-mono text-lg font-black text-sky-500">0</span>
        </div>
        <div class="border-tactical-border flex justify-between border-b border-dashed pb-3">
          <span class="text-fg-secondary text-xs font-bold uppercase opacity-70">Intel Feeds</span>
          <span class="font-mono text-lg font-black text-sky-500">{subscriptions.length}</span>
        </div>
      </div>
    </div>
  </div>
</div>
