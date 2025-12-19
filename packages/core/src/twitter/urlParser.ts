import { Buffer } from 'node:buffer';
import { Match, TweetMatch, UidMatch, UsernameMatch } from './types';
const b64decode = (s: string) => Buffer.from(s, 'base64').toString();

/**
 * User messages are at most 4000 characters long with nitro.
 *
 * Additional 6000 characters for bot embeds, so total 10k characters.
 *
 * Cut anything after 10k to bound worst case performance.
 */
const MAX_MESSAGE_LENGTH = 10_000 as const;
export const twitterDomains = [
  // first-party
  'twitter.com',
  'x.com',
  // fx
  'fxtwitter.com',
  'twittpr.com',
  'fixupx.com',
  'xfixup.com',
  // vx
  'vxtwitter.com',
  'fixvx.com',
  // zz
  'zztwitter.com',
  // nitter
  '153.127.64.199:8081',
  '198.46.203.183:8089',
  '46.250.231.226:8889',
  '5.78.115.92:8081',
  'lightbrd.com',
  'nitter.aishiteiru.moe',
  'nitter.aosus.link',
  'nitter.catsarch.com',
  'nitter.dashy.a3x.dn.nyx.im',
  'nitter.net',
  'nitter.pek.li',
  'nitter.poast.org',
  'nitter.privacydev.net',
  'nitter.privacyredirect.com',
  'nitter.space',
  'nitter.tiekoetter.com',
  'nuku.trabun.org',
  'twitt.re',
  'xcancel.com',
  // questionable domain strings encoded in base64
  ...[
    'Y3Vubnl4LmNvbQ==',
    'Z2lybGNvY2t4LmNvbQ==',
    'aGl0bGVyeC5jb20=',
    'aW10aGVob3R0ZXN0MTh5ZWFyb2xkb25vbmx5ZmFuc3guY29t',
    'cGVlcGVlcG9vcG9vZHVtZHVtdHdpdHRlcnguY29t',
    'c2tpYmlkaXguY29t',
    'c3R1cGlkcGVuaXN4LmNvbQ==',
    'eWlmZnguY29t'
  ].map(b64decode)
].map((s) => s.toLowerCase());

const protocol = /https?:\/\//;
const domain = /(?<domain>[A-Za-z0-9_-]+(?:\.[A-Za-z0-9_-]+)+(?::\d{1,5})?)/;
const separator = /\//;

/**
 * REDOS PROTECTION: Bounded lookahead + bounded search prevents catastrophic backtracking
 *
 * (?!.{0,180}\d{21}) checks only the first 180 chars for 21+ consecutive digits
 * Combined with [^\\\s\r\n?#]{0,200}? which limits total search space to 200 chars
 *
 * This two-layer defense:
 * 1. Rejects obvious bad cases early (21+ digits in first 180 chars)
 * 2. Bounds the remaining search space to 200 chars max
 *
 * Why 180? Gives 20-char buffer for the lookahead scan while staying under 200 total.
 * Performance: O(180) lookahead + O(200) bounded search = O(1) per attempt
 */
const item =
  /[^\\\s\r\n?#]+\/(?<type>status(?:es)?|user)\/(?!.{0,180}\d{21})[^\\\s\r\n?#]{0,200}?(?<id>(?<!\d)\d{2,20})(?!\d)/;

/**
 * - https://x.com/jack/with_replies
 * - https://x.com/jack/highlights
 * - https://x.com/jack/media
 *
 * all map to https://x.com/jack
 */
const profile = /(?<username>[A-Za-z0-9_]{1,15})(?!\/(?:status(?:es)?|user))/;

const any = (patterns: RegExp[]) => `(?:${patterns.map((p) => p.source).join('|')})`;
const concat = (patterns: RegExp[]) => patterns.map((p) => p.source).join('');

const tweetOrProfile = new RegExp(
  concat([protocol, domain, separator]) + any([item, profile]),
  'gi'
);

/**
 * Finds twitter-looking URLs
 * @param text The string to check URLs in (only first 10k characters are considered)
 * @returns A list of items corresponding to a tweet or a twitter user
 */
export function findUrls(text: string): Match[] {
  const matches: Match[] = [];
  const slicedText = text.slice(0, MAX_MESSAGE_LENGTH);

  for (const match of slicedText.matchAll(tweetOrProfile)) {
    const { domain, type, id, username } = match.groups!;

    // Check if domain matches any Twitter domain
    const isTwitterDomain = twitterDomains.some(
      (td) => domain.toLowerCase() === td || domain.toLowerCase().endsWith(`.${td}`)
    );

    if (!isTwitterDomain) continue;

    const url = match[0];

    if (type && id) {
      // leading zero is trimmed
      // 0020 === 20 and 0000 === 0 for tweet IDs
      const trimmedId = id.replace(/^0+/, '') || '0';
      const result =
        type === 'status' || type === 'statuses'
          ? ({ url, tweetId: trimmedId } satisfies TweetMatch)
          : ({ url, userId: trimmedId } satisfies UidMatch);
      matches.push(result);
    } else if (username) {
      matches.push({ url, username } satisfies UsernameMatch);
    }
  }

  return matches;
}
