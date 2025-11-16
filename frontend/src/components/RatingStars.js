import React, { useState } from "react";

const RatingStars = ({ rating, onRate, readOnly = false }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="rating-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={`star ${star <= (hover || rating) ? "filled" : ""}`}
          onClick={() => !readOnly && onRate(star)}
          onMouseEnter={() => !readOnly && setHover(star)}
          onMouseLeave={() => !readOnly && setHover(0)}
          style={{ cursor: readOnly ? "default" : "pointer" }}
        >
          ★
        </span>
      ))}
      {rating > 0 && (
        <span style={{ marginLeft: "0.5rem" }}>({rating.toFixed(1)})</span>
      )}
    </div>
  );
};

export default RatingStars;
