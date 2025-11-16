const { body, param, query } = require("express-validator");

const validators = {
  // User validation
  registerUser: [
    body("name")
      .trim()
      .isLength({ min: 20, max: 60 })
      .withMessage("Name must be between 20 and 60 characters"),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Must be a valid email address")
      .normalizeEmail(),
    body("password")
      .isLength({ min: 8, max: 16 })
      .withMessage("Password must be between 8 and 16 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("Password must contain at least one special character"),
    body("address")
      .optional()
      .trim()
      .isLength({ max: 400 })
      .withMessage("Address must not exceed 400 characters"),
  ],

  loginUser: [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Must be a valid email address")
      .normalizeEmail(),
    body("password").notEmpty().withMessage("Password is required"),
  ],

  updatePassword: [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 8, max: 16 })
      .withMessage("Password must be between 8 and 16 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("Password must contain at least one special character"),
  ],

  // Store validation
  createStore: [
    body("name")
      .trim()
      .isLength({ min: 20, max: 60 })
      .withMessage("Store name must be between 20 and 60 characters"),
    body("email")
      .trim()
      .isEmail()
      .withMessage("Must be a valid email address")
      .normalizeEmail(),
    body("address")
      .optional()
      .trim()
      .isLength({ max: 400 })
      .withMessage("Address must not exceed 400 characters"),
    body("ownerName")
      .trim()
      .isLength({ min: 20, max: 60 })
      .withMessage("Owner name must be between 20 and 60 characters"),
    body("ownerPassword")
      .isLength({ min: 8, max: 16 })
      .withMessage("Password must be between 8 and 16 characters")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[!@#$%^&*(),.?":{}|<>]/)
      .withMessage("Password must contain at least one special character"),
  ],

  // Rating validation
  submitRating: [
    body("storeId").isInt({ min: 1 }).withMessage("Valid store ID is required"),
    body("rating")
      .isInt({ min: 1, max: 5 })
      .withMessage("Rating must be between 1 and 5"),
  ],

  // Query parameter validations
  paginationQuery: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
  ],
};

module.exports = validators;
