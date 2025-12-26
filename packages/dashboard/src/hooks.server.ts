import '$lib/server/env';
import type { Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
  const theme = event.cookies.get('theme') || 'system';
  const colorScheme = theme === 'system' ? 'light dark' : theme;

  const sessionId = event.cookies.get('session');

  if (!sessionId) {
    event.locals.user = null;
    event.locals.session = null;
  } else {
    const result = await validateSession(sessionId);

    if (!result) {
      event.cookies.delete('session', { path: '/' });
      event.locals.user = null;
      event.locals.session = null;
    } else {
      event.locals.user = result.user;
      event.locals.session = result.session;
    }
  }

  return resolve(event, {
    transformPageChunk: ({ html }) =>
      html.replace('%theme.style%', `style="color-scheme: ${colorScheme}"`)
  });
};
