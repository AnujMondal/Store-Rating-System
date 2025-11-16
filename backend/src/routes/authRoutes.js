const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const validators = require("../middleware/validators");

// Public routes
router.post("/register", validators.registerUser, authController.register);
router.post("/login", validators.loginUser, authController.login);

// Protected routes
router.get("/profile", authenticate, authController.getProfile);
router.put(
  "/password",
  authenticate,
  validators.updatePassword,
  authController.updatePassword
);

module.exports = router;
