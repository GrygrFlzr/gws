export type TweetMatch = { url: string; tweetId: string };
export type UidMatch = { url: string; userId: string };
export type UsernameMatch = { url: string; username: string };
export type Match = TweetMatch | UidMatch | UsernameMatch;

/**
 * Result of a Twitter user lookup, normalized across different API providers.
 */
export interface UserResult {
  userId: string;
  username: string;
  source: 'fx' | 'vx' | 'cache';
  /** Original raw data from the API provider */
  data?: unknown;
  /** Hashtags extracted from the user's description or the latest tweet */
  hashtags?: string[];
}

export type DataProvider = 'twitter' | 'bsky';

export interface APIUser {
  id: string;
  name: string;
  screen_name: string;
  avatar_url: string | null;
  banner_url: string | null;
  description: string;
  location: string;
  url: string;
  protected: boolean;
  followers: number;
  following: number;
  statuses: number;
  media_count: number;
  likes: number;
  joined: string;
  website: {
    url: string;
    display_url: string;
  } | null;
  birthday?: {
    day?: number;
    month?: number;
    year?: number;
  };
  verification?: {
    verified: boolean;
    type: 'organization' | 'government' | 'individual' | null;
    verified_at?: string | null;
    identity_verified?: boolean;
  };
  /** Enhanced tracking information from FxTwitter v2 */
  about_account?: {
    /** The country the account is based in */
    based_in?: string | null;
    location_accurate?: boolean;
    created_country_accurate?: boolean | null;
    source?: string | null;
    /** Tracking handle changes */
    username_changes?: {
      count: number;
      last_changed_at: string | null;
    };
  };
}

export interface APIMedia {
  id?: string;
  type: string;
  url: string;
  width: number;
  height: number;
}

export interface APIPhoto extends APIMedia {
  type: 'photo' | 'gif';
  /** URL for transcoding GIF to a playable format */
  transcode_url?: string;
  altText?: string;
}

export type TweetMediaFormat = {
  bitrate: number;
  content_type: string;
  url: string;
};

export interface APIVideo extends APIMedia {
  type: 'video' | 'gif';
  thumbnail_url: string;
  format: string;
  duration: number;
  variants: TweetMediaFormat[];
}

export interface APIMosaicPhoto extends APIMedia {
  type: 'mosaic_photo';
  formats: {
    webp: string;
    jpeg: string;
  };
}

export interface APIExternalMedia {
  type: 'video';
  url: string;
  thumbnail_url?: string;
  height?: number;
  width?: number;
}

export interface APIBroadcast {
  url: string;
  width: number;
  height: number;
  state: 'LIVE' | 'ENDED';
  broadcaster: {
    username: string;
    display_name: string;
    id: string;
  };
  stream?: {
    url: string;
  };
  title: string;
  source: 'Producer' | string;
  orientation: 'landscape' | 'portrait';
  broadcast_id: string;
  media_id: string;
  media_key: string;
  is_high_latency: boolean;
  thumbnail: {
    original: {
      url: string;
    };
    small?: { url: string };
    medium?: { url: string };
    large?: { url: string };
    x_large?: { url: string };
  };
}

export interface APIPollChoice {
  label: string;
  count: number;
  percentage: number;
}

export interface APIPoll {
  choices: APIPollChoice[];
  total_votes: number;
  ends_at: string;
  time_left_en: string;
}

export interface APIFacet {
  type: string;
  /** Start and end indices in the raw text */
  indices: [start: number, end: number];
  /** The original text snippet (e.g. hashtag without #) */
  original?: string;
  replacement?: string;
  display?: string;
  id?: string;
}

export interface APITranslate {
  text: string;
  source_lang: string;
  source_lang_en: string;
  target_lang: string;
  provider: string;
}

export interface APIStatus {
  id: string;
  url: string;
  /** Normalized text with links/mentions resolved */
  text: string;
  created_at: string;
  created_timestamp: number;

  likes: number;
  reposts: number;
  replies: number;

  quote?: APIStatus;
  poll?: APIPoll;
  author: APIUser;

  media: {
    external?: APIExternalMedia;
    photos?: APIPhoto[];
    videos?: APIVideo[];
    all?: APIMedia[];
    mosaic?: APIMosaicPhoto;
    broadcast?: APIBroadcast;
  };

