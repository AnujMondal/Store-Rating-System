import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminStores from "./pages/admin/AdminStores";

// User Pages
import UserStores from "./pages/user/UserStores";

// Store Owner Pages
import StoreOwnerDashboard from "./pages/storeOwner/StoreOwnerDashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />

            {/* Protected Routes - All Roles */}
            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute roles={["admin"]}>
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute roles={["admin"]}>
                  <AdminUsers />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/stores"
              element={
                <PrivateRoute roles={["admin"]}>
                  <AdminStores />
                </PrivateRoute>
              }
            />

            {/* User Routes */}
            <Route
              path="/stores"
              element={
                <PrivateRoute roles={["user"]}>
                  <UserStores />
                </PrivateRoute>
              }
            />

            {/* Store Owner Routes */}
            <Route
              path="/store-owner/dashboard"
              element={
                <PrivateRoute roles={["store_owner"]}>
                  <StoreOwnerDashboard />
                </PrivateRoute>
              }
            />

            {/* Default Route */}
            <Route path="/" element={<HomeRedirect />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Component to redirect based on user role
const HomeRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  } else if (user.role === "store_owner") {
    return <Navigate to="/store-owner/dashboard" replace />;
  } else {
    return <Navigate to="/stores" replace />;
  }
};

// Public route wrapper - redirects to home if already logged in
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default App;
