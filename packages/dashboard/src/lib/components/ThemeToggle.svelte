<script lang="ts">
  import Icon from './Icon.svelte';

  type Theme = 'system' | 'light' | 'dark';

  const { currentTheme = 'system' }: { currentTheme?: string } = $props();

  let selection = $state<Theme | null>(null);
  const theme = $derived(selection ?? (currentTheme as Theme));

  function setTheme(newTheme: Theme) {
    selection = newTheme;

    if (newTheme === 'system') {
      // Remove cookie to minimize network overhead
      document.cookie = 'theme=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    } else {
      document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
    }

    // Update immediate UI via color-scheme property
    const colorScheme = newTheme === 'system' ? 'light dark' : newTheme;
    document.documentElement.style.colorScheme = colorScheme;
  }

  const themes: { value: Theme; icon: string; label: string }[] = [
    { value: 'system', icon: 'icon-computer', label: 'System' },
    { value: 'light', icon: 'icon-sun', label: 'Light' },
    { value: 'dark', icon: 'icon-moon', label: 'Dark' }
  ];
</script>

<div class="bg-badge-neutral-bg flex items-center gap-1 rounded-lg p-1">
  {#each themes as t}
    <button
      type="button"
      onclick={() => setTheme(t.value)}
      class={[
        'flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-all',
        theme === t.value
          ? 'bg-card text-link light-dark:shadow-[0_1px_3px_0_rgb(0_0_0_/_0.1)] dark:ring-border-main shadow-sm dark:ring-1'
          : 'text-fg-secondary hover:bg-muted hover:text-fg-primary'
      ]}
      title={t.label}
      aria-label="Set theme to {t.label}"
    >
      <Icon name={t.icon} class="h-5 w-5" />
    </button>
  {/each}
</div>
