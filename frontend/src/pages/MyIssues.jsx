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
      await axiosInstance.put(`/issues/return/${issueId}`);
      setMessage("Book returned successfully!");
      fetchMyIssues();
    } catch (err) {
      setMessage(err.response?.data?.message || "Return failed");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">My Issued Books</h2>

      {message && <div className="alert alert-info">{message}</div>}
      {loading && <p>Loading...</p>}

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Book</th>
            <th>Issue Date</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Fine</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {issues.map((issue) => (
            <tr key={issue._id}>
              <td>{issue.book?.title}</td>
              <td>{new Date(issue.issueDate).toLocaleDateString()}</td>
              <td>{issue.dueDate ? new Date(issue.dueDate).toLocaleDateString() : "-"}</td>
              <td>{issue.status}</td>
              <td>₹{issue.fine || 0}</td>
              <td>
                {issue.status === "issued" && (
                  <button
                    className="btn btn-sm btn-warning"
                    onClick={() => handleReturn(issue._id)}
                  >
                    Return
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!loading && issues.length === 0 && <p>No issued books found.</p>}
    </div>
  );
}

export default MyIssues;