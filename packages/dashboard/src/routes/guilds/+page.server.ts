import { redirect } from '@sveltejs/kit';
import {
  discordAPI,
  hasPermission,
  Permissions,
  type DiscordGuildPartial
} from '$lib/server/discord';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, depends }) => {
  depends('guilds:list');

  if (!locals.user || !locals.session) {
    redirect(303, '/');
  }

  const token = locals.session.discordAccessToken;

  try {
    // Fetch guilds using the rate-limited client
    const guilds = await discordAPI.fetch<DiscordGuildPartial[]>('/users/@me/guilds', token);

    // Filter for guilds where user has MANAGE_GUILD permission
    const manageableGuilds = guilds.filter((guild) =>
      hasPermission(guild.permissions, Permissions.MANAGE_GUILD)
    );

    return {
      guilds: manageableGuilds
    };
  } catch (error) {
    console.error('Failed to fetch guilds:', error);

    // Return error state instead of throwing to allow graceful handling
    return {
      guilds: [],
      error:
        error && typeof error === 'object' && 'status' in error
          ? { status: (error as { status: number }).status, message: String(error) }
          : { status: 500, message: 'Failed to fetch guilds' }
    };
  }
};
