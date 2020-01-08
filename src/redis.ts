import { createClient, RedisClient } from 'redis';
import { promisify } from 'util';

const redisClient = createClient({ host: process.env.REDIS_ENDPOINT });

const get = promisify(redisClient.get).bind(redisClient);
const set = promisify(redisClient.set).bind(redisClient);
const quit = promisify(redisClient.quit).bind(redisClient);
const expire = promisify(redisClient.expire).bind(redisClient);

export const redis = {
  get,
  set,
  quit,
  expire
} as RedisClient;
