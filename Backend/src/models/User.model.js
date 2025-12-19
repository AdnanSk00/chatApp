import pool from '../lib/db.js';

// Helper to map DB row (lowercase keys) to camelCase properties used throughout the app
const mapUserRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.fullname ?? row.full_name ?? row.fullName ?? null,
    email: row.email ?? null,
    password: row.password ?? null,
    profilePic: row.profilepic ?? row.profile_pic ?? row.profilePic ?? '',
    createdAt: row.createdat ?? row.created_at ?? row.createdAt ?? null,
  };
};

export const findUserByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return mapUserRow(rows[0]);
  // return rows[0];
};

export const findUserById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return mapUserRow(rows[0]);
};

export const createUser = async ({ fullName, email, password }) => {
  const { rows } = await pool.query(
    `INSERT INTO users (fullName, email, password) VALUES ($1, $2, $3) RETURNING *`,
    [fullName, email, password]
  );
  return mapUserRow(rows[0]);
  // return rows[0];
};

export default { findUserByEmail, findUserById, createUser };
