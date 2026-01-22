 // middleware/auth.js
import jwt from "jsonwebtoken";

// Ensure JWT_SECRET is defined in .env
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables!");
}

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Verify JWT token
 */
export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // contains { id, role }
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(403).json({ error: "Invalid or expired token." });
  }
}

/**
 * Role-based access middleware
 */
export function isAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Admin access required." });
  }
  next();
}

export function isInstructor(req, res, next) {
  if (!req.user || req.user.role !== "instructor") {
    return res.status(403).json({ error: "Instructor access required." });
  }
  next();
}

export function isTrainee(req, res, next) {
  if (!req.user || req.user.role !== "trainee") {
    return res.status(403).json({ error: "Trainee access required." });
  }
  next();
}
