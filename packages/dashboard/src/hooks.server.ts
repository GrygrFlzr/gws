import type { Handle } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
  const sessionId = event.cookies.get('session');

  if (!sessionId) {
    event.locals.user = null;
    event.locals.session = null;
    return resolve(event);
  }

  const result = await validateSession(sessionId);

  if (!result) {
    event.cookies.delete('session', { path: '/' });
    event.locals.user = null;
    event.locals.session = null;
    return resolve(event);
  }

  event.locals.user = result.user;
  event.locals.session = result.session;

  return resolve(event);
};
