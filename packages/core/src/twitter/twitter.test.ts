import { performance } from 'node:perf_hooks';
import { describe, expect, it } from 'vitest';
import type { TweetMatch, UidMatch, UsernameMatch } from './types';
import { findUrls } from './urlParser';

type Expect = Omit<TweetMatch, 'url'> | Omit<UidMatch, 'url'> | Omit<UsernameMatch, 'url'>;

interface Test {
  name: string;
  body: string;
  expect: Expect[];
}

/**
 * Test both correctness and worst-case performance
 */
export const testCases: Test[] = [
  {
    name: 'Username containing substring "status"',
    body: 'anfjksnakfan https://x.com/status123 jkaenbdkjbsfkj',
    expect: [
      {
        username: 'status123'
      }
    ]
  },
  {
    name: 'Lesser-known user ID format',
    body: 'this goes to a profile https://x.com/i/user/12 bkasdjfn',
    expect: [
      {
        userId: '12'
      }
    ]
  },
  {
    name: 'Username containing substring "user"',
    body: 'aafkjasbaabg https://x.com/user123/status/456 ksfkjbaksjf',
    expect: [
      {
        tweetId: '456'
      }
    ]
  },
  {
    name: '"Malformed" URL still supported (1)',
    body: '|| https://fixvx.com///status/123  https://fixvx.com/jack//status/456 ||',
    expect: [
      {
        tweetId: '123'
      },
      {
        tweetId: '456'
      }
    ]
  },
  {
    name: 'Query Parameters',
    body: 'Check this out: https://x.com/mob/status/123?ref=some ???',
    expect: [
      {
        tweetId: '123'
      }
    ]
  },
  {
    name: '15 char username',
    body: 'Check this person out: https://x.com/PzuwZ1BonwIkENq?bunchofqueryparams ???',
    expect: [
      {
        username: 'PzuwZ1BonwIkENq'
      }
    ]
  },
  {
    name: 'Tweet ID obfuscated with alphanumeric',
    body: 'this is actually tweet ID #20 because it looks for a number after /status/ https://fixupx.com/i/status/aaaaa20bbb30cccc',
    expect: [
      {
        tweetId: '20'
      }
    ]
  },
  {
    name: 'Domain is IP:Port',
    body: 'nitter domains are kinda funny http://153.127.64.199:8081/user/status/123',
    expect: [
      {
        tweetId: '123'
      }
    ]
  },
  {
    name: 'Spoilered links',
    body: '||https://twitt.re/someone/status/12312137183|| || http://fixvx.com/someoneelse/status/7129371873 ||',
    expect: [
      {
        tweetId: '12312137183'
      },
      {
        tweetId: '7129371873'
      }
    ]
  },
  {
    name: 'Embed-suppressed links',
    body: '<https://xcancel.com/somebody/status/3718471747>',
    expect: [
      {
        tweetId: '3718471747'
      }
    ]
  },
  {
    name: 'UPPERCASE URL',
    body: 'HTTPS://XCANCEL.COM/WHYWESHOUTIN/status/27313',
    expect: [
      {
        tweetId: '27313'
      }
    ]
  },
  {
    name: 'More fxtwitter funny support',
    body: 'https://fixupx.com/*/status/99 https://fixupx.com/(/status/88 https://fixupx.com/&/status/77',
    expect: [
      {
        tweetId: '99'
      },
      {
        tweetId: '88'
      },
      {
        tweetId: '77'
      }
    ]
  },
  {
    name: 'Username that is all numbers (perfectly valid)',
    body: 'https://x.com/123456789',
    expect: [{ username: '123456789' }]
  },
  {
    name: 'Subdomain on official domain',
    body: 'https://mobile.twitter.com/user/status/456',
    expect: [{ tweetId: '456' }]
  },
  {
    name: 'Fragment in URL',
    body: 'https://x.com/user/status/123#replies',
    expect: [{ tweetId: '123' }]
  },
  {
    name: 'Multiple URL types in one message',
    body: 'Check these: https://x.com/alice/status/111 and https://x.com/bob and https://x.com/i/user/12',
    expect: [{ tweetId: '111' }, { username: 'bob' }, { userId: '12' }]
  },
  {
    name: 'Trailing slash on username',
    body: 'https://x.com/username/',
    expect: [{ username: 'username' }]
  },
  {
    name: 'Non-Twitter domain should not match',
    body: 'https://nottwitter.com/user/status/123',
    expect: []
  },
  {
    name: 'Encoded URL characters should not match',
    body: 'https://x.com/user%2Fstatus/123 because 2F is url-encoded / and https://x.com/user/%7ftatus/20 so fall back to username match',
    expect: [{ username: 'user' }, { username: 'user' }]
  },
  {
    name: 'Invalid username which still points to valid tweet',
    body: 'https://fixupx.com/abcdefghijklmnopqrstuvwxyz/status/123 Should fall through to tweetId match',
    expect: [{ tweetId: '123' }]
  },
  {
    name: 'Leading zeros should be trimmed',
    body: 'https://fixupx.com/i/status/0020 maps to x.com/i/status/0020 but x.com just does numeric comparison',
    expect: [{ tweetId: '20' }]
  },
  {
    name: 'Lesser-known /statuses/ is supported',
    body: 'https://fixupx.com/i/statuses/aaaaa20bbb30cccc',
    expect: [{ tweetId: '20' }]
  },
  {
    name: 'Different usernames with leading zero',
    body: 'https://x.com/0123456789 https://x.com/123456789',
    expect: [{ username: '0123456789' }, { username: '123456789' }]
  },
  {
    name: 'Multiline split should not match',
    body: 'https://x.com/i/status/\n128371',
    expect: []
  },
  {
    name: 'Multiline split should not match (fallback to username)',
    body: 'https://x.com/i/\n/128371',
    expect: [{ username: 'i' }]
  },
  {
    name: 'Bunch of extra slashes should match (vxtwitter)',
    body: 'https://fixvx.com/i/status//////128371',
    expect: [{ tweetId: '128371' }]
  },
  {
    name: 'Zero case',
    body: 'https://fixvx.com/i/status/000000000000',
    expect: [{ tweetId: '0' }]
  },
  {
    name: 'weird 0 prefix',
    body: 'https://fixupx.com/i/status/0x20 https://fixupx.com/i/status/0o21 https://fixupx.com/i/status/0a0b0c0d0e0f22 https://fixupx.com/i/status/0a0b0c0d0e0f000023',
    expect: [{ tweetId: '20' }, { tweetId: '21' }, { tweetId: '22' }, { tweetId: '23' }]
  },
  {
    name: '0 prefix more than once should resolve to id 0',
    body: 'https://fixupx.com/i/status/00a20',
    expect: [{ tweetId: '0' }]
  },
  {
    name: '21 digits should not match',
    body: 'https://x.com/i/status/000000000000000000020',
    expect: []
  },
  {
    name: '3900+ digits should not match',
    body: `https://x.com/i/status/${'0'.repeat(3976)}1`,
    expect: []
  },
  {
    name: 'vxtwitter additional path segments',
    body: 'vxtwitter just splits on / and checks status/:id https://fixvx.com/i/i/statuses/20 https://fixvx.com/i/status/status/21',
    expect: [
      {
        tweetId: '20'
      },
      {
        tweetId: '21'
      }
    ]
  },
  {
    name: 'Catastrophic path regex backtrack attack',
    body: `https://x.com/i/${'a/'.repeat(1900)}/status/20`,
    expect: [{ tweetId: '20' }]
  },
  {
    name: 'Catastrophic domain regex backtrack attack',
    body: `https://${'a.'.repeat(1900)}.com/i/status/20`,
    expect: []
  },
  {
    name: 'Catastrophic digit backtrack attack',
    body: `https://x.com/i/status/${'1'.repeat(3977)}`,
    expect: []
  },
  {
    name: '/status/:id URL (no username)',
    body: 'check this out https://fxtwitter.com/status/123456789',
    expect: [{ tweetId: '123456789' }]
  },
  {
    name: '/statuses/:id URL (no username)',
    body: 'another one https://fixupx.com/statuses/987654321',
    expect: [{ tweetId: '987654321' }]
  }
] as const;

describe('Twitter URL Parser', () => {
  describe('Correctness', () => {
    testCases.forEach(({ name, body, expect: expected }) => {
      it(name, () => {
        const matches = findUrls(body);

        // Check count
        expect(matches).toHaveLength(expected.length);

        // Check each expected result exists
        for (const expectedMatch of expected) {
          const found = matches.find((match) =>
            Object.entries(expectedMatch).every(
              ([key, value]) => (match as Record<string, string>)[key] === value
            )
          );

          expect(found).toBeDefined();

          // Ensure no unexpected properties (except 'url')
          if (found) {
            const unexpectedProps = Object.keys(found).filter(
              (key) => key !== 'url' && !(key in expectedMatch)
            );
            expect(unexpectedProps).toHaveLength(0);
          }
        }
      });
    });
  });

  describe('Performance - Boundary Cases', () => {
    const boundaryTests = testCases.filter((t) => t.name.includes('Catastrophic'));

    boundaryTests.forEach(({ name, body }) => {
      it(`${name} - should complete in reasonable time`, () => {
        const start = performance.now();
        findUrls(body);
        const duration = performance.now() - start;

        // Should complete in under 100ms even for pathological cases
        expect(duration).toBeLessThan(100);
      });
    });
  });
});
