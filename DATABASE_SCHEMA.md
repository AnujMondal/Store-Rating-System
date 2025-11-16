# Database Schema Documentation

## Overview

The database consists of three main tables: `users`, `stores`, and `ratings`. The schema is designed to support a store rating system with role-based access control.

## Entity Relationship Diagram

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ id (PK)         │
│ name            │
│ email (UNIQUE)  │
│ password        │
│ address         │
│ role            │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:1 (if store_owner)
         │
         ▼
┌─────────────────┐          ┌─────────────────┐
│    STORES       │          │    RATINGS      │
├─────────────────┤          ├─────────────────┤
│ id (PK)         │◄────┐    │ id (PK)         │
│ owner_id (FK)   │     │    │ user_id (FK)    │
│ name            │     └────┤ store_id (FK)   │
│ email (UNIQUE)  │          │ rating          │
│ address         │          │ created_at      │
│ created_at      │          │ updated_at      │
│ updated_at      │          │ UNIQUE(user_id, │
└─────────────────┘          │        store_id)│
                             └─────────────────┘
```

## Tables

### 1. Users Table

Stores information about all users in the system (administrators, normal users, and store owners).

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  address VARCHAR(400),
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user', 'store_owner')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

**Columns:**

- `id`: Auto-incrementing primary key
- `name`: User's full name (20-60 characters as per validation)
- `email`: Unique email address
- `password`: Hashed password using bcrypt
- `address`: Optional user address (max 400 characters)
- `role`: User role - one of:
  - `admin`: System administrator
  - `user`: Normal user who can rate stores
  - `store_owner`: Owner of a store
- `created_at`: Timestamp when user was created
- `updated_at`: Timestamp when user was last updated

**Indexes:**

- `idx_users_email`: Index on email for fast lookups during login
- `idx_users_role`: Index on role for filtering users by role

**Constraints:**

- `email` must be unique
- `role` must be one of the three allowed values

---

### 2. Stores Table

Stores information about registered stores.

```sql
CREATE TABLE stores (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(60) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  address VARCHAR(400),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_stores_owner ON stores(owner_id);
```

**Columns:**

- `id`: Auto-incrementing primary key
- `owner_id`: Foreign key reference to users table (store owner)
- `name`: Store name (20-60 characters as per validation)
- `email`: Unique store email
- `address`: Optional store address (max 400 characters)
- `created_at`: Timestamp when store was created
- `updated_at`: Timestamp when store was last updated

**Indexes:**

- `idx_stores_owner`: Index on owner_id for fast owner lookups

**Constraints:**

- `email` must be unique
- `owner_id` references `users(id)` with CASCADE delete (if owner is deleted, store is deleted)

**Relationships:**

- One-to-One with Users (where role = 'store_owner')
- One-to-Many with Ratings

---

### 3. Ratings Table

Stores ratings submitted by users for stores.

```sql
CREATE TABLE ratings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  store_id INTEGER REFERENCES stores(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, store_id)
);

CREATE INDEX idx_ratings_user ON ratings(user_id);
CREATE INDEX idx_ratings_store ON ratings(store_id);
```

**Columns:**

- `id`: Auto-incrementing primary key
- `user_id`: Foreign key reference to users table (who rated)
- `store_id`: Foreign key reference to stores table (which store)
- `rating`: Rating value (1-5)
- `created_at`: Timestamp when rating was created
- `updated_at`: Timestamp when rating was last updated

**Indexes:**

- `idx_ratings_user`: Index on user_id for fast user rating lookups
- `idx_ratings_store`: Index on store_id for fast store rating lookups

**Constraints:**

- `rating` must be between 1 and 5 (inclusive)
- `UNIQUE(user_id, store_id)`: A user can only rate a store once (allows update)
- `user_id` references `users(id)` with CASCADE delete
- `store_id` references `stores(id)` with CASCADE delete

**Relationships:**

- Many-to-One with Users
- Many-to-One with Stores

---

## Common Queries

### Get Average Rating for a Store

```sql
SELECT
  s.id,
  s.name,
  COALESCE(AVG(r.rating), 0) as average_rating,
  COUNT(r.id) as total_ratings
