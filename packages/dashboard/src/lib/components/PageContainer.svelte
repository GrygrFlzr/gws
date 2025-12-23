<script lang="ts">
  const { children, class: className = '', prose = false } = $props();
</script>

<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 {className} {prose ? 'py-24 sm:py-32' : 'py-8'}">
  {@render children()}
</div>
