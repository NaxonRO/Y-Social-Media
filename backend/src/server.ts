import app from './app';
import pool from './config/database';
import redis from './config/redis';

const PORT = parseInt(process.env.PORT || '3000');

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('✓ PostgreSQL connected');

    await redis.connect();
    console.log('✓ Redis connected');

    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();
