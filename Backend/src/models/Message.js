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

// Helper to map DB row (lowercase/snake_case keys) to camelCase used in the app
const mapMessageRow = (row) => {
  if (!row) return null;
  return {
    id: row.id,
    senderId: row.senderid ?? row.sender_id ?? row.senderId ?? null,
    receiverId: row.receiverid ?? row.receiver_id ?? row.receiverId ?? null,
    text: row.text ?? null,
    image: row.image ?? row.img ?? null,
    createdAt: row.createdat ?? row.created_at ?? row.createdAt ?? null,
    updatedAt: row.updatedat ?? row.updated_at ?? row.updatedAt ?? null,
  };
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

  return rows.map((r) => mapMessageRow(r));
};

// Minimal helper to insert message (controllers can expand as needed)
export const createMessage = async ({ senderId, receiverId, text, image }) => {
  const { rows } = await pool.query(
    `INSERT INTO messages (senderId, receiverId, text, image) VALUES ($1, $2, $3, $4) RETURNING *`,
    [senderId, receiverId, text ?? null, image ?? null]
  );
  return mapMessageRow(rows[0]);
};

export const fetchMessages = async (userId) => {
  const id = parseInt(userId, 10);
  const { rows } = await pool.query(
    `SELECT * FROM messages WHERE senderId = $1 OR receiverId = $1 ORDER BY createdAt DESC`,
    [id]
  );
  return rows.map((r) => mapMessageRow(r));
};

export default { ensureMessagesTable, createMessage, getMessages, fetchMessages};