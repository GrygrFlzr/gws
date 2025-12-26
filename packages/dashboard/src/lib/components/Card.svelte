<script lang="ts">
  import type { ClassValue } from 'svelte/elements';

  const { children, class: className }: { children: any; class?: ClassValue } = $props();
</script>

<div
  class={[
    'border-border-main bg-card/50 rounded-2xl border p-8 shadow-sm backdrop-blur-sm',
    className
  ]}
>
  {@render children()}
</div>
