import { createClient } from 'redis';

class RedisWrapper {
  private _client?: ReturnType<typeof createClient>;

  get client() {
    if (!this._client) {
      throw new Error('Cannot access Redis client before connecting');
    }

    return this._client;
  }

  connect(url: string): Promise<void> {
    this._client = createClient({ url });

    return new Promise((resolve, reject) => {
      this.client.on('error', (err) => {
        console.log(`Redis error: ${err}`);
        reject(err);
      });
  
      this.client.on('connect', () => {
        console.log('Client connected to redis');
        resolve();
      });
  
      this.client.on('ready', () => {
        console.log('Client connected to Redis');
        resolve();
      });
  
      this.client.connect();
    })
  }
}

export const redisWrapper = new RedisWrapper();
