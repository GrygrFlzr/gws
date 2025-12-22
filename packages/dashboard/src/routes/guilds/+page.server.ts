import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

interface DiscordGuildPartial {
  id: string;
  name: string;
  owner?: boolean;
  owner_id: string;
  permissions: string;
}

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user || !locals.session) {
    redirect(303, '/');
  }

  // Fetch user's guilds from Discord API
  const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
    headers: {
      Authorization: `Bearer ${locals.session.discordAccessToken}`
    }
  });

  if (!guildsResponse.ok) {
    throw new Error('Failed to fetch guilds');
  }

  const guilds: DiscordGuildPartial[] = await guildsResponse.json();

  // Filter guilds where user has MANAGE_GUILD permission
  const manageableGuilds = guilds.filter((guild) => {
    const permissions = BigInt(guild.permissions);
    const MANAGE_GUILD = 1n << 5n;
    return (permissions & MANAGE_GUILD) === MANAGE_GUILD;
  });

  return {
    guilds: manageableGuilds
  };
};
