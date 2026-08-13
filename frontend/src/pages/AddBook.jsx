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
  const [pdf, setPdf] = useState(null);
  const [audio, setAudio] = useState(null);
  const [summary, setSummary] = useState("");
  const [moods, setMoods] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState(0);
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
      formData.append("isFree", isFree);
      formData.append("price", isFree ? 0 : price);
      formData.append("summary", summary);
      formData.append("moods", moods);
      if (coverImage) formData.append("coverImage", coverImage);
      if (pdf) formData.append("pdf", pdf);
      if (audio) formData.append("audio", audio);

      await axiosInstance.post("/books/add", formData);

      setSuccess("Book added successfully!");
      setTimeout(() => navigate("/books"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add book");
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = { display: "block", fontSize: "0.8rem", color: "#6B6A63", marginBottom: "6px" };
  const inputStyle = {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid #E4DFD2",
    borderRadius: "6px",
    fontFamily: "Inter, sans-serif",
    fontSize: "0.9rem",
    outline: "none",
  };
  const fieldWrap = { marginBottom: "18px" };

  return (
    <div style={{ padding: "40px 48px", maxWidth: "560px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "24px" }}>Add New Book</h1>

      {error && (
        <div style={{ padding: "12px 16px", backgroundColor: "#FDECEC", border: "1px solid #D97757", borderRadius: "8px", marginBottom: "20px", color: "#8A2E1F", fontSize: "0.85rem" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ padding: "12px 16px", backgroundColor: "#EAF4EC", border: "1px solid #3F6E52", borderRadius: "8px", marginBottom: "20px", color: "#2D4E3A", fontSize: "0.85rem" }}>
          {success}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        style={{ backgroundColor: "#FBF8F1", border: "1px solid #E4DFD2", borderRadius: "10px", padding: "28px" }}
      >
        <div style={fieldWrap}>
          <label style={labelStyle}>Title</label>
          <input style={inputStyle} type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Author</label>
          <input style={inputStyle} type="text" value={author} onChange={(e) => setAuthor(e.target.value)} required />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Category</label>
          <input style={inputStyle} type="text" value={category} onChange={(e) => setCategory(e.target.value)} required />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Moods (comma separated)</label>
          <input style={inputStyle} type="text" value={moods} onChange={(e) => setMoods(e.target.value)} placeholder="Motivational, Self-Help" />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>ISBN</label>
          <input style={inputStyle} type="text" value={isbn} onChange={(e) => setIsbn(e.target.value)} required />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Quantity</label>
          <input style={inputStyle} type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} min="1" required />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Summary</label>
          <textarea style={{ ...inputStyle, resize: "vertical" }} rows="5" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="What is this book about..."></textarea>
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Cover Image</label>
          <input style={inputStyle} type="file" accept="image/*" onChange={(e) => setCoverImage(e.target.files[0])} />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Book PDF</label>
          <input style={inputStyle} type="file" accept="application/pdf" onChange={(e) => setPdf(e.target.files[0])} />
        </div>

        <div style={fieldWrap}>
          <label style={labelStyle}>Audiobook (optional)</label>
          <input style={inputStyle} type="file" accept="audio/*" onChange={(e) => setAudio(e.target.files[0])} />
        </div>

        <div style={{ ...fieldWrap, display: "flex", alignItems: "center", gap: "8px" }}>
          <input type="checkbox" checked={isFree} onChange={(e) => setIsFree(e.target.checked)} id="isFreeCheck" />
          <label htmlFor="isFreeCheck" style={{ fontSize: "0.9rem" }}>Free to read</label>
        </div>

        {!isFree && (
          <div style={fieldWrap}>
            <label style={labelStyle}>Price (Rs)</label>
            <input style={inputStyle} type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="1" required />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: "#16302C",
            color: "#F5F3ED",
            border: "none",
            borderRadius: "6px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          {loading ? "Adding..." : "Add Book"}
        </button>
      </form>
    </div>
  );
}

export default AddBook;