import { sessions, users } from '@gws/core/db/schema';
import { encodeBase32LowerCaseNoPadding } from '@oslojs/encoding';
import { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, ORIGIN } from '$env/static/private';
import { Discord } from 'arctic';
import { eq } from 'drizzle-orm';
import { db } from './db';

export const discord = new Discord(
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  `${ORIGIN}/auth/callback`
);

function generateSessionId(): string {
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  return encodeBase32LowerCaseNoPadding(bytes);
}

export async function createSession(
  userId: bigint,
  accessToken: string,
  refreshToken: string | null,
  expiresIn: number
) {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30); // 30 days
  const tokenExpiresAt = new Date(Date.now() + expiresIn * 1000);

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
    discordAccessToken: accessToken,
    discordRefreshToken: refreshToken,
    discordTokenExpiresAt: tokenExpiresAt
  });

  return sessionId;
}

export async function refreshDiscordToken(session: typeof sessions.$inferSelect) {
  if (!session.discordRefreshToken) {
    throw new Error('No refresh token available');
  }

  // Check if token needs refreshing (expires in < 5 minutes)
  const needsRefresh =
    !session.discordTokenExpiresAt ||
    session.discordTokenExpiresAt.getTime() < Date.now() + 5 * 60 * 1000;

  if (!needsRefresh) {
    return session;
  }

  try {
    const tokens = await discord.refreshAccessToken(session.discordRefreshToken);

    const newTokenExpiresAt = new Date(Date.now() + tokens.accessTokenExpiresInSeconds() * 1000);

    // Update session with new tokens
    const [updatedSession] = await db
      .update(sessions)
      .set({
        discordAccessToken: tokens.accessToken(),
        discordRefreshToken: tokens.refreshToken() ?? session.discordRefreshToken,
        discordTokenExpiresAt: newTokenExpiresAt
      })
      .where(eq(sessions.id, session.id))
      .returning();

    return updatedSession;
  } catch (err) {
    console.error('Failed to refresh Discord token:', err);
    // Delete invalid session
    await db.delete(sessions).where(eq(sessions.id, session.id));
    throw new Error('Token refresh failed');
  }
}

export async function validateSession(sessionId: string) {
  const result = await db
    .select({
      session: sessions,
      user: users
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const { session, user } = result[0];

  // Check if session is expired
  if (Date.now() >= session.expiresAt.getTime()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    return null;
  }

  // Try to refresh Discord token if needed
  try {
    const refreshedSession = await refreshDiscordToken(session);
    return { session: refreshedSession, user };
  } catch (err) {
    console.error('Session validation failed:', err);
    return null;
  }
}

export async function invalidateSession(sessionId: string) {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function getOrCreateUser(discordUser: {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  email?: string;
}) {
  const userId = BigInt(discordUser.id);

  const existing = await db.query.users.findFirst({
    where: eq(users.id, userId)
  });

  if (existing) {
    await db
      .update(users)
      .set({
        username: discordUser.username,
        discriminator: discordUser.discriminator,
        avatar: discordUser.avatar,
        email: discordUser.email,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));

    return existing;
  }

  const [newUser] = await db
    .insert(users)
    .values({
      id: userId,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      avatar: discordUser.avatar,
      email: discordUser.email
    })
    .returning();

  return newUser;
}
