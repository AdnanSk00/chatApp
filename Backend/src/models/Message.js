import pool from '../lib/db.js';

export const ensureMessagesTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      senderId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      receiverId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      text TEXT,
      image TEXT,
      createdAt TIMESTAMP DEFAULT NOW(),
      updatedAt TIMESTAMP DEFAULT NOW()
    );
  `);
};

export const getMessages = async (myId, userToChatId, { limit = 100, before, after } = {}) => {
  // Fetch messages between two users ordered by creation time ascending
  const a = parseInt(myId, 10);
  const b = parseInt(userToChatId, 10);

  const { rows } = await pool.query(
    `SELECT * FROM messages
     WHERE (senderId = $1 AND receiverId = $2) OR (senderId = $2 AND receiverId = $1)
     ORDER BY createdAt ASC
     LIMIT $3`,
    [a, b, limit]
  );

  return rows;
};

// Minimal helper to insert message (controllers can expand as needed)
export const createMessage = async ({ senderId, receiverId, text, image }) => {
  const { rows } = await pool.query(
    `INSERT INTO messages (senderId, receiverId, text, image) VALUES ($1, $2, $3, $4) RETURNING *`,
    [senderId, receiverId, text ?? null, image ?? null]
  );
  return rows[0];
};

export const fetchMessages = async (userId) => {
  const id = parseInt(userId, 10);
  const { rows } = await pool.query(
    `SELECT * FROM messages WHERE senderId = $1 OR receiverId = $1 ORDER BY createdAt DESC`,
    [id]
  );
  return rows;
};

export default { ensureMessagesTable, createMessage, getMessages, fetchMessages};