import { createClient } from 'redis';

const redisClient = createClient({
    socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    password: process.env.REDIS_PASSWORD || 'redispassword',
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

export { redisClient };
