import { minimatch } from 'minimatch';
import { LruMap } from 'sweet-collections';

import { DEFAULT_TTL, ICacheStore } from './cache.store';

export class MemoryCacheStore extends ICacheStore {
  private readonly cache: LruMap<string, unknown>;
  private readonly ttl: LruMap<string, [Date, NodeJS.Timeout]>;

  constructor() {
    super();
    this.cache = new LruMap<string, unknown>(500);
    this.ttl = new LruMap<string, [Date, NodeJS.Timeout]>(500);
  }

  async get<T>(key: string): Promise<[T | undefined, number]> {
    const value = this.cache.get(key);
    const [ttl] = this.ttl.get(key) ?? [undefined, undefined];

    if (value === undefined) return [undefined, 0];

    return [value as T, ttl ? Math.floor((ttl.getTime() - Date.now()) / 1000) : 0];
  }

  async set<T>(key: string, obj: T, ttl = DEFAULT_TTL): Promise<void> {
    this.cache.set(key, obj);
    this.ttl.set(key, [
      new Date(Date.now() + ttl * 1000),
      setTimeout(() => {
        this.cache.delete(key);
        this.ttl.delete(key);
      }, ttl * 1000),
    ]);
  }

  async has(key: string): Promise<boolean> {
    const [ttl] = this.ttl.get(key) ?? [new Date(), undefined];

    return this.cache.has(key) && ttl.getTime() > Date.now();
  }

  async keys(keyPattern = '*'): Promise<string[]> {
    return [...this.cache.keys()].filter((key) => minimatch(key, keyPattern));
  }

  async remove(keyPattern: string): Promise<void> {
    for (const key of [...this.cache.keys()].filter((key) => minimatch(key, keyPattern))) {
      const [, timeout] = this.ttl.get(key) ?? [undefined, undefined];

      if (timeout) clearTimeout(timeout);

      this.cache.delete(key);
      this.ttl.delete(key);
    }
  }
}
