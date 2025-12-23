import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
  if (!locals.user) {
    return {
      stats: null
    };
  }

  return {
    stats: {}
  };
};
