import { error, redirect } from '@sveltejs/kit';
import { getRequestEvent, query } from '$app/server';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type DiscordResponseHeaderKey =
  | 'X-RateLimit-Limit'
  | 'X-RateLimit-Remaining'
  | 'X-RateLimit-Reset'
  | 'X-RateLimit-Reset-After'
  | 'X-RateLimit-Bucket';
type Snowflake = `${bigint}`;

interface DiscordGuildPartial {
  id: Snowflake;
  name: string;
  owner: boolean;
  permissions: string;
  features: string[];
  icon: string | null;
  banner: string | null;
}
interface DiscordGuildPartialWithCount extends DiscordGuildPartial {
  approximate_member_count: number;
  approximate_presence_count: number;
}
interface ClientRateLimitedResponse {
  code: number;
  message: string;
  retry_after: number;
  global: boolean;
}
interface ClientErrorResponse {
  code: number;
  message: string;
  errors: Record<string, unknown>;
}
type DiscordResponse =
  | DiscordGuildPartialWithCount[]
  | DiscordGuildPartial[]
  | ClientRateLimitedResponse
  | ClientErrorResponse;

const MANAGE_GUILD = 1n << 5n;
export const getManageableGuilds = query(async () => {
  const event = getRequestEvent();
  if (!event.locals.user || !event.locals.session) {
    // not signed in
    redirect(303, '/');
  }
  const TOKEN = event.locals.session.discordAccessToken;
  const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
    headers: {
      Authorization: `Bearer ${TOKEN}`
    }
  });

  if (!guildsResponse.ok) {
    error(504, 'Failed to fetch guilds from Discord API');
  }
  const guilds: DiscordResponse = await guildsResponse.json();
  if ('code' in guilds) {
    console.error(guilds);
    error(504, `Discord API error ${guilds.code}`);
  } else {
    const manageableGuilds = guilds.filter((guild) => {
      const permissions = BigInt(guild.permissions);
      return (permissions & MANAGE_GUILD) === MANAGE_GUILD;
    });

    return manageableGuilds;
  }
});
