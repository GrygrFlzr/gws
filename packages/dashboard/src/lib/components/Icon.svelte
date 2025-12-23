<script lang="ts">
  import { asset } from '$app/paths';

  const { name, class: className = '' }: { name: string; class?: string } = $props();
</script>

<svg class={className} aria-hidden="true">
  <use href={asset(`icons.svg#${name}`)}></use>
</svg>
