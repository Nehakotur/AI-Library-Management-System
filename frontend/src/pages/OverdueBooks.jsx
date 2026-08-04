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

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Overdue Books</h2>

      <a href={downloadUrl} className="btn btn-success mb-3" target="_blank" rel="noopener noreferrer">
        Download Excel Report
      </a>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading && <p>Loading...</p>}

      <table className="table table-bordered">
        <thead className="table-danger">
          <tr>
            <th>Student</th>
            <th>Email</th>
            <th>Book</th>
            <th>Due Date</th>
            <th>Days Late</th>
          </tr>
        </thead>
        <tbody>
          {overdueList.map((issue) => (
            <tr key={issue._id}>
              <td>{issue.user?.name}</td>
              <td>{issue.user?.email}</td>
              <td>{issue.book?.title}</td>
              <td>{new Date(issue.dueDate).toLocaleDateString()}</td>
              <td>
                <span className="badge bg-danger">
                  {calculateDaysLate(issue.dueDate)} days
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!loading && overdueList.length === 0 && (
        <p className="text-success">No overdue books!</p>
      )}
    </div>
  );
}

export default OverdueBooks;