import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

function OverdueBooks() {
  const [overdueList, setOverdueList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOverdue = async () => {
      try {
        const response = await axiosInstance.get("/issues/overdue");
        setOverdueList(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load overdue books");
      } finally {
        setLoading(false);
      }
    };

    fetchOverdue();
  }, []);

  const calculateDaysLate = (dueDate) => {
    const diff = new Date() - new Date(dueDate);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const downloadUrl = "http://localhost:5000/api/issues/overdue/export?token=" + localStorage.getItem("token");

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
      <h1 style={{ fontSize: "2rem", marginBottom: "8px" }}>Overdue Books</h1>
      <p style={{ color: "#6B6A63", marginBottom: "24px" }}>
        Books that have passed their due date
      </p>

      <a
        href={downloadUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-block",
          padding: "9px 20px",
          backgroundColor: "#C9974C",
          color: "#16302C",
          borderRadius: "6px",
          textDecoration: "none",
          fontWeight: "600",
          fontSize: "0.85rem",
          marginBottom: "24px",
        }}
      >
        Download Excel Report
      </a>

      {error && (
        <div style={{ padding: "12px 16px", backgroundColor: "#FDECEC", border: "1px solid #D97757", borderRadius: "8px", marginBottom: "20px", color: "#8A2E1F" }}>
          {error}
        </div>
      )}
      {loading && <p style={{ color: "#6B6A63" }}>Loading...</p>}

      {!loading && overdueList.length > 0 && (
        <div style={{ backgroundColor: "#FFFFFF", borderRadius: "10px", overflow: "hidden", border: "1px solid #E4DFD2" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#FBF8F1" }}>
                <th style={thStyle}>Student</th>
                <th style={thStyle}>Email</th>
                <th style={thStyle}>Book</th>
                <th style={thStyle}>Due Date</th>
                <th style={thStyle}>Days Late</th>
              </tr>
            </thead>
            <tbody>
              {overdueList.map((issue) => (
                <tr key={issue._id}>
                  <td style={tdStyle}>{issue.user?.name}</td>
                  <td className="text-mono" style={{ ...tdStyle, fontSize: "0.8rem", color: "#6B6A63" }}>
                    {issue.user?.email}
                  </td>
                  <td style={tdStyle}>{issue.book?.title}</td>
                  <td className="text-mono" style={{ ...tdStyle, fontSize: "0.8rem", color: "#6B6A63" }}>
                    {new Date(issue.dueDate).toLocaleDateString()}
                  </td>
                  <td style={tdStyle}>
                    <span
                      className="text-mono"
                      style={{
                        fontSize: "0.7rem",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        backgroundColor: "#FDECEC",
                        color: "#B5473A",
                      }}
                    >
                      {calculateDaysLate(issue.dueDate)} DAYS
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && overdueList.length === 0 && (
        <p style={{ color: "#3F6E52" }}>No overdue books right now.</p>
      )}
    </div>
  );
}

export default OverdueBooks;