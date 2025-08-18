import cryptoJs from 'crypto-js';

export function makeCacheKey(prefix: string, args: unknown): string {
  return `${prefix}:${cryptoJs.MD5(JSON.stringify(args))}`;
}
