import React, { useState, useEffect } from "react";
import api from "../../utils/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    total_users: 0,
    total_stores: 0,
    total_ratings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/dashboard");
      setStats(response.data.stats);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: "2rem" }}>Admin Dashboard</h2>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p>{stats.total_users}</p>
        </div>

        <div className="stat-card">
          <h3>Total Stores</h3>
          <p>{stats.total_stores}</p>
        </div>

        <div className="stat-card">
          <h3>Total Ratings</h3>
          <p>{stats.total_ratings}</p>
        </div>
      </div>

      <div className="card">
        <h3>Quick Actions</h3>
        <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
          <a
            href="/admin/users"
            className="btn btn-primary"
            style={{ textDecoration: "none" }}
          >
            Manage Users
          </a>
          <a
            href="/admin/stores"
            className="btn btn-primary"
            style={{ textDecoration: "none" }}
          >
            Manage Stores
          </a>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
