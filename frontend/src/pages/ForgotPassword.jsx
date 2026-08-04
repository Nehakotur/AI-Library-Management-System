import { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/forgot-password", { email });
      setResetToken(response.data.resetToken);
      setMessage("Reset token generated! (In production, this would be emailed to you)");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate reset token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="text-center mb-4">Forgot Password</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {message && <div className="alert alert-info">{message}</div>}

      {resetToken && (
        <div className="alert alert-warning">
          <strong>Your Reset Token:</strong>
          <br />
          <code style={{ wordBreak: "break-all" }}>{resetToken}</code>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Sending..." : "Get Reset Token"}
        </button>
      </form>

      <p className="text-center mt-3">
        {resetToken && (
          <Link to="/reset-password" state={{ resetToken }}>
            Go to Reset Password →
          </Link>
        )}
      </p>

      <p className="text-center mt-2">
        <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
}

export default ForgotPassword;