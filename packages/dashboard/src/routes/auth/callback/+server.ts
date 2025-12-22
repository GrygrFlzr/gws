import { isRedirect, redirect } from '@sveltejs/kit';
import { createSession, discord, getOrCreateUser } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, cookies }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const storedState = cookies.get('discord_oauth_state');

  if (!code || !state || !storedState || state !== storedState) {
    return new Response('Invalid request', { status: 400 });
  }

  try {
    const tokens = await discord.validateAuthorizationCode(code, null);

    // Fetch Discord user
    const discordUserResponse = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bearer ${tokens.accessToken()}`
      }
    });

    if (!discordUserResponse.ok) {
      return new Response('Failed to fetch user', { status: 500 });
    }

    const discordUser = await discordUserResponse.json();

    // Get or create user in database
    const user = await getOrCreateUser({
      id: discordUser.id,
      username: discordUser.username,
      discriminator: discordUser.discriminator,
      avatar: discordUser.avatar,
      email: discordUser.email
    });

    // Create session
    const sessionId = await createSession(
      user.id,
      tokens.accessToken(),
      tokens.refreshToken() ?? null,
      tokens.accessTokenExpiresInSeconds()
    );

    cookies.set('session', sessionId, {
      path: '/',
      secure: import.meta.env.PROD,
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax'
    });

    cookies.delete('discord_oauth_state', { path: '/' });

    redirect(302, '/guilds');
  } catch (error) {
    if (isRedirect(error)) throw error;
    console.error('OAuth error:', error);
    return new Response('Authentication failed', { status: 500 });
  }
};
