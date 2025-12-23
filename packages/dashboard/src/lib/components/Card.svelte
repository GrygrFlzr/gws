<script lang="ts">
  const { children, class: className = '' } = $props();
</script>

<div
  class="rounded-2xl border border-gray-200 bg-white/50 p-8 shadow-sm backdrop-blur-sm {className}"
>
  {@render children()}
</div>
