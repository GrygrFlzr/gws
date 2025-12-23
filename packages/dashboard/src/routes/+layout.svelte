<script lang="ts">
  import { enhance } from '$app/forms';
  import { page } from '$app/state';
  import Button from '$lib/components/Button.svelte';
  import ThemeToggle from '$lib/components/ThemeToggle.svelte';
  import './layout.css';

  const { data, children } = $props();
  const { user, theme } = $derived(data);

  let isLoggingOut = $state(false);

  const footerLinks = [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
    { href: '/data-deletion', label: 'Data Deletion' },
    { href: '/attributions', label: 'Attributions' }
  ];
</script>

<div class="bg-page flex min-h-screen flex-col">
  <nav class="border-border-main bg-card sticky top-0 z-50 border-b shadow-sm">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 justify-between">
        <div class="flex">
          <a
            href="/"
            class="flex shrink-0 items-center transition-all hover:scale-105 active:scale-95"
          >
            <h1 class="text-fg-primary text-xl font-bold">GWS Dashboard</h1>
          </a>
        </div>

        <div class="flex items-center gap-4">
          <ThemeToggle currentTheme={theme} />
          {#if user}
            <div class="border-border-main flex items-center gap-4 border-l pl-4">
              {#if user.avatar}
                <img
                  src="https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png"
                  alt={user.globalName ?? user.username}
                  class="h-8 w-8 rounded-full shadow-sm"
                />
              {/if}
              <span class="text-fg-primary hidden text-sm font-medium sm:block">
                {user.globalName ?? user.username}
              </span>
              <form
                method="POST"
                action="/auth/logout"
                use:enhance={() => {
                  isLoggingOut = true;
                  return async ({ update }) => {
                    await update();
                    isLoggingOut = false;
                  };
                }}
              >
                <Button type="submit" variant="secondary" loading={isLoggingOut}>Sign out</Button>
              </form>
            </div>
          {:else}
            <form method="POST" action="/auth/login">
              <Button type="submit" variant="primary">Sign in with Discord</Button>
            </form>
          {/if}
        </div>
      </div>
    </div>
  </nav>

  <main class="flex-1 overflow-x-clip">
    {@render children()}
  </main>

  <footer class="border-border-main bg-card border-t">
    <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <p class="text-fg-secondary text-sm">
          Released under <a
            href="https://github.com/GrygrFlzr/gws/blob/main/LICENSE"
            class="hover:text-brand underline transition-colors">BSD Zero Clause</a
          >. View on
          <a
            href="https://github.com/GrygrFlzr/gws"
            class="hover:text-brand underline transition-colors">GitHub</a
          >.
        </p>
        <nav class="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {#each footerLinks as link}
            <a
              href={link.href}
              class={[
                'text-sm transition-all hover:scale-110 active:scale-90',
                page.url.pathname === link.href
                  ? 'text-brand font-bold'
                  : 'text-fg-secondary hover:text-fg-primary'
              ]}
            >
              {link.label}
            </a>
          {/each}
        </nav>
      </div>
    </div>
  </footer>
</div>
