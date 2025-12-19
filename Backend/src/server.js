import express from 'express';
import path from 'path';
import { ENV } from './lib/env.js';

import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';

const app = express();
const __dirname = path.resolve();

const PORT = ENV.PORT || 3000;
app.use(express.json()) // req.body

app.use("/api/auth", authRoutes)
app.use("/api/messages", messageRoutes)

// make ready for deployment
if(ENV.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../frontend/dist")))

    app.get("*", (_, res) => {
        res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"))
    })
}

import { initializeDB } from './lib/db.js';

// initialize DB and start server
(async () => {
  try {
    await initializeDB();
    app.listen(PORT, () => console.log("Server is running on port: " + PORT));
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();

