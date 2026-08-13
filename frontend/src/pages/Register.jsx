import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      await axiosInstance.post("/auth/register", { name, email, password });
      setSuccess("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#16302C",
      }}
    >
      <div
        style={{
          width: "380px",
          backgroundColor: "#F5F3ED",
          borderRadius: "10px",
          padding: "40px 36px",
          boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
        }}
      >
        <h1 style={{ fontSize: "1.6rem", marginBottom: "4px", textAlign: "center" }}>
          Join the Library
        </h1>
        <p style={{ color: "#6B6A63", fontSize: "0.9rem", textAlign: "center", marginBottom: "28px" }}>
          Create an account to get started
        </p>

        {error && (
          <div style={{ padding: "10px 14px", backgroundColor: "#FDECEC", border: "1px solid #D97757", borderRadius: "8px", marginBottom: "18px", color: "#8A2E1F", fontSize: "0.85rem" }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ padding: "10px 14px", backgroundColor: "#EAF4EC", border: "1px solid #3F6E52", borderRadius: "8px", marginBottom: "18px", color: "#2D4E3A", fontSize: "0.85rem" }}>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#6B6A63", marginBottom: "6px" }}>
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #E4DFD2",
                borderRadius: "6px",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#6B6A63", marginBottom: "6px" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #E4DFD2",
                borderRadius: "6px",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: "24px" }}>
            <label style={{ display: "block", fontSize: "0.8rem", color: "#6B6A63", marginBottom: "6px" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                border: "1px solid #E4DFD2",
                borderRadius: "6px",
                fontFamily: "Inter, sans-serif",
                fontSize: "0.9rem",
                outline: "none",
              }}
            />
          </div>

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
            {loading ? "Registering..." : "Register"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "18px", fontSize: "0.85rem", color: "#6B6A63" }}>
          Already have an account? <Link to="/login" style={{ color: "#A97D36" }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;