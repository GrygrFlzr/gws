<script lang="ts">
  import GuildDashboard from '$lib/components/guilds/GuildDashboard.svelte';
  import GuildList from '$lib/components/guilds/GuildList.svelte';
  import PageContainer from '$lib/components/PageContainer.svelte';

  // Mock Data
  const mockGuilds = [
    {
      id: '123',
      name: 'Test Server Alpha',
      icon: null,
      isConfigured: true,
      owner: true
    },
    {
      id: '456',
      name: 'Beta Testing Guild',
      icon: null,
      isConfigured: false,
      owner: false
    }
  ];

  const mockError = {
    status: 503,
    message: 'Discord API is temporarily unavailable.'
  };

  const mockGuild = {
    id: '123',
    name: 'Test Server Alpha',
    icon: null
  };

  const mockSettings = {
    defaultAction: {
      react: '🛑',
      delete: true,
      reply: true,
      replyMessage: 'Warning!',
      logChannel: null
    }
  };

  const mockSubscriptions = [
    {
      blocklist: {
        name: 'Global Spam List',
        description: 'Blocks known spam domains and tokens.'
      }
    }
  ];

  let activeTab = $state('list');
  let isRefreshing = $state(false);

  function handleGuildSelect(id: string) {
    // In a real scenario, this might load specific guild data.
    // For the design system, we just switch tabs to simulate navigation.
    console.log(`Selected guild: ${id}`);
    activeTab = 'dashboard';
  }

  function handleBack() {
    activeTab = 'list';
  }

  function handleRefresh() {
    isRefreshing = true;
    setTimeout(() => {
      isRefreshing = false;
    }, 1000);
  }
</script>

<PageContainer>
  <div class="mb-8">
    <h1 class="text-fg-primary mb-4 text-3xl font-bold">Tutorial Playground</h1>
    <p class="text-fg-secondary mb-4">
      Experience the dashboard functionality with sample data. No Discord account required.
    </p>
    <div class="border-border-main flex gap-4 border-b">
      <button
        class={[
          'cursor-pointer border-b-2 px-4 py-2 font-medium transition-colors',
          activeTab === 'list'
            ? 'border-sky-500 text-sky-600'
            : 'text-fg-secondary hover:text-fg-primary border-transparent'
        ]}
        onclick={() => (activeTab = 'list')}
      >
        Server List
      </button>
      <button
        class={[
          'cursor-pointer border-b-2 px-4 py-2 font-medium transition-colors',
          activeTab === 'dashboard'
            ? 'border-sky-500 text-sky-600'
            : 'text-fg-secondary hover:text-fg-primary border-transparent'
        ]}
        onclick={() => (activeTab = 'dashboard')}
      >
        Dashboard View
      </button>
      <button
        class={[
          'cursor-pointer border-b-2 px-4 py-2 font-medium transition-colors',
          activeTab === 'error'
            ? 'border-sky-500 text-sky-600'
            : 'text-fg-secondary hover:text-fg-primary border-transparent'
        ]}
        onclick={() => (activeTab = 'error')}
      >
        Error State
      </button>
    </div>
  </div>

  <div class="border-border-main bg-page rounded-xl border border-dashed p-8">
    {#if activeTab === 'list'}
      <GuildList
        guilds={mockGuilds}
        onSelect={handleGuildSelect}
        onRefresh={handleRefresh}
        {isRefreshing}
      />
    {:else if activeTab === 'dashboard'}
      <GuildDashboard
        guild={mockGuild}
        settings={mockSettings}
        subscriptions={mockSubscriptions}
        onBack={handleBack}
      />
    {:else if activeTab === 'error'}
      <GuildList
        guilds={[]}
        error={mockError}
        onRefresh={handleRefresh}
        {isRefreshing}
        onSelect={handleGuildSelect}
      />
    {/if}
  </div>
</PageContainer>
