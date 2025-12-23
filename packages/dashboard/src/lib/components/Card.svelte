<script lang="ts">
  const { children, class: className = '' } = $props();
</script>

<div
  class="border-border-main bg-card/50 rounded-2xl border p-8 shadow-sm backdrop-blur-sm {className}"
>
  {@render children()}
</div>
