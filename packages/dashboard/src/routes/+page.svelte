<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';
  import GlowBackground from '$lib/components/GlowBackground.svelte';
  import Icon from '$lib/components/Icon.svelte';

  const { data } = $props();
  const { user } = $derived(data);
</script>

{#if user}
  <GlowBackground opacity={10}>
    <div class="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div class="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-16">
        <div>
          <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Okaeri, <span class="text-sky-600">{user.globalName ?? user.username}</span>!
          </h1>
          <p class="mt-6 text-lg leading-8 text-gray-600">
            The GWS interface is online. Your servers are being scanned for Twitter links.
          </p>
          <div class="mt-10 flex items-center gap-x-6">
            <Button href="/guilds" class="px-6 py-3 text-base">Open Dashboard</Button>
            <a href="/docs" class="text-sm leading-6 font-semibold text-gray-900">
              View Manual <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <Card>
            <dt class="flex items-center gap-x-3 text-base leading-7 font-semibold text-gray-900">
              <Icon name="icon-server" class="h-5 w-5 text-sky-600" />
              Servers
            </dt>
            <dd class="mt-4 flex items-baseline gap-x-2">
              <span class="text-4xl font-bold tracking-tight text-gray-900">Active</span>
            </dd>
            <p class="mt-1 text-sm leading-6 text-gray-500">Manage your Discord servers</p>
          </Card>

          <Card>
            <dt class="flex items-center gap-x-3 text-base leading-7 font-semibold text-gray-900">
              <Icon name="icon-filter" class="h-5 w-5 text-pink-500" />
              Lists
            </dt>
            <dd class="mt-4 flex items-baseline gap-x-2">
              <span class="text-4xl font-bold tracking-tight text-gray-900">Active</span>
            </dd>
            <p class="mt-1 text-sm leading-6 text-gray-500">Blocklists are operational</p>
          </Card>
        </div>
      </div>
    </div>
  </GlowBackground>
{:else}
  <GlowBackground opacity={20}>
    <div class="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
      <div class="px-6 text-center">
        <h1 class="text-4xl font-bold tracking-tight text-gray-900 sm:text-7xl">
          The <span class="text-sky-500">GWS</span> Bonk System
        </h1>
        <p class="mt-6 text-lg leading-8 text-gray-600">
          Discord automation for Twitter links. Identify hidden IDs and automatically action Gen-AI
          accounts, bad actors, and drama in your community.
        </p>
        <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <form method="POST" action="/auth/login" class="group relative w-full sm:w-auto">
            <div
              class="pointer-events-none absolute -top-8 left-1/2 hidden -translate-x-1/2 rounded bg-gray-900 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100 lg:block"
            >
              another bloody Monday...
              <div
                class="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent border-t-gray-900"
              ></div>
            </div>
            <Button type="submit" variant="primary" class="w-full px-8 py-3 text-base sm:w-auto">
              Gate Open: START!
            </Button>
          </form>
          <Button
            href="https://discord.com/oauth2/authorize?client_id=1022631246191984700"
            target="_blank"
            variant="secondary"
            class="w-full px-8 py-3 text-base sm:w-auto"
          >
            Add to Discord
          </Button>
        </div>
      </div>
    </div>
  </GlowBackground>

  <div class="bg-gray-50 py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="mx-auto max-w-2xl lg:text-center">
        <h2 class="text-base leading-7 font-semibold text-sky-600">Discord Automation</h2>
        <p class="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Automated protection for your community
        </p>
        <p class="mt-6 text-lg leading-8 text-gray-600">
          GWS is a Discord bot built to identify Twitter IDs across mirrors and formats, enabling
          instant actions.
        </p>
      </div>
      <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
        <dl
          class="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16"
        >
          <div class="relative pl-16">
            <dt class="text-base leading-7 font-semibold text-gray-900">
              <div
                class="absolute top-0 left-0 flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600"
              >
                <Icon name="icon-filter" class="h-6 w-6 text-white" />
              </div>
              ID Extraction
            </dt>
            <dd class="mt-2 text-base leading-7 text-gray-600">
              Parsing that extracts Twitter user IDs from messages, bypassing name changes, link
              mirrors, and obfuscation.
            </dd>
          </div>

          <div class="relative pl-16">
            <dt class="text-base leading-7 font-semibold text-gray-900">
              <div
                class="absolute top-0 left-0 flex h-10 w-10 items-center justify-center rounded-lg bg-sky-600"
              >
                <Icon name="icon-check-circle" class="h-6 w-6 text-white" />
              </div>
              Gen-AI & Drama Filtering
            </dt>
            <dd class="mt-2 text-base leading-7 text-gray-600">
              Subscribe to community blocklists to automatically filter out Gen-AI artists and known
              bad actors before they cause trouble.
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
{/if}
