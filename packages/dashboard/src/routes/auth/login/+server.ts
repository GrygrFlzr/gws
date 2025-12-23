import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { discord } from '$lib/server/auth';
import { generateState } from 'arctic';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
  const state = generateState();
  const url = discord.createAuthorizationURL(state, null, ['identify', 'guilds', 'email']);

  cookies.set('discord_oauth_state', state, {
    path: '/',
    secure: !dev, // non-https for localhost
    httpOnly: true,
    maxAge: 60 * 10,
    sameSite: 'lax'
  });

  redirect(302, url.toString());
};
