<script lang="ts">
  import GuildDashboard from '$lib/components/guilds/GuildDashboard.svelte';
  import PageContainer from '$lib/components/PageContainer.svelte';

  const { data } = $props();
  const { guild, settings, subscriptions } = $derived(data);
</script>

<PageContainer>
  <GuildDashboard {guild} {settings} {subscriptions} />
</PageContainer>
