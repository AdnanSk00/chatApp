import pool from '../lib/db.js';

export const ensureUsersTable = async () => {
  // create table if not exists and ensure archived_chats column exists for storing archived partner ids
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      fullName TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      profilePic TEXT DEFAULT '',
      archived_chats JSONB DEFAULT '[]'::jsonb,
      createdAt TIMESTAMP DEFAULT NOW(),
      updatedAt TIMESTAMP DEFAULT NOW()
    );
  `);

  // Backfill for existing tables: add column if it doesn't exist
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='archived_chats') THEN
        ALTER TABLE users ADD COLUMN archived_chats JSONB DEFAULT '[]'::jsonb;
      END IF;
    END$$;
  `);
};

// Helper to map DB row (lowercase keys) to camelCase properties used throughout the app
const mapUserRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    fullName: row.fullname ?? row.full_name ?? row.fullName ?? null,
    email: row.email ?? null,
    password: row.password ?? null,
    profilePic: row.profilepic ?? row.profile_pic ?? row.profilePic ?? '',
    archivedChats: row.archived_chats ?? row.archivedChats ?? [],
    createdAt: row.createdat ?? row.created_at ?? row.createdAt ?? null,
    updatedAt: row.updatedat ?? row.updated_at ?? row.updatedAt ?? null,
  };
};

export const findUserByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return mapUserRow(rows[0]);
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
};

export const findUserByIdAndUpdate = async (id, updates = {}, options = {}) => {
  if (!id) throw new Error('User id is required');

  const keys = Object.keys(updates);
  if (keys.length === 0) {
    // nothing to update; return current user
    return await findUserById(id);
  }

  // Build SET clause dynamically: e.g. "fullName = $1, profilePic = $2"
  const setClauses = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const values = keys.map((k) => updates[k]);
  // add id as last parameter
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE users SET ${setClauses} WHERE id = $${keys.length + 1} RETURNING *`,
    values
  );

  return mapUserRow(rows[0]);
};

// Return all users except the logged-in user, omitting password
export const getAllUsers = async (loggedInUserId) => {
  const { rows } = await pool.query(
    `SELECT id, fullName, email, profilePic, createdAt, updatedAt FROM users WHERE id != $1 ORDER BY fullName ASC`,
    [loggedInUserId]
  );
  return rows.map((r) => mapUserRow(r));
};

// Get users by ids (array) and omit sensitive fields such as password
export const getUsersByIds = async (ids = []) => {
  if (!Array.isArray(ids) || ids.length === 0) return [];
  // Ensure values are integers
  const intIds = ids.map((v) => parseInt(v, 10)).filter(Boolean);
  const { rows } = await pool.query(
    `SELECT id, fullName, email, profilePic, createdAt, updatedAt FROM users WHERE id = ANY($1::int[])`,
    [intIds]
  );
  return rows.map((r) => mapUserRow(r));
};

export const getArchivedChats = async (userId) => {
  const { rows } = await pool.query('SELECT archived_chats FROM users WHERE id = $1', [userId]);
  return rows[0]?.archived_chats ?? [];
};

export const addArchivedChat = async (userId, partnerId) => {
  const current = await getArchivedChats(userId);
  const numPartnerId = parseInt(partnerId, 10);
  if (!Number.isInteger(numPartnerId)) throw new Error('Invalid partner id');
  const set = new Set(current.map((v) => parseInt(v, 10)).filter(Boolean));
  set.add(numPartnerId);
  const newArr = Array.from(set);
  await pool.query('UPDATE users SET archived_chats = $1 WHERE id = $2', [JSON.stringify(newArr), userId]);
  return newArr;
};

export const removeArchivedChat = async (userId, partnerId) => {
  const current = await getArchivedChats(userId);
  const numPartnerId = parseInt(partnerId, 10);
  const newArr = current.filter((v) => parseInt(v, 10) !== numPartnerId);
  await pool.query('UPDATE users SET archived_chats = $1 WHERE id = $2', [JSON.stringify(newArr), userId]);
  return newArr;
};


// Only export explicit helpers (no mongoose-style findOne or findByIdAndUpdate aliases)
const defaultExport = {
  ensureUsersTable,
  findUserByEmail,
  findUserById,
  createUser,
  findUserByIdAndUpdate,
  getAllUsers,
  getUsersByIds,
  getArchivedChats,
  addArchivedChat,
  removeArchivedChat,
};

export default defaultExport;
