# System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                             │
│                    React Application                         │
│                   (http://localhost:3000)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Login/    │  │    Admin     │  │    User      │     │
│  │   Register   │  │  Dashboard   │  │   Stores     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Profile    │  │  Store Owner │  │   Rating     │     │
│  │    Page      │  │  Dashboard   │  │  Component   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │         React Router + Protected Routes          │      │
│  └──────────────────────────────────────────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │      Auth Context (JWT Token Management)         │      │
│  └──────────────────────────────────────────────────┘      │
│                                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS (Axios)
                         │ JSON Data
                         │
┌────────────────────────▼────────────────────────────────────┐
│                         BACKEND                              │
│                    Express.js API                            │
│                   (http://localhost:5000)                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │              API Routes                           │      │
│  │  /api/auth  /api/admin  /api/stores  /api/ratings│      │
│  └──────────────────────────────────────────────────┘      │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────┐       │
│  │            Middleware Layer                      │       │
│  │  • Authentication (JWT Verify)                   │       │
│  │  • Authorization (Role Check)                    │       │
│  │  • Validation (Input Sanitization)               │       │
│  │  • Error Handling                                │       │
│  └──────────────────────────────────────────────────┘       │
│                         │                                    │
│  ┌──────────────────────▼──────────────────────────┐       │
│  │              Controllers                         │       │
│  │  • authController                                │       │
│  │  • adminController                               │       │
│  │  • storeController                               │       │
│  │  • ratingController                              │       │
│  └──────────────────────────────────────────────────┘       │
│                         │                                    │
└─────────────────────────┼────────────────────────────────────┘
                          │
                          │ SQL Queries (pg)
                          │
┌─────────────────────────▼────────────────────────────────────┐
│                      DATABASE                                │
│                    PostgreSQL                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    users     │  │    stores    │  │   ratings    │     │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤     │
│  │ id           │  │ id           │  │ id           │     │
│  │ name         │  │ owner_id (FK)│  │ user_id (FK) │     │
│  │ email        │  │ name         │  │ store_id(FK) │     │
│  │ password     │  │ email        │  │ rating       │     │
│  │ address      │  │ address      │  │ created_at   │     │
│  │ role         │  │ created_at   │  │ updated_at   │     │
│  │ created_at   │  │ updated_at   │  └──────────────┘     │
│  │ updated_at   │  └──────────────┘                        │
│  └──────────────┘                                           │
│                                                              │
│  Relationships:                                              │
│  • stores.owner_id → users.id                               │
│  • ratings.user_id → users.id                               │
│  • ratings.store_id → stores.id                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Authentication Flow

```
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 1. POST /api/auth/login
     │    { email, password }
     │
     ▼
┌─────────────────┐
│  Auth Controller│
└────┬────────────┘
     │
     │ 2. Query user by email
     │
     ▼
┌─────────────────┐
│   Database      │
└────┬────────────┘
     │
     │ 3. Return user data
     │
     ▼
┌─────────────────┐
│  Auth Controller│
├─────────────────┤
│ 4. Compare      │
│    passwords    │
│    (bcrypt)     │
└────┬────────────┘
     │
     │ 5. Generate JWT
     │    with user data
     │    and role
     │
     ▼
┌──────────┐
│  Client  │
├──────────┤
│ 6. Store │
│   token  │
│   in     │
│   localStorage
└────┬─────┘
     │
     │ 7. All future requests
     │    include token in
     │    Authorization header
     │
     ▼
┌─────────────────┐
│  Middleware     │
├─────────────────┤
│ 8. Verify token │
│    Decode user  │
│    Check role   │
└─────────────────┘
```

---

## User Registration Flow

```
┌──────────┐
│  Client  │
│ (Register│
│   Form)  │
└────┬─────┘
     │
     │ 1. Client-side validation
     │    • Name: 20-60 chars
     │    • Email: valid format
     │    • Password: 8-16, uppercase, special
     │    • Address: max 400 chars
     │
     ▼
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 2. POST /api/auth/register
     │    { name, email, password, address }
     │
     ▼
┌─────────────────┐
│  Validator      │
│  Middleware     │
└────┬────────────┘
     │
     │ 3. Server-side validation
     │    (same rules as client)
     │
     ▼
┌─────────────────┐
│  Auth Controller│
└────┬────────────┘
     │
     │ 4. Hash password (bcrypt)
     │
     ▼
┌─────────────────┐
│   Database      │
├─────────────────┤
│ 5. INSERT user  │
│    with role =  │
│    'user'       │
└────┬────────────┘
     │
     │ 6. Return user + JWT
     │
     ▼
┌──────────┐
│  Client  │
├──────────┤
│ 7. Store │
│   token  │
│ 8. Redirect to│
│   /stores     │
└───────────────┘
```

---

## Rating Submission Flow

```
┌──────────┐
│   User   │
│ (Logged) │
└────┬─────┘
     │
     │ 1. View stores list
     │    GET /api/stores
     │
     ▼
┌─────────────────┐
│  Store List     │
│  (with ratings) │
└────┬────────────┘
     │
     │ 2. Click "Rate Store"
     │
     ▼
┌─────────────────┐
│  Rating Modal   │
│  (Star selector)│
└────┬────────────┘
     │
     │ 3. Select 1-5 stars
     │
     ▼
┌──────────┐
│  Client  │
└────┬─────┘
     │
     │ 4. POST /api/ratings
     │    { storeId, rating }
     │    + JWT token
     │
     ▼
┌─────────────────┐
│  Auth Middleware│
├─────────────────┤
│ 5. Verify token │
│    Check role   │
│    = 'user'     │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Validator      │
├─────────────────┤
│ 6. Validate     │
│    rating 1-5   │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│Rating Controller│
└────┬────────────┘
     │
     │ 7. Check store exists
     │
     ▼
┌─────────────────┐
│   Database      │
├─────────────────┤
│ 8. INSERT or    │
│    UPDATE       │
│    rating       │
│    (UNIQUE      │
│    constraint)  │
└────┬────────────┘
     │
     │ 9. Return success
     │
     ▼
┌──────────┐
│  Client  │
├──────────┤
│ 10. Show │
│   success│
│   message│
│ 11. Refresh│
│   store list│
└───────────────┘
```

---

## Role-Based Access Control

```
┌─────────────────────────────────────────────────────┐
│                   ALL REQUESTS                      │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌────────────────────────────────┐
│    Authentication Middleware    │
│    (Verify JWT Token)           │
└────┬───────────────────────┬───┘
     │                       │
     │ No Token              │ Valid Token
     │                       │
     ▼                       ▼
┌─────────┐      ┌──────────────────────┐
│ 401     │      │ Decode Token         │
│ Error   │      │ Extract: id, email,  │
└─────────┘      │          role        │
                 └────┬─────────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │  Authorization Middleware   │
         │  (Check Role)               │
         └──┬──────────┬──────────┬───┘
            │          │          │
   ┌────────▼───┐ ┌───▼────┐ ┌──▼──────┐
   │   Admin    │ │  User  │ │  Store  │
   │   Routes   │ │ Routes │ │  Owner  │
   │            │ │        │ │  Routes │
   └────────────┘ └────────┘ └─────────┘
        │              │           │
        ▼              ▼           ▼
   Dashboard      View Stores   View
   Manage Users   Rate Stores   Dashboard
   Manage Stores                Ratings
```

---

## Database Relationships

```
┌─────────────────────────────────────────────────────────┐
│                    USERS TABLE                          │
│  • id (PK)                                              │
│  • role (admin | user | store_owner)                    │
└──┬────────────────────────────────────────────────┬─────┘
   │                                                 │
   │ 1:1 (if role = store_owner)                    │ 1:N
   │                                                 │
   ▼                                                 ▼
┌──────────────────────┐                  ┌─────────────────┐
│   STORES TABLE       │                  │  RATINGS TABLE  │
│  • id (PK)           │◄─────────────────┤  • id (PK)      │
│  • owner_id (FK)     │       N:1        │  • user_id (FK) │
│                      │                  │  • store_id(FK) │
└──────────────────────┘                  │  • rating       │
                                          └─────────────────┘

Constraints:
• UNIQUE(user_id, store_id) in ratings
• CASCADE DELETE on all foreign keys
• CHECK rating >= 1 AND rating <= 5
```

---

## Component Hierarchy

```
App
├── AuthProvider (Context)
│
├── Router
│   ├── Public Routes
│   │   ├── Login
│   │   └── Register
│   │
│   ├── Admin Routes (Protected)
│   │   ├── AdminDashboard
│   │   ├── AdminUsers
│   │   │   └── UserModal
│   │   └── AdminStores
│   │       └── StoreModal
│   │
│   ├── User Routes (Protected)
│   │   └── UserStores
│   │       └── RatingModal
│   │           └── RatingStars
│   │
│   ├── Store Owner Routes (Protected)
│   │   └── StoreOwnerDashboard
│   │       └── RatingStars
│   │
│   └── Common Routes (Protected)
│       └── Profile
│
└── Navbar (Conditional rendering based on role)
```

---

## File Structure Details

```
backend/
├── src/
│   ├── config/
│   │   └── database.js           # PostgreSQL connection pool
│   │
│   ├── controllers/
│   │   ├── authController.js     # Login, register, password
│   │   ├── adminController.js    # Dashboard, users, stores
│   │   ├── storeController.js    # Store CRUD, owner dashboard
│   │   └── ratingController.js   # Submit, view ratings
│   │
│   ├── middleware/
│   │   ├── auth.js              # JWT verification & RBAC
│   │   ├── validators.js        # Input validation rules
│   │   └── errorHandler.js      # Centralized error handling
│   │
│   ├── migrations/
│   │   └── runMigrations.js     # Database setup script
│   │
│   └── routes/
│       ├── authRoutes.js        # /api/auth/*
│       ├── adminRoutes.js       # /api/admin/*
│       ├── storeRoutes.js       # /api/stores/*
│       └── ratingRoutes.js      # /api/ratings/*
│
├── server.js                     # Express app entry point
├── package.json
├── .env.example
└── .gitignore

frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.js            # Navigation bar
│   │   ├── PrivateRoute.js      # Route protection
│   │   └── RatingStars.js       # Star rating UI
│   │
│   ├── context/
│   │   └── AuthContext.js       # Global auth state
│   │
│   ├── pages/
│   │   ├── Login.js
│   │   ├── Register.js
│   │   ├── Profile.js
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminUsers.js
│   │   │   └── AdminStores.js
│   │   │
│   │   ├── user/
│   │   │   └── UserStores.js
│   │   │
│   │   └── storeOwner/
│   │       └── StoreOwnerDashboard.js
│   │
│   ├── utils/
│   │   ├── api.js               # Axios configuration
│   │   └── validation.js        # Validation functions
│   │
│   ├── App.js                   # Main app component
│   ├── index.js                 # React entry point
│   └── index.css                # Global styles
│
├── public/
│   └── index.html
│
├── package.json
└── .gitignore
```

This architecture ensures:

- ✅ Separation of concerns
- ✅ Scalability
- ✅ Maintainability
- ✅ Security
- ✅ Testability
