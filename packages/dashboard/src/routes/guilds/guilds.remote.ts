import { redirect } from '@sveltejs/kit';
import { getRequestEvent, query } from '$app/server';
import { fetchUserGuilds, hasPermission, Permissions } from '$lib/server/discord';

export const getManageableGuilds = query(async () => {
  const event = getRequestEvent();

  if (!event.locals.user || !event.locals.session) {
    redirect(303, '/');
  }

  const token = event.locals.session.discordAccessToken;

  // Fetch guilds using the rate-limited client
  const guilds = await fetchUserGuilds(token);

  // Filter for guilds where user has MANAGE_GUILD permission
  const manageableGuilds = guilds.filter((guild) =>
    hasPermission(guild.permissions, Permissions.MANAGE_GUILD)
  );

  return manageableGuilds;
});
