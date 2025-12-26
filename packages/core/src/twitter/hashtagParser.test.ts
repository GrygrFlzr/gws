import { describe, expect, it } from 'vitest';
import { extractHashtags } from './hashtagParser';

describe('extractHashtags', () => {
  it('should extract simple alphanumeric hashtags', () => {
    const text = 'Hello #world and #Twitter!';
    expect(extractHashtags(text)).toEqual(['world', 'twitter']);
  });

  it('should extract Japanese hashtags (Hiragana, Katakana, Kanji)', () => {
    const text = 'こんにちは #ひらがな #カタカナ #漢字 #Ｔｗｉｔｔｅｒ';
    expect(extractHashtags(text)).toEqual(['ひらがな', 'カタカナ', '漢字', 'ｔｗｉｔｔｅｒ']);
  });

  it('should handle full-width hash marks', () => {
    const text = '＃日本語ハッシュタグ';
    expect(extractHashtags(text)).toEqual(['日本語ハッシュタグ']);
  });

  it('should extract multiple hashtags from a single string', () => {
    const text = 'Working on #GWS #bot #Discord #日本語';
    expect(extractHashtags(text)).toEqual(['gws', 'bot', 'discord', '日本語']);
  });

  it('should return an empty array for text without hashtags', () => {
    const text = 'This is just a regular message.';
    expect(extractHashtags(text)).toEqual([]);
  });

  it('should handle null or undefined input', () => {
    expect(extractHashtags(null)).toEqual([]);
    expect(extractHashtags(undefined)).toEqual([]);
  });

  it('should handle hashtags mixed with punctuation', () => {
    const text = '#test, #test2. #test3? #test4! #漢字;';
    expect(extractHashtags(text)).toEqual(['test', 'test2', 'test3', 'test4', '漢字']);
  });
});
