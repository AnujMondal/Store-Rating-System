import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import RatingStars from "../../components/RatingStars";
import {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress,
} from "../../utils/validation";

const AdminStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    limit: 10,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    ownerName: "",
    ownerPassword: "",
  });
  const [errors, setErrors] = useState({});
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

      const response = await api.get("/admin/stores", { params });
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

  const validate = () => {
    const newErrors = {};

    const nameError = validateName(formData.name);
    if (nameError) newErrors.name = nameError;

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const addressError = validateAddress(formData.address);
    if (addressError) newErrors.address = addressError;

    const ownerNameError = validateName(formData.ownerName);
    if (ownerNameError) newErrors.ownerName = ownerNameError;

    const passwordError = validatePassword(formData.ownerPassword);
    if (passwordError) newErrors.ownerPassword = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!validate()) {
      return;
    }

    try {
      await api.post("/stores", formData);
      setMessage({ type: "success", text: "Store created successfully" });
      setFormData({
        name: "",
        email: "",
        address: "",
        ownerName: "",
        ownerPassword: "",
      });
      setShowModal(false);
      fetchStores();
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.error || "Failed to create store",
      });
    }
  };

  return (
    <div className="container">
      <div className="table-container">
        <div className="table-header">
          <h2>Stores Management</h2>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            Add Store
          </button>
        </div>

        <div className="filters">
          <input
            type="text"
            name="name"
            placeholder="Filter by name"
            value={filters.name}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="email"
            placeholder="Filter by email"
            value={filters.email}
            onChange={handleFilterChange}
          />
          <input
            type="text"
            name="address"
            placeholder="Filter by address"
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
                    Name{" "}
                    {sortBy === "name" && (sortOrder === "ASC" ? "▲" : "▼")}
                  </th>
                  <th onClick={() => handleSort("email")}>
                    Email{" "}
                    {sortBy === "email" && (sortOrder === "ASC" ? "▲" : "▼")}
                  </th>
                  <th onClick={() => handleSort("address")}>
                    Address{" "}
                    {sortBy === "address" && (sortOrder === "ASC" ? "▲" : "▼")}
                  </th>
                  <th onClick={() => handleSort("rating")}>
                    Rating{" "}
                    {sortBy === "rating" && (sortOrder === "ASC" ? "▲" : "▼")}
                  </th>
                  <th>Total Ratings</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id}>
                    <td>{store.name}</td>
                    <td>{store.email}</td>
                    <td>{store.address || "N/A"}</td>
                    <td>
                      <RatingStars
                        rating={parseFloat(store.average_rating)}
                        readOnly
                      />
                    </td>
                    <td>{store.total_ratings}</td>
                  </tr>
                ))}
              </tbody>
            </table>

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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Store</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>

            {message.text && (
              <div className={`alert alert-${message.type}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <h4>Store Details</h4>
              <div className="form-group">
                <label>Store Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="20-60 characters"
                />
                {errors.name && (
                  <div className="error-message">{errors.name}</div>
                )}
              </div>

              <div className="form-group">
                <label>Store Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
                {errors.email && (
                  <div className="error-message">{errors.email}</div>
                )}
              </div>

              <div className="form-group">
                <label>Store Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Max 400 characters"
                />
                {errors.address && (
                  <div className="error-message">{errors.address}</div>
                )}
              </div>

              <h4 style={{ marginTop: "1.5rem" }}>Store Owner Details</h4>
              <div className="form-group">
                <label>Owner Name *</label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerName: e.target.value })
                  }
                  placeholder="20-60 characters"
                />
                {errors.ownerName && (
                  <div className="error-message">{errors.ownerName}</div>
                )}
              </div>

              <div className="form-group">
                <label>Owner Password *</label>
                <input
                  type="password"
                  value={formData.ownerPassword}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerPassword: e.target.value })
                  }
                  placeholder="8-16 chars, 1 uppercase, 1 special"
                />
                {errors.ownerPassword && (
                  <div className="error-message">{errors.ownerPassword}</div>
                )}
              </div>

              <div
                style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}
              >
                <button type="submit" className="btn btn-primary">
                  Create Store
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStores;
