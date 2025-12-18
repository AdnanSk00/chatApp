import pool from '../lib/db.js';

export const findUserByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
};

export const findUserById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0];
};

export const createUser = async ({ fullName, email, password }) => {
  const { rows } = await pool.query(
    `INSERT INTO users (fullName, email, password) VALUES ($1, $2, $3) RETURNING id, fullName, email, profilePic, createdAt`,
    [fullName, email, password]
  );

  return rows[0];
};

export default { findUserByEmail, findUserById, createUser };
