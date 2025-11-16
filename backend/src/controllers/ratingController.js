const { validationResult } = require("express-validator");
const pool = require("../config/database");

const ratingController = {
  // Submit or update rating
  submitRating: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { storeId, rating } = req.body;
      const userId = req.user.id;

      // Check if store exists
      const storeCheck = await pool.query(
        "SELECT id FROM stores WHERE id = $1",
        [storeId]
      );

      if (storeCheck.rows.length === 0) {
        return res.status(404).json({ error: "Store not found" });
      }

      // Insert or update rating
      const result = await pool.query(
        `INSERT INTO ratings (user_id, store_id, rating)
         VALUES ($1, $2, $3)
         ON CONFLICT (user_id, store_id)
         DO UPDATE SET rating = $3, updated_at = CURRENT_TIMESTAMP
         RETURNING id, user_id, store_id, rating, created_at, updated_at`,
        [userId, storeId, rating]
      );

      res.status(201).json({
        message: "Rating submitted successfully",
        rating: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user's rating for a store
  getUserRating: async (req, res, next) => {
    try {
      const { storeId } = req.params;
      const userId = req.user.id;

      const result = await pool.query(
        `SELECT id, rating, created_at, updated_at
         FROM ratings
         WHERE user_id = $1 AND store_id = $2`,
        [userId, storeId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "No rating found" });
      }

      res.json({ rating: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  // Get all ratings for a store (with user details)
  getStoreRatings: async (req, res, next) => {
    try {
      const { storeId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await pool.query(
        "SELECT COUNT(*) FROM ratings WHERE store_id = $1",
        [storeId]
      );
      const totalRatings = parseInt(countResult.rows[0].count);

      // Get ratings with user details
      const result = await pool.query(
        `SELECT r.id, r.rating, r.created_at, r.updated_at,
                u.id as user_id, u.name as user_name, u.email as user_email
         FROM ratings r
         JOIN users u ON r.user_id = u.id
         WHERE r.store_id = $1
         ORDER BY r.created_at DESC
         LIMIT $2 OFFSET $3`,
        [storeId, limit, offset]
      );

      res.json({
        ratings: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalRatings / limit),
          totalRatings,
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = ratingController;
