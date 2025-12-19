export type TweetMatch = { url: string; tweetId: string };
export type UidMatch = { url: string; userId: string };
export type UsernameMatch = { url: string; username: string };
export type Match = TweetMatch | UidMatch | UsernameMatch;

export interface UserResult {
  userId: string;
  username: string;
  source: 'fx' | 'vx' | 'cache';
  data?: unknown;
}

export interface FxTwitterUserResponse {
  user: {
    id: string;
    screen_name: string;
    [key: string]: unknown;
  };
}

export interface FxTwitterTweetResponse {
  tweet: {
    author: {
      id: string;
      screen_name: string;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
}

export interface VxTwitterUserResponse {
  id: number;
  screen_name: string;
  [key: string]: unknown;
}

export interface VxTwitterTweetResponse {
  user_screen_name: string;
  [key: string]: unknown;
}
