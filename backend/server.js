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

// One-time migration endpoint (remove after use)
app.get("/api/migrate", async (req, res) => {
  try {
    const { exec } = require("child_process");
    const util = require("util");
    const execPromise = util.promisify(exec);
    
    const { stdout, stderr } = await execPromise("node src/migrations/runMigrations.js");
    res.json({ 
      success: true, 
      message: "Migration completed",
      output: stdout,
      errors: stderr 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: error.toString()
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
