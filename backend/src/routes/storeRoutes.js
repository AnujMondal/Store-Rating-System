const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");
const { authenticate, authorize } = require("../middleware/auth");
const validators = require("../middleware/validators");

// Admin only: Create store
router.post(
  "/",
  authenticate,
  authorize("admin"),
  validators.createStore,
  storeController.createStore
);

// Normal users: View stores
router.get(
  "/",
  authenticate,
  authorize("user"),
  validators.paginationQuery,
  storeController.getAllStores
);

router.get("/:id", authenticate, storeController.getStoreById);

// Store owner: Dashboard
router.get(
  "/owner/dashboard",
  authenticate,
  authorize("store_owner"),
  storeController.getStoreDashboard
);

module.exports = router;
