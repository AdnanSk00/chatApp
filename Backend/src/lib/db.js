// Using PostgreSQL (pg) instead of MongoDB for persistence

import pkg from 'pg';
const { Pool } = pkg;
import { ENV } from './env.js';

const pool = new Pool({
  host: ENV.DB_HOST || 'localhost',
  port: parseInt(ENV.DB_PORT, 10) || 5432,
  user: ENV.DB_USER,
  password: ENV.DB_PASSWORD,
  database: ENV.DB_NAME,
  ssl: ENV.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
});

// Minimal connection helper. Table creation and schema-related queries
// should live in the respective model files (User.js, Message.js).
export const connectDB = async () => {
  try {
    const client = await pool.connect();
    client.release();
    console.log('Postgres connected');
  } catch (err) {
    console.error('Failed to connect to Postgres:', err);
    throw err;
  }
};

export default pool;