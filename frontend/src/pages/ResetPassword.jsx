import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [resetToken, setResetToken] = useState(location.state?.resetToken || "");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await axiosInstance.post("/auth/reset-password", { resetToken, newPassword });
      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <h2 className="text-center mb-4">Reset Password</h2>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Reset Token</label>
          <input
            type="text"
            className="form-control"
            value={resetToken}
            onChange={(e) => setResetToken(e.target.value)}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">New Password</label>
          <input
            type="password"
            className="form-control"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <p className="text-center mt-3">
        <Link to="/login">Back to Login</Link>
      </p>
    </div>
  );
}

export default ResetPassword;