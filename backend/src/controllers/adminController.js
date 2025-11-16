const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const pool = require("../config/database");

const adminController = {
  // Get dashboard stats
  getDashboardStats: async (req, res, next) => {
    try {
      const statsQuery = `
        SELECT 
          (SELECT COUNT(*) FROM users) as total_users,
          (SELECT COUNT(*) FROM stores) as total_stores,
          (SELECT COUNT(*) FROM ratings) as total_ratings
      `;

      const result = await pool.query(statsQuery);
      res.json({ stats: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  // Create user (admin or normal user)
  createUser: async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, address, role } = req.body;

      // Validate role
      if (!["admin", "user"].includes(role)) {
        return res
          .status(400)
          .json({ error: "Invalid role. Must be admin or user" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user
      const result = await pool.query(
        `INSERT INTO users (name, email, password, address, role)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, name, email, address, role, created_at`,
        [name, email, hashedPassword, address, role]
      );

      res.status(201).json({
        message: "User created successfully",
        user: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  },

  // Get all users with filtering and sorting
  getAllUsers: async (req, res, next) => {
    try {
      const {
        name,
        email,
        address,
        role,
        sortBy = "created_at",
        sortOrder = "DESC",
        page = 1,
        limit = 10,
      } = req.query;

      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      // Build WHERE clause
      if (name) {
        whereConditions.push(`name ILIKE $${paramIndex}`);
        queryParams.push(`%${name}%`);
        paramIndex++;
      }
      if (email) {
        whereConditions.push(`email ILIKE $${paramIndex}`);
        queryParams.push(`%${email}%`);
        paramIndex++;
      }
      if (address) {
        whereConditions.push(`address ILIKE $${paramIndex}`);
        queryParams.push(`%${address}%`);
        paramIndex++;
      }
      if (role) {
        whereConditions.push(`role = $${paramIndex}`);
        queryParams.push(role);
        paramIndex++;
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Validate sort column
      const allowedSortColumns = [
        "name",
        "email",
        "address",
        "role",
        "created_at",
      ];
      const sortColumn = allowedSortColumns.includes(sortBy)
        ? sortBy
        : "created_at";
      const order = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

      // Calculate offset
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await pool.query(
        `SELECT COUNT(*) FROM users ${whereClause}`,
        queryParams
      );
      const totalUsers = parseInt(countResult.rows[0].count);

      // Get users
      const usersQuery = `
        SELECT id, name, email, address, role, created_at
        FROM users
        ${whereClause}
        ORDER BY ${sortColumn} ${order}
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;
      queryParams.push(limit, offset);

      const result = await pool.query(usersQuery, queryParams);

      res.json({
        users: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / limit),
          totalUsers,
          limit: parseInt(limit),
        },
      });
    } catch (error) {
      next(error);
    }
  },

  // Get user details by ID
  getUserById: async (req, res, next) => {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT u.id, u.name, u.email, u.address, u.role, u.created_at,
                s.id as store_id, s.name as store_name,
                COALESCE(AVG(r.rating), 0) as average_rating
         FROM users u
         LEFT JOIN stores s ON u.id = s.owner_id
         LEFT JOIN ratings r ON s.id = r.store_id
         WHERE u.id = $1
         GROUP BY u.id, s.id, s.name`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ user: result.rows[0] });
    } catch (error) {
      next(error);
    }
  },

  // Get all stores with filtering and sorting
  getAllStores: async (req, res, next) => {
    try {
      const {
        name,
        email,
        address,
        sortBy = "created_at",
        sortOrder = "DESC",
        page = 1,
        limit = 10,
      } = req.query;

      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      // Build WHERE clause
      if (name) {
        whereConditions.push(`s.name ILIKE $${paramIndex}`);
        queryParams.push(`%${name}%`);
        paramIndex++;
      }
      if (email) {
        whereConditions.push(`s.email ILIKE $${paramIndex}`);
        queryParams.push(`%${email}%`);
        paramIndex++;
      }
      if (address) {
        whereConditions.push(`s.address ILIKE $${paramIndex}`);
        queryParams.push(`%${address}%`);
        paramIndex++;
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Validate sort column
      const allowedSortColumns = [
        "name",
        "email",
        "address",
        "rating",
        "created_at",
      ];
      const sortColumn =
        sortBy === "rating"
          ? "average_rating"
          : allowedSortColumns.includes(sortBy)
          ? `s.${sortBy}`
          : "s.created_at";
      const order = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

      // Calculate offset
      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await pool.query(
        `SELECT COUNT(*) FROM stores s ${whereClause}`,
        queryParams
      );
      const totalStores = parseInt(countResult.rows[0].count);

      // Get stores with ratings
      const storesQuery = `
        SELECT s.id, s.name, s.email, s.address, s.created_at,
               COALESCE(AVG(r.rating), 0) as average_rating,
               COUNT(r.id) as total_ratings
        FROM stores s
        LEFT JOIN ratings r ON s.id = r.store_id
        ${whereClause}
        GROUP BY s.id
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
};

module.exports = adminController;
