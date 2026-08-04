import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

function Books() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/books?search=${search}`);
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

  const handleIssue = async (bookId) => {
    setMessage("");
    try {
      await axiosInstance.post("/issues/issue", { bookId });
      setMessage("Book issued successfully!");
      fetchBooks();
    } catch (err) {
      setMessage(err.response?.data?.message || "Issue failed");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Library Books</h2>

      <form onSubmit={handleSearch} className="mb-4 d-flex gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Search by title or author..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Search
        </button>
      </form>

      {message && <div className="alert alert-info">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p>Loading...</p>}

      <div className="row">
        {books.map((book) => (
          <div className="col-md-4 mb-4" key={book._id}>
            <div className="card h-100">
              {book.coverImageUrl && (
                <img
                  src={book.coverImageUrl}
                  alt={book.title}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "contain", backgroundColor: "#f8f9fa" }}
                />
              )}
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{book.title}</h5>
                <p className="card-text mb-1">
                  <strong>Author:</strong> {book.author}
                </p>
                <p className="card-text mb-1">
                  <strong>Category:</strong> {book.category}
                </p>
                <p className="card-text mb-3">
                  <strong>Status:</strong>{" "}
                  {book.available ? (
                    <span className="text-success">Available ({book.quantity})</span>
                  ) : (
                    <span className="text-danger">Not Available</span>
                  )}
                </p>

                <button
                  className="btn btn-success mt-auto"
                  disabled={!book.available}
                  onClick={() => handleIssue(book._id)}
                >
                  Issue Book
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!loading && books.length === 0 && <p>No books found.</p>}
    </div>
  );
}

export default Books;