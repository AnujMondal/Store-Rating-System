# Quick Start Guide

This guide will help you get the Store Rating System up and running quickly.

## Prerequisites Check

Before starting, ensure you have:

- ✅ Node.js (v14+) - Run `node --version`
- ✅ npm (v6+) - Run `npm --version`
- ✅ PostgreSQL (v12+) - Run `psql --version`

## Step-by-Step Setup

### 1. Database Setup

```bash
# Start PostgreSQL (if not running)
# macOS with Homebrew:
brew services start postgresql

# Linux:
sudo service postgresql start

# Create database
createdb store_rating_db

# Or using psql:
psql -U postgres
CREATE DATABASE store_rating_db;
\q
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your settings (use nano, vim, or any editor)
nano .env

# Update these values:
# DB_USER=postgres
# DB_PASSWORD=your_postgres_password
# JWT_SECRET=your_random_secret_key_here

# Run migrations (creates tables and admin user)
npm run migrate

# You should see:
# ✅ Database migrations completed successfully
# ✅ Admin user created: admin@example.com

# Start backend server
npm run dev

# Backend is now running on http://localhost:5000
```

### 3. Frontend Setup

```bash
# Open a new terminal window
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start frontend server
npm start

# Frontend will open automatically at http://localhost:3000
```

## 4. Test the Application

### Login as Admin

1. Go to `http://localhost:3000/login`
2. Email: `admin@example.com`
3. Password: `Admin@123`
4. You should see the Admin Dashboard

### Create a Store

1. As admin, go to "Stores" in navigation
2. Click "Add Store" button
3. Fill in the form:
   - Store Name: `Best Electronics Store Example Name` (20-60 chars)
   - Store Email: `electronics@example.com`
   - Store Address: `123 Electronics Avenue, Tech City`
   - Owner Name: `Electronics Store Owner Full Name` (20-60 chars)
   - Owner Password: `Owner@123`
4. Click "Create Store"

### Register as Normal User

1. Logout (click Logout button)
2. Click "Register here" on login page
3. Fill in registration form:
   - Name: `Regular User Example Full Name Here` (20-60 chars)
   - Email: `user@example.com`
   - Password: `User@123` (8-16 chars, 1 uppercase, 1 special)
   - Address: `456 User Street, User City`
4. After registration, you'll see the stores list

### Rate a Store

1. As normal user, you'll see the stores list
2. Click "Rate Store" button
3. Select rating (1-5 stars)
4. Click "Submit Rating"
5. Your rating is now visible in the store list

### View Store Dashboard

1. Logout
2. Login as store owner:
   - Email: `electronics@example.com`
   - Password: `Owner@123`
3. You'll see:
   - Average rating of your store
   - List of users who rated
   - Individual ratings

## Common Issues and Solutions

### Issue: Port already in use

**Backend (Port 5000):**

```bash
# macOS/Linux - Find and kill process
lsof -ti:5000 | xargs kill -9

# Change port in backend/.env
PORT=5001
```

**Frontend (Port 3000):**

```bash
# macOS/Linux - Find and kill process
lsof -ti:3000 | xargs kill -9

# Or let React use different port (it will prompt)
```

### Issue: Database connection failed

```bash
# Check if PostgreSQL is running
ps aux | grep postgres

# Start PostgreSQL
# macOS:
brew services start postgresql

# Linux:
sudo service postgresql start

# Check connection
psql -U postgres -d store_rating_db
```

### Issue: Migration fails

```bash
# Drop and recreate database
dropdb store_rating_db
createdb store_rating_db

# Run migration again
npm run migrate
```

### Issue: "Cannot find module" errors

```bash
# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: CORS errors

Make sure:

1. Backend is running on port 5000
2. Frontend package.json has `"proxy": "http://localhost:5000"`
3. Both servers are running

## Environment Variables Explained

### Backend (.env)

```env
# Server port (default: 5000)
PORT=5000

# Node environment (development/production)
NODE_ENV=development

# Database connection
DB_HOST=localhost          # Usually localhost for local dev
DB_PORT=5432              # Default PostgreSQL port
DB_NAME=store_rating_db   # Database name
DB_USER=postgres          # Your PostgreSQL username
DB_PASSWORD=your_password # Your PostgreSQL password

# JWT settings
JWT_SECRET=your_super_secret_jwt_key  # Change this!
JWT_EXPIRE=7d                         # Token expiry (7 days)

# Default admin credentials
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin@123
```

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend opens in browser
- [ ] Can login as admin
- [ ] Admin dashboard shows stats
- [ ] Can create new user from admin panel
- [ ] Can create new store from admin panel
- [ ] Can logout and register as normal user
- [ ] Can view stores list as normal user
- [ ] Can rate a store
- [ ] Can update rating
- [ ] Store owner can view dashboard
- [ ] Store owner can see ratings
- [ ] Can update password from profile
- [ ] Filtering works on user/store lists
- [ ] Sorting works on tables
- [ ] Pagination works

## Next Steps

1. **Customize Admin Credentials**

   - Update `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `.env`
   - Run migration again

2. **Add Sample Data**

   - Create multiple stores
   - Create multiple users
   - Add various ratings

3. **Explore Features**

   - Try filtering and sorting
   - Test form validations
   - Check responsive design

4. **Development**
   - Backend hot reload is enabled (nodemon)
   - Frontend hot reload is enabled (React)
   - Make changes and see them instantly

## Useful Commands

```bash
# Backend
npm run dev          # Start with hot reload
npm start           # Start without hot reload
npm run migrate     # Run database migrations

# Frontend
npm start           # Start development server
npm run build       # Build for production

# Database
psql -U postgres -d store_rating_db    # Connect to database
\dt                                     # List tables
\d users                               # Describe users table
SELECT * FROM users;                   # Query users
```

## Project Structure Reference

```
Store Rating System/
├── backend/
│   ├── src/
│   │   ├── config/          # Database config
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Auth & validation
│   │   ├── migrations/      # Database setup
│   │   └── routes/          # API routes
│   ├── server.js           # Entry point
│   └── .env                # Configuration
│
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── context/        # Auth context
│   │   ├── pages/          # Page components
│   │   ├── utils/          # Helpers
│   │   ├── App.js          # Main app
│   │   └── index.js        # Entry point
│   └── public/
│
├── README.md              # Main documentation
├── API_DOCUMENTATION.md   # API reference
├── DATABASE_SCHEMA.md     # Database details
└── SETUP_GUIDE.md        # This file
```

## Support

If you encounter any issues:

1. Check the console for error messages
2. Verify all prerequisites are installed
3. Ensure PostgreSQL is running
4. Check that ports 3000 and 5000 are available
5. Review the error messages in terminal

## Production Deployment

For production deployment, consider:

1. Use environment-specific .env files
2. Set NODE_ENV=production
3. Use a process manager (PM2, systemd)
4. Set up proper PostgreSQL credentials
5. Use HTTPS
6. Enable CORS only for your domain
7. Set strong JWT_SECRET
8. Implement rate limiting
9. Add monitoring and logging
10. Regular database backups

Happy coding! 🚀
