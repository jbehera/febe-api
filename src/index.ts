import dotenv from 'dotenv';
dotenv.config(); // Initialize dot env before access

// import mongoose from 'mongoose';
// import https from 'https';
// import fs from 'fs';
import { app } from './app';
// import { redisWrapper } from './redis-wrapper';



const start = async () => {
  const port = process.env.PORT || 8081;

  if(!process.env.FEBE_REST_API_BASE_URL) {
    throw new Error('FEBE_REST_API_BASE_URL must be specified');
  }

  if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URI) {
    throw new Error('REDIS_URI must be specified');
  }

  // if (!process.env.ACCESS_TOKEN_SECRET) {
  //   throw new Error('ACCESS_TOKEN_SECRET must be specified');
  // }

  // if (!process.env.REFRESH_TOKEN_SECRET) {
  //   throw new Error('REFRESH_TOKEN_SECRET must be specified');
  // }

  // try {
  //   await redisWrapper.connect(process.env.REDIS_URI);
  //   redisWrapper.client.on('end', () => {
  //     console.log('Client disconnected to redis');
  //   });
  // } catch (error) {
  //   console.error(error);
  //   process.exit(0);
  // }

  process.on('SIGINT', async () => {
    // await redisWrapper.client.disconnect();
    process.exit(0);
  });

  app.listen(port, () => {
    console.log(`Server is running on the port: ${port}`);
  });
  // https
  //   .createServer(
  //     {
  //       key: fs.readFileSync('key.pem'),
  //       cert: fs.readFileSync('cert.pem'),
  //     },
  //     app
  //   )
  //   .listen(port, () => {
  //     console.log(`Server is running on the port: ${port}`);
  //   });
};

start();
