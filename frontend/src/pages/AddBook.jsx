import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

function AddBook() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [isbn, setIsbn] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [coverImage, setCoverImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("author", author);
      formData.append("category", category);
      formData.append("isbn", isbn);
      formData.append("quantity", quantity);
      if (coverImage) {
        formData.append("coverImage", coverImage);
      }

      await axiosInstance.post("/books/add", formData)
        

      setSuccess("Book added successfully!");
      setTimeout(() => navigate("/books"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-4">Add New Book</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Title</label>
          <input type="text" className="form-control" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Author</label>
          <input type="text" className="form-control" value={author} onChange={(e) => setAuthor(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Category</label>
          <input type="text" className="form-control" value={category} onChange={(e) => setCategory(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label className="form-label">ISBN</label>
          <input type="text" className="form-control" value={isbn} onChange={(e) => setIsbn(e.target.value)} required />
        </div>

        <div className="mb-3">
          <label className="form-label">Quantity</label>
          <input type="number" className="form-control" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" required />
        </div>

        <div className="mb-3">
          <label className="form-label">Cover Image</label>
          <input type="file" className="form-control" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])} />
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Adding..." : "Add Book"}
        </button>
      </form>
    </div>
  );
}

export default AddBook;