  /** Structured text content including original raw text and facets (hashtags, mentions, etc.) */
  raw_text: {
    text: string;
    facets: APIFacet[];
  };

  lang: string | null;
  translation?: APITranslate;

  possibly_sensitive: boolean;

  replying_to: {
    screen_name: string;
    post: string;
  } | null;

  source: string | null;

  embed_card: 'tweet' | 'summary' | 'summary_large_image' | 'player';
  provider: DataProvider;
}

export interface BirdwatchEntity {
  fromIndex: number;
  toIndex: number;
  ref: {
    type: 'TimelineUrl';
    url: string;
    urlType: 'ExternalUrl';
  };
}

export interface APITwitterCommunityNote {
  text: string;
  entities: BirdwatchEntity[];
}

export interface APITwitterCommunity {
  id: string;
  name: string;
  description: string;
  created_at: string;
  search_tags: string[];
  is_nsfw: boolean;
  topic: string | null;
  admin: APIUser | null;
  creator: APIUser | null;
  join_policy: 'Open' | 'Closed';
  invites_policy: 'MemberInvitesAllowed' | 'MemberInvitesDisabled';
  is_pinned: boolean;
}

/**
 * Enhanced Twitter-specific status fields from FxTwitter.
 */
export interface APITwitterStatus extends APIStatus {
  /** View count if available */
  views?: number | null;
  bookmarks?: number | null;
  community?: APITwitterCommunity;

  /** Whether the tweet is a long-form "Note Tweet" */
  is_note_tweet: boolean;
  /** Community note (Birdwatch) information */
  community_note: APITwitterCommunityNote | null;
  provider: 'twitter';
  /** Legacy field for full tweet text */
  full_text?: string;
  /** Manually populated hashtags list */
  hashtags?: string[];
}

/**
 * FxTwitter API v1 response format.
 */
export interface FxTwitterAPIV1Response {
  code: number;
  message: string;
  tweet?: APITwitterStatus;
}

/**
 * FxTwitter User API v1 response format.
 */
export interface FxTwitterUserAPIV1Response {
  code: number;
  message: string;
  user?: APIUser;
}

/**
 * FxTwitter API v2 response format.
 */
export interface FxTwitterAPIV2Response {
  code: number;
  message: string;
  /** The primary status requested */
  status?: APITwitterStatus;
  /** Thread context if requested */
  thread?: APITwitterStatus[] | null;
  /** The author of the primary status */
  author?: APIUser | null;
}

// Aliases for compatibility
export type FxTwitterTweetResponse = FxTwitterAPIV1Response;
export type FxTwitterUserResponse = FxTwitterUserAPIV1Response;

/**
 * VxTwitter User API response format.
 */
export interface VxTwitterUserResponse {
  id: number;
  screen_name: string;
  name: string;
  description: string;
  profile_image_url: string;
  location: string;
  followers_count: number;
  following_count: number;
  tweet_count: number;
  created_at: string;
  protected: boolean;
  fetched_on: number;
  [key: string]: unknown;
}

/**
 * VxTwitter Tweet API response format.
 */
export interface VxTwitterTweetResponse {
  text: string;
  likes: number;
  retweets: number;
  replies: number;
  date: string;
  date_epoch: number;
  user_screen_name: string;
  user_name: string;
  user_profile_image_url: string;
  tweetURL: string;
  tweetID: string;
  conversationID: string;
  mediaURLs: string[];
  media_extended: Array<{
    url: string;
    type: 'image' | 'video' | 'gif' | 'txt' | 'rtf';
    size?: { width: number; height: number };
    thumbnail_url?: string;
    altText?: string;
    duration_millis?: number;
  }>;
  possibly_sensitive: boolean;
  hashtags: string[];
  qrtURL?: string | null;
  communityNote?: string | null;
  allSameType: boolean;
  hasMedia: boolean;
  combinedMediaUrl?: string | null;
  pollData?: {
    options: Array<{ name: string; votes: number; percentage: number }>;
  } | null;
  article?: {
    title: string;
    preview_text: string;
    image: string | null;
  } | null;
  lang: string | null;
  replyingTo?: string | null;
  replyingToID?: string | null;
  fetched_on: number;
  retweetURL?: string | null;
  [key: string]: unknown;
}
