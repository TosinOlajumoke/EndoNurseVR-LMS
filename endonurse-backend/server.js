// server.js, for testing
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { pool } from "./config/db.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// =============================================
// ✅ CORS setup
// =============================================
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================================
// ✅ Ensure uploads folder exists
// =============================================
// Use absolute path to backend/uploads — without repeating "backend"
const uploadsBasePath = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsBasePath)) {
  fs.mkdirSync(uploadsBasePath, { recursive: true });
  console.log("📁 Created uploads directory:", uploadsBasePath);
}

// =============================================
// ✅ Serve uploads folder publicly
// =============================================
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


// =============================================
// 🔐 API Routes
// =============================================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// =============================================
// ✅ Root route to test DB
// =============================================
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.send(`✅ EndoNurse LMS Backend Server Running — DB Time: ${result.rows[0].now}`);
  } catch (error) {
    console.error("❌ Database error:", error.message);
    res.status(500).send("Database connection error");
  }
});

// =============================================
// ⚠️ Global Error Handler
// =============================================
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(err.status || 500).json({ error: err.message });
});

// =============================================
// 🚀 Start Server
// =============================================
app.listen(port, () => {
  console.log(`✅ Server running on port ${port}`);
});
