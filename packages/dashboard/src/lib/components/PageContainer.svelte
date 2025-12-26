<script lang="ts">
  import type { ClassValue } from 'svelte/elements';

  const {
    children,
    class: className,
    prose = false
  }: { children: any; class?: ClassValue; prose?: boolean } = $props();
</script>

<div
  class={['mx-auto max-w-7xl px-4 sm:px-6 lg:px-8', prose ? 'py-24 sm:py-32' : 'py-8', className]}
>
  {@render children()}
</div>
