const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const storeRoutes = require("./src/routes/storeRoutes");
const ratingRoutes = require("./src/routes/ratingRoutes");
const errorHandler = require("./src/middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Debug endpoint to check users (remove after use)
app.get("/api/debug/users", async (req, res) => {
  try {
    const pool = require("./src/config/database");
    const result = await pool.query("SELECT id, name, email, role FROM users");
    res.json({ users: result.rows, count: result.rows.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to test login (remove after use)
app.post("/api/debug/test-login", async (req, res) => {
  try {
    const pool = require("./src/config/database");
    const bcrypt = require("bcryptjs");
    const { email, password } = req.body;
    
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    
    if (result.rows.length === 0) {
      return res.json({ error: "User not found", email });
    }
    
    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    
    res.json({
      userFound: true,
      email: user.email,
      role: user.role,
      passwordMatch: isMatch,
      jwtSecret: process.env.JWT_SECRET ? "SET" : "NOT SET",
      adminPassword: process.env.ADMIN_PASSWORD || "NOT SET"
    });
  } catch (error) {
    res.status(500).json({ error: error.message, stack: error.stack });
  }
});

// One-time migration endpoint (remove after use)
app.get("/api/migrate", async (req, res) => {
  try {
    const pool = require("./src/config/database");
    const bcrypt = require("bcryptjs");
    const client = await pool.connect();

    await client.query("BEGIN");

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        address VARCHAR(400),
        role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user', 'store_owner')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create stores table
    await client.query(`
      CREATE TABLE IF NOT EXISTS stores (
        id SERIAL PRIMARY KEY,
        owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(60) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        address VARCHAR(400),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create ratings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, store_id)
      )
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_stores_owner ON stores(owner_id);
      CREATE INDEX IF NOT EXISTS idx_ratings_user ON ratings(user_id);
      CREATE INDEX IF NOT EXISTS idx_ratings_store ON ratings(store_id);
    `);

    // Insert default admin user
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "Admin@123", 10);
    await client.query(
      `INSERT INTO users (name, email, password, address, role)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO NOTHING`,
      [
        "System Administrator",
        process.env.ADMIN_EMAIL || "admin@example.com",
        hashedPassword,
        "System Address",
        "admin",
      ]
    );

    await client.query("COMMIT");
    client.release();

    res.json({
      success: true,
      message: "Migration completed successfully",
      admin: {
        email: process.env.ADMIN_EMAIL || "admin@example.com",
        password: "Admin@123"
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/ratings", ratingRoutes);

// Error handler (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
