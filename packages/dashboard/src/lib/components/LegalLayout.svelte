<script lang="ts">
  import GlowBackground from './GlowBackground.svelte';
  import PageContainer from './PageContainer.svelte';

  const { title, children } = $props();
</script>

<GlowBackground>
  <PageContainer prose>
    <div
      class="prose prose-sky prose-headings:text-gray-900 mx-auto max-w-3xl text-base leading-7 text-gray-700"
    >
      <p class="m-0! text-base leading-7 font-semibold text-sky-600">Legal</p>
      <h1 class="mt-2!">{title}</h1>
      {@render children()}
    </div>
  </PageContainer>
</GlowBackground>
