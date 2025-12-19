import { bench, describe } from 'vitest';
import { testCases } from './twitter.test';
import { findUrls } from './urlParser';

describe('Twitter URL Parser - Performance Benchmarks', () => {
  for (const item of testCases) {
    bench(item.name, () => {
      findUrls(item.body);
    });

    describe('Scale tests', () => {
      bench('1000x simple URLs in single string', () => {
        const largeString = item.body.repeat(1000);
        findUrls(largeString);
      });

      bench('1000 separate messages', () => {
        for (let i = 0; i < 1000; i++) {
          findUrls(`a`.repeat(100) + item.body);
        }
      });

      bench('Max message length (10k chars) with URLs', () => {
        const padding = 'a'.repeat(5000);
        const message = padding + item.body + padding;
        findUrls(message.slice(0, 10000));
      });
    });
  }
});
