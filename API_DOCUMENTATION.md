# API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

---

## Authentication Endpoints

### Register User

**POST** `/auth/register`

Register a new normal user.

**Request Body:**

```json
{
  "name": "John Doe Example User Name",
  "email": "user@example.com",
  "password": "Password@123",
  "address": "123 Main St, City, Country"
}
```

**Response:**

```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "name": "John Doe Example User Name",
    "email": "user@example.com",
    "address": "123 Main St, City, Country",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Login

**POST** `/auth/login`

Login with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "Password@123"
}
```

**Response:**

```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "name": "John Doe Example User Name",
    "email": "user@example.com",
    "address": "123 Main St, City, Country",
    "role": "user",
    "storeId": null
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### Get Profile

**GET** `/auth/profile`

Get current user profile (requires authentication).

**Response:**

```json
{
  "user": {
    "id": 1,
    "name": "John Doe Example User Name",
    "email": "user@example.com",
    "address": "123 Main St, City, Country",
    "role": "user",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Update Password

**PUT** `/auth/password`

Update user password (requires authentication).

**Request Body:**

```json
{
  "currentPassword": "OldPassword@123",
  "newPassword": "NewPassword@123"
}
```

**Response:**

```json
{
  "message": "Password updated successfully"
}
```

---

## Admin Endpoints

All admin endpoints require admin role authentication.

### Get Dashboard Stats

**GET** `/admin/dashboard`

Get dashboard statistics.

**Response:**

```json
{
  "stats": {
    "total_users": 50,
    "total_stores": 25,
    "total_ratings": 150
  }
}
```

---

### Create User

**POST** `/admin/users`

Create a new user or admin.

**Request Body:**

```json
{
  "name": "Jane Smith Administrator User",
  "email": "admin2@example.com",
  "password": "Admin@123",
  "address": "456 Admin St, City",
  "role": "admin"
}
```

**Response:**

```json
{
  "message": "User created successfully",
  "user": {
    "id": 2,
    "name": "Jane Smith Administrator User",
    "email": "admin2@example.com",
    "address": "456 Admin St, City",
    "role": "admin",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Get All Users

**GET** `/admin/users`

Get all users with filtering, sorting, and pagination.

**Query Parameters:**

- `name` (optional): Filter by name (case-insensitive partial match)
- `email` (optional): Filter by email (case-insensitive partial match)
- `address` (optional): Filter by address (case-insensitive partial match)
- `role` (optional): Filter by role (exact match: admin, user, store_owner)
- `sortBy` (optional): Sort column (name, email, address, role, created_at) - default: created_at
- `sortOrder` (optional): Sort order (ASC, DESC) - default: DESC
- `page` (optional): Page number - default: 1
- `limit` (optional): Items per page - default: 10

**Example Request:**

```
GET /admin/users?role=user&sortBy=name&sortOrder=ASC&page=1&limit=10
```

**Response:**

```json
{
  "users": [
    {
      "id": 1,
      "name": "John Doe Example User Name",
      "email": "user@example.com",
      "address": "123 Main St",
      "role": "user",
      "created_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalUsers": 50,
    "limit": 10
  }
}
```

---

### Get User By ID

**GET** `/admin/users/:id`

Get detailed user information by ID.

**Response:**

```json
{
  "user": {
    "id": 1,
    "name": "Store Owner Example Name Here",
    "email": "owner@example.com",
    "address": "789 Store St",
    "role": "store_owner",
    "created_at": "2024-01-01T00:00:00.000Z",
    "store_id": 1,
    "store_name": "Example Store With Long Name Here",
    "average_rating": 4.5
  }
}
```

---

### Get All Stores (Admin)

**GET** `/admin/stores`

Get all stores with filtering, sorting, and pagination.

**Query Parameters:**

- `name` (optional): Filter by name
- `email` (optional): Filter by email
- `address` (optional): Filter by address
- `sortBy` (optional): Sort column (name, email, address, rating, created_at)
- `sortOrder` (optional): Sort order (ASC, DESC)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**

```json
{
  "stores": [
    {
      "id": 1,
      "name": "Example Store With Long Name Here",
      "email": "store@example.com",
      "address": "123 Store Ave",
      "created_at": "2024-01-01T00:00:00.000Z",
      "average_rating": 4.5,
      "total_ratings": 25
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalStores": 25,
    "limit": 10
  }
}
```

---

## Store Endpoints

### Create Store

**POST** `/stores`

Create a new store (Admin only).

**Request Body:**

```json
{
  "name": "New Store With Very Long Name Example",
  "email": "newstore@example.com",
  "address": "456 New Store Boulevard, City, State, Country with more details",
  "ownerName": "Store Owner Full Name Example Here",
  "ownerPassword": "Owner@123"
}
```

**Response:**

```json
{
  "message": "Store created successfully",
  "store": {
    "id": 2,
    "owner_id": 5,
    "name": "New Store With Very Long Name Example",
    "email": "newstore@example.com",
    "address": "456 New Store Boulevard, City, State, Country with more details",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Get All Stores (User)

**GET** `/stores`

Get all stores with user's ratings (Normal users only).

**Query Parameters:**

- `name` (optional): Search by store name
- `address` (optional): Search by address
- `sortBy` (optional): Sort column (name, address, rating)
- `sortOrder` (optional): Sort order (ASC, DESC)
- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**

```json
{
  "stores": [
    {
      "id": 1,
      "name": "Example Store With Long Name Here",
      "address": "123 Store Ave",
      "average_rating": 4.5,
      "total_ratings": 25,
      "user_rating": 5
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalStores": 25,
    "limit": 10
  }
}
```

---

### Get Store Owner Dashboard

**GET** `/stores/owner/dashboard`

Get store owner's dashboard data (Store owners only).

**Response:**

```json
{
  "storeId": 1,
  "averageRating": "4.50",
  "totalRatings": 25,
  "ratings": [
    {
      "id": 1,
      "name": "John Doe Example User Name",
      "email": "user@example.com",
      "rating": 5,
      "rated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

## Rating Endpoints

All rating endpoints require normal user authentication.

### Submit Rating

**POST** `/ratings`

Submit or update a rating for a store.

**Request Body:**

```json
{
  "storeId": 1,
  "rating": 5
}
```

**Response:**

```json
{
  "message": "Rating submitted successfully",
  "rating": {
    "id": 1,
    "user_id": 1,
    "store_id": 1,
    "rating": 5,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Get User's Rating

**GET** `/ratings/store/:storeId/my-rating`

Get user's rating for a specific store.

**Response:**

```json
{
  "rating": {
    "id": 1,
    "rating": 5,
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### Get Store Ratings

**GET** `/ratings/store/:storeId`

Get all ratings for a store.

**Query Parameters:**

- `page` (optional): Page number
- `limit` (optional): Items per page

**Response:**

```json
{
  "ratings": [
    {
      "id": 1,
      "rating": 5,
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "user_id": 1,
      "user_name": "John Doe Example User Name",
      "user_email": "user@example.com"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalRatings": 25,
    "limit": 10
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "error": "Validation Error",
  "errors": [
    {
      "msg": "Name must be between 20 and 60 characters",
      "param": "name"
    }
  ]
}
```

### 401 Unauthorized

```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden

```json
{
  "error": "Access denied"
}
```

### 404 Not Found

```json
{
  "error": "Resource not found"
}
```

### 409 Conflict

```json
{
  "error": "Resource already exists",
  "message": "A record with this email already exists"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal Server Error"
}
```
