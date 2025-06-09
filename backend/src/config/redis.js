const { createClient } = require('redis');

const redisClient = createClient({
  socket: {
    host: 'redis-19109.c322.us-east-1-2.ec2.redns.redis-cloud.com',
    port: 19109
  },
  username: 'default',
  password: 'cNlbE4NIBMdBO5rpvAqPqkI8AQ42lwCm'
});

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err);
  // Không thoát process khi Redis lỗi
});

redisClient.on('connect', () => {
  console.log('Connected to Redis');
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
    // Test connection
    await redisClient.set('test', 'Hello Redis');
    const value = await redisClient.get('test');
    console.log('Redis test value:', value);
  } catch (err) {
    console.error('Redis connection error:', err);
    // Không thoát process khi Redis lỗi
  }
};

module.exports = {
  redisClient,
  connectRedis,
}; 