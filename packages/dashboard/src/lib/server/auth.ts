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
  const bytes = new Uint8Array(20); // 160-bit
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

  // Refresh session if it's close to expiring (< 15 days)
  if (Date.now() >= session.expiresAt.getTime() - 1000 * 60 * 60 * 24 * 15) {
    await db
      .update(sessions)
      .set({ expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30) })
      .where(eq(sessions.id, sessionId));
  }

  return { session, user };
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
    // Update user info
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

  // Create new user
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
