import { redirect } from '@sveltejs/kit';
import { invalidateSession } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, locals }) => {
  if (locals.session) {
    await invalidateSession(locals.session.id);
  }

  cookies.delete('session', { path: '/' });

  redirect(302, '/');
};

export const actions: Actions = {
  default: async ({ cookies, locals }) => {
    if (locals.session) {
      await invalidateSession(locals.session.id);
    }

    cookies.delete('session', { path: '/' });

    redirect(302, '/');
  }
};
