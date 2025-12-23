<script lang="ts">
  import Icon from './Icon.svelte';

  const { title, icon, iconClass = '', children } = $props();
</script>

<section class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
  <div class="flex items-center gap-2 border-b border-gray-200 bg-gray-50 px-6 py-4">
    {#if icon}
      <Icon name={icon} class="h-5 w-5 {iconClass}" />
    {/if}
    <h2 class="text-lg font-bold text-gray-900">{title}</h2>
  </div>
  <div class="p-6">
    {@render children()}
  </div>
</section>
