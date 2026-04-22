'use strict';

require('dotenv').config();

const { DB_USER, DB_PASSWORD, DB_HOST, DB_PORT, DB_NAME } = process.env;

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `postgres://${DB_USER}:${encodeURIComponent(DB_PASSWORD || '')}@${DB_HOST}:${DB_PORT}/${DB_NAME}`;
}

const direction = process.argv[2] || 'up';
const { execSync } = require('child_process');

execSync(`npx node-pg-migrate ${direction} -m migrations`, { stdio: 'inherit' });
