import { config as dotenvConfig } from 'dotenv';

dotenvConfig();

export const config = {
  environment: process.env['ENVIRONMENT'] ?? 'development',
  redisUrl: process.env['REDIS_URL'],
  sessionSecret: process.env['SESSION_SECRET'],
  cloudflare: {
    audience: process.env['CLOUDFLARE_AUDIENCE'],
    teamDomain: process.env['CLOUDFLARE_TEAM_DOMAIN'],
  },
};
