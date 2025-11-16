import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import RatingStars from "../../components/RatingStars";
import { validateRating } from "../../utils/validation";

const UserStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    name: "",
    address: "",
  });
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("ASC");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });
  const [selectedStore, setSelectedStore] = useState(null);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchStores();
  }, [filters, sortBy, sortOrder, pagination.currentPage]);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params = {
        ...filters,
        sortBy,
        sortOrder,
        page: pagination.currentPage,
        limit: pagination.limit,
      };

      const response = await api.get("/stores", { params });
      setStores(response.data.stores);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch stores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
    setPagination({ ...pagination, currentPage: 1 });
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortOrder("ASC");
    }
  };

  const handleRateStore = (store) => {
    setSelectedStore(store);
    setRating(store.user_rating || 0);
    setMessage({ type: "", text: "" });
  };

  const handleSubmitRating = async () => {
    const error = validateRating(rating);
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    try {
      await api.post("/ratings", {
        storeId: selectedStore.id,
        rating,
      });
      setMessage({
        type: "success",
        text: selectedStore.user_rating
          ? "Rating updated successfully"
          : "Rating submitted successfully",
      });
      setTimeout(() => {
        setSelectedStore(null);
        fetchStores();
      }, 1500);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to submit rating",
      });
    }
  };

  return (
    <div className="container">
      <div className="table-container">
        <h2>Browse Stores</h2>

        <div className="filters">
          <input
            type="text"
            name="name"
            placeholder="Search by store name"
            value={filters.name}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="address"
            placeholder="Search by address"
            value={filters.address}
            onChange={handleFilterChange}
          />
        </div>

        {loading ? (
          <div className="loading">Loading stores...</div>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th onClick={() => handleSort("name")}>
                    Store Name{" "}
                    {sortBy === "name" && (sortOrder === "ASC" ? "▲" : "▼")}
                  </th>
                  <th onClick={() => handleSort("address")}>
                    Address{" "}
                    {sortBy === "address" && (sortOrder === "ASC" ? "▲" : "▼")}
                  </th>
                  <th onClick={() => handleSort("rating")}>
                    Overall Rating{" "}
                    {sortBy === "rating" && (sortOrder === "ASC" ? "▲" : "▼")}
                  </th>
                  <th>Your Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id}>
                    <td>{store.name}</td>
                    <td>{store.address || "N/A"}</td>
                    <td>
                      <RatingStars
                        rating={parseFloat(store.average_rating)}
                        readOnly
                      />
                      <span style={{ marginLeft: "0.5rem" }}>
                        ({store.total_ratings} ratings)
                      </span>
                    </td>
                    <td>
                      {store.user_rating ? (
                        <RatingStars rating={store.user_rating} readOnly />
                      ) : (
                        <span style={{ color: "#7f8c8d" }}>Not rated</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleRateStore(store)}
                        style={{ padding: "0.5rem 1rem" }}
                      >
                        {store.user_rating ? "Update Rating" : "Rate Store"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {stores.length === 0 && (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#7f8c8d",
                }}
              >
                No stores found
              </div>
            )}

            <div className="pagination">
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    currentPage: pagination.currentPage - 1,
                  })
                }
                disabled={pagination.currentPage === 1}
              >
                Previous
              </button>
              <span>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPagination({
                    ...pagination,
                    currentPage: pagination.currentPage + 1,
                  })
                }
                disabled={pagination.currentPage === pagination.totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {selectedStore && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Rate {selectedStore.name}</h3>
              <button
                className="close-btn"
                onClick={() => setSelectedStore(null)}
              >
                ×
              </button>
            </div>

            {message.text && (
              <div className={`alert alert-${message.type}`}>
                {message.text}
              </div>
            )}

            <div style={{ padding: "1rem 0" }}>
              <p style={{ marginBottom: "1rem", color: "#7f8c8d" }}>
                Select your rating (1-5 stars):
              </p>
              <RatingStars rating={rating} onRate={setRating} />
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
              <button
                className="btn btn-success"
                onClick={handleSubmitRating}
                disabled={rating === 0}
              >
                Submit Rating
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedStore(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserStores;
