const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const pool = require("../config/database");

const storeController = {
  // Create new store (Admin only)
  createStore: async (req, res, next) => {
    const client = await pool.connect();

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, address, ownerName, ownerPassword } = req.body;

      await client.query("BEGIN");

      // Hash password
      const hashedPassword = await bcrypt.hash(ownerPassword, 10);

      // Create store owner user
      const userResult = await client.query(
        `INSERT INTO users (name, email, password, address, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [ownerName, email, hashedPassword, address, "store_owner"]
      );

      const ownerId = userResult.rows[0].id;

      // Create store
      const storeResult = await client.query(
        `INSERT INTO stores (owner_id, name, email, address)
         VALUES ($1, $2, $3, $4)
         RETURNING id, owner_id, name, email, address, created_at`,
        [ownerId, name, email, address]
      );

      await client.query("COMMIT");

      res.status(201).json({
        message: "Store created successfully",
        store: storeResult.rows[0],
      });
    } catch (error) {
      await client.query("ROLLBACK");
      next(error);
    } finally {
      client.release();
    }
  },

  // Get all stores (for normal users)
  getAllStores: async (req, res, next) => {
    try {
      const {
        name,
        address,
        sortBy = "name",
        sortOrder = "ASC",
        page = 1,
        limit = 10,
      } = req.query;

      const userId = req.user.id;

      let whereConditions = [];
      let queryParams = [userId];
      let paramIndex = 2;

      // Build WHERE clause
      if (name) {
        whereConditions.push(`s.name ILIKE $${paramIndex}`);
        queryParams.push(`%${name}%`);
        paramIndex++;
      }
      if (address) {
        whereConditions.push(`s.address ILIKE $${paramIndex}`);
        queryParams.push(`%${address}%`);
        paramIndex++;
      }

      const whereClause =
        whereConditions.length > 0
          ? `AND ${whereConditions.join(" AND ")}`
          : "";

      // Validate sort column
      const allowedSortColumns = ["name", "address", "rating"];
      const sortColumn =
        sortBy === "rating"
          ? "average_rating"
          : allowedSortColumns.includes(sortBy)
          ? `s.${sortBy}`
          : "s.name";
      const order = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

      // Calculate offset
      const offset = (page - 1) * limit;

      // Get total count
      const countQuery = `
        SELECT COUNT(DISTINCT s.id)
        FROM stores s
        WHERE 1=1 ${whereClause}
      `;
      const countResult = await pool.query(countQuery, queryParams.slice(1));
      const totalStores = parseInt(countResult.rows[0].count);

      // Get stores with ratings
      const storesQuery = `
        SELECT s.id, s.name, s.address,
               COALESCE(AVG(r.rating), 0) as average_rating,
               COUNT(r.id) as total_ratings,
               ur.rating as user_rating
        FROM stores s
        LEFT JOIN ratings r ON s.id = r.store_id
        LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $1
        WHERE 1=1 ${whereClause}
        GROUP BY s.id, ur.rating
        ORDER BY ${sortColumn} ${order}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      queryParams.push(limit, offset);

      const result = await pool.query(storesQuery, queryParams);

      res.json({
        stores: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalStores / limit),
          totalStores,
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get store details
  getStoreById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      const query = `
        SELECT s.id, s.name, s.email, s.address, s.created_at,
               COALESCE(AVG(r.rating), 0) as average_rating,
               COUNT(r.id) as total_ratings,
               ur.rating as user_rating
        FROM stores s
        LEFT JOIN ratings r ON s.id = r.store_id
        LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $2
        WHERE s.id = $1
        GROUP BY s.id, ur.rating
      `;

      const result = await pool.query(query, [id, userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Store not found" });
      }

      res.json({ store: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  // Get store dashboard (for store owners)
  getStoreDashboard: async (req, res, next) => {
    try {
      const userId = req.user.id;

      // Get store owned by user
      const storeResult = await pool.query(
        "SELECT id FROM stores WHERE owner_id = $1",
        [userId]
      );

      if (storeResult.rows.length === 0) {
        return res.status(404).json({ error: "No store found for this user" });
      }

      const storeId = storeResult.rows[0].id;

      // Get average rating
      const ratingResult = await pool.query(
        `SELECT COALESCE(AVG(rating), 0) as average_rating, COUNT(*) as total_ratings
         FROM ratings WHERE store_id = $1`,
        [storeId]
      );

      // Get users who rated
      const usersResult = await pool.query(
        `SELECT u.id, u.name, u.email, r.rating, r.created_at as rated_at
         FROM ratings r
         JOIN users u ON r.user_id = u.id
         WHERE r.store_id = $1
         ORDER BY r.created_at DESC`,
        [storeId]
      );

      res.json({
        storeId,
        averageRating: parseFloat(ratingResult.rows[0].average_rating).toFixed(
          2
        ),
        totalRatings: parseInt(ratingResult.rows[0].total_ratings),
        ratings: usersResult.rows,
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = storeController;
