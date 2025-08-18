import { randomBytes as crypto_randomBytes } from 'crypto';
import type { SessionIdStorageStrategy, SessionStorage } from 'react-router';
import { createSessionStorage } from 'react-router';

import { cache } from '../cache';
import { config } from '../config';

const cookie: SessionIdStorageStrategy['cookie'] = {
  name: 'session',
  secure: config.environment === 'production',
  sameSite: 'lax',
  secrets: [config.sessionSecret ?? genRandomID(32)],
  path: '/',
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60, // 7 days
};

export const { getSession, commitSession, destroySession } = createCacheSessionStorage(cookie);

export function genRandomID(size = 8): string {
  const randomBytes = crypto_randomBytes(size);
  return Buffer.from(randomBytes).toString('hex');
}

const expiresToSeconds = (expires: Date) => {
  const now = new Date();
  const expiresDate = new Date(expires);
  const secondsDelta = Math.round((expiresDate.getTime() - now.getTime()) / 1000);
  return secondsDelta < 0 ? 0 : secondsDelta;
};

export function createCacheSessionStorage(
  cookie: SessionIdStorageStrategy['cookie'],
): SessionStorage {
  return createSessionStorage({
    cookie,
    async createData(data, expires) {
      const id = genRandomID();
      if (expires) {
        await cache.set(id, data, expiresToSeconds(expires));
      } else {
        await cache.set(id, data);
      }
      return id;
    },
    async readData(id) {
      const [data] = await cache.get(id);
      if (data) {
        return data;
      }
      return null;
    },
    async updateData(id, data, expires) {
      if (expires) {
        await cache.set(id, data, expiresToSeconds(expires));
      } else {
        await cache.set(id, data);
      }
    },
    async deleteData(id) {
      await cache.remove(id);
    },
  });
}
