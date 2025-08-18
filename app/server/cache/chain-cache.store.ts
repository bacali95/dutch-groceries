import { DEFAULT_TTL, ICacheStore } from './cache.store';

export class ChainCacheStore extends ICacheStore {
  private readonly stores: ICacheStore[];

  constructor(...stores: ICacheStore[]) {
    super();
    this.stores = stores;
  }

  async get<T>(key: string): Promise<[T | undefined, number]> {
    for (let i = 0; i < this.stores.length; i++) {
      const store = this.stores[i];
      if (await store.has(key)) {
        const [result, ttl] = await store.get<T>(key);
        for (let j = i - 1; j >= 0; j--) {
          await this.stores[j].set(key, result, ttl);
        }
        return [result, ttl];
      }
    }

    return [undefined, 0];
  }

  async set<T>(key: string, obj: T | undefined, ttl = DEFAULT_TTL): Promise<void> {
    for (const store of this.stores) {
      await store.set(key, obj, ttl);
    }
  }

  async has(key: string): Promise<boolean> {
    for (const store of this.stores) {
      if (await store.has(key)) {
        return true;
      }
    }
    return false;
  }

  async keys(keyPattern = '*'): Promise<string[]> {
    const result: string[] = [];

    for (const store of this.stores) {
      result.push(...(await store.keys(keyPattern)));
    }

    return [...new Set(result)].sort();
  }

  override getOrPopulate<T, R>(
    prefix: string,
    args: T,
    getter: (args: T) => Promise<R>,
  ): Promise<R> {
    return super.getOrPopulate(prefix, args, getter);
  }

  async remove(keyPattern: string): Promise<void> {
    for (const store of this.stores) {
      await store.remove(keyPattern);
    }
  }
}
