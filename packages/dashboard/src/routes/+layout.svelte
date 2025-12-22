<script lang="ts">
  import './layout.css';

  const { data, children } = $props();
  const { user } = $derived.by(() => {
    let _ = $state(data);
    return _;
  });
</script>

<div class="min-h-screen bg-gray-50">
  <nav class="bg-white shadow-sm">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 justify-between">
        <div class="flex">
          <a href="/" class="flex shrink-0 items-center">
            <h1 class="text-xl font-bold">GWS Dashboard</h1>
          </a>
        </div>

        <div class="flex items-center">
          {#if user}
            <div class="flex items-center gap-4">
              {#if user.avatar}
                <img
                  src="https://cdn.discordapp.com/avatars/{user.id}/{user.avatar}.png"
                  alt={user.username}
                  class="h-8 w-8 rounded-full"
                />
              {/if}
              <span class="text-sm text-gray-700">
                {user.username}
              </span>
              <form method="POST" action="/auth/logout">
                <button
                  type="submit"
                  class="rounded-md bg-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
                >
                  Sign out
                </button>
              </form>
            </div>
          {:else}
            <a
              href="/auth/login"
              class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Sign in with Discord
            </a>
          {/if}
        </div>
      </div>
    </div>
  </nav>

  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    {@render children()}
  </main>
</div>
