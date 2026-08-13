import { useState, useEffect, useContext } from "react";
import axiosInstance from "../api/axiosInstance";
import { AuthContext } from "../context/AuthContext";

function Newspapers() {
  const [newspapers, setNewspapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [title, setTitle] = useState("");
  const [publisher, setPublisher] = useState("");
  const [language, setLanguage] = useState("English");
  const [editionDate, setEditionDate] = useState("");

  const { user } = useContext(AuthContext);
  const canManage = user?.role === "librarian" || user?.role === "admin";

  const fetchNewspapers = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/newspapers");
      setNewspapers(response.data.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load newspapers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNewspapers();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      await axiosInstance.post("/newspapers", { title, publisher, language, editionDate });
      setMessage("Newspaper added successfully!");
      setTitle("");
      setPublisher("");
      setEditionDate("");
      fetchNewspapers();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to add newspaper");
    }
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete("/newspapers/" + id);
      setMessage("Newspaper deleted");
      fetchNewspapers();
    } catch (err) {
      setMessage(err.response?.data?.message || "Delete failed");
    }
  };

  const inputStyle = {
    padding: "9px 12px",
    border: "1px solid #E4DFD2",
    borderRadius: "6px",
    fontFamily: "Inter, sans-serif",
    fontSize: "0.88rem",
    outline: "none",
  };

  return (
    <div style={{ padding: "40px 48px", maxWidth: "1200px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "24px" }}>Newspapers</h1>

      {message && (
        <div style={{ padding: "12px 16px", backgroundColor: "#FFF8EC", border: "1px solid #C9974C", borderRadius: "8px", marginBottom: "24px", color: "#16302C" }}>
          {message}
        </div>
      )}

      {canManage && (
        <form
          onSubmit={handleAdd}
          style={{
            backgroundColor: "#FBF8F1",
            border: "1px solid #E4DFD2",
            borderRadius: "10px",
            padding: "20px",
            marginBottom: "32px",
          }}
        >
          <h3 style={{ fontSize: "1rem", marginBottom: "14px" }}>Add New Edition</h3>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <input style={{ ...inputStyle, flex: "1 1 160px" }} type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <input style={{ ...inputStyle, flex: "1 1 160px" }} type="text" placeholder="Publisher" value={publisher} onChange={(e) => setPublisher(e.target.value)} required />
            <input style={{ ...inputStyle, flex: "1 1 120px" }} type="text" placeholder="Language" value={language} onChange={(e) => setLanguage(e.target.value)} />
            <input style={{ ...inputStyle, flex: "1 1 140px" }} type="date" value={editionDate} onChange={(e) => setEditionDate(e.target.value)} required />
            <button
              type="submit"
              style={{
                padding: "9px 20px",
                backgroundColor: "#16302C",
                color: "#F5F3ED",
                border: "none",
                borderRadius: "6px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Add
            </button>
          </div>
        </form>
      )}

      {loading && <p style={{ color: "#6B6A63" }}>Loading...</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
          gap: "20px",
        }}
      >
        {newspapers.map((n) => (
          <div
            key={n._id}
            style={{
              backgroundColor: "#FFFFFF",
              border: "1px solid #E4DFD2",
              borderRadius: "10px",
              padding: "18px",
            }}
          >
            <h3 style={{ fontSize: "1.05rem", marginBottom: "6px" }}>{n.title}</h3>
            <p style={{ fontSize: "0.85rem", color: "#6B6A63", marginBottom: "4px" }}>
              {n.publisher}
            </p>
            <p style={{ fontSize: "0.85rem", color: "#6B6A63", marginBottom: "10px" }}>
              {n.language}
            </p>
            <p className="text-mono" style={{ fontSize: "0.75rem", color: "#A97D36", marginBottom: "12px" }}>
              {new Date(n.editionDate).toLocaleDateString()}
            </p>

            {canManage && (
              <button
                onClick={() => handleDelete(n._id)}
                style={{
                  padding: "5px 14px",
                  border: "1px solid #B5473A",
                  backgroundColor: "transparent",
                  color: "#B5473A",
                  borderRadius: "6px",
                  fontSize: "0.78rem",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            )}
          </div>
        ))}
      </div>

      {!loading && newspapers.length === 0 && <p style={{ color: "#6B6A63" }}>No newspapers found.</p>}
    </div>
  );
}

export default Newspapers;