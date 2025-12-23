<script lang="ts">
  const { opacity = 20, children } = $props();
</script>

<div class="relative isolate flex min-h-full flex-col overflow-hidden">
  <!-- Top blur -->
  <div
    class="pointer-events-none absolute inset-x-0 -top-40 -z-10 transform-gpu blur-3xl sm:-top-80"
    aria-hidden="true"
  >
    <div
      class="from-glow-primary to-glow-secondary relative left-1/2 -ml-44 aspect-1155/678 w-144.5 -translate-x-1/2 rotate-30 bg-linear-to-tr sm:-ml-120 sm:w-288.75"
      style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%); opacity: {opacity /
        100}"
    ></div>
  </div>

  <div class="relative z-0 flex-1">
    {@render children()}
  </div>

  <!-- Bottom blur -->
  <div
    class="pointer-events-none absolute inset-x-0 top-full -z-10 -mt-52 transform-gpu blur-3xl sm:-mt-120"
    aria-hidden="true"
  >
    <div
      class="from-glow-accent to-glow-secondary relative left-1/2 ml-12 aspect-1155/678 w-144.5 -translate-x-1/2 bg-linear-to-tr sm:ml-144 sm:w-288.75"
      style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%); opacity: {opacity /
        100}"
    ></div>
  </div>
</div>
