<script lang="ts">
  import { asset } from '$app/paths';
  import type { ClassValue } from 'svelte/elements';

  const { name, class: className }: { name: string; class?: ClassValue } = $props();
</script>

<svg class={className} aria-hidden="true">
  <use href={asset(`/icons.svg#${name}`)}></use>
</svg>
