/**
 * Robust hashtag parser that correctly handles Japanese characters.
 * Standard Twitter hashtags can contain Kanji, Hiragana, Katakana, and Alphanumeric characters.
 * They start with either # (U+0023) or ＃ (U+FF03).
 */

// Japanese character ranges:
// Hiragana: \u3040-\u309f
// Katakana: \u30a0-\u30ff
// Kanji: \u4e00-\u9faf
// Full-width Alphanumeric: \uff10-\uff19 \uff21-\uff3a \uff41-\uff5a
// Iteration marks: \u3005\u303b\u309d\u309e\u30fd\u30fe
// NOTE: This is a simplified list, but covers the vast majority of usage.

const MAX_TEXT_LENGTH = 25_000 as const;
const HASHTAG_REGEX =
  /(?:#|＃)([\w\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf\u3005\u303b\u309d\u309e\u30fd\u30fe\uff10-\uff19\uff21-\uff3a\uff41-\uff5a]+)/gi;

/**
 * Extracts hashtags from a string, supporting CJK characters.
 * @param text The string to extract hashtags from (only first 25k characters are considered)
 * @returns A list of hashtags (without the # prefix)
 */
export function extractHashtags(text: string | null | undefined): string[] {
  if (!text) return [];

  const hashtags = new Set<string>();
  const slicedText = text.slice(0, MAX_TEXT_LENGTH);
  const matches = slicedText.matchAll(HASHTAG_REGEX);

  for (const match of matches) {
    if (match[1]) {
      hashtags.add(match[1].toLowerCase());
    }
  }

  return Array.from(hashtags);
}
