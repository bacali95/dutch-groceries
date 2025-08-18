import { config } from '../config';
import type { ICacheStore } from './cache.store';
import { ChainCacheStore } from './chain-cache.store';
import { MemoryCacheStore } from './memory-cache.store';
import { RedisCacheStore } from './redis-cache.store';

export class CacheService extends ChainCacheStore {
  constructor() {
    const cacheStores: ICacheStore[] = [new MemoryCacheStore()];

    if (config.redisUrl) {
      cacheStores.push(new RedisCacheStore(config.redisUrl));
    }

    super(...cacheStores);
  }
}

export const cache = new CacheService();
