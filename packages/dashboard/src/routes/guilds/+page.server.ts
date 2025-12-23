import { schema } from '@gws/core';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { fetchUserGuilds, hasPermission, Permissions } from '$lib/server/discord';
import { eq, inArray } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, depends, url }) => {
  depends('guilds:list');

  if (!locals.user || !locals.session) {
    redirect(303, '/');
  }

  const userId = locals.user.id;
  const token = locals.session.discordAccessToken;
  const forceRefresh = url.searchParams.has('refresh');

  try {
    let guilds = locals.user.guildsCache;
    const cacheAt = locals.user.guildsCacheAt;
    const isCacheValid = cacheAt && Date.now() - cacheAt.getTime() < 1000 * 60 * 10; // 10 minutes

    if (!guilds || !isCacheValid || forceRefresh) {
      // Fetch fresh guilds using the rate-limited client
      guilds = await fetchUserGuilds(token);

      // Update cache in database
      await db
        .update(schema.users)
        .set({
          guildsCache: guilds,
          guildsCacheAt: new Date(),
          updatedAt: new Date()
        })
        .where(eq(schema.users.id, userId));
    }

    // Filter for guilds where user has MANAGE_GUILD permission
    const manageableGuilds = guilds.filter((guild) =>
      hasPermission(guild.permissions, Permissions.MANAGE_GUILD)
    );

    let configuredIds = new Set<string>();

    if (manageableGuilds.length > 0) {
      const manageableIds = manageableGuilds.map((g) => BigInt(g.id));
      const dbGuilds = await db
        .select({ id: schema.guilds.guildId })
        .from(schema.guilds)
        .where(inArray(schema.guilds.guildId, manageableIds));

      configuredIds = new Set(dbGuilds.map((g) => g.id.toString()));
    }

    const sortedGuilds = manageableGuilds
      .map((guild) => ({
        ...guild,
        isConfigured: configuredIds.has(guild.id)
      }))
      .sort((a, b) => (b.isConfigured ? 1 : 0) - (a.isConfigured ? 1 : 0));

    return {
      guilds: sortedGuilds
    };
  } catch (err: unknown) {
    console.error('Failed to fetch guilds:', err);

    if (err && typeof err === 'object' && 'status' in err) {
      const status = (err as { status: number }).status;
      if (status === 401) {
        redirect(303, '/auth/logout');
      }

      // Return error state instead of throwing to allow graceful handling
      return {
        guilds: [],
        error: { status, message: String(err) }
      };
    }

    return {
      guilds: [],
      error: { status: 500, message: 'Failed to fetch guilds' }
    };
  }
};
