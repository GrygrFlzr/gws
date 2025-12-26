<script lang="ts">
  import Button from '$lib/components/Button.svelte';
  import Card from '$lib/components/Card.svelte';
  import GlowBackground from '$lib/components/GlowBackground.svelte';
  import Icon from '$lib/components/Icon.svelte';

  const { data } = $props();
  const { user } = $derived(data);
</script>

{#if user}
  <GlowBackground opacity={15}>
    <div class="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div class="grid grid-cols-1 gap-y-16 lg:grid-cols-2 lg:gap-x-16">
        <div>
          <h1 class="text-fg-primary text-5xl font-black tracking-tighter sm:text-7xl">
            Okaeri, <span class="text-gradient">{user.globalName ?? user.username}</span>!
          </h1>
          <p class="text-fg-secondary mt-6 text-xl leading-8 font-medium italic opacity-80">
            The GWS tactical interface is online. Perimeter scanning active.
          </p>
          <div class="mt-10 flex items-center gap-x-6">
            <Button href="/guilds" class="px-8 py-4 text-lg font-black tracking-tight">
              OPEN DASHBOARD
            </Button>
            <a
              href="/docs"
              class="text-fg-primary group text-sm leading-6 font-black tracking-widest uppercase"
            >
              View Manual <span
                aria-hidden="true"
                class="inline-block transition-transform group-hover:translate-x-2">→</span
              >
            </a>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <Card class="group transition-all hover:border-sky-500/50">
            <dt
              class="text-fg-primary flex items-center gap-x-3 text-sm font-black tracking-widest uppercase opacity-70"
            >
              <Icon name="icon-server" class="text-glow-primary h-5 w-5" />
              Servers
            </dt>
            <dd class="mt-4 flex items-baseline gap-x-2">
              <span
                class="text-gradient text-5xl font-black tracking-tighter transition-transform group-hover:scale-105"
                >ACTIVE</span
              >
            </dd>
            <p class="text-fg-secondary mt-2 text-sm font-bold opacity-60">
              Fleet management online
            </p>
          </Card>

          <Card class="group transition-all hover:border-fuchsia-500/50">
            <dt
              class="text-fg-primary flex items-center gap-x-3 text-sm font-black tracking-widest uppercase opacity-70"
            >
              <Icon name="icon-filter" class="h-5 w-5 text-fuchsia-500" />
              Intelligence
            </dt>
            <dd class="mt-4 flex items-baseline gap-x-2">
              <span
                class="text-gradient text-5xl font-black tracking-tighter transition-transform group-hover:scale-105"
                >NOMINAL</span
              >
            </dd>
            <p class="text-fg-secondary mt-2 text-sm font-bold opacity-60">
              Blocklists operational
            </p>
          </Card>
        </div>
      </div>
    </div>
  </GlowBackground>
{:else}
  <GlowBackground opacity={25}>
    <div class="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
      <div class="px-6 text-center">
        <h1 class="text-fg-primary text-5xl font-black tracking-tighter sm:text-8xl">
          The <span class="text-gradient">GWS</span> Bonk System
        </h1>
        <p class="text-fg-secondary mt-8 text-xl leading-8 font-bold italic opacity-80">
          Discord automation for Twitter links. Identify hidden IDs and automatically action Gen-AI
          accounts, bad actors, and drama in your community.
        </p>
        <div class="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
          <form method="POST" action="/auth/login" class="group relative w-full sm:w-auto">
            <div
              class="bg-glow-primary pointer-events-none absolute -top-10 left-1/2 hidden -translate-x-1/2 rounded-full px-4 py-1.5 text-xs font-black tracking-tighter whitespace-nowrap text-white opacity-0 shadow-xl transition-all group-hover:-top-12 group-hover:opacity-100 lg:block"
            >
              BONK TIME! 🔨
              <div
                class="border-t-glow-primary absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-t-4 border-x-transparent"
              ></div>
            </div>
            <Button
              type="submit"
              variant="primary"
              class="w-full px-10 py-4 text-lg font-black tracking-tight shadow-[0_0_20px_rgba(2,132,199,0.3)] sm:w-auto"
            >
              GATE OPEN: START!
            </Button>
          </form>
          <Button
            href="https://discord.com/oauth2/authorize?client_id=1022631246191984700"
            target="_blank"
            variant="secondary"
            class="w-full border-2 px-10 py-4 text-lg font-black tracking-tight sm:w-auto"
          >
            ADD TO DISCORD
          </Button>
        </div>
      </div>
    </div>
  </GlowBackground>

  <div class="bg-page/50 border-border-main border-y border-dashed py-24 backdrop-blur-md sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="mx-auto max-w-2xl lg:text-center">
        <h2 class="text-glow-primary text-sm font-black tracking-[0.4em] uppercase opacity-70">
          Tactical Automation
        </h2>
        <p class="text-fg-primary mt-4 text-4xl font-black tracking-tighter sm:text-5xl">
          Automated protection for your community
        </p>
        <p class="text-fg-secondary mt-6 text-xl leading-8 font-medium italic opacity-70">
          GWS is a high-performance Discord bot built to identify Twitter IDs across mirrors and
          formats, enabling instant actions.
        </p>
      </div>
      <div class="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
        <dl class="grid max-w-xl grid-cols-1 gap-x-12 gap-y-12 lg:max-w-none lg:grid-cols-2">
          <div class="group relative pl-20">
            <dt class="text-fg-primary text-xl font-black tracking-tight">
              <div
                class="from-glow-primary to-glow-secondary absolute top-0 left-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-6"
              >
                <Icon name="icon-filter" class="h-8 w-8 text-white" />
              </div>
              ID Extraction
            </dt>
            <dd class="text-fg-secondary mt-3 text-base leading-7 font-medium italic opacity-80">
              High-precision parsing that extracts Twitter user IDs from messages, bypassing name
              changes, link mirrors, and obfuscation.
            </dd>
          </div>

          <div class="group relative pl-20">
            <dt class="text-fg-primary text-xl font-black tracking-tight">
              <div
                class="from-glow-accent to-glow-secondary absolute top-0 left-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br shadow-lg transition-transform group-hover:scale-110 group-hover:-rotate-6"
              >
                <Icon name="icon-check-circle" class="h-8 w-8 text-white" />
              </div>
              Drama Filtering
            </dt>
            <dd class="text-fg-secondary mt-3 text-base leading-7 font-medium italic opacity-80">
              Subscribe to community-maintained blocklists to automatically filter out Gen-AI spam
              and known bad actors before they impact your users.
            </dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
{/if}
