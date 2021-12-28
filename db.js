const redis = require('redis');

let client = null;

(async () => {
  client = redis.createClient({
    socket: {
      port: 6379,
      host: 'redis'
    }
  });

  client.on('error', (error) => console.error('Redis connection failed: ', error));

  await client.connect();
})();

module.exports = client;
