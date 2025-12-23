<script lang="ts">
  import { navigating } from '$app/state';
  import GuildList from '$lib/components/guilds/GuildList.svelte';
  import PageContainer from '$lib/components/PageContainer.svelte';

  const { data } = $props();
  const { guilds, error: loadError } = $derived(data);

  // Derive isRefreshing from global navigation state for better UX
  const isRefreshing = $derived(
    navigating?.to?.url.pathname === '/guilds' && navigating?.to?.url.searchParams.has('refresh')
  );
</script>

<PageContainer>
  <GuildList {guilds} error={loadError} {isRefreshing} />
</PageContainer>
