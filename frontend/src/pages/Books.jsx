import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

function Books() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/books?search=" + search);
      setBooks(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks();
  };

  return (
    <div style={{ padding: "40px 48px", maxWidth: "1400px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>Library Books</h1>
      <p style={{ color: "#6B6A63", marginBottom: "28px" }}>
        Browse the full catalog and find your next read
      </p>

      <form onSubmit={handleSearch} style={{ display: "flex", gap: "10px", marginBottom: "40px", maxWidth: "500px" }}>
        <input
          type="text"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 14px",
            border: "1px solid #E4DFD2",
            borderRadius: "8px",
            fontFamily: "Inter, sans-serif",
            fontSize: "0.95rem",
            outline: "none",
          }}
        />
        <button
          type="submit"
          style={{
            padding: "10px 22px",
            backgroundColor: "#16302C",
            color: "#F5F3ED",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          Search
        </button>
      </form>

      {error && (
        <div style={{ padding: "12px 16px", backgroundColor: "#FDECEC", border: "1px solid #D97757", borderRadius: "8px", marginBottom: "24px", color: "#8A2E1F" }}>
          {error}
        </div>
      )}
      {loading && <p style={{ color: "#6B6A63" }}>Loading...</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "36px 24px",
        }}
      >
        {books.map((book) => (
          <Link
            to={"/books/" + book._id}
            key={book._id}
            style={{ textDecoration: "none" }}
          >
            <div style={{ position: "relative" }}>
              {book.coverImageUrl ? (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="book-cover"
                  style={{
                    width: "100%",
                    aspectRatio: "2 / 3",
                    objectFit: "cover",
                    borderRadius: "4px",
                    boxShadow: "0 8px 16px rgba(22, 48, 44, 0.18)",
                    display: "block",
                  }}
                />
              ) : (
                <div
                  className="book-cover"
                  style={{
                    width: "100%",
                    aspectRatio: "2 / 3",
                    backgroundColor: "#16302C",
                    borderRadius: "4px",
                    boxShadow: "0 8px 16px rgba(22, 48, 44, 0.18)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#C9974C",
                    fontFamily: "Fraunces, serif",
                    fontSize: "1rem",
                    padding: "16px",
                    textAlign: "center",
                  }}
                >
                  {book.title}
                </div>
              )}

              {book.numReviews > 0 && (
                <div
                  className="text-mono"
                  style={{
                    position: "absolute",
                    top: "8px",
                    right: "8px",
                    backgroundColor: "#16302C",
                    color: "#C9974C",
                    fontSize: "0.7rem",
                    padding: "3px 7px",
                    borderRadius: "20px",
                  }}
                >
                  {book.averageRating} ★
                </div>
              )}
            </div>

            <h3 style={{ fontSize: "0.95rem", color: "#1E2420", marginTop: "12px", marginBottom: "2px", lineHeight: "1.3" }}>
              {book.title}
            </h3>
            <p style={{ color: "#6B6A63", fontSize: "0.8rem" }}>
              {book.author}
            </p>
          </Link>
        ))}
      </div>

      {!loading && books.length === 0 && <p style={{ color: "#6B6A63" }}>No books found.</p>}
    </div>
  );
}

export default Books;