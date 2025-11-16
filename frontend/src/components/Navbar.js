import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  if (!user) {
    return null;
  }

  return (
    <nav className="navbar">
      <h1>Store Rating System</h1>
      <div className="navbar-links">
        <span>Welcome, {user.name}</span>

        {user.role === "admin" && (
          <>
            <Link to="/admin/dashboard">Dashboard</Link>
            <Link to="/admin/users">Users</Link>
            <Link to="/admin/stores">Stores</Link>
          </>
        )}

        {user.role === "user" && (
          <>
            <Link to="/stores">Stores</Link>
            <Link to="/profile">Profile</Link>
          </>
        )}

        {user.role === "store_owner" && (
          <>
            <Link to="/store-owner/dashboard">Dashboard</Link>
            <Link to="/profile">Profile</Link>
          </>
        )}

        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
