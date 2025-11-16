const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { authenticate, authorize } = require("../middleware/auth");
const validators = require("../middleware/validators");

// All routes require admin authentication
router.use(authenticate);
router.use(authorize("admin"));

// Dashboard stats
router.get("/dashboard", adminController.getDashboardStats);

// User management
router.post("/users", validators.registerUser, adminController.createUser);
router.get("/users", validators.paginationQuery, adminController.getAllUsers);
router.get("/users/:id", adminController.getUserById);

// Store management
router.get("/stores", validators.paginationQuery, adminController.getAllStores);

module.exports = router;
