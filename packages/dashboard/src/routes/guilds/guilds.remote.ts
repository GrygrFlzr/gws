import { redirect } from '@sveltejs/kit';
import { getRequestEvent, query } from '$app/server';
import { discordAPI, type DiscordGuildPartial } from '$lib/server/discord';

const MANAGE_GUILD = 1n << 5n;

export const getManageableGuilds = query(async () => {
  const event = getRequestEvent();

  if (!event.locals.user || !event.locals.session) {
    redirect(303, '/');
  }

  const token = event.locals.session.discordAccessToken;

  // Fetch guilds using the rate-limited client
  const guilds = await discordAPI.fetch<DiscordGuildPartial[]>('/users/@me/guilds', token);

  // Filter for guilds where user has MANAGE_GUILD permission
  const manageableGuilds = guilds.filter((guild) => {
    const permissions = BigInt(guild.permissions);
    return (permissions & MANAGE_GUILD) === MANAGE_GUILD;
  });

  return manageableGuilds;
});
