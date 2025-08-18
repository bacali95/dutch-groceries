import { makeCacheKey } from '../helpers';

export const DEFAULT_TTL = 7 * 24 * 3600; /* 7 days in seconds */

export abstract class ICacheStore {
  abstract get<T>(key: string): Promise<[T | undefined, number]>;

  abstract set<T>(key: string, obj: T | undefined, ttl?: number): Promise<void>;

  abstract has(key: string): Promise<boolean>;

  abstract keys(keyPattern?: string): Promise<string[]>;

  async values(keyPattern = '*'): Promise<Record<string, any>> {
    const result: Record<string, any> = {};
    const keys = await this.keys(keyPattern);

    for (const key of keys) {
      result[key] = await this.get(key);
    }

    return result;
  }

  abstract remove(keyPattern: string): Promise<void>;

  async getOrPopulate<T, R>(prefix: string, args: T, getter: (args: T) => Promise<R>): Promise<R> {
    const key = makeCacheKey(prefix, args);

    if (await this.has(key)) {
      return (await this.get(key))[0] as R;
    }

    const result = await getter(args);

    // do async cache setting
    if (result) this.set(key, result);

    return result;
  }
}
