import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import RatingStars from "../../components/RatingStars";

const StoreOwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    storeId: null,
    averageRating: 0,
    totalRatings: 0,
    ratings: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await api.get("/stores/owner/dashboard");
      setDashboardData(response.data);
    } catch (error) {
      console.error("Failed to fetch dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: "2rem" }}>Store Owner Dashboard</h2>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Average Rating</h3>
          <p>{dashboardData.averageRating}</p>
          <RatingStars
            rating={parseFloat(dashboardData.averageRating)}
            readOnly
          />
        </div>

        <div className="stat-card">
          <h3>Total Ratings</h3>
          <p>{dashboardData.totalRatings}</p>
        </div>
      </div>

      <div className="table-container">
        <h3>Ratings History</h3>

        {dashboardData.ratings.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "#7f8c8d",
            }}
          >
            No ratings yet
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>User Name</th>
                <th>User Email</th>
                <th>Rating</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.ratings.map((rating) => (
                <tr key={rating.id}>
                  <td>{rating.name}</td>
                  <td>{rating.email}</td>
                  <td>
                    <RatingStars rating={rating.rating} readOnly />
                  </td>
                  <td>{new Date(rating.rated_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default StoreOwnerDashboard;
