# Store Rating System

A full-stack web application that allows users to submit ratings for stores registered on the platform. The application implements role-based access control with three different user roles: System Administrator, Normal User, and Store Owner.

## 🚀 Live Demo

**Frontend:** https://store-rating-system-production-6948.up.railway.app  
**Backend API:** https://backend-production-0879.up.railway.app

**Admin Credentials:**
- Email: admin@example.com
- Password: Admin@123

## Tech Stack

### Backend

- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: express-validator
- **Password Hashing**: bcryptjs

### Frontend

- **Framework**: React 18
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Custom CSS

## Features

### System Administrator

- ✅ Add new stores, normal users, and admin users
- ✅ Dashboard displaying total users, stores, and ratings
- ✅ View and filter lists of users and stores
- ✅ Sort tables by various columns (ascending/descending)
- ✅ View detailed user information including ratings for store owners

### Normal User

- ✅ Sign up and login functionality
- ✅ Update password after logging in
- ✅ View all registered stores with ratings
- ✅ Search stores by name and address
- ✅ Submit ratings (1-5) for stores
- ✅ Modify their submitted ratings
- ✅ Sort stores by name, address, or rating

### Store Owner

- ✅ Login functionality
- ✅ Update password after logging in
- ✅ View dashboard with average store rating
- ✅ View list of users who rated their store
- ✅ See rating history

## Form Validations

All forms implement both client-side and server-side validation:

- **Name**: 20-60 characters
- **Address**: Maximum 400 characters
- **Password**: 8-16 characters, at least one uppercase letter and one special character
- **Email**: Standard email validation

## Database Schema

### Users Table

```sql
- id (Primary Key)
- name (VARCHAR 60)
- email (VARCHAR 255, Unique)
- password (VARCHAR 255, Hashed)
- address (VARCHAR 400)
- role (ENUM: 'admin', 'user', 'store_owner')
- created_at (Timestamp)
- updated_at (Timestamp)
```

### Stores Table

```sql
- id (Primary Key)
- owner_id (Foreign Key -> Users)
- name (VARCHAR 60)
- email (VARCHAR 255, Unique)
- address (VARCHAR 400)
- created_at (Timestamp)
- updated_at (Timestamp)
```

### Ratings Table

```sql
- id (Primary Key)
- user_id (Foreign Key -> Users)
- store_id (Foreign Key -> Stores)
- rating (INTEGER 1-5)
- created_at (Timestamp)
- updated_at (Timestamp)
- UNIQUE constraint on (user_id, store_id)
```

## Installation & Setup

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

4. Update the `.env` file with your database credentials:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=store_rating_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
```

5. Create the PostgreSQL database:

```bash
createdb store_rating_db
```

6. Run database migrations:

```bash
npm run migrate
```

This will create all tables and insert a default admin user.

7. Start the development server:

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The frontend will run on `http://localhost:3000`

## Default Admin Credentials

After running migrations, you can login with:

- **Email**: admin@example.com
- **Password**: Admin@123

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Get current user profile (Protected)
- `PUT /api/auth/password` - Update password (Protected)

### Admin Routes (Admin only)

- `GET /api/admin/dashboard` - Get dashboard statistics
- `POST /api/admin/users` - Create new user/admin
- `GET /api/admin/users` - Get all users with filters
- `GET /api/admin/users/:id` - Get user details
- `GET /api/admin/stores` - Get all stores with filters

### Store Routes

- `POST /api/stores` - Create new store (Admin only)
- `GET /api/stores` - Get all stores (Normal users)
- `GET /api/stores/:id` - Get store details
- `GET /api/stores/owner/dashboard` - Get store owner dashboard (Store owners)

### Rating Routes (Normal users only)

- `POST /api/ratings` - Submit or update rating
- `GET /api/ratings/store/:storeId/my-rating` - Get user's rating for a store
- `GET /api/ratings/store/:storeId` - Get all ratings for a store

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── adminController.js
│   │   │   ├── storeController.js
│   │   │   └── ratingController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── validators.js
│   │   │   └── errorHandler.js
│   │   ├── migrations/
│   │   │   └── runMigrations.js
│   │   └── routes/
│   │       ├── authRoutes.js
│   │       ├── adminRoutes.js
│   │       ├── storeRoutes.js
│   │       └── ratingRoutes.js
│   ├── server.js
│   ├── package.json
│   └── .env
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   ├── PrivateRoute.js
    │   │   └── RatingStars.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Profile.js
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.js
    │   │   │   ├── AdminUsers.js
    │   │   │   └── AdminStores.js
    │   │   ├── user/
    │   │   │   └── UserStores.js
    │   │   └── storeOwner/
    │   │       └── StoreOwnerDashboard.js
    │   ├── utils/
    │   │   ├── api.js
    │   │   └── validation.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## Best Practices Implemented

### Backend

- ✅ RESTful API design
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Input validation and sanitization
- ✅ Error handling middleware
- ✅ Password hashing with bcrypt
- ✅ SQL injection prevention with parameterized queries
- ✅ Database indexing for performance
- ✅ Environment variable configuration
- ✅ CORS enabled for frontend integration

### Frontend

- ✅ Component-based architecture
- ✅ Context API for state management
- ✅ Protected routes based on authentication and roles
- ✅ Client-side form validation
- ✅ Responsive design
- ✅ User-friendly error messages
- ✅ Loading states
- ✅ Pagination for large data sets
- ✅ Sorting and filtering capabilities
- ✅ Token-based authentication with automatic refresh

### Database

- ✅ Normalized schema design
- ✅ Foreign key constraints
- ✅ Unique constraints
- ✅ Check constraints for data integrity
- ✅ Indexes on frequently queried columns
- ✅ Cascading deletes for referential integrity
- ✅ Timestamps for audit trail

## Testing the Application

1. **Register as Normal User**:

   - Go to `/register`
   - Fill in the form (name must be 20-60 chars, password must have uppercase and special char)
   - After registration, you'll be redirected to the stores page

2. **Login as Admin**:

   - Go to `/login`
   - Use: admin@example.com / Admin@123
   - Access dashboard, create users, create stores

3. **Rate Stores**:

   - Login as normal user
   - Go to stores page
   - Click "Rate Store" button
   - Submit rating (1-5 stars)

4. **View Store Dashboard**:
   - Login as store owner (created by admin)
   - View average rating and rating history

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if database exists

### Port Already in Use

- Change `PORT` in backend `.env` file
- Change proxy in frontend `package.json`

### CORS Issues

- Ensure backend URL is correctly set in frontend
- Check CORS configuration in `server.js`

## Future Enhancements

- Add store categories
- Implement review text along with ratings
- Add store images
- Implement email verification
- Add password reset functionality
- Implement admin user management (edit/delete)
- Add analytics and reports
- Implement real-time notifications

## License

MIT

## Author

Roxiler Systems Intern Candidate
