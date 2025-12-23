export type Snowflake = `${bigint}`;

export interface DiscordGuildPartial {
  id: Snowflake;
  name: string;
  owner: boolean;
  permissions: string;
  features: string[];
  icon: string | null;
  banner: string | null;
}

export interface DiscordGuildWithCounts extends DiscordGuildPartial {
  approximate_member_count: number;
  approximate_presence_count: number;
}
