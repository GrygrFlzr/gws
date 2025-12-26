import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { loadEnvFile } from 'node:process';
import { defineConfig } from 'tsdown';

loadEnvFile(path.resolve(import.meta.dirname, '../../.env'));

const require = createRequire(import.meta.url);

interface PackageManifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Robustly resolves a dependency version using Node's resolution metadata.
 * It favors the version in the local manifest, but resolves 'catalog:'
 * by looking up the actual installed version in node_modules.
 */
const getDependencyVersion = (name: string, manifest: PackageManifest): string => {
  const definedVersion = manifest.dependencies?.[name] || manifest.devDependencies?.[name];

  if (definedVersion && definedVersion !== 'catalog:') {
    return definedVersion;
  }

  try {
    // Attempt to find the package.json by searching the module path
    const entryPath = require.resolve(name, { paths: [import.meta.dirname, workspaceRoot] });
    let currentDir = path.dirname(entryPath);

    // Walk up to find the nearest package.json
    while (currentDir.length > workspaceRoot.length || currentDir === workspaceRoot) {
      const pkgPath = path.join(currentDir, 'package.json');
      if (fs.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) as {
          version: string;
          name: string;
        };
        if (pkg.name === name) {
          return `^${pkg.version}`;
        }
      }
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) break;
      currentDir = parentDir;
    }
    return definedVersion || '*';
  } catch {
    // Fallback for optional dependencies or unresolvable paths
    return definedVersion === 'catalog:' ? '*' : definedVersion || '*';
  }
};

const botManifest = JSON.parse(
  fs.readFileSync(path.resolve(import.meta.dirname, 'package.json'), 'utf-8')
) as PackageManifest;
const workspaceRoot = path.resolve(import.meta.dirname, '../..');

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node24',
  sourcemap: true,
  clean: true,
  minify: true,
  // Use .js instead of .mjs since we have "type": "module" in package.json
  fixedExtension: false,
  // We want to be ESM-first, so we disable shims for CJS globals
  shims: false,
  plugins: [
    {
      name: 'generate-prod-manifest',
      generateBundle() {
        const pkg = {
          name: '@gws/bot-runtime',
          type: 'module',
          main: 'index.js',
          dependencies: {
            bufferutil: getDependencyVersion('bufferutil', botManifest),
            postgres: getDependencyVersion('postgres', botManifest),
            'utf-8-validate': getDependencyVersion('utf-8-validate', botManifest),
            'zlib-sync': getDependencyVersion('zlib-sync', botManifest)
          }
        };
        this.emitFile({
          type: 'asset',
          fileName: 'package.json',
          source: JSON.stringify(pkg, null, 2)
        });
      }
    },
    {
      name: 'strip-discord-sharding',
      transform(code, id) {
        if (id.includes('discord.js/src/client/Client.js')) {
          let newCode = code.replace(
            /_eval\(script\) \{[\s\S]*?return eval\(script\);[\s\S]*?\}/,
            '_eval(script) { throw new Error("eval disabled") }'
          );
          newCode = newCode.replace(
            /this\.shard = ShardClientUtil\.singleton\(this\);/,
            'this.shard = null;'
          );
          return newCode;
        }
        if (id.includes('discord.js/src/sharding/')) {
          return 'module.exports = {};';
        }
      }
    }
  ],
  // Don't bundle these - they need to be actual dependencies
  external: ['bufferutil', 'postgres', 'utf-8-validate', 'zlib-sync'],
  // Bundle core logic and libraries that we want to optimize/tree-shake
  noExternal: ['@gws/core', 'drizzle-orm', 'discord.js', 'bullmq', 'ioredis', 'opossum']
});
