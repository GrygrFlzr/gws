import { redirect } from '@sveltejs/kit';
import { invalidateSession } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies, locals }) => {
  if (locals.session) {
    await invalidateSession(locals.session.id);
  }

  cookies.delete('session', { path: '/' });

  redirect(302, '/');
};
