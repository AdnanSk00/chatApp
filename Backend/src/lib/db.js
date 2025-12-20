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

export const initializeDB = async () => {
  try {
    // Ensure users table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        fullName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        profilePic TEXT DEFAULT '',
        createdAt TIMESTAMP DEFAULT NOW(),
        updatedAt TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('Postgres connected and users table is ready');
  } catch (err) {
    console.error('Failed to initialize database:', err);
    throw err;
  }
};

export default pool;