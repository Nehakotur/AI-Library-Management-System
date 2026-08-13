import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

function MyIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchMyIssues = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/issues/my-issues");
      setIssues(response.data.data);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load issues");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyIssues();
  }, []);

  const handleReturn = async (issueId) => {
    try {
      await axiosInstance.put("/issues/return/" + issueId);
      setMessage("Book returned successfully!");
      fetchMyIssues();
    } catch (err) {
      setMessage(err.response?.data?.message || "Return failed");
    }
  };

  const thStyle = {
    textAlign: "left",
    padding: "12px 16px",
    fontSize: "0.75rem",
    color: "#6B6A63",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    borderBottom: "2px solid #E4DFD2",
  };

  const tdStyle = {
    padding: "14px 16px",
    borderBottom: "1px solid #E4DFD2",
    fontSize: "0.9rem",
  };

  return (
    <div style={{ padding: "40px 48px", maxWidth: "1100px" }}>
      <h1 style={{ fontSize: "2rem", marginBottom: "24px" }}>My Issued Books</h1>

      {message && (
        <div style={{ padding: "12px 16px", backgroundColor: "#FFF8EC", border: "1px solid #C9974C", borderRadius: "8px", marginBottom: "24px", color: "#16302C" }}>
          {message}
        </div>
      )}
      {loading && <p style={{ color: "#6B6A63" }}>Loading...</p>}

      {!loading && issues.length > 0 && (
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", overflow: "hidden", border: "1px solid #E4DFD2" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Book</th>
                <th style={thStyle}>Issue Date</th>
                <th style={thStyle}>Due Date</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Fine</th>
                <th style={thStyle}>Action</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue._id}>
                  <td style={tdStyle}>{issue.book?.title}</td>
                  <td className="text-mono" style={{ ...tdStyle, fontSize: "0.8rem", color: "#6B6A63" }}>
                    {new Date(issue.issueDate).toLocaleDateString()}
                  </td>
                  <td className="text-mono" style={{ ...tdStyle, fontSize: "0.8rem", color: "#6B6A63" }}>
                    {issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : "-"}
                  </td>
                  <td style={tdStyle}>
                    <span
                      className="text-mono"
                      style={{
                        fontSize: "0.7rem",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        backgroundColor: issue.status === "issued" ? "#FFF8EC" : "#EAF4EC",
                        color: issue.status === "issued" ? "#A97D36" : "#3F6E52",
                      }}
                    >
                      {issue.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="text-mono" style={{ ...tdStyle, color: issue.fine > 0 ? "#B5473A" : "#6B6A63" }}>
                    Rs {issue.fine || 0}
                  </td>
                  <td style={tdStyle}>
                    {issue.status === "issued" && (
                      <button
                        onClick={() => handleReturn(issue._id)}
                        style={{
                          padding: "6px 14px",
                          backgroundColor: "#C9974C",
                          color: "#16302C",
                          border: "none",
                          borderRadius: "6px",
                          fontWeight: "600",
                          fontSize: "0.8rem",
                          cursor: "pointer",
                        }}
                      >
                        Return
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && issues.length === 0 && <p style={{ color: "#6B6A63" }}>No issued books found.</p>}
    </div>
  );
}

export default MyIssues;