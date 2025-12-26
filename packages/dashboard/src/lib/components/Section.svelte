<script lang="ts">
  import type { ClassValue } from 'svelte/elements';
  import Icon from './Icon.svelte';

  const {
    title,
    icon,
    iconClass,
    children
  }: { title: string; icon?: string; iconClass?: ClassValue; children: any } = $props();
</script>

<section class="bg-card ring-border-main overflow-hidden rounded-xl shadow-sm ring-1">
  <div class="border-border-main bg-page flex items-center gap-2 border-b px-6 py-4">
    {#if icon}
      <Icon name={icon} class={['h-5 w-5', iconClass]} />
    {/if}
    <h2 class="text-fg-primary text-lg font-bold">{title}</h2>
  </div>
  <div class="text-fg-secondary p-6">
    {@render children()}
  </div>
</section>
