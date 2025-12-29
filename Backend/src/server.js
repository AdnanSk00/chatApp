import express from 'express';
import path from 'path';
import { ENV } from './lib/env.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import userRoutes from './routes/user.route.js';

import { app, server } from "./lib/socket.js";

const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;
 
// Ensure CORS runs before body parsing so preflight requests get the proper headers
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }))

// Increase body size limits to accept image data URLs (base64) coming from client
app.use(express.json({ limit: '10mb' })); // req.body
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// make ready for deployment
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")))

  app.get("*", (_, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"))
  })
}

import { connectDB } from './lib/db.js';
import { ensureUsersTable } from './models/User.js';
import { ensureMessagesTable } from './models/Message.js';

// initialize DB and start server
(async () => {
  try {
    await connectDB();
    // create tables (schema-related tasks should live in their models)
    await ensureUsersTable();
    await ensureMessagesTable();

    server.listen(PORT, () => console.log("Server is running on port: " + PORT));
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the process using it or set a different PORT in your .env file.`);
        process.exit(1);
      } else {
        console.error('Server error:', err);
        process.exit(1);
      }
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();

