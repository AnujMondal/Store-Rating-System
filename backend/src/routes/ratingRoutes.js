const express = require("express");
const router = express.Router();
const ratingController = require("../controllers/ratingController");
const { authenticate, authorize } = require("../middleware/auth");
const validators = require("../middleware/validators");

// Normal users only
router.use(authenticate);
router.use(authorize("user"));

// Submit or update rating
router.post("/", validators.submitRating, ratingController.submitRating);

// Get user's rating for a store
router.get("/store/:storeId/my-rating", ratingController.getUserRating);

// Get all ratings for a store
router.get(
  "/store/:storeId",
  validators.paginationQuery,
  ratingController.getStoreRatings
);

module.exports = router;
