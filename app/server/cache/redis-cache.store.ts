import { Redis } from 'ioredis';

import { DEFAULT_TTL, ICacheStore } from './cache.store';

export class RedisCacheStore extends ICacheStore {
  private readonly cache: Redis;

  constructor(redisUrl: string) {
    super();

    this.cache = new Redis(redisUrl);
  }

  async get<T>(key: string): Promise<[T | undefined, number]> {
    const result = await this.cache.get(key);
    const ttl = await this.cache.ttl(key);

    return result ? [JSON.parse(result), ttl] : [undefined, 0];
  }

  async set<T>(key: string, obj: T, ttl = DEFAULT_TTL): Promise<void> {
    try {
      await this.cache.setex(key, ttl, JSON.stringify(obj));
    } catch {
      console.warn('Failed to set value with key', key);
    }
  }

  async has(key: string): Promise<boolean> {
    return (await this.cache.exists(key)) > 0;
  }

  async keys(keyPattern = '*'): Promise<string[]> {
    const allKeys: string[] = [];

    for await (const keys of this.cache.scanStream({ match: keyPattern }).iterator()) {
      allKeys.concat(keys);
    }

    return allKeys;
  }

  async remove(keyPattern: string): Promise<void> {
    const allKeys: string[][] = [];

    for await (const keys of this.cache.scanStream({ match: keyPattern }).iterator()) {
      allKeys.push(keys);
    }

    for (const keys of allKeys) {
      if (keys.length) {
        await this.cache.del(keys);
      }
    }
  }
}