FROM stores s
LEFT JOIN ratings r ON s.id = r.store_id
WHERE s.id = $1
GROUP BY s.id;
```

### Get All Stores with User's Rating

```sql
SELECT
  s.id,
  s.name,
  s.address,
  COALESCE(AVG(r.rating), 0) as average_rating,
  COUNT(r.id) as total_ratings,
  ur.rating as user_rating
FROM stores s
LEFT JOIN ratings r ON s.id = r.store_id
LEFT JOIN ratings ur ON s.id = ur.store_id AND ur.user_id = $1
GROUP BY s.id, ur.rating;
```

### Get Users Who Rated a Store

```sql
SELECT
  u.id,
  u.name,
  u.email,
  r.rating,
  r.created_at as rated_at
FROM ratings r
JOIN users u ON r.user_id = u.id
WHERE r.store_id = $1
ORDER BY r.created_at DESC;
```

### Get Dashboard Statistics

```sql
SELECT
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM stores) as total_stores,
  (SELECT COUNT(*) FROM ratings) as total_ratings;
```

---

## Data Integrity

### Referential Integrity

- All foreign key relationships use `ON DELETE CASCADE` to maintain data integrity
- When a user is deleted, their ratings are automatically deleted
- When a store is deleted, all its ratings are automatically deleted
- When a store owner user is deleted, their store is automatically deleted

### Unique Constraints

- Email addresses are unique across users and stores
- A user can only submit one rating per store (enforced at database level)

### Check Constraints

- User role must be one of: admin, user, store_owner
- Rating value must be between 1 and 5

### Indexes

- All foreign keys are indexed for performance
- Email columns are indexed for fast authentication lookups
- Role column is indexed for filtering users

---

## Sample Data

### Sample Admin User

```sql
INSERT INTO users (name, email, password, address, role)
VALUES (
  'System Administrator',
  'admin@example.com',
  '$2a$10$hashed_password_here',
  'System Address',
  'admin'
);
```

### Sample Store with Owner

```sql
-- Create store owner
INSERT INTO users (name, email, password, address, role)
VALUES (
  'Store Owner Full Name Example Here',
  'owner@example.com',
  '$2a$10$hashed_password_here',
  '123 Owner Address',
  'store_owner'
)
RETURNING id; -- returns owner_id

-- Create store
INSERT INTO stores (owner_id, name, email, address)
VALUES (
  <owner_id>,
  'Example Store With Long Name Here',
  'store@example.com',
  '456 Store Address'
);
```

### Sample Rating

```sql
INSERT INTO ratings (user_id, store_id, rating)
VALUES (2, 1, 5)
ON CONFLICT (user_id, store_id)
DO UPDATE SET rating = 5, updated_at = CURRENT_TIMESTAMP;
```

---

## Migration Script

The complete migration script is available in `/backend/src/migrations/runMigrations.js`. It creates all tables, indexes, constraints, and inserts a default admin user.

To run migrations:

```bash
cd backend
npm run migrate
```

---

## Performance Considerations

1. **Indexes**: All foreign keys and frequently queried columns are indexed
2. **Aggregations**: Use `COALESCE` to handle NULL values in aggregations
3. **Joins**: Use appropriate JOIN types (LEFT JOIN for optional relationships)
4. **Pagination**: Implement LIMIT and OFFSET for large result sets
5. **Connection Pooling**: Use pg Pool for efficient database connections

---

## Backup and Maintenance

### Backup Database

```bash
pg_dump -U postgres -d store_rating_db > backup.sql
```

### Restore Database

```bash
psql -U postgres -d store_rating_db < backup.sql
```

### View Table Sizes

```sql
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```
