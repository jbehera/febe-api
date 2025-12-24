import { createClient } from 'redis';

const client = createClient({
  url: process.env.REDIS_URI,
});

client.on('error', (err) => {
  console.log(`Redis error: ${err}`);
});

client.on('connect', () => {
  console.log('Client connected to redis');
});

client.on('ready', () => {
  console.log('Redis client is ready to use');
});

client.on('end', () => {
  console.log('Client disconnected to redis');
});

export { client as redisClient };
