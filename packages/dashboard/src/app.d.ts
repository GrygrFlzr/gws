import type { sessions, users } from '@gws/core/db/schema';

declare global {
  namespace App {
    interface Locals {
      user: typeof users.$inferSelect | null;
      session: typeof sessions.$inferSelect | null;
    }

    interface PageData {
      user: App.Locals['user'];
    }
  }
}

export {};
