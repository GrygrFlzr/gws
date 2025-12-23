import { schema } from '@gws/core';
import { error, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { fetchUserGuilds, hasPermission, Permissions } from '$lib/server/discord';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
  if (!locals.user || !locals.session) {
    redirect(303, '/');
  }

  const guildId = params.id;
  const token = locals.session.discordAccessToken;

  try {
    // 1. Verify user still has access to this guild and has MANAGE_GUILD permission
    // Use cache if available
    let guilds = locals.user.guildsCache;
    const cacheAt = locals.user.guildsCacheAt;
    const isCacheValid = cacheAt && Date.now() - cacheAt.getTime() < 1000 * 60 * 10; // 10 minutes

    if (!guilds || !isCacheValid) {
      guilds = await fetchUserGuilds(token);

      // Update cache in database
      await db
        .update(schema.users)
        .set({
          guildsCache: guilds,
          guildsCacheAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(schema.users.id, locals.user.id));
    }

    const userGuild = guilds.find((g) => g.id === guildId);

    if (!userGuild || !hasPermission(userGuild.permissions, Permissions.MANAGE_GUILD)) {
      throw error(403, 'You do not have permission to manage this server.');
    }

    // 2. Fetch DB settings
    const [dbGuild] = await db
      .select()
      .from(schema.guilds)
      .where(eq(schema.guilds.guildId, BigInt(guildId)));

    // 3. Fetch subscriptions
    const subscriptions = await db.query.guildBlocklistSubscriptions.findMany({
      where: eq(schema.guildBlocklistSubscriptions.guildId, BigInt(guildId)),
      with: {
        blocklist: true
      }
    });

    return {
      guild: {
        id: userGuild.id,
        name: userGuild.name,
        icon: userGuild.icon
      },
      settings: dbGuild || null,
      subscriptions
    };
  } catch (err: unknown) {
    console.error('Failed to load guild settings:', err);

    if (err && typeof err === 'object' && 'status' in err) {
      const status = (err as { status: number }).status;
      if (status === 401) {
        redirect(303, '/auth/logout');
      }
      throw err;
    }

    throw error(500, 'Internal Server Error');
  }
};
